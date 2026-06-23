import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ============ API Routes ============

// 호기 목록 조회
app.get('/api/units', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT * FROM units WHERE is_active = 1 ORDER BY unit_code').all()
  return c.json(results.results)
})

// 원부자재 목록 조회
app.get('/api/materials', async (c) => {
  const db = c.env.DB
  const category = c.req.query('category')
  let query = 'SELECT * FROM materials WHERE is_active = 1'
  if (category) query += ` AND category = '${category}'`
  query += ' ORDER BY category, material_code'
  const results = await db.prepare(query).all()
  return c.json(results.results)
})

// 월별 실적 데이터 조회
app.get('/api/records', async (c) => {
  const db = c.env.DB
  const { unit_id, year, month } = c.req.query()
  
  let query = `
    SELECT mr.*, u.unit_code, u.unit_name, m.material_code, m.material_name, m.category, m.unit_of_measure
    FROM monthly_records mr
    JOIN units u ON mr.unit_id = u.id
    JOIN materials m ON mr.material_id = m.id
    WHERE 1=1
  `
  const params: any[] = []
  
  if (unit_id) { query += ' AND mr.unit_id = ?'; params.push(unit_id) }
  if (year) { query += ' AND mr.year = ?'; params.push(year) }
  if (month) { query += ' AND mr.month = ?'; params.push(month) }
  
  query += ' ORDER BY u.unit_code, m.category, m.material_code'
  
  const stmt = db.prepare(query)
  const results = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all()
  return c.json(results.results)
})

// 실적 데이터 등록/수정 (Upsert)
app.post('/api/records', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes } = body
  
  const result = await db.prepare(`
    INSERT INTO monthly_records (unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(unit_id, material_id, year, month) 
    DO UPDATE SET usage_qty = ?, unit_price = ?, production_qty = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
  `).bind(unit_id, material_id, year, month, usage_qty, unit_price, production_qty || 0, notes || '',
          usage_qty, unit_price, production_qty || 0, notes || '').run()
  
  return c.json({ success: true, meta: result.meta })
})

// 일괄 등록
app.post('/api/records/bulk', async (c) => {
  const db = c.env.DB
  const { records } = await c.req.json()
  
  const stmt = db.prepare(`
    INSERT INTO monthly_records (unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(unit_id, material_id, year, month) 
    DO UPDATE SET usage_qty = ?, unit_price = ?, production_qty = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
  `)
  
  const batch = records.map((r: any) => 
    stmt.bind(r.unit_id, r.material_id, r.year, r.month, r.usage_qty, r.unit_price, r.production_qty || 0, r.notes || '',
              r.usage_qty, r.unit_price, r.production_qty || 0, r.notes || '')
  )
  
  const results = await db.batch(batch)
  return c.json({ success: true, count: results.length })
})

// ============ 핵심: 전월 대비 분석 API ============
app.get('/api/analysis/comparison', async (c) => {
  const db = c.env.DB
  const { unit_id, year, month } = c.req.query()
  
  if (!year || !month) {
    return c.json({ error: 'year and month are required' }, 400)
  }
  
  const currentYear = parseInt(year)
  const currentMonth = parseInt(month)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  let unitFilter = ''
  const params: any[] = [currentYear, currentMonth, prevYear, prevMonth]
  
  if (unit_id) {
    unitFilter = 'AND cur.unit_id = ?'
    params.push(parseInt(unit_id))
  }

  const query = `
    SELECT 
      cur.unit_id,
      u.unit_code,
      u.unit_name,
      cur.material_id,
      m.material_code,
      m.material_name,
      m.category,
      m.unit_of_measure,
      -- 전월 데이터
      COALESCE(prev.usage_qty, 0) as prev_usage_qty,
      COALESCE(prev.unit_price, 0) as prev_unit_price,
      COALESCE(prev.total_cost, 0) as prev_total_cost,
      COALESCE(prev.production_qty, 0) as prev_production_qty,
      -- 당월 데이터
      cur.usage_qty as cur_usage_qty,
      cur.unit_price as cur_unit_price,
      cur.total_cost as cur_total_cost,
      cur.production_qty as cur_production_qty,
      -- 차이 분석
      (cur.usage_qty - COALESCE(prev.usage_qty, 0)) as qty_diff,
      (cur.unit_price - COALESCE(prev.unit_price, 0)) as price_diff,
      (cur.total_cost - COALESCE(prev.total_cost, 0)) as cost_diff,
      -- 손익 효과 분석 (차이 분해)
      -- 수량차이 효과 = (당월수량 - 전월수량) × 전월단가
      ((cur.usage_qty - COALESCE(prev.usage_qty, 0)) * COALESCE(prev.unit_price, 0)) as qty_effect,
      -- 단가차이 효과 = (당월단가 - 전월단가) × 당월수량
      ((cur.unit_price - COALESCE(prev.unit_price, 0)) * cur.usage_qty) as price_effect,
      -- 변동률 (%)
      CASE WHEN COALESCE(prev.usage_qty, 0) > 0 
        THEN ROUND(((cur.usage_qty - prev.usage_qty) * 100.0 / prev.usage_qty), 2) 
        ELSE NULL END as qty_change_pct,
      CASE WHEN COALESCE(prev.unit_price, 0) > 0 
        THEN ROUND(((cur.unit_price - prev.unit_price) * 100.0 / prev.unit_price), 2) 
        ELSE NULL END as price_change_pct,
      CASE WHEN COALESCE(prev.total_cost, 0) > 0 
        THEN ROUND(((cur.total_cost - prev.total_cost) * 100.0 / prev.total_cost), 2) 
        ELSE NULL END as cost_change_pct
    FROM monthly_records cur
    JOIN units u ON cur.unit_id = u.id
    JOIN materials m ON cur.material_id = m.id
    LEFT JOIN monthly_records prev 
      ON cur.unit_id = prev.unit_id 
      AND cur.material_id = prev.material_id 
      AND prev.year = ? AND prev.month = ?
    WHERE cur.year = ? AND cur.month = ?
    ${unitFilter}
    ORDER BY u.unit_code, m.category, m.material_code
  `

  // Reorder params: prev first (for JOIN), then cur (for WHERE)
  const orderedParams = [prevYear, prevMonth, currentYear, currentMonth]
  if (unit_id) orderedParams.push(parseInt(unit_id))

  const results = await db.prepare(query).bind(...orderedParams).all()
  
  // 집계 데이터 계산
  const items = results.results as any[]
  const summary = {
    total_prev_cost: items.reduce((sum, r) => sum + (r.prev_total_cost || 0), 0),
    total_cur_cost: items.reduce((sum, r) => sum + (r.cur_total_cost || 0), 0),
    total_cost_diff: items.reduce((sum, r) => sum + (r.cost_diff || 0), 0),
    total_qty_effect: items.reduce((sum, r) => sum + (r.qty_effect || 0), 0),
    total_price_effect: items.reduce((sum, r) => sum + (r.price_effect || 0), 0),
    item_count: items.length,
    period: { current: `${currentYear}-${String(currentMonth).padStart(2,'0')}`, previous: `${prevYear}-${String(prevMonth).padStart(2,'0')}` }
  }

  return c.json({ items, summary })
})

// 호기별 요약 분석
app.get('/api/analysis/unit-summary', async (c) => {
  const db = c.env.DB
  const { year, month } = c.req.query()
  
  if (!year || !month) {
    return c.json({ error: 'year and month are required' }, 400)
  }

  const currentYear = parseInt(year)
  const currentMonth = parseInt(month)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const query = `
    SELECT 
      u.id as unit_id,
      u.unit_code,
      u.unit_name,
      SUM(COALESCE(prev.total_cost, 0)) as prev_total_cost,
      SUM(cur.total_cost) as cur_total_cost,
      SUM(cur.total_cost - COALESCE(prev.total_cost, 0)) as cost_diff,
      SUM((cur.usage_qty - COALESCE(prev.usage_qty, 0)) * COALESCE(prev.unit_price, 0)) as total_qty_effect,
      SUM((cur.unit_price - COALESCE(prev.unit_price, 0)) * cur.usage_qty) as total_price_effect,
      COUNT(cur.id) as material_count,
      MAX(cur.production_qty) as production_qty
    FROM monthly_records cur
    JOIN units u ON cur.unit_id = u.id
    LEFT JOIN monthly_records prev 
      ON cur.unit_id = prev.unit_id 
      AND cur.material_id = prev.material_id 
      AND prev.year = ? AND prev.month = ?
    WHERE cur.year = ? AND cur.month = ?
    GROUP BY u.id, u.unit_code, u.unit_name
    ORDER BY u.unit_code
  `

  const results = await db.prepare(query).bind(prevYear, prevMonth, currentYear, currentMonth).all()
  return c.json(results.results)
})

// 카테고리별 분석 (원자재/부자재 구분)
app.get('/api/analysis/category-summary', async (c) => {
  const db = c.env.DB
  const { unit_id, year, month } = c.req.query()
  
  if (!year || !month) {
    return c.json({ error: 'year and month are required' }, 400)
  }

  const currentYear = parseInt(year)
  const currentMonth = parseInt(month)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  let unitFilter = ''
  const params: any[] = [prevYear, prevMonth, currentYear, currentMonth]
  if (unit_id) {
    unitFilter = 'AND cur.unit_id = ?'
    params.push(parseInt(unit_id))
  }

  const query = `
    SELECT 
      m.category,
      CASE m.category WHEN 'RAW' THEN '원자재' ELSE '부자재' END as category_name,
      SUM(COALESCE(prev.total_cost, 0)) as prev_total_cost,
      SUM(cur.total_cost) as cur_total_cost,
      SUM(cur.total_cost - COALESCE(prev.total_cost, 0)) as cost_diff,
      SUM((cur.usage_qty - COALESCE(prev.usage_qty, 0)) * COALESCE(prev.unit_price, 0)) as total_qty_effect,
      SUM((cur.unit_price - COALESCE(prev.unit_price, 0)) * cur.usage_qty) as total_price_effect,
      COUNT(cur.id) as material_count
    FROM monthly_records cur
    JOIN materials m ON cur.material_id = m.id
    LEFT JOIN monthly_records prev 
      ON cur.unit_id = prev.unit_id 
      AND cur.material_id = prev.material_id 
      AND prev.year = ? AND prev.month = ?
    WHERE cur.year = ? AND cur.month = ?
    ${unitFilter}
    GROUP BY m.category
    ORDER BY m.category
  `

  const results = await db.prepare(query).bind(...params).all()
  return c.json(results.results)
})

// 호기 등록
app.post('/api/units', async (c) => {
  const db = c.env.DB
  const { unit_code, unit_name, description } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO units (unit_code, unit_name, description) VALUES (?, ?, ?)'
  ).bind(unit_code, unit_name, description || '').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

// 원부자재 등록
app.post('/api/materials', async (c) => {
  const db = c.env.DB
  const { material_code, material_name, category, unit_of_measure, description } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO materials (material_code, material_name, category, unit_of_measure, description) VALUES (?, ?, ?, ?, ?)'
  ).bind(material_code, material_name, category || 'RAW', unit_of_measure || 'kg', description || '').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

// 실적 삭제
app.delete('/api/records/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('DELETE FROM monthly_records WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ============ 메인 페이지 ============
app.get('/', (c) => {
  return c.html(mainPage())
})

function mainPage() {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>원부자재 사전원가 분석 시스템</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: { 50:'#eff6ff', 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 800:'#1e40af', 900:'#1e3a8a' },
          }
        }
      }
    }
  </script>
  <style>
    .tab-active { border-bottom: 3px solid #2563eb; color: #2563eb; font-weight: 600; }
    .positive { color: #dc2626; }
    .negative { color: #2563eb; }
    .card-shadow { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    table th { position: sticky; top: 0; z-index: 10; }
    .tooltip { position: relative; }
    .tooltip:hover::after { content: attr(data-tip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #1f2937; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-primary-600 text-white p-2 rounded-lg">
            <i class="fas fa-chart-line text-xl"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">원부자재 사전원가 분석</h1>
            <p class="text-xs text-gray-500">Material Cost Variance Analysis</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <label class="text-sm font-medium text-gray-600">분석기간:</label>
            <select id="analysisYear" class="bg-transparent text-sm font-semibold border-none focus:ring-0" onchange="loadAnalysis()">
              <option value="2026">2026년</option>
              <option value="2025">2025년</option>
            </select>
            <select id="analysisMonth" class="bg-transparent text-sm font-semibold border-none focus:ring-0" onchange="loadAnalysis()">
              <option value="6">6월</option>
              <option value="5">5월</option>
              <option value="4">4월</option>
              <option value="3">3월</option>
              <option value="2">2월</option>
              <option value="1">1월</option>
            </select>
          </div>
          <select id="unitFilter" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" onchange="loadAnalysis()">
            <option value="">전체 호기</option>
          </select>
        </div>
      </div>
    </div>
  </header>

  <!-- Tabs -->
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex gap-6">
        <button onclick="switchTab('dashboard')" id="tab-dashboard" class="py-3 px-1 text-sm tab-active">
          <i class="fas fa-tachometer-alt mr-1"></i> 대시보드
        </button>
        <button onclick="switchTab('detail')" id="tab-detail" class="py-3 px-1 text-sm text-gray-500 hover:text-gray-700">
          <i class="fas fa-table mr-1"></i> 상세분석
        </button>
        <button onclick="switchTab('input')" id="tab-input" class="py-3 px-1 text-sm text-gray-500 hover:text-gray-700">
          <i class="fas fa-edit mr-1"></i> 데이터입력
        </button>
        <button onclick="switchTab('master')" id="tab-master" class="py-3 px-1 text-sm text-gray-500 hover:text-gray-700">
          <i class="fas fa-database mr-1"></i> 기준정보
        </button>
      </div>
    </div>
  </nav>

  <!-- Content -->
  <main class="max-w-7xl mx-auto px-4 py-6">
    <!-- Dashboard Tab -->
    <div id="content-dashboard" class="fade-in">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-5 card-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">전월 총원가</span>
            <i class="fas fa-calendar-minus text-gray-400"></i>
          </div>
          <p id="summary-prev-cost" class="text-2xl font-bold text-gray-900">-</p>
          <p class="text-xs text-gray-400 mt-1">원</p>
        </div>
        <div class="bg-white rounded-xl p-5 card-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">당월 총원가</span>
            <i class="fas fa-calendar text-gray-400"></i>
          </div>
          <p id="summary-cur-cost" class="text-2xl font-bold text-gray-900">-</p>
          <p class="text-xs text-gray-400 mt-1">원</p>
        </div>
        <div class="bg-white rounded-xl p-5 card-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">수량차이 효과</span>
            <i class="fas fa-boxes text-blue-400"></i>
          </div>
          <p id="summary-qty-effect" class="text-2xl font-bold">-</p>
          <p class="text-xs text-gray-400 mt-1">사용량 변동에 의한 원가차이</p>
        </div>
        <div class="bg-white rounded-xl p-5 card-shadow">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">단가차이 효과</span>
            <i class="fas fa-won-sign text-green-400"></i>
          </div>
          <p id="summary-price-effect" class="text-2xl font-bold">-</p>
          <p class="text-xs text-gray-400 mt-1">단가 변동에 의한 원가차이</p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-xl p-5 card-shadow">
          <h3 class="text-sm font-semibold text-gray-700 mb-4"><i class="fas fa-industry mr-1"></i> 호기별 원가 비교</h3>
          <canvas id="unitChart" height="250"></canvas>
        </div>
        <div class="bg-white rounded-xl p-5 card-shadow">
          <h3 class="text-sm font-semibold text-gray-700 mb-4"><i class="fas fa-balance-scale mr-1"></i> 손익효과 분해 (수량 vs 단가)</h3>
          <canvas id="effectChart" height="250"></canvas>
        </div>
      </div>

      <!-- Category Summary & Top Impact -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-5 card-shadow">
          <h3 class="text-sm font-semibold text-gray-700 mb-4"><i class="fas fa-layer-group mr-1"></i> 카테고리별 분석</h3>
          <div id="category-summary" class="space-y-3"></div>
        </div>
        <div class="bg-white rounded-xl p-5 card-shadow">
          <h3 class="text-sm font-semibold text-gray-700 mb-4"><i class="fas fa-exclamation-triangle mr-1"></i> 원가 영향 TOP 5</h3>
          <div id="top-impact" class="space-y-2"></div>
        </div>
      </div>
    </div>

    <!-- Detail Tab -->
    <div id="content-detail" class="hidden fade-in">
      <div class="bg-white rounded-xl card-shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-semibold text-gray-700"><i class="fas fa-table mr-2"></i>전월 대비 상세 분석표</h3>
          <button onclick="exportCSV()" class="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
            <i class="fas fa-file-csv mr-1"></i> CSV 내보내기
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-3 text-left font-semibold text-gray-600 border-b">호기</th>
                <th class="px-3 py-3 text-left font-semibold text-gray-600 border-b">구분</th>
                <th class="px-3 py-3 text-left font-semibold text-gray-600 border-b">자재명</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">전월수량</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">당월수량</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">수량차이</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">전월단가</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">당월단가</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">단가차이</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">전월원가</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">당월원가</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">수량효과</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">단가효과</th>
                <th class="px-3 py-3 text-right font-semibold text-gray-600 border-b">총차이</th>
              </tr>
            </thead>
            <tbody id="detail-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Input Tab -->
    <div id="content-input" class="hidden fade-in">
      <div class="bg-white rounded-xl p-6 card-shadow">
        <h3 class="font-semibold text-gray-700 mb-4"><i class="fas fa-edit mr-2"></i>실적 데이터 입력</h3>
        <form id="record-form" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">호기</label>
            <select id="input-unit" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" required></select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">원부자재</label>
            <select id="input-material" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" required></select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">년도</label>
              <input type="number" id="input-year" value="2026" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">월</label>
              <input type="number" id="input-month" min="1" max="12" value="6" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">사용량</label>
            <input type="number" id="input-qty" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">단가 (원)</label>
            <input type="number" id="input-price" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">생산량</label>
            <input type="number" id="input-production" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2">
          </div>
          <div class="md:col-span-3 flex gap-3">
            <button type="submit" class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium">
              <i class="fas fa-save mr-1"></i> 저장
            </button>
            <button type="reset" class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
              <i class="fas fa-undo mr-1"></i> 초기화
            </button>
          </div>
        </form>
      </div>

      <!-- Recent Records -->
      <div class="bg-white rounded-xl p-6 card-shadow mt-6">
        <h3 class="font-semibold text-gray-700 mb-4"><i class="fas fa-history mr-2"></i>최근 입력 데이터</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left border-b">호기</th>
                <th class="px-3 py-2 text-left border-b">자재</th>
                <th class="px-3 py-2 text-center border-b">기간</th>
                <th class="px-3 py-2 text-right border-b">사용량</th>
                <th class="px-3 py-2 text-right border-b">단가</th>
                <th class="px-3 py-2 text-right border-b">총원가</th>
                <th class="px-3 py-2 text-center border-b">작업</th>
              </tr>
            </thead>
            <tbody id="recent-records"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Master Tab -->
    <div id="content-master" class="hidden fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Units Master -->
        <div class="bg-white rounded-xl p-6 card-shadow">
          <h3 class="font-semibold text-gray-700 mb-4"><i class="fas fa-industry mr-2"></i>호기 관리</h3>
          <form id="unit-form" class="flex gap-2 mb-4">
            <input type="text" id="new-unit-code" placeholder="호기코드 (예: UNIT-05)" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
            <input type="text" id="new-unit-name" placeholder="호기명 (예: 5호기)" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
            <button type="submit" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">추가</button>
          </form>
          <div id="units-list" class="space-y-2"></div>
        </div>
        <!-- Materials Master -->
        <div class="bg-white rounded-xl p-6 card-shadow">
          <h3 class="font-semibold text-gray-700 mb-4"><i class="fas fa-cubes mr-2"></i>원부자재 관리</h3>
          <form id="material-form" class="space-y-2 mb-4">
            <div class="flex gap-2">
              <input type="text" id="new-mat-code" placeholder="자재코드" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
              <input type="text" id="new-mat-name" placeholder="자재명" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
            </div>
            <div class="flex gap-2">
              <select id="new-mat-category" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="RAW">원자재</option>
                <option value="SUB">부자재</option>
              </select>
              <input type="text" id="new-mat-uom" placeholder="단위 (kg, L, EA)" value="kg" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
              <button type="submit" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">추가</button>
            </div>
          </form>
          <div id="materials-list" class="space-y-2 max-h-96 overflow-y-auto"></div>
        </div>
      </div>
    </div>
  </main>

  <script>
    // ============ Global State ============
    let analysisData = null;
    let unitSummaryData = null;
    let categorySummaryData = null;
    let unitsCache = [];
    let materialsCache = [];
    let unitChartInstance = null;
    let effectChartInstance = null;

    // ============ Initialization ============
    document.addEventListener('DOMContentLoaded', async () => {
      await loadMasterData();
      await loadAnalysis();
    });

    // ============ Tab Navigation ============
    function switchTab(tab) {
      ['dashboard','detail','input','master'].forEach(t => {
        document.getElementById('content-' + t).classList.add('hidden');
        document.getElementById('tab-' + t).classList.remove('tab-active');
        document.getElementById('tab-' + t).classList.add('text-gray-500');
      });
      document.getElementById('content-' + tab).classList.remove('hidden');
      document.getElementById('tab-' + tab).classList.add('tab-active');
      document.getElementById('tab-' + tab).classList.remove('text-gray-500');

      if (tab === 'input') loadRecentRecords();
      if (tab === 'master') { loadUnitsList(); loadMaterialsList(); }
    }

    // ============ Data Loading ============
    async function loadMasterData() {
      const [unitsRes, matsRes] = await Promise.all([
        fetch('/api/units').then(r => r.json()),
        fetch('/api/materials').then(r => r.json())
      ]);
      unitsCache = unitsRes;
      materialsCache = matsRes;
      
      // Populate unit filter
      const unitFilter = document.getElementById('unitFilter');
      unitFilter.innerHTML = '<option value="">전체 호기</option>' + 
        unitsCache.map(u => '<option value="'+u.id+'">'+u.unit_name+'</option>').join('');
      
      // Populate input selects
      document.getElementById('input-unit').innerHTML = 
        unitsCache.map(u => '<option value="'+u.id+'">'+u.unit_name+' ('+u.unit_code+')</option>').join('');
      document.getElementById('input-material').innerHTML = 
        materialsCache.map(m => '<option value="'+m.id+'">['+m.category+'] '+m.material_name+' ('+m.unit_of_measure+')</option>').join('');
    }

    async function loadAnalysis() {
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value;
      const unitId = document.getElementById('unitFilter').value;
      
      const params = new URLSearchParams({ year, month });
      if (unitId) params.set('unit_id', unitId);
      
      const [comparison, unitSummary, catSummary] = await Promise.all([
        fetch('/api/analysis/comparison?' + params).then(r => r.json()),
        fetch('/api/analysis/unit-summary?' + new URLSearchParams({ year, month })).then(r => r.json()),
        fetch('/api/analysis/category-summary?' + params).then(r => r.json())
      ]);
      
      analysisData = comparison;
      unitSummaryData = unitSummary;
      categorySummaryData = catSummary;
      
      renderDashboard();
      renderDetailTable();
    }

    // ============ Dashboard Rendering ============
    function renderDashboard() {
      if (!analysisData) return;
      const s = analysisData.summary;
      
      document.getElementById('summary-prev-cost').textContent = formatNumber(s.total_prev_cost);
      document.getElementById('summary-cur-cost').textContent = formatNumber(s.total_cur_cost);
      
      const qtyEl = document.getElementById('summary-qty-effect');
      qtyEl.textContent = formatSignedNumber(s.total_qty_effect) + '원';
      qtyEl.className = 'text-2xl font-bold ' + (s.total_qty_effect > 0 ? 'positive' : 'negative');
      
      const priceEl = document.getElementById('summary-price-effect');
      priceEl.textContent = formatSignedNumber(s.total_price_effect) + '원';
      priceEl.className = 'text-2xl font-bold ' + (s.total_price_effect > 0 ? 'positive' : 'negative');
      
      renderUnitChart();
      renderEffectChart();
      renderCategorySummary();
      renderTopImpact();
    }

    function renderUnitChart() {
      if (!unitSummaryData || unitSummaryData.length === 0) return;
      const ctx = document.getElementById('unitChart').getContext('2d');
      
      if (unitChartInstance) unitChartInstance.destroy();
      
      unitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: unitSummaryData.map(u => u.unit_name),
          datasets: [
            { label: '전월 원가', data: unitSummaryData.map(u => u.prev_total_cost), backgroundColor: 'rgba(59,130,246,0.6)', borderRadius: 4 },
            { label: '당월 원가', data: unitSummaryData.map(u => u.cur_total_cost), backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true, ticks: { callback: v => (v/1000000).toFixed(1)+'M' } } }
        }
      });
    }

    function renderEffectChart() {
      if (!unitSummaryData || unitSummaryData.length === 0) return;
      const ctx = document.getElementById('effectChart').getContext('2d');
      
      if (effectChartInstance) effectChartInstance.destroy();
      
      effectChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: unitSummaryData.map(u => u.unit_name),
          datasets: [
            { label: '수량차이 효과', data: unitSummaryData.map(u => u.total_qty_effect), backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 4 },
            { label: '단가차이 효과', data: unitSummaryData.map(u => u.total_price_effect), backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { y: { ticks: { callback: v => (v/1000000).toFixed(1)+'M' } } }
        }
      });
    }

    function renderCategorySummary() {
      const container = document.getElementById('category-summary');
      if (!categorySummaryData || categorySummaryData.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">데이터 없음</p>';
        return;
      }
      container.innerHTML = categorySummaryData.map(cat => {
        const costDiffClass = cat.cost_diff > 0 ? 'positive' : 'negative';
        return \`
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-gray-700">\${cat.category_name} (\${cat.material_count}건)</span>
              <span class="text-sm \${costDiffClass} font-medium">\${formatSignedNumber(cat.cost_diff)}원</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="text-center p-2 bg-gray-50 rounded">
                <p class="text-gray-500">전월원가</p>
                <p class="font-medium">\${formatCompact(cat.prev_total_cost)}</p>
              </div>
              <div class="text-center p-2 bg-gray-50 rounded">
                <p class="text-gray-500">수량효과</p>
                <p class="font-medium \${cat.total_qty_effect > 0 ? 'positive' : 'negative'}">\${formatCompact(cat.total_qty_effect)}</p>
              </div>
              <div class="text-center p-2 bg-gray-50 rounded">
                <p class="text-gray-500">단가효과</p>
                <p class="font-medium \${cat.total_price_effect > 0 ? 'positive' : 'negative'}">\${formatCompact(cat.total_price_effect)}</p>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderTopImpact() {
      const container = document.getElementById('top-impact');
      if (!analysisData || !analysisData.items.length) {
        container.innerHTML = '<p class="text-gray-400 text-sm">데이터 없음</p>';
        return;
      }
      const sorted = [...analysisData.items].sort((a,b) => Math.abs(b.cost_diff) - Math.abs(a.cost_diff)).slice(0,5);
      container.innerHTML = sorted.map((item, idx) => {
        const isUp = item.cost_diff > 0;
        return \`
          <div class="flex items-center justify-between p-3 rounded-lg \${isUp ? 'bg-red-50' : 'bg-blue-50'} border \${isUp ? 'border-red-100' : 'border-blue-100'}">
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold \${isUp ? 'text-red-400' : 'text-blue-400'}">#\${idx+1}</span>
              <div>
                <p class="text-sm font-medium text-gray-700">\${item.material_name}</p>
                <p class="text-xs text-gray-500">\${item.unit_name} | \${item.category === 'RAW' ? '원자재' : '부자재'}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold \${isUp ? 'positive' : 'negative'}">\${formatSignedNumber(item.cost_diff)}원</p>
              <p class="text-xs text-gray-500">수량:\${formatCompact(item.qty_effect)} / 단가:\${formatCompact(item.price_effect)}</p>
            </div>
          </div>
        \`;
      }).join('');
    }

    // ============ Detail Table ============
    function renderDetailTable() {
      const tbody = document.getElementById('detail-table-body');
      if (!analysisData || !analysisData.items.length) {
        tbody.innerHTML = '<tr><td colspan="14" class="text-center py-8 text-gray-400">데이터가 없습니다</td></tr>';
        return;
      }
      tbody.innerHTML = analysisData.items.map(item => \`
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-3 py-2 font-medium">\${item.unit_name}</td>
          <td class="px-3 py-2"><span class="px-2 py-0.5 text-xs rounded-full \${item.category==='RAW'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}">\${item.category==='RAW'?'원자재':'부자재'}</span></td>
          <td class="px-3 py-2">\${item.material_name}</td>
          <td class="px-3 py-2 text-right">\${formatNumber(item.prev_usage_qty)}</td>
          <td class="px-3 py-2 text-right">\${formatNumber(item.cur_usage_qty)}</td>
          <td class="px-3 py-2 text-right \${item.qty_diff>0?'positive':'negative'}">\${formatSignedNumber(item.qty_diff)}</td>
          <td class="px-3 py-2 text-right">\${formatNumber(item.prev_unit_price)}</td>
          <td class="px-3 py-2 text-right">\${formatNumber(item.cur_unit_price)}</td>
          <td class="px-3 py-2 text-right \${item.price_diff>0?'positive':'negative'}">\${formatSignedNumber(item.price_diff)}</td>
          <td class="px-3 py-2 text-right">\${formatNumber(item.prev_total_cost)}</td>
          <td class="px-3 py-2 text-right">\${formatNumber(item.cur_total_cost)}</td>
          <td class="px-3 py-2 text-right font-medium \${item.qty_effect>0?'positive':'negative'}">\${formatSignedNumber(item.qty_effect)}</td>
          <td class="px-3 py-2 text-right font-medium \${item.price_effect>0?'positive':'negative'}">\${formatSignedNumber(item.price_effect)}</td>
          <td class="px-3 py-2 text-right font-bold \${item.cost_diff>0?'positive':'negative'}">\${formatSignedNumber(item.cost_diff)}</td>
        </tr>
      \`).join('');
    }

    // ============ CSV Export ============
    function exportCSV() {
      if (!analysisData || !analysisData.items.length) return alert('데이터가 없습니다');
      const headers = '호기,구분,자재명,전월수량,당월수량,수량차이,전월단가,당월단가,단가차이,전월원가,당월원가,수량효과,단가효과,총차이\\n';
      const rows = analysisData.items.map(i => 
        [i.unit_name, i.category==='RAW'?'원자재':'부자재', i.material_name,
         i.prev_usage_qty, i.cur_usage_qty, i.qty_diff,
         i.prev_unit_price, i.cur_unit_price, i.price_diff,
         i.prev_total_cost, i.cur_total_cost, i.qty_effect, i.price_effect, i.cost_diff].join(',')
      ).join('\\n');
      
      const blob = new Blob(['\\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = \`원가분석_\${document.getElementById('analysisYear').value}_\${document.getElementById('analysisMonth').value}.csv\`;
      link.click();
    }

    // ============ Data Input ============
    document.getElementById('record-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        unit_id: parseInt(document.getElementById('input-unit').value),
        material_id: parseInt(document.getElementById('input-material').value),
        year: parseInt(document.getElementById('input-year').value),
        month: parseInt(document.getElementById('input-month').value),
        usage_qty: parseFloat(document.getElementById('input-qty').value),
        unit_price: parseFloat(document.getElementById('input-price').value),
        production_qty: parseFloat(document.getElementById('input-production').value || '0')
      };
      
      const res = await fetch('/api/records', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
      if (res.ok) {
        alert('저장되었습니다!');
        document.getElementById('record-form').reset();
        document.getElementById('input-year').value = '2026';
        document.getElementById('input-month').value = '6';
        loadRecentRecords();
        loadAnalysis();
      } else {
        alert('저장 실패');
      }
    });

    async function loadRecentRecords() {
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value;
      const res = await fetch(\`/api/records?year=\${year}&month=\${month}\`);
      const records = await res.json();
      const tbody = document.getElementById('recent-records');
      tbody.innerHTML = records.slice(0, 20).map(r => \`
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-3 py-2">\${r.unit_name}</td>
          <td class="px-3 py-2">\${r.material_name}</td>
          <td class="px-3 py-2 text-center">\${r.year}-\${String(r.month).padStart(2,'0')}</td>
          <td class="px-3 py-2 text-right">\${formatNumber(r.usage_qty)} \${r.unit_of_measure}</td>
          <td class="px-3 py-2 text-right">\${formatNumber(r.unit_price)}원</td>
          <td class="px-3 py-2 text-right font-medium">\${formatNumber(r.total_cost)}원</td>
          <td class="px-3 py-2 text-center">
            <button onclick="deleteRecord(\${r.id})" class="text-red-500 hover:text-red-700"><i class="fas fa-trash-alt"></i></button>
          </td>
        </tr>
      \`).join('');
    }

    async function deleteRecord(id) {
      if (!confirm('삭제하시겠습니까?')) return;
      await fetch('/api/records/' + id, { method: 'DELETE' });
      loadRecentRecords();
      loadAnalysis();
    }

    // ============ Master Data Management ============
    document.getElementById('unit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          unit_code: document.getElementById('new-unit-code').value,
          unit_name: document.getElementById('new-unit-name').value
        })
      });
      if (res.ok) { loadUnitsList(); loadMasterData(); document.getElementById('unit-form').reset(); }
    });

    document.getElementById('material-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          material_code: document.getElementById('new-mat-code').value,
          material_name: document.getElementById('new-mat-name').value,
          category: document.getElementById('new-mat-category').value,
          unit_of_measure: document.getElementById('new-mat-uom').value
        })
      });
      if (res.ok) { loadMaterialsList(); loadMasterData(); document.getElementById('material-form').reset(); }
    });

    async function loadUnitsList() {
      const units = await fetch('/api/units').then(r => r.json());
      document.getElementById('units-list').innerHTML = units.map(u => \`
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <span class="font-medium text-gray-700">\${u.unit_name}</span>
            <span class="text-xs text-gray-400 ml-2">\${u.unit_code}</span>
          </div>
          <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">활성</span>
        </div>
      \`).join('');
    }

    async function loadMaterialsList() {
      const mats = await fetch('/api/materials').then(r => r.json());
      document.getElementById('materials-list').innerHTML = mats.map(m => \`
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <span class="font-medium text-gray-700">\${m.material_name}</span>
            <span class="text-xs text-gray-400 ml-2">\${m.material_code}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">\${m.unit_of_measure}</span>
            <span class="text-xs px-2 py-1 rounded-full \${m.category==='RAW'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}">\${m.category==='RAW'?'원자재':'부자재'}</span>
          </div>
        </div>
      \`).join('');
    }

    // ============ Utility Functions ============
    function formatNumber(n) {
      if (n == null) return '-';
      return Math.round(n).toLocaleString('ko-KR');
    }

    function formatSignedNumber(n) {
      if (n == null) return '-';
      const val = Math.round(n);
      return (val > 0 ? '+' : '') + val.toLocaleString('ko-KR');
    }

    function formatCompact(n) {
      if (n == null) return '-';
      const abs = Math.abs(n);
      const sign = n >= 0 ? '+' : '-';
      if (abs >= 1000000) return sign + (abs/1000000).toFixed(1) + 'M';
      if (abs >= 1000) return sign + (abs/1000).toFixed(0) + 'K';
      return sign + Math.round(abs);
    }
  </script>
</body>
</html>`
}

export default app
