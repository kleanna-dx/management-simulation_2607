import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { mainPage } from './pages/main'
import { registry } from './core'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ============ Division 필터 헬퍼 ============
/** API 요청에서 division 파라미터를 추출하여 SQL WHERE 조건 생성 */
function getDivisionFilter(c: any): { division: string; sql: string; bind: string } {
  const division = c.req.query('division') || 'PS'
  return { 
    division,
    sql: " AND division = ?",
    bind: division
  }
}


// ============ 사업부 (Division) API ============

/** 등록된 사업부 목록 조회 */
app.get('/api/divisions', (c) => {
  return c.json(registry.list())
})

/** 공통코드 API — 사업부 설정에서 파생된 모든 메타데이터를 한 번에 반환 */
app.get('/api/common-codes', (c) => {
  const div = c.req.query('division') || 'PS'
  const division = registry.get(div)
  if (!division) return c.json({ error: 'Division not found' }, 404)

  const cfg = division.config

  // 호기 → 플랜트 매핑
  const machinePlantMap: Record<string, string> = {}
  cfg.factories.forEach(f => {
    f.machines.forEach(mc => { machinePlantMap[mc] = f.code === 'CJ' ? 'P100' : f.code === 'ES' ? 'P200' : f.code })
  })

  // 호기 → 칩 컬러 CSS 클래스 (순환 할당)
  const chipColors = ['unit-chip-pm2', 'unit-chip-pm3', 'unit-chip-chem', 'unit-chip-tissue']
  const machineChipMap: Record<string, string> = {}
  cfg.machines.forEach((m, idx) => {
    machineChipMap[m.code] = chipColors[idx % chipColors.length]
  })

  // 호기 → 기본 지종 매핑
  const machineDefaultGrades: Record<string, string[]> = {}
  cfg.machines.forEach(m => {
    machineDefaultGrades[m.code] = m.mainProducts || ['기본']
  })

  // 플랜트 목록
  const plants = cfg.factories.map(f => ({
    code: f.code === 'CJ' ? 'P100' : f.code === 'ES' ? 'P200' : f.code,
    name: f.name,
    location: f.location
  }))

  return c.json({
    division: cfg.code,
    name: cfg.name,
    description: cfg.description,
    unitCostLabel: cfg.unitCostLabel,
    productionUnit: cfg.productionUnit,
    usageUnit: cfg.usageUnit,
    machines: cfg.machines,
    machinePlantMap,
    machineChipMap,
    machineDefaultGrades,
    plants,
    materialGroups: cfg.materialGroups,
    productClassification: cfg.productClassification
  })
})

/** 특정 사업부 설정 조회 */
app.get('/api/divisions/:code', (c) => {
  const code = c.req.param('code')
  const division = registry.get(code)
  if (!division) return c.json({ error: 'Division not found' }, 404)
  return c.json(division.config)
})

/** 특정 사업부의 호기 목록 */
app.get('/api/divisions/:code/machines', (c) => {
  const code = c.req.param('code')
  const division = registry.get(code)
  if (!division) return c.json({ error: 'Division not found' }, 404)
  return c.json(division.config.machines)
})

/** 특정 사업부의 자재 그룹 체계 */
app.get('/api/divisions/:code/material-groups', (c) => {
  const code = c.req.param('code')
  const division = registry.get(code)
  if (!division) return c.json({ error: 'Division not found' }, 404)
  return c.json(division.config.materialGroups)
})

// ============ 기본 마스터 API ============

app.get('/api/units', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT * FROM units WHERE is_active = 1 ORDER BY id').all()
  return c.json(results.results)
})

app.get('/api/materials', async (c) => {
  const db = c.env.DB
  const category = c.req.query('category')
  let query = 'SELECT * FROM materials WHERE is_active = 1'
  if (category) query += ` AND category = '${category}'`
  query += ' ORDER BY category, material_code'
  const results = await db.prepare(query).all()
  return c.json(results.results)
})

app.get('/api/records', async (c) => {
  const db = c.env.DB
  const { unit_id, year, month } = c.req.query()
  let query = `SELECT mr.*, u.unit_code, u.unit_name, m.material_code, m.material_name, m.category, m.unit_of_measure
    FROM monthly_records mr JOIN units u ON mr.unit_id = u.id JOIN materials m ON mr.material_id = m.id WHERE 1=1`
  const params: any[] = []
  if (unit_id) { query += ' AND mr.unit_id = ?'; params.push(unit_id) }
  if (year) { query += ' AND mr.year = ?'; params.push(year) }
  if (month) { query += ' AND mr.month = ?'; params.push(month) }
  query += ' ORDER BY u.unit_code, m.category, m.material_code'
  const stmt = db.prepare(query)
  const results = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all()
  return c.json(results.results)
})

app.post('/api/records', async (c) => {
  const db = c.env.DB
  const { unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes } = await c.req.json()
  const result = await db.prepare(`
    INSERT INTO monthly_records (unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(unit_id, material_id, year, month) 
    DO UPDATE SET usage_qty = ?, unit_price = ?, production_qty = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
  `).bind(unit_id, material_id, year, month, usage_qty, unit_price, production_qty || 0, notes || '',
          usage_qty, unit_price, production_qty || 0, notes || '').run()
  return c.json({ success: true, meta: result.meta })
})

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

app.delete('/api/records/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM monthly_records WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

app.post('/api/units', async (c) => {
  const db = c.env.DB
  const { unit_code, unit_name, description } = await c.req.json()
  const result = await db.prepare('INSERT INTO units (unit_code, unit_name, description) VALUES (?, ?, ?)').bind(unit_code, unit_name, description || '').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.post('/api/materials', async (c) => {
  const db = c.env.DB
  const { material_code, material_name, category, unit_of_measure, description } = await c.req.json()
  const result = await db.prepare('INSERT INTO materials (material_code, material_name, category, unit_of_measure, description) VALUES (?, ?, ?, ?, ?)').bind(material_code, material_name, category || 'RAW', unit_of_measure || 'kg', description || '').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

// ============ 분석 API ============

app.get('/api/analysis/comparison', async (c) => {
  const db = c.env.DB
  const { unit_id, year, month } = c.req.query()
  if (!year || !month) return c.json({ error: 'year and month are required' }, 400)
  
  const currentYear = parseInt(year), currentMonth = parseInt(month)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  let unitFilter = ''
  const orderedParams: any[] = [prevYear, prevMonth, currentYear, currentMonth]
  if (unit_id) { unitFilter = 'AND cur.unit_id = ?'; orderedParams.push(parseInt(unit_id)) }

  const query = `
    SELECT cur.unit_id, u.unit_code, u.unit_name, cur.material_id, m.material_code, m.material_name, m.category, m.unit_of_measure,
      COALESCE(prev.usage_qty,0) as prev_usage_qty, COALESCE(prev.unit_price,0) as prev_unit_price, COALESCE(prev.total_cost,0) as prev_total_cost, COALESCE(prev.production_qty,0) as prev_production_qty,
      cur.usage_qty as cur_usage_qty, cur.unit_price as cur_unit_price, cur.total_cost as cur_total_cost, cur.production_qty as cur_production_qty,
      (cur.usage_qty - COALESCE(prev.usage_qty,0)) as qty_diff, (cur.unit_price - COALESCE(prev.unit_price,0)) as price_diff, (cur.total_cost - COALESCE(prev.total_cost,0)) as cost_diff,
      ((cur.usage_qty - COALESCE(prev.usage_qty,0)) * COALESCE(prev.unit_price,0)) as qty_effect,
      ((cur.unit_price - COALESCE(prev.unit_price,0)) * cur.usage_qty) as price_effect,
      CASE WHEN COALESCE(prev.usage_qty,0)>0 THEN ROUND(((cur.usage_qty-prev.usage_qty)*100.0/prev.usage_qty),2) ELSE NULL END as qty_change_pct,
      CASE WHEN COALESCE(prev.unit_price,0)>0 THEN ROUND(((cur.unit_price-prev.unit_price)*100.0/prev.unit_price),2) ELSE NULL END as price_change_pct,
      CASE WHEN COALESCE(prev.total_cost,0)>0 THEN ROUND(((cur.total_cost-prev.total_cost)*100.0/prev.total_cost),2) ELSE NULL END as cost_change_pct
    FROM monthly_records cur JOIN units u ON cur.unit_id=u.id JOIN materials m ON cur.material_id=m.id
    LEFT JOIN monthly_records prev ON cur.unit_id=prev.unit_id AND cur.material_id=prev.material_id AND prev.year=? AND prev.month=?
    WHERE cur.year=? AND cur.month=? ${unitFilter}
    ORDER BY u.unit_code, m.category, m.material_code`

  const results = await db.prepare(query).bind(...orderedParams).all()
  const items = results.results as any[]
  const summary = {
    total_prev_cost: items.reduce((s,r) => s+(r.prev_total_cost||0), 0),
    total_cur_cost: items.reduce((s,r) => s+(r.cur_total_cost||0), 0),
    total_cost_diff: items.reduce((s,r) => s+(r.cost_diff||0), 0),
    total_qty_effect: items.reduce((s,r) => s+(r.qty_effect||0), 0),
    total_price_effect: items.reduce((s,r) => s+(r.price_effect||0), 0),
    item_count: items.length,
    period: { current: `${currentYear}-${String(currentMonth).padStart(2,'0')}`, previous: `${prevYear}-${String(prevMonth).padStart(2,'0')}` }
  }
  return c.json({ items, summary })
})

app.get('/api/analysis/unit-summary', async (c) => {
  const db = c.env.DB
  const { year, month } = c.req.query()
  if (!year || !month) return c.json({ error: 'year and month are required' }, 400)
  const div = c.req.query('division') || 'PS'
  const currentMonth = parseInt(month)
  const currentYear = parseInt(year)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
  const curYm = String(currentYear) + String(currentMonth).padStart(2, '0')
  const prevYm = String(prevYear) + String(prevMonth).padStart(2, '0')

  // raw_records 기반: 호기별 자재별 비용 집계 (전월/당월)
  // 비용 = 배부수량 × 사용단가 (actual_alloc_qty × actual_unit_price)
  const prevData = await db.prepare(`
    SELECT machine_code,
      material_code,
      SUM(CAST(actual_alloc_qty AS REAL)) as usage_qty,
      AVG(CAST(actual_unit_price AS REAL)) as unit_price,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as total_cost
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
    GROUP BY machine_code, material_code
  `).bind(prevYm, div).all()

  // 당월 데이터
  const curData = await db.prepare(`
    SELECT machine_code,
      material_code,
      SUM(CAST(actual_alloc_qty AS REAL)) as usage_qty,
      AVG(CAST(actual_unit_price AS REAL)) as unit_price,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as total_cost,
      MAX(CAST(production_qty AS REAL)) as production_qty
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
    GROUP BY machine_code, material_code
  `).bind(curYm, div).all()

  // 호기별 생산량 (전월/당월) - 생산량은 지종별 MAX로 합산
  const prevProdResult = await db.prepare(`
    SELECT machine_code, SUM(prod) as total_prod FROM (
      SELECT machine_code, product_level4, MAX(CAST(production_qty AS REAL)) as prod
      FROM raw_records WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ? AND CAST(production_qty AS REAL) > 0
      GROUP BY machine_code, product_level4
    ) GROUP BY machine_code
  `).bind(prevYm, div).all()
  const prevProdMap: Record<string, number> = {}
  for (const r of prevProdResult.results as any[]) {
    prevProdMap[r.machine_code] = Number(r.total_prod) || 0
  }

  const curProdResult = await db.prepare(`
    SELECT machine_code, SUM(prod) as total_prod FROM (
      SELECT machine_code, product_level4, MAX(CAST(production_qty AS REAL)) as prod
      FROM raw_records WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ? AND CAST(production_qty AS REAL) > 0
      GROUP BY machine_code, product_level4
    ) GROUP BY machine_code
  `).bind(curYm, div).all()
  const curProdMap: Record<string, number> = {}
  for (const r of curProdResult.results as any[]) {
    curProdMap[r.machine_code] = Number(r.total_prod) || 0
  }

  // material_code 정규화 (앞의 0 제거하여 비교)
  const normCode = (code: string) => code.replace(/^0+/, '') || code

  // 전월 자재별 맵 구성 (정규화된 코드로 키)
  const prevMap: Record<string, Record<string, { usage_qty: number, unit_price: number, total_cost: number }>> = {}
  for (const r of prevData.results as any[]) {
    if (!prevMap[r.machine_code]) prevMap[r.machine_code] = {}
    prevMap[r.machine_code][normCode(r.material_code)] = {
      usage_qty: Number(r.usage_qty) || 0,
      unit_price: Number(r.unit_price) || 0,
      total_cost: Number(r.total_cost) || 0
    }
  }

  // 호기별 집계
  const summaryMap: Record<string, { prev_total_cost: number, cur_total_cost: number, cost_diff: number, total_qty_effect: number, total_price_effect: number, material_count: number, production_qty: number }> = {}

  for (const r of curData.results as any[]) {
    const mc = r.machine_code as string
    if (!summaryMap[mc]) summaryMap[mc] = { prev_total_cost: 0, cur_total_cost: 0, cost_diff: 0, total_qty_effect: 0, total_price_effect: 0, material_count: 0, production_qty: 0 }

    const curUsage = Number(r.usage_qty) || 0
    const curPrice = Number(r.unit_price) || 0
    const curCost = Number(r.total_cost) || 0
    const prodQty = Number(r.production_qty) || 0

    const prev = prevMap[mc]?.[normCode(r.material_code)]
    const prevUsage = prev?.usage_qty || 0
    const prevPrice = prev?.unit_price || 0
    const prevCost = prev?.total_cost || 0

    // 손익효과: 사용량차이 = (전월사용량 - 당월사용량) × 전월단가, 단가차이 = (전월단가 - 당월단가) × 당월사용량
    const qtyEffect = (prevUsage - curUsage) * prevPrice
    const priceEffect = (prevPrice - curPrice) * curUsage

    summaryMap[mc].prev_total_cost += prevCost
    summaryMap[mc].cur_total_cost += curCost
    summaryMap[mc].cost_diff += (curCost - prevCost)
    summaryMap[mc].total_qty_effect += qtyEffect
    summaryMap[mc].total_price_effect += priceEffect
    summaryMap[mc].material_count++
    if (prodQty > summaryMap[mc].production_qty) summaryMap[mc].production_qty = prodQty
  }

  // 전월에만 있고 당월에 없는 자재의 비용도 전월 합계에 포함
  const curNormCodes: Record<string, Set<string>> = {}
  for (const r of curData.results as any[]) {
    const mc = r.machine_code as string
    if (!curNormCodes[mc]) curNormCodes[mc] = new Set()
    curNormCodes[mc].add(normCode(r.material_code))
  }
  for (const mc in prevMap) {
    if (!summaryMap[mc]) summaryMap[mc] = { prev_total_cost: 0, cur_total_cost: 0, cost_diff: 0, total_qty_effect: 0, total_price_effect: 0, material_count: 0, production_qty: 0 }
    for (const normMatCode in prevMap[mc]) {
      if (!curNormCodes[mc]?.has(normMatCode)) {
        summaryMap[mc].prev_total_cost += prevMap[mc][normMatCode].total_cost
      }
    }
  }

  const results = Object.entries(summaryMap).map(([mc, s], idx) => ({
    unit_id: idx + 1,
    unit_code: mc,
    unit_name: mc,
    prev_total_cost: s.prev_total_cost,
    cur_total_cost: s.cur_total_cost,
    cost_diff: s.cost_diff,
    total_qty_effect: s.total_qty_effect,
    total_price_effect: s.total_price_effect,
    material_count: s.material_count,
    production_qty: curProdMap[mc] || 0,
    prev_production_qty: prevProdMap[mc] || 0
  })).sort((a, b) => a.unit_code.localeCompare(b.unit_code))

  return c.json(results)
})

// ============ 제품 API ============

app.get('/api/products', async (c) => {
  const db = c.env.DB
  const unit_id = c.req.query('unit_id')
  let query = `SELECT p.*, u.unit_code, u.unit_name FROM products p JOIN units u ON p.unit_id = u.id WHERE p.is_active = 1`
  if (unit_id) query += ` AND p.unit_id = ${unit_id}`
  query += ' ORDER BY p.unit_id, p.product_code'
  const results = await db.prepare(query).all()
  return c.json(results.results)
})

app.post('/api/products', async (c) => {
  const db = c.env.DB
  const { product_code, product_name, unit_id, unit_of_measure, description } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO products (product_code, product_name, unit_id, unit_of_measure, description) VALUES (?, ?, ?, ?, ?)'
  ).bind(product_code, product_name, unit_id, unit_of_measure || 'ton', description || '').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.delete('/api/products/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// ============ 시뮬레이션 API ============

// 시뮬레이션 실행: 생산량 기반으로 원가 예측
app.post('/api/simulation/run', async (c) => {
  const db = c.env.DB
  const { plans, base_year, base_month } = await c.req.json()
  // plans: [{ product_id, planned_qty }]
  // base_year/month: 단가 기준월 (이 달의 실적 단가를 사용)
  
  if (!plans || !plans.length || !base_year || !base_month) {
    return c.json({ error: 'plans, base_year, base_month required' }, 400)
  }

  // 1. BOM 조회
  const bomResults = await db.prepare(`
    SELECT b.*, p.product_code, p.product_name, p.unit_id, u.unit_code, u.unit_name,
           m.material_code, m.material_name, m.category, m.unit_of_measure
    FROM bom b 
    JOIN products p ON b.product_id = p.id 
    JOIN units u ON p.unit_id = u.id
    JOIN materials m ON b.material_id = m.id
    WHERE p.is_active = 1
  `).all()
  const allBom = bomResults.results as any[]

  // 2. 기준월 단가 조회
  const priceResults = await db.prepare(`
    SELECT unit_id, material_id, unit_price, usage_qty, production_qty
    FROM monthly_records WHERE year = ? AND month = ?
  `).bind(base_year, base_month).all()
  const priceMap = new Map<string, any>()
  ;(priceResults.results as any[]).forEach(r => {
    priceMap.set(`${r.unit_id}-${r.material_id}`, r)
  })

  // 3. 전월 데이터 조회 (비교용)
  const prevMonth = base_month === 1 ? 12 : base_month - 1
  const prevYear = base_month === 1 ? base_year - 1 : base_year
  const prevResults = await db.prepare(`
    SELECT unit_id, material_id, unit_price, usage_qty, total_cost, production_qty
    FROM monthly_records WHERE year = ? AND month = ?
  `).bind(prevYear, prevMonth).all()
  const prevMap = new Map<string, any>()
  ;(prevResults.results as any[]).forEach(r => {
    prevMap.set(`${r.unit_id}-${r.material_id}`, r)
  })

  // 4. 시뮬레이션 계산
  const simResults: any[] = []
  const productSummary: any[] = []

  for (const plan of plans) {
    const { product_id, planned_qty } = plan
    const productBom = allBom.filter(b => b.product_id === product_id)
    
    if (productBom.length === 0) continue

    const productInfo = productBom[0]
    let productTotalCost = 0
    let productPrevCost = 0
    const materials: any[] = []

    for (const bom of productBom) {
      const key = `${bom.unit_id}-${bom.material_id}`
      const priceData = priceMap.get(key)
      const prevData = prevMap.get(key)
      
      const unitPrice = priceData?.unit_price || 0
      const simUsageQty = bom.unit_consumption * planned_qty  // 예상 사용량
      const simCost = simUsageQty * unitPrice  // 예상 원가
      
      const prevUsageQty = prevData?.usage_qty || 0
      const prevUnitPrice = prevData?.unit_price || 0
      const prevCost = prevData?.total_cost || 0

      // 손익효과 (시뮬레이션 vs 전월)
      const qtyEffect = (simUsageQty - prevUsageQty) * prevUnitPrice
      const priceEffect = (unitPrice - prevUnitPrice) * simUsageQty
      
      materials.push({
        material_id: bom.material_id,
        material_code: bom.material_code,
        material_name: bom.material_name,
        category: bom.category,
        unit_of_measure: bom.unit_of_measure,
        unit_consumption: bom.unit_consumption,
        sim_usage_qty: simUsageQty,
        unit_price: unitPrice,
        sim_cost: simCost,
        prev_usage_qty: prevUsageQty,
        prev_unit_price: prevUnitPrice,
        prev_cost: prevCost,
        qty_effect: qtyEffect,
        price_effect: priceEffect,
        cost_diff: simCost - prevCost
      })

      productTotalCost += simCost
      productPrevCost += prevCost
    }

    productSummary.push({
      product_id,
      product_code: productInfo.product_code,
      product_name: productInfo.product_name,
      unit_id: productInfo.unit_id,
      unit_code: productInfo.unit_code,
      unit_name: productInfo.unit_name,
      planned_qty,
      total_sim_cost: productTotalCost,
      total_prev_cost: productPrevCost,
      cost_diff: productTotalCost - productPrevCost,
      materials
    })

    simResults.push(...materials.map(m => ({ ...m, product_id, product_code: productInfo.product_code, product_name: productInfo.product_name, unit_name: productInfo.unit_name })))
  }

  // 전체 요약
  const totalSummary = {
    total_sim_cost: productSummary.reduce((s, p) => s + p.total_sim_cost, 0),
    total_prev_cost: productSummary.reduce((s, p) => s + p.total_prev_cost, 0),
    total_cost_diff: productSummary.reduce((s, p) => s + p.cost_diff, 0),
    total_qty_effect: simResults.reduce((s, r) => s + (r.qty_effect || 0), 0),
    total_price_effect: simResults.reduce((s, r) => s + (r.price_effect || 0), 0),
    product_count: productSummary.length,
    material_count: simResults.length
  }

  return c.json({ summary: totalSummary, products: productSummary, details: simResults })
})

// 시뮬레이션 저장
app.post('/api/simulation/save', async (c) => {
  const db = c.env.DB
  const { sim_name, base_year, base_month, sim_data, result_data } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO simulations (sim_name, base_year, base_month, sim_data, result_data) VALUES (?, ?, ?, ?, ?)'
  ).bind(sim_name, base_year, base_month, JSON.stringify(sim_data), JSON.stringify(result_data)).run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

// 시뮬레이션 이력 조회
app.get('/api/simulations', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT id, sim_name, base_year, base_month, created_by, created_at FROM simulations ORDER BY created_at DESC LIMIT 20').all()
  return c.json(results.results)
})

app.get('/api/simulations/:id', async (c) => {
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM simulations WHERE id = ?').bind(c.req.param('id')).first()
  if (!result) return c.json({ error: 'not found' }, 404)
  return c.json({ ...result, sim_data: JSON.parse(result.sim_data as string), result_data: result.result_data ? JSON.parse(result.result_data as string) : null })
})

// ============ 손익 시뮬레이션 API (지종별 생산량 기반) ============

// 시뮬레이션 기준 데이터 로드: 호기별/지종별 원단위/생산량/재료비 (당월 + 전월)
app.get('/api/simulation/profit-base', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const category = c.req.query('category') || '' // ALL, RAW, SUB
  const div = c.req.query('division') || 'PS'

  // 전월 계산
  let prevYm = ''
  if (ym && ym.length === 6) {
    let y = parseInt(ym.substring(0, 4))
    let m = parseInt(ym.substring(4, 6))
    m -= 1
    if (m < 1) { m = 12; y -= 1 }
    prevYm = `${y}${String(m).padStart(2, '0')}`
  }

  let catFilter = ''
  if (category === 'RAW') {
    catFilter = " AND (material_group_major = '1100' OR material_group_major = '1200')"
  } else if (category === 'SUB') {
    catFilter = " AND material_group_major != '1100' AND material_group_major != '1200'"
  }

  // 재료비 SQL
  const costSql = `
    SELECT 
      machine_code,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_level2_name,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as material_cost
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      AND CAST(actual_alloc_qty AS REAL) != 0
      ${catFilter}
    GROUP BY machine_code, 
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END
    ORDER BY machine_code, material_cost DESC
  `

  // 생산량 SQL
  const prodSql = `
    SELECT 
      machine_code,
      product_level2_name,
      SUM(total_prod) as production
    FROM (
      SELECT 
        machine_code,
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
          ELSE product_level2_name
        END as product_level2_name,
        product_level4,
        MAX(CAST(total_production AS REAL)) as total_prod
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
        AND CAST(total_production AS REAL) > 0
      GROUP BY machine_code, 
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
          ELSE product_level2_name
        END,
        product_level4
    )
    GROUP BY machine_code, product_level2_name
    ORDER BY machine_code, production DESC
  `

  // 당월
  const curCostResult = await db.prepare(costSql).bind(ym, div).all()
  const curProdResult = await db.prepare(prodSql).bind(ym, div).all()
  const curCostMap = new Map<string, number>()
  const curProdMap = new Map<string, number>()
  for (const r of curCostResult.results as any[]) {
    curCostMap.set(`${r.machine_code}|${r.product_level2_name}`, Number(r.material_cost) || 0)
  }
  for (const r of curProdResult.results as any[]) {
    curProdMap.set(`${r.machine_code}|${r.product_level2_name}`, Number(r.production) || 0)
  }

  // 전월
  let prevCostMap = new Map<string, number>()
  let prevProdMap = new Map<string, number>()
  if (prevYm) {
    const prevCostResult = await db.prepare(costSql).bind(prevYm, div).all()
    const prevProdResult = await db.prepare(prodSql).bind(prevYm, div).all()
    for (const r of prevCostResult.results as any[]) {
      prevCostMap.set(`${r.machine_code}|${r.product_level2_name}`, Number(r.material_cost) || 0)
    }
    for (const r of prevProdResult.results as any[]) {
      prevProdMap.set(`${r.machine_code}|${r.product_level2_name}`, Number(r.production) || 0)
    }
  }

  // 모든 키 취합
  const allKeys = new Set<string>()
  curCostMap.forEach((_, k) => allKeys.add(k))
  curProdMap.forEach((_, k) => allKeys.add(k))
  prevCostMap.forEach((_, k) => allKeys.add(k))
  prevProdMap.forEach((_, k) => allKeys.add(k))

  const rows = Array.from(allKeys).map(key => {
    const [machine_code, product_level2_name] = key.split('|')
    const curCost = curCostMap.get(key) || 0
    const curProdKg = curProdMap.get(key) || 0
    const curProdTon = curProdKg / 1000
    const curUnitCost = curProdKg > 0 ? curCost / curProdKg : 0  // 원/kg

    const prevCost = prevCostMap.get(key) || 0
    const prevProdKg = prevProdMap.get(key) || 0
    const prevProdTon = prevProdKg / 1000
    const prevUnitCost = prevProdKg > 0 ? prevCost / prevProdKg : 0  // 원/kg

    return {
      machine_code,
      product_level2_name,
      cur_production_ton: curProdTon,
      cur_unit_cost: curUnitCost,  // 원/kg
      cur_material_cost: curCost,
      prev_production_ton: prevProdTon,
      prev_unit_cost: prevUnitCost,  // 원/kg
      prev_material_cost: prevCost
    }
  }).sort((a, b) => {
    if (a.machine_code < b.machine_code) return -1
    if (a.machine_code > b.machine_code) return 1
    return b.cur_material_cost - a.cur_material_cost
  })

  return c.json({ rows, ym, prevYm, category })
})

// ============ 전월 대비 예상 실적 API ============

// 1) 지종별 생산량 & 폐품율
app.get('/api/forecast/production', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const div = c.req.query('division') || 'PS'

  const sql = `
    SELECT 
      machine_code,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_type,
      SUM(total_prod) as total_production,
      SUM(prod_qty) as production_qty,
      SUM(waste) as waste_qty
    FROM (
      SELECT 
        machine_code,
        product_level2_name,
        product_level4,
        MAX(CAST(total_production AS REAL)) as total_prod,
        MAX(CAST(production_qty AS REAL)) as prod_qty,
        MAX(CAST(waste_qty AS REAL)) as waste
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
        AND CAST(total_production AS REAL) > 0
      GROUP BY machine_code, product_level2_name, product_level4
    )
    GROUP BY machine_code, 
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END
    ORDER BY machine_code, total_production DESC
  `

  const result = await db.prepare(sql).bind(ym, div).all()
  return c.json(result.results)
})

// 2) 호기 > 자재그룹 > 자재코드별 상세 (엑셀 레이아웃용)
app.get('/api/forecast/material-detail', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const machine = c.req.query('machine') || ''  // PM2, PM3 or empty for all
  const div = c.req.query('division') || 'PS'

  let machineFilter = ''
  if (machine) {
    machineFilter = ` AND machine_code = '${machine}'`
  }

  // 자재별 집계: material_group_name(소분류) 포함, actual_alloc_qty(실적배부수량) 기준
  const matSql = `
    SELECT 
      machine_code,
      material_group_major_name,
      material_group_name,
      material_code,
      material_name,
      SUM(CAST(actual_alloc_qty AS REAL)) as usage_qty,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as total_cost
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      ${machineFilter}
    GROUP BY machine_code, material_group_major_name, material_group_name, material_code, material_name
    ORDER BY machine_code, material_group_major_name, material_group_name, material_code
  `

  // 호기별 총생산량 (kg → 톤 변환용) — total_production 사용 (production_qty는 0인 경우 많음)
  const prodSql = `
    SELECT 
      machine_code,
      SUM(prod_qty) as production
    FROM (
      SELECT 
        machine_code,
        product_level4,
        MAX(CAST(total_production AS REAL)) as prod_qty
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
        AND CAST(total_production AS REAL) > 0
        ${machineFilter}
      GROUP BY machine_code, product_level4
    )
    GROUP BY machine_code
  `

  const [matResult, prodResult] = await Promise.all([
    db.prepare(matSql).bind(ym, div).all(),
    db.prepare(prodSql).bind(ym, div).all()
  ])

  // 호기별 생산량 맵 (kg)
  const prodMap: Record<string, number> = {}
  for (const p of prodResult.results as any[]) {
    prodMap[p.machine_code] = Number(p.production) || 0
  }

  // 결과 조합
  const rows = (matResult.results as any[]).map(r => {
    const productionKg = prodMap[r.machine_code] || 0
    const productionTon = productionKg / 1000
    const usageQty = Number(r.usage_qty) || 0  // kg
    const totalCost = Number(r.total_cost) || 0  // 원
    // 원단위(kg/톤) = 사용량(kg) / 생산량(톤)
    const unitConsumption = productionTon > 0 ? usageQty / productionTon : 0
    // 사용단가(원/kg) = 비용(원) / 사용량(kg)
    const unitPrice = usageQty > 0 ? totalCost / usageQty : 0
    // 비용(백만원) = 비용(원) / 1,000,000
    const costMillion = totalCost / 1000000
    // 톤당비용(원/톤) = 비용(원) / 생산량(톤)
    const costPerTon = productionTon > 0 ? totalCost / productionTon : 0

    return {
      machine_code: r.machine_code,
      material_group_major_name: r.material_group_major_name,
      material_group_name: r.material_group_name,
      material_code: r.material_code,
      material_name: r.material_name,
      usage_qty: usageQty,
      unit_consumption: Math.round(unitConsumption * 100) / 100,
      unit_price: Math.round(unitPrice * 100) / 100,
      cost_million: Math.round(costMillion * 100) / 100,
      cost_per_ton: Math.round(costPerTon),
      production_ton: Math.round(productionTon * 100) / 100
    }
  })

  return c.json({ rows, production: prodMap })
})

// 3) 자재코드 × 지종별 원단위 (사용량 보정용)
app.get('/api/forecast/unit-by-product', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const machine = c.req.query('machine') || ''
  const div = c.req.query('division') || 'PS'

  let machineFilter = ''
  if (machine) {
    machineFilter = ` AND machine_code = '${machine}'`
  }

  // 지종별-자재별 배부수량과 생산량으로 원단위 계산
  const sql = `
    SELECT 
      material_code,
      material_name,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_type,
      SUM(CAST(actual_alloc_qty AS REAL)) as alloc_qty,
      SUM(CAST(production_qty AS REAL)) as prod_qty
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      ${machineFilter}
      AND CAST(actual_alloc_qty AS REAL) != 0
    GROUP BY material_code, material_name,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END
    ORDER BY material_code, product_type
  `

  const result = await db.prepare(sql).bind(ym, div).all()

  // 지종별 실제 생산량(톤) 조회 (원단위 계산의 분모) — total_production 사용
  const prodSql = `
    SELECT 
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_type,
      SUM(prod_qty) as production
    FROM (
      SELECT product_level2_name, product_level4,
        MAX(CAST(total_production AS REAL)) as prod_qty
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
        AND CAST(total_production AS REAL) > 0
        ${machineFilter}
      GROUP BY product_level2_name, product_level4
    )
    GROUP BY product_type
  `
  const prodResult = await db.prepare(prodSql).bind(ym, div).all()

  // 지종별 생산량 맵 (kg)
  const prodMap: Record<string, number> = {}
  for (const p of prodResult.results as any[]) {
    prodMap[p.product_type] = Number(p.production) || 0
  }

  // 결과: { material_code: { product_type: unit_consumption(kg/톤) } }
  const unitMap: Record<string, Record<string, number>> = {}
  for (const r of result.results as any[]) {
    const mc = r.material_code
    const pt = r.product_type
    const allocQty = Number(r.alloc_qty) || 0
    const prodKg = prodMap[pt] || 0
    const prodTon = prodKg / 1000
    const uc = prodTon > 0 ? allocQty / prodTon : 0

    if (!unitMap[mc]) unitMap[mc] = {}
    unitMap[mc][pt] = Math.round(uc * 100) / 100
  }

  return c.json({ unitMap, productionTon: Object.fromEntries(Object.entries(prodMap).map(([k, v]) => [k, Math.round(v / 1000 * 100) / 100])) })
})

// ============ SAP 엑셀 스마트 업로드 API ============

// SAP 형식 엑셀 파싱 결과를 DB에 일괄 등록 (집계용 monthly_records + 원본 raw_records)
app.post('/api/upload/smart', async (c) => {
  try {
  const db = c.env.DB
  const { rows, rawRows, fileName, division } = await c.req.json()
  const div = division || 'PS'
  // rows: 집계용 파싱 데이터 (기존 호환)
  // rawRows: SAP 엑셀 원본 37컬럼 전체 (신규)

  // === Part A: raw_records에 원본 데이터 전체 저장 ===
  if (rawRows && rawRows.length > 0) {
    const rawStmt = db.prepare(`
      INSERT INTO raw_records (
        calendar_ym, process_code, process_name, machine_code, machine_name,
        product_level1, product_level1_name, product_level2, product_level2_name,
        product_level3, product_level3_name, product_level4, product_level4_name,
        material_code, material_name, material_group, material_group_name,
        material_group_major, material_group_major_name, product_type_code, product_type_name,
        plan_unit_consumption, component_qty, base_qty, plan_unit_consumption_waste,
        plan_unit_price, plan_alloc_qty, total_production, production_qty, waste_qty,
        actual_unit_consumption, actual_alloc_qty, actual_unit_price,
        issue_qty, issue_amount, plan_vs_usage_diff, plan_vs_price_diff,
        data_source, file_name, division
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `)

    const batchSize = 50
    for (let i = 0; i < rawRows.length; i += batchSize) {
      const chunk = rawRows.slice(i, i + batchSize)
      const batch = chunk.map((r: any) => rawStmt.bind(
        r.calendar_ym, r.process_code, r.process_name, r.machine_code, r.machine_name,
        r.product_level1, r.product_level1_name, r.product_level2, r.product_level2_name,
        r.product_level3, r.product_level3_name, r.product_level4, r.product_level4_name,
        r.material_code, r.material_name, r.material_group, r.material_group_name,
        r.material_group_major, r.material_group_major_name, r.product_type_code, r.product_type_name,
        r.plan_unit_consumption, r.component_qty, r.base_qty, r.plan_unit_consumption_waste,
        r.plan_unit_price, r.plan_alloc_qty, r.total_production, r.production_qty, r.waste_qty,
        r.actual_unit_consumption, r.actual_alloc_qty, r.actual_unit_price,
        r.issue_qty, r.issue_amount, r.plan_vs_usage_diff, r.plan_vs_price_diff,
        'SAP_BW', fileName || '', div
      ))
      await db.batch(batch)
    }
  }

  // === Part B: 기존 monthly_records 집계 로직 (호환 유지) ===
  if (!rows || !rows.length) {
    return c.json({ success: true, summary: { raw_records_inserted: rawRows?.length || 0, records_inserted: 0, new_materials: 0, skipped: 0 } })
  }

  // 1. 기존 호기 매핑 로드
  const unitsResult = await db.prepare('SELECT * FROM units').all()
  const existingUnits = unitsResult.results as any[]
  const unitMap = new Map<string, number>()
  existingUnits.forEach(u => { unitMap.set(u.unit_code, u.id); unitMap.set(u.unit_name, u.id) })

  // 2. 기존 자재 매핑 로드
  const matsResult = await db.prepare('SELECT * FROM materials').all()
  const existingMats = matsResult.results as any[]
  const matMap = new Map<string, number>()
  existingMats.forEach(m => { matMap.set(m.material_code, m.id); matMap.set(m.material_name, m.id) })

  // 3. 새로운 자재 자동 등록
  const newMaterials: { code: string; name: string; category: string; unit: string }[] = []
  for (const row of rows) {
    const matCode = row.mat_code
    if (!matCode || matMap.has(matCode)) continue
    // 카테고리 분류: 자재그룹(대분류) 1100, 1200 → RAW(원재료), 그 외 → SUB(부재료)
    const majorCode = (row.mat_group_major || '').trim()
    const category = (majorCode === '1100' || majorCode === '1200') ? 'RAW' : 'SUB'
    newMaterials.push({ code: matCode, name: row.mat_name || matCode, category, unit: (row.unit || 'KG').toUpperCase() })
    matMap.set(matCode, -1) // placeholder
  }

  // Deduplicate new materials
  const uniqueNewMats = [...new Map(newMaterials.map(m => [m.code, m])).values()]
  
  // Insert new materials
  let newMatCount = 0
  for (const m of uniqueNewMats) {
    try {
      const r = await db.prepare(
        'INSERT OR IGNORE INTO materials (material_code, material_name, category, unit_of_measure, description) VALUES (?, ?, ?, ?, ?)'
      ).bind(m.code, m.name, m.category, m.unit.toLowerCase(), `자동등록 (SAP)`).run()
      if (r.meta.changes > 0) newMatCount++
    } catch(e) { /* ignore duplicates */ }
  }

  // Reload materials after inserts
  const refreshedMats = await db.prepare('SELECT * FROM materials').all()
  const finalMatMap = new Map<string, number>()
  ;(refreshedMats.results as any[]).forEach(m => { finalMatMap.set(m.material_code, m.id) })

  // 4. 데이터를 monthly_records에 변환 및 삽입
  // period "2026.05" → year=2026, month=5
  const records: any[] = []
  const skipped: any[] = []

  for (const row of rows) {
    // Period parsing: "2026.05", "2026-05", 202605, "202605"
    const periodStr = String(row.period || '')
    let year: number, month: number
    if (periodStr.includes('.')) {
      const parts = periodStr.split('.')
      year = parseInt(parts[0])
      month = parseInt(parts[1])
    } else if (periodStr.includes('-')) {
      const parts = periodStr.split('-')
      year = parseInt(parts[0])
      month = parseInt(parts[1])
    } else if (/^\d{6}$/.test(periodStr)) {
      // 202605 format
      year = parseInt(periodStr.substring(0, 4))
      month = parseInt(periodStr.substring(4, 6))
    } else { skipped.push({ row, reason: 'invalid period' }); continue }

    // Unit mapping (생산호기)
    const machineCode = (row.machine || '').toUpperCase()
    const unitId = unitMap.get(machineCode)
    if (!unitId) { skipped.push({ row, reason: `unknown unit: ${machineCode}` }); continue }

    // Material mapping
    const matCode = row.mat_code
    const materialId = finalMatMap.get(matCode)
    if (!materialId) { skipped.push({ row, reason: `unknown material: ${matCode}` }); continue }

    // Numeric values
    const usageQty = parseFloat(row.issue_qty) || 0
    const unitPrice = parseFloat(row.actual_unit_price) || 0
    const totalCost = parseFloat(row.issue_amount) || 0
    const productionQty = parseFloat(row.production_qty) || parseFloat(row.total_production) || 0

    // Skip zero-data rows
    if (usageQty === 0 && totalCost === 0) continue

    records.push({
      unit_id: unitId,
      material_id: materialId,
      year, month,
      usage_qty: usageQty,
      unit_price: unitPrice,
      total_cost: totalCost,
      production_qty: productionQty,
      notes: `${row.product_type || ''} | ${row.mat_group_desc || ''}`
    })
  }

  // 5. Batch insert: 합산 없이 모든 행을 개별 레코드로 저장
  const stmt = db.prepare(`
    INSERT INTO monthly_records (unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  const batchSize = 50
  let inserted = 0
  for (let i = 0; i < records.length; i += batchSize) {
    const chunk = records.slice(i, i + batchSize)
    const batch = chunk.map(r => 
      stmt.bind(r.unit_id, r.material_id, r.year, r.month, r.usage_qty, r.unit_price, r.production_qty, r.notes || '')
    )
    await db.batch(batch)
    inserted += chunk.length
  }

  return c.json({
    success: true,
    summary: {
      total_rows: rows.length,
      records_inserted: inserted,
      raw_records_inserted: rawRows?.length || 0,
      new_materials: newMatCount,
      skipped: skipped.length
    }
  })
  } catch (err: any) {
    return c.json({ error: err.message || 'Unknown error', stack: err.stack }, 500)
  }
})

// ============ 대시보드 요약 API ============

// 0) 재료비 총괄 Overview: 호기별 > 지종별 재료비/생산량/호기비중/원단위/억원/전체비중 (당월+전월+예상)
app.get('/api/dashboard/material-overview', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const category = c.req.query('category') || '' // ALL, RAW, SUB
  const div = c.req.query('division') || 'PS'

  // 전월 계산
  let prevYm = ''
  if (ym && ym.length === 6) {
    let y = parseInt(ym.substring(0, 4))
    let m = parseInt(ym.substring(4, 6))
    m -= 1
    if (m < 1) { m = 12; y -= 1 }
    prevYm = `${y}${String(m).padStart(2, '0')}`
  }

  let catFilter = ''
  if (category === 'RAW') {
    catFilter = " AND (material_group_major = '1100' OR material_group_major = '1200')"
  } else if (category === 'SUB') {
    catFilter = " AND material_group_major != '1100' AND material_group_major != '1200'"
  }

  // 재료비 SQL: machine_code + product_level2_name(SC split) 별 합산
  const costSql = `
    SELECT 
      machine_code,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_level2_name,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as material_cost
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      AND CAST(actual_alloc_qty AS REAL) != 0
      ${catFilter}
    GROUP BY machine_code, 
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END
    ORDER BY machine_code, material_cost DESC
  `

  // 생산량 SQL: machine_code + product_level2_name별 (product_level4 중복제거)
  const prodSql = `
    SELECT 
      machine_code,
      product_level2_name,
      SUM(total_prod) as production
    FROM (
      SELECT 
        machine_code,
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
          ELSE product_level2_name
        END as product_level2_name,
        product_level4,
        MAX(CAST(total_production AS REAL)) as total_prod
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
        AND CAST(total_production AS REAL) > 0
      GROUP BY machine_code, 
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
          ELSE product_level2_name
        END,
        product_level4
    )
    GROUP BY machine_code, product_level2_name
    ORDER BY machine_code, production DESC
  `

  // 당월 재료비 + 생산량
  const curCostResult = await db.prepare(costSql).bind(ym, div).all()
  const curCostData = curCostResult.results as any[]
  const curProdResult = await db.prepare(prodSql).bind(ym, div).all()
  const curProdMap = new Map<string, number>()
  for (const p of curProdResult.results as any[]) {
    curProdMap.set(`${p.machine_code}|${p.product_level2_name}`, Number(p.production) || 0)
  }

  // 전월 재료비 + 생산량
  let prevCostMap = new Map<string, number>()
  let prevProdMap = new Map<string, number>()
  if (prevYm) {
    const prevCostResult = await db.prepare(costSql).bind(prevYm, div).all()
    for (const row of prevCostResult.results as any[]) {
      prevCostMap.set(`${row.machine_code}|${row.product_level2_name}`, Number(row.material_cost) || 0)
    }
    const prevProdResult = await db.prepare(prodSql).bind(prevYm, div).all()
    for (const p of prevProdResult.results as any[]) {
      prevProdMap.set(`${p.machine_code}|${p.product_level2_name}`, Number(p.production) || 0)
    }
  }

  // 모든 키를 모아서 머지 (당월에 있는 것 + 전월에만 있는 것)
  const allKeys = new Set<string>()
  curCostData.forEach(d => allKeys.add(`${d.machine_code}|${d.product_level2_name}`))
  prevCostMap.forEach((_, k) => allKeys.add(k))

  // 정렬: machine_code → 재료비(당월) DESC
  const rows = Array.from(allKeys).map(key => {
    const [machine_code, product_level2_name] = key.split('|')
    const curCost = curCostData.find(d => `${d.machine_code}|${d.product_level2_name}` === key)
    const cur_material_cost = curCost ? Number(curCost.material_cost) || 0 : 0
    const cur_production = (curProdMap.get(key) || 0) / 1000  // kg → ton
    const prev_material_cost = prevCostMap.get(key) || 0
    const prev_production = (prevProdMap.get(key) || 0) / 1000  // kg → ton
    return {
      machine_code,
      product_level2_name,
      cur_material_cost,
      cur_production,
      prev_material_cost,
      prev_production,
      // 예상 필드 (공란 - 추후 산식 추가)
      est_material_cost: null,
      est_production: null,
    }
  }).sort((a, b) => {
    if (a.machine_code < b.machine_code) return -1
    if (a.machine_code > b.machine_code) return 1
    return b.cur_material_cost - a.cur_material_cost
  })

  return c.json(rows)
})

// 1) 호기별 > 제품레벨2명 > 자재그룹명별 재료비 요약 (당월 + 전월 + 차이)
// 재료비 = 실적배부수량(actual_alloc_qty) * 실적단가(actual_unit_price)
app.get('/api/dashboard/material-cost-summary', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const category = c.req.query('category') || '' // RAW, SUB
  const div = c.req.query('division') || 'PS'
  
  // 전월 계산
  let prevYm = ''
  if (ym && ym.length === 6) {
    let y = parseInt(ym.substring(0, 4))
    let m = parseInt(ym.substring(4, 6))
    m -= 1
    if (m < 1) { m = 12; y -= 1 }
    prevYm = `${y}${String(m).padStart(2, '0')}`
  }
  
  let catFilter = ''
  if (category === 'RAW') {
    catFilter = " AND (material_group_major = '1100' OR material_group_major = '1200')"
  } else if (category === 'SUB') {
    catFilter = " AND material_group_major != '1100' AND material_group_major != '1200'"
  }
  
  const baseSql = `
    SELECT 
      machine_code,
      machine_name,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_level2_name,
      material_group_name,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as material_cost,
      SUM(CAST(actual_alloc_qty AS REAL)) as total_alloc_qty,
      AVG(CAST(actual_unit_price AS REAL)) as avg_unit_price,
      SUM(CAST(plan_vs_usage_diff AS REAL)) as usage_diff,
      SUM(CAST(plan_vs_price_diff AS REAL)) as price_diff,
      COUNT(*) as row_count
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      AND CAST(actual_alloc_qty AS REAL) != 0
      ${catFilter}
    GROUP BY machine_code, 
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END,
      material_group_name
    ORDER BY machine_code, product_level2_name, material_cost DESC
  `
  
  // 당월 조회
  const curResult = await db.prepare(baseSql).bind(ym, div).all()
  const curData = curResult.results as any[]
  
  // 전월 조회
  let prevMap = new Map<string, any>()
  if (prevYm) {
    const prevResult = await db.prepare(baseSql).bind(prevYm, div).all()
    for (const row of prevResult.results as any[]) {
      const key = `${row.machine_code}|${row.product_level2_name}|${row.material_group_name}`
      prevMap.set(key, row)
    }
  }
  
  // 당월 데이터에 전월 데이터 합치기
  const merged = curData.map(cur => {
    const key = `${cur.machine_code}|${cur.product_level2_name}|${cur.material_group_name}`
    const prev = prevMap.get(key)
    return {
      ...cur,
      prev_material_cost: prev?.material_cost || 0,
      prev_alloc_qty: prev?.total_alloc_qty || 0,
      prev_avg_unit_price: prev?.avg_unit_price || 0,
      usage_diff: cur.usage_diff || 0,
      price_diff: cur.price_diff || 0,
    }
  })
  
  return c.json(merged)
})

// 3) 호기별 > 자재그룹(대분류)명 > 제품레벨2명별 재료비 요약
app.get('/api/dashboard/material-by-group', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const category = c.req.query('category') || ''
  const div = c.req.query('division') || 'PS'
  
  // 전월 계산
  let prevYm = ''
  if (ym && ym.length === 6) {
    let y = parseInt(ym.substring(0, 4))
    let m = parseInt(ym.substring(4, 6))
    m -= 1
    if (m < 1) { m = 12; y -= 1 }
    prevYm = `${y}${String(m).padStart(2, '0')}`
  }

  let catFilter = ''
  if (category === 'RAW') {
    catFilter = " AND (material_group_major = '1100' OR material_group_major = '1200')"
  } else if (category === 'SUB') {
    catFilter = " AND material_group_major != '1100' AND material_group_major != '1200'"
  }

  const baseSql = `
    SELECT 
      machine_code,
      machine_name,
      material_group_major_name,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_level2_name,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as material_cost,
      SUM(CAST(actual_alloc_qty AS REAL)) as total_alloc_qty,
      SUM(CAST(plan_vs_usage_diff AS REAL)) as usage_diff,
      SUM(CAST(plan_vs_price_diff AS REAL)) as price_diff,
      COUNT(*) as row_count
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      AND CAST(actual_alloc_qty AS REAL) != 0
      ${catFilter}
    GROUP BY machine_code, material_group_major_name,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END
    ORDER BY machine_code, material_group_major_name, material_cost DESC
  `

  const curResult = await db.prepare(baseSql).bind(ym, div).all()
  const curData = curResult.results as any[]

  let prevMap = new Map<string, any>()
  if (prevYm) {
    const prevResult = await db.prepare(baseSql).bind(prevYm, div).all()
    for (const row of prevResult.results as any[]) {
      const key = `${row.machine_code}|${row.material_group_major_name}|${row.product_level2_name}`
      prevMap.set(key, row)
    }
  }

  const merged = curData.map(cur => {
    const key = `${cur.machine_code}|${cur.material_group_major_name}|${cur.product_level2_name}`
    const prev = prevMap.get(key)
    return {
      ...cur,
      prev_material_cost: prev?.material_cost || 0,
      prev_alloc_qty: prev?.total_alloc_qty || 0,
    }
  })

  return c.json(merged)
})

// 2) 호기별 > 제품레벨2명별 총생산량 합계
app.get('/api/dashboard/production-summary', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const div = c.req.query('division') || 'PS'
  
  let where = 'division = ?'
  const params: any[] = [div]
  if (ym) { where += ' AND calendar_ym = ?'; params.push(ym) }
  
  // 총생산량은 제품별로 중복될 수 있으므로, 동일 호기+제품레벨2+자재 조합에서 대표값 사용
  // total_production은 제품 단위 생산량이므로 DISTINCT한 제품별로 합산
  const sql = `
    SELECT 
      machine_code,
      machine_name,
      product_level2_name,
      SUM(total_prod) as total_production
    FROM (
      SELECT 
        machine_code,
        machine_name,
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
          ELSE product_level2_name
        END as product_level2_name,
        product_level4,
        MAX(CAST(total_production AS REAL)) as total_prod
      FROM raw_records
      WHERE ${where}
        AND calendar_ym != 'CALMONTH'
        AND CAST(total_production AS REAL) > 0
      GROUP BY machine_code, 
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
          ELSE product_level2_name
        END,
        product_level4
    )
    GROUP BY machine_code, product_level2_name
    ORDER BY machine_code, total_production DESC
  `
  
  const result = await db.prepare(sql).bind(...params).all()
  return c.json(result.results)
})

// 3) 생산량 분석 대시보드 (총생산량, 생산수량, 폐품수량 — 당월/전월)
app.get('/api/dashboard/production-analysis', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const div = c.req.query('division') || 'PS'

  // 전월 계산
  let prevYm = ''
  if (ym && ym.length === 6) {
    let y = parseInt(ym.substring(0, 4))
    let m = parseInt(ym.substring(4, 6))
    m -= 1
    if (m < 1) { m = 12; y -= 1 }
    prevYm = `${y}${String(m).padStart(2, '0')}`
  }

  // 생산량 SQL: product_level4별로 중복 제거 후 호기+지종별 합산
  const prodSql = `
    SELECT 
      machine_code,
      product_level2_name,
      SUM(total_prod) as total_production,
      SUM(prod_qty) as production_qty,
      SUM(waste) as waste_qty
    FROM (
      SELECT 
        machine_code,
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC\uc800\ud3c9\ub7c9'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC\uace0\ud3c9\ub7c9'
          ELSE product_level2_name
        END as product_level2_name,
        product_level4,
        MAX(CAST(total_production AS REAL)) as total_prod,
        MAX(CAST(production_qty AS REAL)) as prod_qty,
        MAX(CAST(waste_qty AS REAL)) as waste
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
        AND CAST(total_production AS REAL) > 0
      GROUP BY machine_code, 
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC\uc800\ud3c9\ub7c9'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC\uace0\ud3c9\ub7c9'
          ELSE product_level2_name
        END,
        product_level4
    )
    GROUP BY machine_code, product_level2_name
    ORDER BY machine_code, total_production DESC
  `

  const curResult = await db.prepare(prodSql).bind(ym, div).all()
  const curData = (curResult.results || []) as any[]

  let prevData: any[] = []
  if (prevYm) {
    const prevResult = await db.prepare(prodSql).bind(prevYm, div).all()
    prevData = (prevResult.results || []) as any[]
  }

  // 전월 데이터 맵 생성
  const prevMap: Record<string, any> = {}
  for (const p of prevData) {
    prevMap[`${p.machine_code}|${p.product_level2_name}`] = p
  }

  // 호기별 소계 계산
  const machineMap: Record<string, { cur_total: number; cur_prod: number; cur_waste: number; prev_total: number; prev_prod: number; prev_waste: number }> = {}

  const rows = curData.map((cur: any) => {
    const key = `${cur.machine_code}|${cur.product_level2_name}`
    const prev = prevMap[key] || { total_production: 0, production_qty: 0, waste_qty: 0 }

    if (!machineMap[cur.machine_code]) {
      machineMap[cur.machine_code] = { cur_total: 0, cur_prod: 0, cur_waste: 0, prev_total: 0, prev_prod: 0, prev_waste: 0 }
    }
    machineMap[cur.machine_code].cur_total += cur.total_production || 0
    machineMap[cur.machine_code].cur_prod += cur.production_qty || 0
    machineMap[cur.machine_code].cur_waste += cur.waste_qty || 0
    machineMap[cur.machine_code].prev_total += prev.total_production || 0
    machineMap[cur.machine_code].prev_prod += prev.production_qty || 0
    machineMap[cur.machine_code].prev_waste += prev.waste_qty || 0

    // 전월에만 있는 건 삭제 (key 제거)
    delete prevMap[key]

    return {
      machine_code: cur.machine_code,
      product_level2_name: cur.product_level2_name,
      cur_total_production: cur.total_production || 0,
      cur_production_qty: cur.production_qty || 0,
      cur_waste_qty: cur.waste_qty || 0,
      prev_total_production: prev.total_production || 0,
      prev_production_qty: prev.production_qty || 0,
      prev_waste_qty: prev.waste_qty || 0
    }
  })

  // 전월에만 있는 항목 추가
  for (const [key, prev] of Object.entries(prevMap)) {
    const [mc, pl2] = key.split('|')
    if (!machineMap[mc]) {
      machineMap[mc] = { cur_total: 0, cur_prod: 0, cur_waste: 0, prev_total: 0, prev_prod: 0, prev_waste: 0 }
    }
    machineMap[mc].prev_total += (prev as any).total_production || 0
    machineMap[mc].prev_prod += (prev as any).production_qty || 0
    machineMap[mc].prev_waste += (prev as any).waste_qty || 0

    rows.push({
      machine_code: mc,
      product_level2_name: pl2,
      cur_total_production: 0,
      cur_production_qty: 0,
      cur_waste_qty: 0,
      prev_total_production: (prev as any).total_production || 0,
      prev_production_qty: (prev as any).production_qty || 0,
      prev_waste_qty: (prev as any).waste_qty || 0
    })
  }

  // 호기별 소계
  const subtotals = Object.entries(machineMap).map(([mc, v]) => ({
    machine_code: mc,
    cur_total_production: v.cur_total,
    cur_production_qty: v.cur_prod,
    cur_waste_qty: v.cur_waste,
    prev_total_production: v.prev_total,
    prev_production_qty: v.prev_prod,
    prev_waste_qty: v.prev_waste
  }))

  // 총합계
  const grandTotal = {
    cur_total_production: subtotals.reduce((s, r) => s + r.cur_total_production, 0),
    cur_production_qty: subtotals.reduce((s, r) => s + r.cur_production_qty, 0),
    cur_waste_qty: subtotals.reduce((s, r) => s + r.cur_waste_qty, 0),
    prev_total_production: subtotals.reduce((s, r) => s + r.prev_total_production, 0),
    prev_production_qty: subtotals.reduce((s, r) => s + r.prev_production_qty, 0),
    prev_waste_qty: subtotals.reduce((s, r) => s + r.prev_waste_qty, 0)
  }

  return c.json({ rows, subtotals, grandTotal, ym, prevYm })
})

// 4) 믹스 효과 분석 (호기 믹스 + 지종 믹스)
app.get('/api/dashboard/mix-effect', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const category = c.req.query('category') || 'ALL' // RAW, SUB, ALL
  const div = c.req.query('division') || 'PS'

  // 전월 계산
  let prevYm = ''
  if (ym && ym.length === 6) {
    let y = parseInt(ym.substring(0, 4))
    let m = parseInt(ym.substring(4, 6))
    m -= 1
    if (m < 1) { m = 12; y -= 1 }
    prevYm = `${y}${String(m).padStart(2, '0')}`
  }

  // 카테고리 조건
  let categoryFilter = ''
  if (category === 'RAW') {
    categoryFilter = "AND (material_group_major = '1100' OR material_group_major = '1200')"
  } else if (category === 'SUB') {
    categoryFilter = "AND material_group_major != '1100' AND material_group_major != '1200'"
  }
  // ALL이면 필터 없음

  // 재료비 SQL
  const costSql = `
    SELECT 
      machine_code,
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_type,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as material_cost
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      AND CAST(actual_alloc_qty AS REAL) != 0
      ${categoryFilter}
    GROUP BY machine_code, 
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END
  `

  // 생산량 SQL (product_level4 중복제거)
  const prodSql = `
    SELECT 
      machine_code, product_type, SUM(total_prod) as production
    FROM (
      SELECT 
        machine_code,
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
          ELSE product_level2_name
        END as product_type,
        product_level4,
        MAX(CAST(total_production AS REAL)) as total_prod
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
        AND CAST(total_production AS REAL) > 0
      GROUP BY machine_code, 
        CASE 
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
          WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
          ELSE product_level2_name
        END,
        product_level4
    )
    GROUP BY machine_code, product_type
  `

  // 당월/전월 데이터 조회
  const [curCost, curProd, prevCost, prevProd] = await Promise.all([
    db.prepare(costSql).bind(ym, div).all(),
    db.prepare(prodSql).bind(ym, div).all(),
    prevYm ? db.prepare(costSql).bind(prevYm, div).all() : Promise.resolve({ results: [] }),
    prevYm ? db.prepare(prodSql).bind(prevYm, div).all() : Promise.resolve({ results: [] })
  ])

  // 데이터 맵 구성: { "PM2|ACB": { cost, production, unitCost } }
  type MixRow = { cost: number; production: number; unitCost: number }
  const buildMap = (costData: any[], prodData: any[]): Record<string, MixRow> => {
    const map: Record<string, MixRow> = {}
    const prodMap: Record<string, number> = {}
    for (const p of prodData) {
      prodMap[`${p.machine_code}|${p.product_type}`] = p.production || 0
    }
    for (const c of costData) {
      const key = `${c.machine_code}|${c.product_type}`
      const prod = prodMap[key] || 0
      map[key] = { cost: c.material_cost || 0, production: prod, unitCost: prod > 0 ? c.material_cost / prod : 0 }
    }
    // 생산량은 있지만 원가 없는 경우 추가
    for (const [key, prod] of Object.entries(prodMap)) {
      if (!map[key]) { map[key] = { cost: 0, production: prod, unitCost: 0 } }
    }
    return map
  }

  const curMap = buildMap(curCost.results as any[] || [], curProd.results as any[] || [])
  const prevMap = buildMap(prevCost.results as any[] || [], prevProd.results as any[] || [])

  // 호기별/전체 소계 계산
  const calcSubtotals = (map: Record<string, MixRow>) => {
    const machines: Record<string, { cost: number; production: number }> = {}
    let totalCost = 0, totalProd = 0
    for (const [key, val] of Object.entries(map)) {
      const mc = key.split('|')[0]
      if (!machines[mc]) machines[mc] = { cost: 0, production: 0 }
      machines[mc].cost += val.cost
      machines[mc].production += val.production
      totalCost += val.cost
      totalProd += val.production
    }
    const result: Record<string, { cost: number; production: number; unitCost: number }> = {}
    for (const [mc, v] of Object.entries(machines)) {
      result[mc] = { ...v, unitCost: v.production > 0 ? v.cost / v.production : 0 }
    }
    result['TOTAL'] = { cost: totalCost, production: totalProd, unitCost: totalProd > 0 ? totalCost / totalProd : 0 }
    return result
  }

  const curSub = calcSubtotals(curMap)
  const prevSub = calcSubtotals(prevMap)

  // 지종 목록 (호기별 동적 집계)
  const machineTypesMap: Record<string, string[]> = {}
  const allKeys = new Set([...Object.keys(curMap), ...Object.keys(prevMap)])
  for (const key of allKeys) {
    const [mc, pt] = key.split('|')
    if (!machineTypesMap[mc]) machineTypesMap[mc] = []
    if (!machineTypesMap[mc].includes(pt)) machineTypesMap[mc].push(pt)
  }
  Object.keys(machineTypesMap).forEach(mc => machineTypesMap[mc].sort())
  // 하위 호환: pm2Types, pm3Types
  const pm2Types = machineTypesMap['PM2'] || []
  const pm3Types = machineTypesMap['PM3'] || []

  // ======== 믹스 효과 계산 ========

  // --- 시나리오 1: 당월(전월 2호기 미생산버전) ---
  // 전월 = PM3만 있다고 가정 → 전월 전체 = PM3 소계
  const scenario1_machineMix = (() => {
    // 전월 전체 원단위 = PM3 소계 원단위 (PM2 미생산이므로)
    const prevTotalUnitCost = prevSub['PM3'] ? prevSub['PM3'].unitCost : 0
    const curPM2UnitCost = curSub['PM2'] ? curSub['PM2'].unitCost : 0
    const curTotalProd = curSub['TOTAL'] ? curSub['TOTAL'].production : 0
    const prevTotalProd = prevSub['PM3'] ? prevSub['PM3'].production : 0 // 전월 전체=PM3
    const curPM2Prod = curSub['PM2'] ? curSub['PM2'].production : 0

    const col1 = prevTotalUnitCost - curPM2UnitCost  // U16 - O8
    const col2 = curPM2Prod - curTotalProd * (0 / (prevTotalProd || 1))  // PM2 전월 미생산이므로 S8=0
    const col3 = col1 * col2 / 1000
    return [{ machine: 'PM2', col1, col2, col3 }]
  })()

  // --- 시나리오 2: 당월 (정상) ---
  const scenario2_machineMix = (() => {
    const prevTotalUnitCost = prevSub['TOTAL'] ? prevSub['TOTAL'].unitCost : 0
    const curTotalProd = curSub['TOTAL'] ? curSub['TOTAL'].production : 0
    const prevTotalProd = prevSub['TOTAL'] ? prevSub['TOTAL'].production : 0
    const machineList = Object.keys(machineTypesMap)
    if (!machineList.length) machineList.push('PM2', 'PM3')

    return machineList.map(mc => {
      const curMcUnitCost = curSub[mc] ? curSub[mc].unitCost : 0
      const curMcProd = curSub[mc] ? curSub[mc].production : 0
      const prevMcProd = prevSub[mc] ? prevSub[mc].production : 0

      const col1 = prevTotalUnitCost - curMcUnitCost
      const col2 = curMcProd - curTotalProd * (prevMcProd / (prevTotalProd || 1))
      const col3 = col1 * col2 / 1000
      return { machine: mc, col1, col2, col3 }
    })
  })()

  // --- 지종 믹스 계산 함수 ---
  const calcGradeMix = (mc: string, types: string[], prevRefUnitCost: number, curMcProd: number, prevMcProd: number, useRatio: boolean) => {
    return types.map(pt => {
      const key = `${mc}|${pt}`
      const curPt = curMap[key] || { cost: 0, production: 0, unitCost: 0 }
      const prevPt = prevMap[key] || { cost: 0, production: 0, unitCost: 0 }
      const prevPtUnitCost = prevPt.unitCost

      const col1 = prevRefUnitCost - prevPtUnitCost  // (전월 호기소계 원단위) - (전월 해당지종 원단위)
      // col2 = (당월 해당지종 생산량) - (당월 호기생산량) × (전월 해당지종 비중)
      const prevRatio = prevMcProd > 0 ? prevPt.production / prevMcProd : 0
      const col2 = curPt.production - curMcProd * prevRatio
      const col3 = col1 * col2 / 1000
      return { product_type: pt, col1, col2, col3 }
    })
  }

  // 시나리오1 지종 믹스: 전월 전체 = PM3만, PM2 지종은 모두 전월 데이터 없음
  const s1_prevPM3UnitCost = prevSub['PM3'] ? prevSub['PM3'].unitCost : 0
  const s1_pm2GradeMix = calcGradeMix('PM2', pm2Types, s1_prevPM3UnitCost, curSub['PM2']?.production || 0, 0, false)
  const s1_pm3GradeMix = calcGradeMix('PM3', pm3Types, s1_prevPM3UnitCost, curSub['PM3']?.production || 0, prevSub['PM3']?.production || 0, false)

  // 시나리오2 지종 믹스: 각 호기별 전월 소계 기준
  const s2_prevPM2UnitCost = prevSub['PM2'] ? prevSub['PM2'].unitCost : 0
  const s2_prevPM3UnitCost = prevSub['PM3'] ? prevSub['PM3'].unitCost : 0
  const s2_pm2GradeMix = calcGradeMix('PM2', pm2Types, s2_prevPM2UnitCost, curSub['PM2']?.production || 0, prevSub['PM2']?.production || 0, false)
  const s2_pm3GradeMix = calcGradeMix('PM3', pm3Types, s2_prevPM3UnitCost, curSub['PM3']?.production || 0, prevSub['PM3']?.production || 0, false)

  // 동적 호기별 지종 믹스 (시나리오 2)
  const s2_gradeMixDynamic: Record<string, any[]> = {}
  Object.keys(machineTypesMap).forEach(mc => {
    const prevMcUnitCost = prevSub[mc] ? prevSub[mc].unitCost : 0
    s2_gradeMixDynamic[mc] = calcGradeMix(mc, machineTypesMap[mc], prevMcUnitCost, curSub[mc]?.production || 0, prevSub[mc]?.production || 0, false)
  })

  return c.json({
    ym, prevYm,
    pm2Types, pm3Types,
    machineTypesMap,
    curSubtotals: curSub,
    prevSubtotals: prevSub,
    scenario1: {
      label: '당월(전월 2호기 미생산)',
      machineMix: scenario1_machineMix,
      gradeMix: { PM2: s1_pm2GradeMix, PM3: s1_pm3GradeMix }
    },
    scenario2: {
      label: '당월',
      machineMix: scenario2_machineMix,
      gradeMix: s2_gradeMixDynamic
    },
    scenario3: {
      label: '예상',
      machineMix: [],
      gradeMix: {},
      note: '예상 데이터 미구현 (추후 입력 예정)'
    }
  })
})

// ============ 통합 시뮬레이션 API (자재 구성 변경) ============

// 자재 구성 변경 시뮬레이션: 기존 자재 대체/비율변경 + 신규 자재 추가
app.post('/api/simulation/material-mix', async (c) => {
  const db = c.env.DB
  const { ym, machine, production_ton, changes, division } = await c.req.json()
  const div = division || 'PS'
  // changes: [{ type: 'replace'|'ratio'|'add', source_code, target_code, target_name, target_price, ratio, qty_kg }]

  if (!ym || !machine) {
    return c.json({ error: 'ym and machine are required' }, 400)
  }

  // 1. 전월 실적 데이터 로드 (자재별 사용량/단가/비용)
  const baseData = await db.prepare(`
    SELECT 
      material_code,
      material_name,
      material_group_name,
      material_group_major_name,
      SUM(CAST(actual_alloc_qty AS REAL)) as usage_qty,
      CASE WHEN SUM(CAST(actual_alloc_qty AS REAL)) > 0 
        THEN SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) / SUM(CAST(actual_alloc_qty AS REAL))
        ELSE 0 END as unit_price,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as total_cost
    FROM raw_records
    WHERE calendar_ym = ? AND machine_code = ? AND calendar_ym != 'CALMONTH' AND division = ?
      AND CAST(actual_alloc_qty AS REAL) != 0
    GROUP BY material_code, material_name, material_group_name, material_group_major_name
    ORDER BY total_cost DESC
  `).bind(ym, machine, div).all()

  // 2. 전월 생산량 (톤)
  const prodResult = await db.prepare(`
    SELECT SUM(prod) as total_prod FROM (
      SELECT product_level4, MAX(CAST(total_production AS REAL)) as prod
      FROM raw_records WHERE calendar_ym = ? AND machine_code = ? AND calendar_ym != 'CALMONTH' AND division = ?
        AND CAST(total_production AS REAL) > 0
      GROUP BY product_level4
    )
  `).bind(ym, machine, div).first() as any
  const baseProdTon = (prodResult?.total_prod || 0) / 1000
  const simProdTon = production_ton || baseProdTon

  // 3. 기존 자재 맵 구성
  type MatRow = { material_code: string; material_name: string; material_group_name: string; material_group_major_name: string; usage_qty: number; unit_price: number; total_cost: number }
  const baseMap = new Map<string, MatRow>()
  for (const r of baseData.results as any[]) {
    baseMap.set(r.material_code.replace(/^0+/, ''), {
      material_code: r.material_code,
      material_name: r.material_name,
      material_group_name: r.material_group_name || '',
      material_group_major_name: r.material_group_major_name || '',
      usage_qty: Number(r.usage_qty) || 0,
      unit_price: Number(r.unit_price) || 0,
      total_cost: Number(r.total_cost) || 0
    })
  }

  // 4. 시뮬레이션 적용 — deep copy
  const simMap = new Map<string, MatRow>()
  baseMap.forEach((v, k) => simMap.set(k, { ...v }))

  const changeResults: any[] = []

  if (changes && changes.length > 0) {
    for (const ch of changes) {
      const srcKey = (ch.source_code || '').replace(/^0+/, '')
      const srcRow = simMap.get(srcKey)

      if (ch.type === 'replace') {
        // 기존 자재를 다른 자재로 완전 대체
        if (srcRow) {
          const newQty = srcRow.usage_qty  // 사용량 동일
          const newPrice = ch.target_price || srcRow.unit_price  // 새 단가
          const newCost = newQty * newPrice
          const costDiff = newCost - srcRow.total_cost

          // 기존 자재 제거
          simMap.delete(srcKey)
          // 새 자재 추가
          const tgtKey = (ch.target_code || 'NEW_' + Date.now()).replace(/^0+/, '')
          simMap.set(tgtKey, {
            material_code: ch.target_code || tgtKey,
            material_name: ch.target_name || '신규자재',
            material_group_name: ch.target_group || srcRow.material_group_name,
            material_group_major_name: srcRow.material_group_major_name,
            usage_qty: newQty,
            unit_price: newPrice,
            total_cost: newCost
          })

          changeResults.push({
            type: 'replace',
            source: srcRow.material_name,
            target: ch.target_name || '신규자재',
            before_cost: srcRow.total_cost,
            after_cost: newCost,
            cost_diff: costDiff,
            note: `${srcRow.material_name} → ${ch.target_name || '신규자재'} (단가: ${Math.round(srcRow.unit_price)}→${Math.round(newPrice)})`
          })
        }
      } else if (ch.type === 'ratio') {
        // 기존 자재 사용량 비율 변경 (예: 70% → 50%)
        if (srcRow) {
          const ratio = (ch.ratio || 100) / 100
          const newQty = srcRow.usage_qty * ratio
          const newCost = newQty * srcRow.unit_price
          const costDiff = newCost - srcRow.total_cost
          const qtyDiff = newQty - srcRow.usage_qty

          simMap.set(srcKey, { ...srcRow, usage_qty: newQty, total_cost: newCost })

          // 나머지 물량을 target에 배분
          if (ch.target_code) {
            const tgtKey = ch.target_code.replace(/^0+/, '')
            const tgtRow = simMap.get(tgtKey)
            const redistributeQty = srcRow.usage_qty - newQty  // 빠진 양
            const tgtPrice = ch.target_price || (tgtRow ? tgtRow.unit_price : srcRow.unit_price)

            if (tgtRow) {
              // 기존 자재에 추가
              tgtRow.usage_qty += redistributeQty
              tgtRow.total_cost = tgtRow.usage_qty * tgtRow.unit_price
            } else {
              // 신규 자재로 배분
              simMap.set(tgtKey, {
                material_code: ch.target_code,
                material_name: ch.target_name || '대체자재',
                material_group_name: ch.target_group || srcRow.material_group_name,
                material_group_major_name: srcRow.material_group_major_name,
                usage_qty: redistributeQty,
                unit_price: tgtPrice,
                total_cost: redistributeQty * tgtPrice
              })
            }

            const tgtCost = redistributeQty * tgtPrice
            changeResults.push({
              type: 'ratio',
              source: srcRow.material_name,
              target: ch.target_name || tgtRow?.material_name || '대체자재',
              ratio_pct: ch.ratio,
              redistributed_qty: redistributeQty,
              before_cost: srcRow.total_cost,
              after_cost: newCost + tgtCost,
              cost_diff: (newCost + tgtCost) - srcRow.total_cost,
              note: `${srcRow.material_name} ${Math.round(ch.ratio)}% 유지, 나머지 ${ch.target_name || tgtRow?.material_name}로 이동`
            })
          } else {
            changeResults.push({
              type: 'ratio',
              source: srcRow.material_name,
              ratio_pct: ch.ratio,
              before_cost: srcRow.total_cost,
              after_cost: newCost,
              cost_diff: costDiff,
              note: `${srcRow.material_name} 사용량 ${Math.round(ch.ratio)}%로 축소`
            })
          }
        }
      } else if (ch.type === 'add') {
        // 신규 자재 추가 (기존에 없던 자재)
        const addQty = ch.qty_kg || 0
        const addPrice = ch.target_price || 0
        const addCost = addQty * addPrice
        const tgtKey = (ch.target_code || 'NEW_' + Date.now()).replace(/^0+/, '')

        const existing = simMap.get(tgtKey)
        if (existing) {
          existing.usage_qty += addQty
          existing.total_cost = existing.usage_qty * existing.unit_price
        } else {
          simMap.set(tgtKey, {
            material_code: ch.target_code || tgtKey,
            material_name: ch.target_name || '신규자재',
            material_group_name: ch.target_group || '',
            material_group_major_name: ch.target_major || '',
            usage_qty: addQty,
            unit_price: addPrice,
            total_cost: addCost
          })
        }

        changeResults.push({
          type: 'add',
          target: ch.target_name || '신규자재',
          qty_kg: addQty,
          unit_price: addPrice,
          after_cost: addCost,
          cost_diff: addCost,
          note: `신규 추가: ${ch.target_name || '신규자재'} ${Math.round(addQty)}kg × ${Math.round(addPrice)}원`
        })
      }
    }
  }

  // 5. 결과 계산
  let baseTotalCost = 0
  baseMap.forEach(v => { baseTotalCost += v.total_cost })
  let simTotalCost = 0
  simMap.forEach(v => { simTotalCost += v.total_cost })

  const baseUnitCost = baseProdTon > 0 ? baseTotalCost / baseProdTon / 1000 : 0  // 천원/톤
  const simUnitCost = simProdTon > 0 ? simTotalCost / simProdTon / 1000 : 0  // 천원/톤

  // 자재별 비교 상세
  const details: any[] = []
  const allKeys = new Set([...baseMap.keys(), ...simMap.keys()])
  allKeys.forEach(key => {
    const base = baseMap.get(key)
    const sim = simMap.get(key)
    details.push({
      material_code: sim?.material_code || base?.material_code || key,
      material_name: sim?.material_name || base?.material_name || '',
      material_group_name: sim?.material_group_name || base?.material_group_name || '',
      base_usage_qty: base?.usage_qty || 0,
      base_unit_price: base?.unit_price || 0,
      base_cost: base?.total_cost || 0,
      sim_usage_qty: sim?.usage_qty || 0,
      sim_unit_price: sim?.unit_price || 0,
      sim_cost: sim?.total_cost || 0,
      cost_diff: (sim?.total_cost || 0) - (base?.total_cost || 0),
      is_new: !base,
      is_removed: !sim
    })
  })
  details.sort((a, b) => Math.abs(b.cost_diff) - Math.abs(a.cost_diff))

  return c.json({
    summary: {
      base_production_ton: baseProdTon,
      sim_production_ton: simProdTon,
      base_total_cost: baseTotalCost,
      sim_total_cost: simTotalCost,
      total_cost_diff: simTotalCost - baseTotalCost,
      base_unit_cost_1000won: Math.round(baseUnitCost * 10) / 10,
      sim_unit_cost_1000won: Math.round(simUnitCost * 10) / 10,
      unit_cost_diff: Math.round((simUnitCost - baseUnitCost) * 10) / 10,
      savings_million: Math.round((baseTotalCost - simTotalCost) / 1000000)
    },
    changes: changeResults,
    details,
    base_ym: ym,
    machine
  })
})

// 통합 시뮬레이션용: 자재 목록 조회 (현재 호기의 자재 + 동일 그룹 대체 가능 자재)
app.get('/api/simulation/materials-for-mix', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const machine = c.req.query('machine') || ''
  const div = c.req.query('division') || 'PS'

  // 해당 호기의 현재 사용 자재
  const current = await db.prepare(`
    SELECT 
      material_code,
      material_name,
      material_group_name,
      material_group_major_name,
      SUM(CAST(actual_alloc_qty AS REAL)) as usage_qty,
      CASE WHEN SUM(CAST(actual_alloc_qty AS REAL)) > 0 
        THEN SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) / SUM(CAST(actual_alloc_qty AS REAL))
        ELSE 0 END as unit_price,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as total_cost
    FROM raw_records
    WHERE calendar_ym = ? AND machine_code = ? AND calendar_ym != 'CALMONTH' AND division = ?
      AND CAST(actual_alloc_qty AS REAL) != 0
    GROUP BY material_code, material_name, material_group_name, material_group_major_name
    ORDER BY total_cost DESC
  `).bind(ym, machine, div).all()

  // 동일 기간 다른 호기에서 사용되는 자재 (대체 후보)
  const others = await db.prepare(`
    SELECT DISTINCT
      material_code,
      material_name,
      material_group_name,
      material_group_major_name,
      CASE WHEN SUM(CAST(actual_alloc_qty AS REAL)) > 0 
        THEN SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) / SUM(CAST(actual_alloc_qty AS REAL))
        ELSE 0 END as unit_price
    FROM raw_records
    WHERE calendar_ym = ? AND machine_code != ? AND calendar_ym != 'CALMONTH' AND division = ?
      AND CAST(actual_alloc_qty AS REAL) != 0
    GROUP BY material_code, material_name, material_group_name, material_group_major_name
    ORDER BY material_group_name, material_name
  `).bind(ym, machine, div).all()

  // 마스터에 있지만 실적에 없는 자재 (신규 후보)
  const masterPaperRaw = await db.prepare(`SELECT material_code, material_name, material_group FROM master_paper_raw_materials`).all()
  const masterPaperSub = await db.prepare(`SELECT material_code, material_name, material_group FROM master_paper_sub_materials`).all()

  return c.json({
    current: current.results,
    alternatives: others.results,
    master_raw: masterPaperRaw.results,
    master_sub: masterPaperSub.results
  })
})

// ============ Raw Records (원본 데이터) 조회 API ============

// 원본 데이터 조회 (필터링, 페이징) + 자재구분 매핑
app.get('/api/raw-records', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') // 예: 202605
  const machine = c.req.query('machine') // PM2, PM3
  const category = c.req.query('category') // RAW, SUB (material_group_major_name 기반)
  const search = c.req.query('search')
  const matGroup = c.req.query('mat_group') // 자재구분 필터
  const div = c.req.query('division') || 'PS'
  const page = parseInt(c.req.query('page') || '0')
  const limit = parseInt(c.req.query('limit') || '100')

  // 자재구분 매핑 인덱스 구축 (material_code → material_group)
  const paperRaw = await db.prepare('SELECT material_code, material_group FROM master_paper_raw_materials').all()
  const paperSub = await db.prepare('SELECT material_code, material_group FROM master_paper_sub_materials').all()
  const tissueRaw = await db.prepare('SELECT material_code, category FROM master_tissue_raw_materials').all()

  const codeToGroup: Record<string, string> = {}
  for (const r of (paperRaw.results || []) as any[]) {
    codeToGroup[r.material_code] = r.material_group
  }
  for (const r of (paperSub.results || []) as any[]) {
    codeToGroup[r.material_code] = r.material_group
  }
  for (const r of (tissueRaw.results || []) as any[]) {
    codeToGroup[r.material_code] = r.category
  }

  let where = 'division = ?'
  const params: any[] = [div]

  if (ym) { where += ' AND calendar_ym = ?'; params.push(ym) }
  if (machine) { where += ' AND machine_code = ?'; params.push(machine) }
  if (category === 'RAW') { 
    where += " AND (material_group_major = '1100' OR material_group_major = '1200')"
  } else if (category === 'SUB') {
    where += " AND material_group_major != '1100' AND material_group_major != '1200'"
  }
  if (search) { where += ' AND (material_name LIKE ? OR material_group_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }

  // Count
  const countResult = await db.prepare(`SELECT COUNT(*) as cnt FROM raw_records WHERE ${where}`).bind(...params).first() as any
  const total = countResult?.cnt || 0

  // 전체 합계 (조회조건 기준 TOTAL - 페이지 무관)
  const sumParams = [...params] // limit/offset 추가 전의 params 복사
  const sumResult = await db.prepare(`SELECT 
    COALESCE(SUM(CAST(issue_qty AS REAL)), 0) as total_issue_qty,
    COALESCE(SUM(CAST(issue_amount AS REAL)), 0) as total_issue_amount,
    COUNT(DISTINCT material_code) as material_count
  FROM raw_records WHERE ${where}`).bind(...sumParams).first() as any

  // Data
  params.push(limit, page * limit)
  const dataResult = await db.prepare(`SELECT * FROM raw_records WHERE ${where} ORDER BY machine_code, material_group_name, material_name LIMIT ? OFFSET ?`).bind(...params).all()

  // 자재구분 매핑 적용
  let mappedData = ((dataResult.results || []) as any[]).map((row: any) => {
    const shortCode = row.material_code ? row.material_code.replace(/^0+/, '') : ''
    const materialClassification = codeToGroup[shortCode] || ''
    return { ...row, material_classification: materialClassification }
  })

  // mat_group 필터 적용 (매핑 후 필터링)
  let filteredTotal = total
  if (matGroup) {
    mappedData = mappedData.filter((row: any) => row.material_classification === matGroup)
    // mat_group 필터가 있으면 전체 개수도 다시 계산 (간이 방식: 현 페이지 기준)
    // 정확한 total을 위해 전체 데이터에서 필터링해야 하지만, 성능상 표시만 조정
    filteredTotal = mappedData.length
  }

  return c.json({ 
    total: matGroup ? filteredTotal : total, 
    page, 
    limit, 
    data: mappedData,
    summary: {
      total_issue_qty: sumResult?.total_issue_qty || 0,
      total_issue_amount: sumResult?.total_issue_amount || 0,
      material_count: sumResult?.material_count || 0
    }
  })
})

// 자재구분 목록 (드롭다운용)
app.get('/api/raw-records/material-groups', async (c) => {
  const db = c.env.DB
  
  // master 테이블에서 고유 자재구분 목록 추출
  const paperRaw = await db.prepare('SELECT DISTINCT material_group FROM master_paper_raw_materials ORDER BY material_group').all()
  const paperSub = await db.prepare('SELECT DISTINCT material_group FROM master_paper_sub_materials ORDER BY material_group').all()
  const tissueRaw = await db.prepare('SELECT DISTINCT category FROM master_tissue_raw_materials ORDER BY category').all()

  const groups = new Set<string>()
  for (const r of (paperRaw.results || []) as any[]) { if (r.material_group) groups.add(r.material_group) }
  for (const r of (paperSub.results || []) as any[]) { if (r.material_group) groups.add(r.material_group) }
  for (const r of (tissueRaw.results || []) as any[]) { if (r.category) groups.add(r.category) }

  return c.json([...groups].sort())
})

// 원본 데이터 전체 삭제
app.delete('/api/raw-records', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM raw_records').run()
  return c.json({ success: true })
})

// 원본 데이터 요약 (호기별, 자재그룹별 통계)
app.get('/api/raw-records/summary', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym')
  const div = c.req.query('division') || 'PS'
  
  let ymFilter = ' WHERE division = ?'
  const params: any[] = [div]
  if (ym) { ymFilter += ' AND calendar_ym = ?'; params.push(ym) }

  const result = await db.prepare(`
    SELECT 
      machine_code,
      COUNT(*) as record_count,
      COUNT(DISTINCT material_code) as material_count,
      SUM(issue_qty) as total_issue_qty,
      SUM(issue_amount) as total_issue_amount,
      SUM(production_qty) as total_production
    FROM raw_records ${ymFilter}
    GROUP BY machine_code
    ORDER BY machine_code
  `).bind(...params).all()

  return c.json(result.results)
})

// ============ 기준정보 (Master Index) API ============

// --- 제지 제품분류 ---
app.get('/api/master/paper-products', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT * FROM master_paper_products ORDER BY grade_name, grade_code').all()
  return c.json(results.results)
})

app.post('/api/master/paper-products', async (c) => {
  const db = c.env.DB
  const { product_hierarchy_level3, grade_code, grade_name, grade_detail } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO master_paper_products (product_hierarchy_level3, grade_code, grade_name, grade_detail) VALUES (?, ?, ?, ?)'
  ).bind(product_hierarchy_level3, grade_code, grade_name, grade_detail || '').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.post('/api/master/paper-products/bulk', async (c) => {
  const db = c.env.DB
  const { records } = await c.req.json()
  const stmt = db.prepare('INSERT INTO master_paper_products (product_hierarchy_level3, grade_code, grade_name, grade_detail) VALUES (?, ?, ?, ?)')
  const batch = records.map((r: any) => stmt.bind(r.product_hierarchy_level3, r.grade_code, r.grade_name, r.grade_detail || ''))
  await db.batch(batch)
  return c.json({ success: true, count: records.length })
})

app.put('/api/master/paper-products/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { product_hierarchy_level3, grade_code, grade_name, grade_detail } = await c.req.json()
  await db.prepare(
    'UPDATE master_paper_products SET product_hierarchy_level3=?, grade_code=?, grade_name=?, grade_detail=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(product_hierarchy_level3, grade_code, grade_name, grade_detail || '', id).run()
  return c.json({ success: true })
})

app.delete('/api/master/paper-products/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_paper_products WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

app.delete('/api/master/paper-products', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_paper_products').run()
  return c.json({ success: true })
})

// --- 제지 원재료 분류 ---
app.get('/api/master/paper-raw', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT * FROM master_paper_raw_materials ORDER BY material_class, material_subclass, material_code').all()
  return c.json(results.results)
})

app.post('/api/master/paper-raw', async (c) => {
  const db = c.env.DB
  const { category1, material_class, material_subclass, material_code, material_name, material_group } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO master_paper_raw_materials (category1, material_class, material_subclass, material_code, material_name, material_group) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(category1 || '', material_class, material_subclass, material_code, material_name, material_group).run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.post('/api/master/paper-raw/bulk', async (c) => {
  const db = c.env.DB
  const { records } = await c.req.json()
  const stmt = db.prepare('INSERT INTO master_paper_raw_materials (category1, material_class, material_subclass, material_code, material_name, material_group) VALUES (?, ?, ?, ?, ?, ?)')
  const batch = records.map((r: any) => stmt.bind(r.category1 || '', r.material_class, r.material_subclass, r.material_code, r.material_name, r.material_group))
  await db.batch(batch)
  return c.json({ success: true, count: records.length })
})

app.put('/api/master/paper-raw/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { category1, material_class, material_subclass, material_code, material_name, material_group } = await c.req.json()
  await db.prepare(
    'UPDATE master_paper_raw_materials SET category1=?, material_class=?, material_subclass=?, material_code=?, material_name=?, material_group=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(category1 || '', material_class, material_subclass, material_code, material_name, material_group, id).run()
  return c.json({ success: true })
})

app.delete('/api/master/paper-raw/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_paper_raw_materials WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

app.delete('/api/master/paper-raw', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_paper_raw_materials').run()
  return c.json({ success: true })
})

// --- 제지 부재료 분류 ---
app.get('/api/master/paper-sub', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT * FROM master_paper_sub_materials ORDER BY material_group, material_code').all()
  return c.json(results.results)
})

app.post('/api/master/paper-sub', async (c) => {
  const db = c.env.DB
  const { material_code, material_name, material_group } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO master_paper_sub_materials (material_code, material_name, material_group) VALUES (?, ?, ?)'
  ).bind(material_code, material_name, material_group).run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.post('/api/master/paper-sub/bulk', async (c) => {
  const db = c.env.DB
  const { records } = await c.req.json()
  const stmt = db.prepare('INSERT INTO master_paper_sub_materials (material_code, material_name, material_group) VALUES (?, ?, ?)')
  const batch = records.map((r: any) => stmt.bind(r.material_code, r.material_name, r.material_group))
  await db.batch(batch)
  return c.json({ success: true, count: records.length })
})

app.put('/api/master/paper-sub/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { material_code, material_name, material_group } = await c.req.json()
  await db.prepare(
    'UPDATE master_paper_sub_materials SET material_code=?, material_name=?, material_group=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(material_code, material_name, material_group, id).run()
  return c.json({ success: true })
})

app.delete('/api/master/paper-sub/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_paper_sub_materials WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

app.delete('/api/master/paper-sub', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_paper_sub_materials').run()
  return c.json({ success: true })
})

// --- 화장지 제품분류 ---
app.get('/api/master/tissue-products', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT * FROM master_tissue_products ORDER BY category, product_name').all()
  return c.json(results.results)
})

app.post('/api/master/tissue-products', async (c) => {
  const db = c.env.DB
  const { category, product_name } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO master_tissue_products (category, product_name) VALUES (?, ?)'
  ).bind(category, product_name).run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.post('/api/master/tissue-products/bulk', async (c) => {
  const db = c.env.DB
  const { records } = await c.req.json()
  const stmt = db.prepare('INSERT INTO master_tissue_products (category, product_name) VALUES (?, ?)')
  const batch = records.map((r: any) => stmt.bind(r.category, r.product_name))
  await db.batch(batch)
  return c.json({ success: true, count: records.length })
})

app.put('/api/master/tissue-products/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { category, product_name } = await c.req.json()
  await db.prepare(
    'UPDATE master_tissue_products SET category=?, product_name=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(category, product_name, id).run()
  return c.json({ success: true })
})

app.delete('/api/master/tissue-products/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_tissue_products WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

app.delete('/api/master/tissue-products', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_tissue_products').run()
  return c.json({ success: true })
})

// --- 화장지 원재료 분류 ---
app.get('/api/master/tissue-raw', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT * FROM master_tissue_raw_materials ORDER BY category, material_code').all()
  return c.json(results.results)
})

app.post('/api/master/tissue-raw', async (c) => {
  const db = c.env.DB
  const { category, material_code, material_name } = await c.req.json()
  const result = await db.prepare(
    'INSERT INTO master_tissue_raw_materials (category, material_code, material_name) VALUES (?, ?, ?)'
  ).bind(category, material_code, material_name).run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.post('/api/master/tissue-raw/bulk', async (c) => {
  const db = c.env.DB
  const { records } = await c.req.json()
  const stmt = db.prepare('INSERT INTO master_tissue_raw_materials (category, material_code, material_name) VALUES (?, ?, ?)')
  const batch = records.map((r: any) => stmt.bind(r.category, r.material_code, r.material_name))
  await db.batch(batch)
  return c.json({ success: true, count: records.length })
})

app.put('/api/master/tissue-raw/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { category, material_code, material_name } = await c.req.json()
  await db.prepare(
    'UPDATE master_tissue_raw_materials SET category=?, material_code=?, material_name=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(category, material_code, material_name, id).run()
  return c.json({ success: true })
})

app.delete('/api/master/tissue-raw/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_tissue_raw_materials WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

app.delete('/api/master/tissue-raw', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM master_tissue_raw_materials').run()
  return c.json({ success: true })
})

// ============ 자재구분 매핑 (Material Classification Mapping) ============

// 자재구분 매핑 조회: raw_records의 자재를 master 테이블과 매핑하여 자재구분을 보여줌
app.get('/api/master/material-mapping', async (c) => {
  const db = c.env.DB
  const filter = c.req.query('filter') || 'all' // all, mapped, unmapped

  // raw_records에서 고유 자재 목록 추출
  const rawMaterials = await db.prepare(`
    SELECT DISTINCT 
      material_code,
      material_name,
      material_group_major,
      material_group_major_name
    FROM raw_records
    ORDER BY material_group_major, material_name
  `).all()

  // master 원재료 테이블 조회 (code → material_group 매핑)
  const paperRaw = await db.prepare('SELECT material_code, material_name, material_group FROM master_paper_raw_materials').all()
  const paperSub = await db.prepare('SELECT material_code, material_name, material_group FROM master_paper_sub_materials').all()
  const tissueRaw = await db.prepare('SELECT material_code, material_name, category FROM master_tissue_raw_materials').all()

  // 매핑 인덱스 구축 (material_code → material_group)
  const codeToGroup: Record<string, { material_group: string; source: string }> = {}
  for (const r of (paperRaw.results || []) as any[]) {
    codeToGroup[r.material_code] = { material_group: r.material_group, source: '제지 원재료' }
  }
  for (const r of (paperSub.results || []) as any[]) {
    codeToGroup[r.material_code] = { material_group: r.material_group, source: '제지 부재료' }
  }
  for (const r of (tissueRaw.results || []) as any[]) {
    codeToGroup[r.material_code] = { material_group: r.category, source: '화장지 원재료' }
  }

  // raw materials와 매핑
  const results = ((rawMaterials.results || []) as any[]).map((rm: any) => {
    // raw_records의 material_code에서 leading zeros 제거하여 매핑
    const shortCode = rm.material_code ? rm.material_code.replace(/^0+/, '') : ''
    const mapping = codeToGroup[shortCode] || null

    return {
      material_code: rm.material_code,
      material_code_short: shortCode,
      material_name: rm.material_name,
      material_group_major: rm.material_group_major,
      material_group_major_name: rm.material_group_major_name,
      category: rm.material_group_major === '1100' || rm.material_group_major === '1200' ? 'RAW' : 'SUB',
      mapped_group: mapping ? mapping.material_group : null,
      mapping_source: mapping ? mapping.source : null
    }
  })

  // 필터 적용
  let filtered = results
  if (filter === 'mapped') {
    filtered = results.filter((r: any) => r.mapped_group !== null)
  } else if (filter === 'unmapped') {
    filtered = results.filter((r: any) => r.mapped_group === null)
  }

  return c.json({
    total: results.length,
    mapped_count: results.filter((r: any) => r.mapped_group !== null).length,
    unmapped_count: results.filter((r: any) => r.mapped_group === null).length,
    data: filtered
  })
})

// 자재구분 수동 매핑 저장 (미매핑 자재를 master 테이블에 추가)
app.post('/api/master/material-mapping', async (c) => {
  const db = c.env.DB
  const { material_code, material_name, material_group, target_table } = await c.req.json()

  if (!material_code || !material_name || !material_group || !target_table) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const shortCode = material_code.replace(/^0+/, '')

  if (target_table === 'paper-raw') {
    await db.prepare(
      'INSERT INTO master_paper_raw_materials (category1, material_class, material_subclass, material_code, material_name, material_group) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind('', '', '', shortCode, material_name, material_group).run()
  } else if (target_table === 'paper-sub') {
    await db.prepare(
      'INSERT INTO master_paper_sub_materials (material_code, material_name, material_group) VALUES (?, ?, ?)'
    ).bind(shortCode, material_name, material_group).run()
  } else if (target_table === 'tissue-raw') {
    await db.prepare(
      'INSERT INTO master_tissue_raw_materials (category, material_code, material_name) VALUES (?, ?, ?)'
    ).bind(material_group, shortCode, material_name).run()
  } else {
    return c.json({ error: 'Invalid target_table' }, 400)
  }

  return c.json({ success: true })
})

// 자재구분 매핑 엑셀 일괄 업로드
app.post('/api/master/material-mapping/bulk-upload', async (c) => {
  const db = c.env.DB
  const { items } = await c.req.json() as { items: Array<{ material_code: string; material_name: string; material_group: string; target_table: string }> }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'No items provided' }, 400)
  }

  let inserted = 0
  let updated = 0
  let skipped = 0
  const errors: string[] = []

  for (const item of items) {
    const { material_code, material_name, material_group, target_table } = item
    if (!material_code || !material_group || !target_table) {
      skipped++
      continue
    }

    const shortCode = String(material_code).replace(/^0+/, '')
    const name = material_name || ''

    try {
      if (target_table === 'paper-raw' || target_table === '제지 원재료') {
        // Check if exists
        const existing = await db.prepare('SELECT id FROM master_paper_raw_materials WHERE material_code = ?').bind(shortCode).first()
        if (existing) {
          await db.prepare('UPDATE master_paper_raw_materials SET material_name = ?, material_group = ? WHERE material_code = ?')
            .bind(name, material_group, shortCode).run()
          updated++
        } else {
          await db.prepare('INSERT INTO master_paper_raw_materials (category1, material_class, material_subclass, material_code, material_name, material_group) VALUES (?, ?, ?, ?, ?, ?)')
            .bind('', '', '', shortCode, name, material_group).run()
          inserted++
        }
      } else if (target_table === 'paper-sub' || target_table === '제지 부재료') {
        const existing = await db.prepare('SELECT id FROM master_paper_sub_materials WHERE material_code = ?').bind(shortCode).first()
        if (existing) {
          await db.prepare('UPDATE master_paper_sub_materials SET material_name = ?, material_group = ? WHERE material_code = ?')
            .bind(name, material_group, shortCode).run()
          updated++
        } else {
          await db.prepare('INSERT INTO master_paper_sub_materials (material_code, material_name, material_group) VALUES (?, ?, ?)')
            .bind(shortCode, name, material_group).run()
          inserted++
        }
      } else if (target_table === 'tissue-raw' || target_table === '화장지 원재료') {
        const existing = await db.prepare('SELECT id FROM master_tissue_raw_materials WHERE material_code = ?').bind(shortCode).first()
        if (existing) {
          await db.prepare('UPDATE master_tissue_raw_materials SET category = ?, material_name = ? WHERE material_code = ?')
            .bind(material_group, name, shortCode).run()
          updated++
        } else {
          await db.prepare('INSERT INTO master_tissue_raw_materials (category, material_code, material_name) VALUES (?, ?, ?)')
            .bind(material_group, shortCode, name).run()
          inserted++
        }
      } else {
        skipped++
        errors.push(`Invalid target_table "${target_table}" for code ${shortCode}`)
      }
    } catch (e: any) {
      skipped++
      errors.push(`Error for code ${shortCode}: ${e.message || e}`)
    }
  }

  return c.json({ success: true, inserted, updated, skipped, errors: errors.slice(0, 10) })
})

// ============ 가용 월 목록 API ============
app.get('/api/available-months', async (c) => {
  const { env } = c
  const div = c.req.query('division') || 'PS'
  const result = await env.DB.prepare(`
    SELECT DISTINCT calendar_ym FROM raw_records
    WHERE calendar_ym != 'CALMONTH' AND calendar_ym IS NOT NULL AND division = ?
    ORDER BY calendar_ym DESC
  `).bind(div).all()
  return c.json(result.results.map((r: any) => r.calendar_ym))
})

// ============ 메인 페이지 ============
app.get('/', (c) => {
  return c.html(mainPage())
})

// ============ 수기 입력 API ============

// 자재 목록 조회 (전월 실적 기반)
app.get('/api/manual-input/materials', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const machine = c.req.query('machine') || ''
  const div = c.req.query('division') || 'PS'

  if (!ym) return c.json({ materials: [], productTypes: [] })

  let machineFilter = ''
  if (machine) machineFilter = ` AND machine_code = '${machine}'`

  // 1) 해당 호기의 모든 기간 유니크 자재 목록
  const allMatSql = `
    SELECT 
      material_code as code,
      material_name as name,
      material_group_name as group_name,
      material_group_major_name as major_group
    FROM raw_records
    WHERE calendar_ym != 'CALMONTH' AND division = ?
      ${machineFilter}
    GROUP BY material_code, material_name, material_group_name, material_group_major_name
    ORDER BY material_group_name, material_code
  `
  const allMatResult = await db.prepare(allMatSql).bind(div).all()
  const allMaterials = (allMatResult.results || []) as any[]

  // 2) 전월(ym) 사용량/단가 집계
  const prevMatSql = `
    SELECT 
      material_code as code,
      SUM(CAST(actual_alloc_qty AS REAL)) as usage_qty,
      MAX(CAST(actual_unit_price AS REAL)) as unit_price
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      ${machineFilter}
      AND CAST(actual_alloc_qty AS REAL) != 0
    GROUP BY material_code
  `
  const prevMatResult = await db.prepare(prevMatSql).bind(ym, div).all()
  const prevMap: Record<string, any> = {}
  for (const r of (prevMatResult.results || []) as any[]) {
    prevMap[r.code] = r
  }

  // 3) 합치기: 모든 자재에 전월 데이터 매핑
  const materials = allMaterials.map((m: any) => {
    const prev = prevMap[m.code]
    return {
      code: m.code,
      name: m.name,
      group_name: m.group_name,
      major_group: m.major_group,
      usage_qty: prev ? prev.usage_qty : 0,
      unit_price: prev ? prev.unit_price : 0
    }
  })

  // 지종 목록 조회 (production_qty 필터 제거 - 실적 데이터에 production_qty=0인 경우가 있음)
  const typeSql = `
    SELECT DISTINCT
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_type
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
      ${machineFilter}
      AND product_level2_name IS NOT NULL AND product_level2_name != ''
  `
  const typeResult = await db.prepare(typeSql).bind(ym, div).all()
  const productTypes = (typeResult.results as any[]).map(r => r.product_type).filter(Boolean)

  return c.json({ 
    materials,
    productTypes
  })
})

// 생산량 조회 (전월 실적 기반)
app.get('/api/manual-input/production', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const machine = c.req.query('machine') || ''
  const div = c.req.query('division') || 'PS'

  if (!ym) return c.json({ production: {} })

  let machineFilter = ''
  if (machine) machineFilter = ` AND machine_code = '${machine}'`

  const prodSql = `
    SELECT 
      CASE 
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 300 THEN 'SC저평량'
        WHEN product_level2_name IN ('SC','백판지 기타') AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 300 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_type,
      SUM(prod_qty) as production_kg
    FROM (
      SELECT product_level2_name, product_level4,
        MAX(CAST(total_production AS REAL)) as prod_qty
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH' AND division = ?
        ${machineFilter}
        AND CAST(total_production AS REAL) > 0
      GROUP BY product_level2_name, product_level4
    )
    GROUP BY product_type
    ORDER BY product_type
  `
  const result = await db.prepare(prodSql).bind(ym, div).all()
  
  const production: Record<string, number> = {}
  for (const r of result.results as any[]) {
    production[r.product_type] = Number(r.production_kg) || 0
  }

  return c.json({ production })
})

// 저장된 수기입력 데이터 조회
app.get('/api/manual-input/saved', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const machine = c.req.query('machine') || ''

  if (!ym || !machine) return c.json({})

  try {
    // 항상 최신 통합 레코드 1건 반환 (부서별 merge된 상태)
    const result = await db.prepare(
      'SELECT data, saved_by, updated_at, dept_type FROM manual_inputs WHERE ym = ? AND machine_code = ? ORDER BY id DESC LIMIT 1'
    ).bind(ym, machine).first()

    if (result && result.data) {
      return c.json({ data: JSON.parse(result.data as string), saved_by: result.saved_by, updated_at: result.updated_at, dept_type: result.dept_type || 'all' })
    }
  } catch (e) {
    // 테이블이 없으면 무시
  }

  return c.json({})
})

// 수기입력 데이터 저장 (부서별 merge 방식)
// 같은 ym+machine의 최신 레코드에서 기존 데이터를 읽고, 현재 부서 필드만 병합하여 저장
app.post('/api/manual-input/save', async (c) => {
  const db = c.env.DB
  const { ym, machine, dept_type, data, saved_by } = await c.req.json()

  if (!ym || !machine || !data) return c.json({ error: 'ym, machine, data required' }, 400)

  // 테이블 생성 (없으면)
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS manual_inputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ym TEXT NOT NULL,
      machine_code TEXT NOT NULL,
      dept_type TEXT DEFAULT 'all',
      data TEXT NOT NULL,
      saved_by TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()

  // 기존 테이블에 dept_type/saved_by 컬럼이 없으면 추가
  try { await db.prepare(`ALTER TABLE manual_inputs ADD COLUMN dept_type TEXT DEFAULT 'all'`).run() } catch (e) {}
  try { await db.prepare(`ALTER TABLE manual_inputs ADD COLUMN saved_by TEXT DEFAULT ''`).run() } catch (e) {}

  // === Merge 로직 ===
  // 1) 같은 ym+machine의 최신 레코드에서 기존 통합 데이터 로드
  let existingData: any = { production: {}, materials: {}, new_materials: [] }
  try {
    const existing = await db.prepare(
      'SELECT data FROM manual_inputs WHERE ym = ? AND machine_code = ? ORDER BY id DESC LIMIT 1'
    ).bind(ym, machine).first()
    if (existing && existing.data) {
      existingData = JSON.parse(existing.data as string)
    }
  } catch (e) {}

  // 2) 부서별 필드 정의
  const productionFields = ['cur_usage', 'cur_uc']  // 생산부서 필드
  const purchaseFields = ['incoming_qty', 'incoming_price']  // 구매부서 필드

  // 3) 기존 materials에 현재 부서 데이터 merge
  const mergedMaterials = { ...(existingData.materials || {}) }
  const incomingMaterials = data.materials || {}

  for (const matCode of Object.keys(incomingMaterials)) {
    const incoming = incomingMaterials[matCode]
    const existing = mergedMaterials[matCode] || {}

    if (dept_type === 'production') {
      // 생산부서: cur_usage, cur_uc만 덮어쓰기
      productionFields.forEach(f => {
        if (incoming[f] !== undefined) existing[f] = incoming[f]
      })
    } else if (dept_type === 'purchase') {
      // 구매부서: incoming_qty, incoming_price만 덮어쓰기
      purchaseFields.forEach(f => {
        if (incoming[f] !== undefined) existing[f] = incoming[f]
      })
    } else {
      // 부서 미지정(all) — 전체 필드 덮어쓰기 (하위호환)
      Object.assign(existing, incoming)
    }
    // 이슈사항 — 기존 값에 줄바꿈으로 append (부서 라벨 포함)
    if (incoming.issue !== undefined && incoming.issue !== '') {
      const deptLabel = dept_type === 'production' ? '[생산]' : dept_type === 'purchase' ? '[구매]' : ''
      const newIssue = deptLabel ? `${deptLabel} ${incoming.issue}` : incoming.issue
      if (existing.issue && existing.issue !== '') {
        // 같은 부서 이슈가 이미 있으면 해당 라인 교체, 없으면 append
        if (deptLabel) {
          const lines = existing.issue.split('\n').filter((l: string) => !l.startsWith(deptLabel))
          lines.push(newIssue)
          existing.issue = lines.join('\n')
        } else {
          existing.issue = existing.issue + '\n' + newIssue
        }
      } else {
        existing.issue = newIssue
      }
    }

    mergedMaterials[matCode] = existing
  }

  // 4) 생산량 merge: 생산부서가 입력하면 덮어쓰기
  const mergedProduction = { ...(existingData.production || {}) }
  if (data.production && Object.keys(data.production).length > 0) {
    Object.assign(mergedProduction, data.production)
  }

  // 5) 신규 자재 merge
  const mergedNewMats = existingData.new_materials || []
  if (data.new_materials && data.new_materials.length) {
    data.new_materials.forEach((nm: any) => {
      const exists = mergedNewMats.some((e: any) => e.code === nm.code)
      if (!exists) mergedNewMats.push(nm)
    })
  }

  // 6) 최종 통합 데이터
  const mergedData = {
    production: mergedProduction,
    materials: mergedMaterials,
    new_materials: mergedNewMats
  }

  // 7) INSERT (히스토리 유지)
  const deptLabel = dept_type || 'all'
  const savedByLabel = saved_by ? `${saved_by}(${deptLabel === 'production' ? '생산' : deptLabel === 'purchase' ? '구매' : '전체'})` : ''
  await db.prepare(`
    INSERT INTO manual_inputs (ym, machine_code, dept_type, data, saved_by, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(ym, machine, deptLabel, JSON.stringify(mergedData), savedByLabel).run()

  return c.json({ success: true, merged: true })
})

// 수기입력 히스토리 조회
app.get('/api/manual-input/history', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') || ''
  const machine = c.req.query('machine') || ''

  if (!ym || !machine) return c.json({ history: [] })

  try {
    const results = await db.prepare(
      'SELECT id, ym, machine_code, saved_by, created_at, updated_at FROM manual_inputs WHERE ym = ? AND machine_code = ? ORDER BY updated_at DESC LIMIT 50'
    ).bind(ym, machine).all()
    return c.json({ history: results.results || [] })
  } catch (e) {
    return c.json({ history: [] })
  }
})

// 히스토리 특정 버전 조회
app.get('/api/manual-input/history/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')

  try {
    const result = await db.prepare(
      'SELECT * FROM manual_inputs WHERE id = ?'
    ).bind(id).first()

    if (result && result.data) {
      return c.json({ data: JSON.parse(result.data as string), saved_by: result.saved_by, updated_at: result.updated_at })
    }
  } catch (e) {
    // ignore
  }

  return c.json({ error: 'not found' }, 404)
})

// ============ 투입제외 규칙 API ============

app.get('/api/exclusion-rules', async (c) => {
  const db = c.env.DB
  const machine = c.req.query('machine') || ''
  let sql = 'SELECT * FROM exclusion_rules'
  if (machine) sql += ` WHERE machine_code = '${machine}'`
  sql += ' ORDER BY machine_code, material_group_keyword, excluded_product_type'
  const results = await db.prepare(sql).all()
  return c.json(results.results)
})

app.post('/api/exclusion-rules', async (c) => {
  const db = c.env.DB
  const { machine_code, material_group_keyword, excluded_product_type, description } = await c.req.json()
  if (!machine_code || !material_group_keyword || !excluded_product_type) {
    return c.json({ error: 'machine_code, material_group_keyword, excluded_product_type are required' }, 400)
  }
  const result = await db.prepare(
    'INSERT INTO exclusion_rules (machine_code, material_group_keyword, excluded_product_type, description) VALUES (?, ?, ?, ?)'
  ).bind(machine_code, material_group_keyword, excluded_product_type, description || '').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.put('/api/exclusion-rules/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { machine_code, material_group_keyword, excluded_product_type, description } = await c.req.json()
  await db.prepare(
    'UPDATE exclusion_rules SET machine_code=?, material_group_keyword=?, excluded_product_type=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(machine_code, material_group_keyword, excluded_product_type, description || '', id).run()
  return c.json({ success: true })
})

app.delete('/api/exclusion-rules/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('DELETE FROM exclusion_rules WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ============ 호기/자재 수정/삭제 API ============

app.put('/api/units/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { unit_code, unit_name, description } = await c.req.json()
  await db.prepare('UPDATE units SET unit_code=?, unit_name=?, description=? WHERE id=?')
    .bind(unit_code, unit_name, description || '', id).run()
  return c.json({ success: true })
})

app.delete('/api/units/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('UPDATE units SET is_active = 0 WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

app.put('/api/materials/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { material_code, material_name, category, unit_of_measure } = await c.req.json()
  await db.prepare('UPDATE materials SET material_code=?, material_name=?, category=?, unit_of_measure=? WHERE id=?')
    .bind(material_code, material_name, category || 'RAW', unit_of_measure || 'kg', id).run()
  return c.json({ success: true })
})

app.delete('/api/materials/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('UPDATE materials SET is_active = 0 WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ============ 기초재고 API ============

// 기초재고 조회
app.get('/api/inventory-stock', async (c) => {
  const db = c.env.DB
  const month = c.req.query('month') || ''
  const plant = c.req.query('plant') || ''
  const materialType = c.req.query('material_type') || ''
  const materialGroup = c.req.query('material_group') || ''

  // 테이블 생성 (확장 스키마)
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      plant TEXT DEFAULT '',
      material_group TEXT DEFAULT '',
      material_type TEXT DEFAULT '',
      material_type_name TEXT DEFAULT '',
      material_id TEXT DEFAULT '',
      material_name TEXT DEFAULT '',
      currency TEXT DEFAULT 'KRW',
      unit TEXT DEFAULT 'KG',
      stock_qty REAL DEFAULT 0,
      stock_price REAL DEFAULT 0,
      incoming_qty REAL DEFAULT 0,
      incoming_price REAL DEFAULT 0,
      outgoing_qty REAL DEFAULT 0,
      outgoing_price REAL DEFAULT 0,
      closing_qty REAL DEFAULT 0,
      closing_price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()

  let query = 'SELECT * FROM inventory_stock WHERE 1=1'
  const binds: string[] = []

  if (month) { query += ' AND month = ?'; binds.push(month); }
  if (plant) { query += ' AND plant = ?'; binds.push(plant); }
  if (materialType) { query += ' AND material_type = ?'; binds.push(materialType); }
  if (materialGroup) { query += ' AND material_group = ?'; binds.push(materialGroup); }

  query += ' ORDER BY month DESC, plant, material_group, material_id'

  const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query)
  const result = await stmt.all()

  return c.json({ rows: result.results || [] })
})

// 기초재고 단건 추가
app.post('/api/inventory-stock', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      plant TEXT DEFAULT '',
      material_group TEXT DEFAULT '',
      material_type TEXT DEFAULT '',
      material_type_name TEXT DEFAULT '',
      material_id TEXT DEFAULT '',
      material_name TEXT DEFAULT '',
      currency TEXT DEFAULT 'KRW',
      unit TEXT DEFAULT 'KG',
      stock_qty REAL DEFAULT 0,
      stock_price REAL DEFAULT 0,
      incoming_qty REAL DEFAULT 0,
      incoming_price REAL DEFAULT 0,
      outgoing_qty REAL DEFAULT 0,
      outgoing_price REAL DEFAULT 0,
      closing_qty REAL DEFAULT 0,
      closing_price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()

  await db.prepare(`
    INSERT INTO inventory_stock (month, plant, material_group, material_type, material_type_name, material_id, material_name, currency, unit, stock_qty, stock_price, incoming_qty, incoming_price, outgoing_qty, outgoing_price, closing_qty, closing_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.month || '', body.plant || '', body.material_group || '',
    body.material_type || '', body.material_type_name || '',
    body.material_id || '', body.material_name || '',
    body.currency || 'KRW', body.unit || 'KG',
    body.stock_qty || 0, body.stock_price || 0,
    body.incoming_qty || 0, body.incoming_price || 0,
    body.outgoing_qty || 0, body.outgoing_price || 0,
    body.closing_qty || 0, body.closing_price || 0
  ).run()

  return c.json({ success: true })
})

// 기초재고 대량 업로드
app.post('/api/inventory-stock/bulk', async (c) => {
  const db = c.env.DB
  const { rows } = await c.req.json()

  if (!rows || !rows.length) return c.json({ error: 'No data' }, 400)

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      plant TEXT DEFAULT '',
      material_group TEXT DEFAULT '',
      material_type TEXT DEFAULT '',
      material_type_name TEXT DEFAULT '',
      material_id TEXT DEFAULT '',
      material_name TEXT DEFAULT '',
      currency TEXT DEFAULT 'KRW',
      unit TEXT DEFAULT 'KG',
      stock_qty REAL DEFAULT 0,
      stock_price REAL DEFAULT 0,
      incoming_qty REAL DEFAULT 0,
      incoming_price REAL DEFAULT 0,
      outgoing_qty REAL DEFAULT 0,
      outgoing_price REAL DEFAULT 0,
      closing_qty REAL DEFAULT 0,
      closing_price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()

  let count = 0
  for (const row of rows) {
    await db.prepare(`
      INSERT INTO inventory_stock (month, plant, material_group, material_type, material_type_name, material_id, material_name, currency, unit, stock_qty, stock_price, incoming_qty, incoming_price, outgoing_qty, outgoing_price, closing_qty, closing_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      row.month || '', row.plant || '', row.material_group || '',
      row.material_type || '', row.material_type_name || '',
      row.material_id || '', row.material_name || '',
      row.currency || 'KRW', row.unit || 'KG',
      row.stock_qty || 0, row.stock_price || 0,
      row.incoming_qty || 0, row.incoming_price || 0,
      row.outgoing_qty || 0, row.outgoing_price || 0,
      row.closing_qty || 0, row.closing_price || 0
    ).run()
    count++
  }

  return c.json({ success: true, count })
})

// 기초재고 삭제
app.delete('/api/inventory-stock/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('DELETE FROM inventory_stock WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// 기말재고 → 차월 기초재고 조회 API
// 특정 월의 기말재고를 자재ID(material_id)를 키로 맵 형태로 반환
// 용도: 부서별 수기입력의 "불러오기" 시 기초재고 자동 채우기
app.get('/api/inventory-stock/closing-map', async (c) => {
  const db = c.env.DB
  const month = c.req.query('month') || ''
  const plant = c.req.query('plant') || ''

  if (!month) return c.json({ map: {} })

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      plant TEXT DEFAULT '',
      material_group TEXT DEFAULT '',
      material_type TEXT DEFAULT '',
      material_type_name TEXT DEFAULT '',
      material_id TEXT DEFAULT '',
      material_name TEXT DEFAULT '',
      currency TEXT DEFAULT 'KRW',
      unit TEXT DEFAULT 'KG',
      stock_qty REAL DEFAULT 0,
      stock_price REAL DEFAULT 0,
      incoming_qty REAL DEFAULT 0,
      incoming_price REAL DEFAULT 0,
      outgoing_qty REAL DEFAULT 0,
      outgoing_price REAL DEFAULT 0,
      closing_qty REAL DEFAULT 0,
      closing_price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()

  // YYYYMM → 다양한 월 형식으로 변환하여 검색
  // 사용자 엑셀 형식: "26년 5월", "26년 04월" 등
  const monthVariants: string[] = [month]
  if (/^\d{6}$/.test(month)) {
    const y = parseInt(month.substring(0, 4))
    const m = parseInt(month.substring(4, 6))
    const shortYear = y % 100
    // "26년 5월" 형식
    monthVariants.push(shortYear + '년 ' + m + '월')
    // "26년 05월" 형식 (0패딩)
    monthVariants.push(shortYear + '년 ' + String(m).padStart(2, '0') + '월')
    // "2026년 5월" 형식
    monthVariants.push(y + '년 ' + m + '월')
    // "2026년 05월" 형식
    monthVariants.push(y + '년 ' + String(m).padStart(2, '0') + '월')
    // "2026-05" 형식
    monthVariants.push(y + '-' + String(m).padStart(2, '0'))
  }

  // 해당 월의 기말재고를 material_id 기준으로 조회 (모든 월 형식 대응)
  const placeholders = monthVariants.map(() => '?').join(',')
  let sql = 'SELECT material_id, closing_qty, closing_price FROM inventory_stock WHERE month IN (' + placeholders + ') AND material_id != \'\''
  const binds: any[] = [...monthVariants]

  // 플랜트 필터 (PM2/PM3→P100, 화장지→P200)
  if (plant) {
    sql += ' AND plant = ?'
    binds.push(plant)
  }

  const result = await db.prepare(sql).bind(...binds).all()

  // material_id → { closing_qty, closing_price } 맵으로 변환
  // 동일 material_id가 여러 행일 경우 합산 (수량 SUM, 단가 가중평균)
  const map: Record<string, { closing_qty: number; closing_price: number }> = {}
  if (result.results) {
    for (const row of result.results as any[]) {
      const id = String(row.material_id).trim()
      if (!id) continue
      const qty = row.closing_qty || 0
      const price = row.closing_price || 0
      if (map[id]) {
        // 가중평균: (기존수량×기존단가 + 신규수량×신규단가) / (기존수량 + 신규수량)
        const prevQty = map[id].closing_qty
        const prevPrice = map[id].closing_price
        const totalQty = prevQty + qty
        map[id].closing_qty = totalQty
        map[id].closing_price = totalQty > 0 ? (prevQty * prevPrice + qty * price) / totalQty : 0
      } else {
        map[id] = { closing_qty: qty, closing_price: price }
      }
    }
  }

  return c.json({ map, month, plant, variants: monthVariants })
})

// ============ 가동시간 (Operating Time) API ============

/** 호기별 시간당 생산능력 마스터 조회 */
app.get('/api/machine-capacity', async (c) => {
  const db = c.env.DB
  const div = c.req.query('division') || 'PS'
  const results = await db.prepare(
    `SELECT * FROM machine_capacity WHERE division = ? AND valid_to >= strftime('%Y%m', 'now') ORDER BY machine_code`
  ).bind(div).all()
  return c.json(results.results)
})

/** 호기별 시간당 생산능력 수정 */
app.post('/api/machine-capacity', async (c) => {
  const db = c.env.DB
  const { division, machine_code, hourly_capacity, basis_weight_ref, note } = await c.req.json() as any
  const div = division || 'PS'

  // 기존 유효 레코드 확인
  const existing = await db.prepare(
    `SELECT id FROM machine_capacity WHERE division = ? AND machine_code = ? AND valid_to >= strftime('%Y%m', 'now')`
  ).bind(div, machine_code).first()

  if (existing) {
    await db.prepare(`
      UPDATE machine_capacity SET hourly_capacity = ?, basis_weight_ref = ?, note = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(hourly_capacity || 0, basis_weight_ref || null, note || null, existing.id).run()
  } else {
    await db.prepare(`
      INSERT INTO machine_capacity (division, machine_code, hourly_capacity, basis_weight_ref, note, valid_from)
      VALUES (?, ?, ?, ?, ?, strftime('%Y%m', 'now'))
    `).bind(div, machine_code, hourly_capacity || 0, basis_weight_ref || null, note || null).run()
  }

  return c.json({ success: true })
})

/** 월별 가동시간 조회 (호기별 + 생산능력 계산 포함) */
app.get('/api/operating-time', async (c) => {
  const db = c.env.DB
  const div = c.req.query('division') || 'PS'
  const ym = c.req.query('ym')

  let query = `
    SELECT ot.*, mc.hourly_capacity, mc.basis_weight_ref,
           ot.operation_subtotal * 24 * COALESCE(mc.hourly_capacity, 0) as max_production_ton
    FROM machine_operating_time ot
    LEFT JOIN machine_capacity mc ON mc.division = ot.division AND mc.machine_code = ot.machine_code
      AND mc.valid_from <= ot.ym AND mc.valid_to >= ot.ym
    WHERE ot.division = ?
  `
  const binds: any[] = [div]

  if (ym) {
    query += ' AND ot.ym = ?'
    binds.push(ym)
  }
  query += ' ORDER BY ot.ym DESC, ot.machine_code'

  const results = await db.prepare(query).bind(...binds).all()
  return c.json(results.results)
})

/** 월별 가동시간 저장/수정 (Upsert) */
app.post('/api/operating-time', async (c) => {
  const db = c.env.DB
  const body = await c.req.json() as any
  const { division, machine_code, ym, total_days, planned_shutdown_days,
          operation_normal_days, operation_waste_days, operation_unplanned_days,
          operation_startup_days, operation_cutting_days,
          downtime_maintenance_days, downtime_cleaning_days, downtime_accident_days,
          note, saved_by } = body
  const div = division || 'PS'

  await db.prepare(`
    INSERT INTO machine_operating_time 
      (division, machine_code, ym, total_days, planned_shutdown_days,
       operation_normal_days, operation_waste_days, operation_unplanned_days,
       operation_startup_days, operation_cutting_days,
       downtime_maintenance_days, downtime_cleaning_days, downtime_accident_days,
       note, saved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(division, machine_code, ym) DO UPDATE SET
      total_days = excluded.total_days,
      planned_shutdown_days = excluded.planned_shutdown_days,
      operation_normal_days = excluded.operation_normal_days,
      operation_waste_days = excluded.operation_waste_days,
      operation_unplanned_days = excluded.operation_unplanned_days,
      operation_startup_days = excluded.operation_startup_days,
      operation_cutting_days = excluded.operation_cutting_days,
      downtime_maintenance_days = excluded.downtime_maintenance_days,
      downtime_cleaning_days = excluded.downtime_cleaning_days,
      downtime_accident_days = excluded.downtime_accident_days,
      note = excluded.note,
      saved_by = excluded.saved_by,
      updated_at = CURRENT_TIMESTAMP
  `).bind(div, machine_code, ym, total_days || 0, planned_shutdown_days || 0,
          operation_normal_days || 0, operation_waste_days || 0, operation_unplanned_days || 0,
          operation_startup_days || 0, operation_cutting_days || 0,
          downtime_maintenance_days || 0, downtime_cleaning_days || 0, downtime_accident_days || 0,
          note || null, saved_by || null).run()

  return c.json({ success: true })
})

/** 월별 가동시간 일괄 저장 (여러 호기 한 번에) */
app.post('/api/operating-time/batch', async (c) => {
  const db = c.env.DB
  const { division, ym, entries, saved_by } = await c.req.json() as any
  const div = division || 'PS'

  if (!entries || !entries.length) return c.json({ error: 'No entries' }, 400)

  const stmt = db.prepare(`
    INSERT INTO machine_operating_time 
      (division, machine_code, ym, total_days, planned_shutdown_days,
       operation_normal_days, operation_waste_days, operation_unplanned_days,
       operation_startup_days, operation_cutting_days,
       downtime_maintenance_days, downtime_cleaning_days, downtime_accident_days,
       note, saved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(division, machine_code, ym) DO UPDATE SET
      total_days = excluded.total_days,
      planned_shutdown_days = excluded.planned_shutdown_days,
      operation_normal_days = excluded.operation_normal_days,
      operation_waste_days = excluded.operation_waste_days,
      operation_unplanned_days = excluded.operation_unplanned_days,
      operation_startup_days = excluded.operation_startup_days,
      operation_cutting_days = excluded.operation_cutting_days,
      downtime_maintenance_days = excluded.downtime_maintenance_days,
      downtime_cleaning_days = excluded.downtime_cleaning_days,
      downtime_accident_days = excluded.downtime_accident_days,
      note = excluded.note,
      saved_by = excluded.saved_by,
      updated_at = CURRENT_TIMESTAMP
  `)

  const batch = entries.map((e: any) => stmt.bind(
    div, e.machine_code, ym, e.total_days || 0, e.planned_shutdown_days || 0,
    e.operation_normal_days || 0, e.operation_waste_days || 0, e.operation_unplanned_days || 0,
    e.operation_startup_days || 0, e.operation_cutting_days || 0,
    e.downtime_maintenance_days || 0, e.downtime_cleaning_days || 0, e.downtime_accident_days || 0,
    e.note || null, saved_by || null
  ))
  await db.batch(batch)

  return c.json({ success: true, count: entries.length })
})

/** 가동시간 요약 (대시보드용 — 월별 전체 호기 집계) */
app.get('/api/operating-time/summary', async (c) => {
  const db = c.env.DB
  const div = c.req.query('division') || 'PS'
  const ym = c.req.query('ym')
  if (!ym) return c.json({ error: 'ym required' }, 400)

  const results = await db.prepare(`
    SELECT ot.machine_code, ot.total_days, ot.planned_shutdown_days,
           ot.operation_normal_days, ot.operation_waste_days, ot.operation_unplanned_days,
           ot.operation_startup_days, ot.operation_cutting_days, ot.operation_subtotal,
           ot.downtime_maintenance_days, ot.downtime_cleaning_days, ot.downtime_accident_days,
           ot.downtime_subtotal, ot.total_operating_days,
           mc.hourly_capacity,
           ot.operation_subtotal * 24 * COALESCE(mc.hourly_capacity, 0) as max_production_ton,
           CASE WHEN ot.total_days > 0 THEN ROUND(ot.operation_subtotal * 100.0 / ot.total_days, 1) ELSE 0 END as utilization_rate
    FROM machine_operating_time ot
    LEFT JOIN machine_capacity mc ON mc.division = ot.division AND mc.machine_code = ot.machine_code
      AND mc.valid_from <= ot.ym AND mc.valid_to >= ot.ym
    WHERE ot.division = ? AND ot.ym = ?
    ORDER BY ot.machine_code
  `).bind(div, ym).all()

  const rows = results.results as any[]
  const totals = rows.reduce((acc, r) => ({
    total_days: acc.total_days + (r.total_days || 0),
    planned_shutdown_days: acc.planned_shutdown_days + (r.planned_shutdown_days || 0),
    operation_subtotal: acc.operation_subtotal + (r.operation_subtotal || 0),
    downtime_subtotal: acc.downtime_subtotal + (r.downtime_subtotal || 0),
    max_production_ton: acc.max_production_ton + (r.max_production_ton || 0),
    total_operating_days: acc.total_operating_days + (r.total_operating_days || 0),
  }), { total_days: 0, planned_shutdown_days: 0, operation_subtotal: 0, downtime_subtotal: 0, max_production_ton: 0, total_operating_days: 0 })

  return c.json({ 
    ym, 
    division: div,
    machines: rows, 
    totals: {
      ...totals,
      utilization_rate: totals.total_days > 0 ? Math.round(totals.operation_subtotal * 1000 / totals.total_days) / 10 : 0
    }
  })
})

// ============ 지종별 생산성 마스터 (Grade Production) API ============

/** 지종별 생산성 마스터 조회 */
app.get('/api/grade-production', async (c) => {
  const db = c.env.DB
  const div = c.req.query('division') || 'PS'
  const machine = c.req.query('machine_code')
  const activeOnly = c.req.query('active') !== '0'  // 기본: 활성만

  let query = `
    SELECT gp.*, 
           ROUND(gp.theoretical_daily_ton * (1 - gp.waste_rate), 2) as good_daily_ton,
           ROUND(gp.theoretical_daily_ton * gp.waste_rate, 2) as waste_daily_ton
    FROM grade_production_master gp
    WHERE gp.division = ?
  `
  const binds: any[] = [div]

  if (machine) {
    query += ' AND gp.machine_code = ?'
    binds.push(machine)
  }
  if (activeOnly) {
    query += ' AND gp.is_active = 1'
  }
  query += ' ORDER BY gp.machine_code, gp.grade_name, gp.basis_weight ASC'

  const results = await db.prepare(query).bind(...binds).all()
  return c.json(results.results)
})

/** 지종별 생산성 마스터 등록/수정 */
app.post('/api/grade-production', async (c) => {
  const db = c.env.DB
  const body = await c.req.json() as any
  const { division, machine_code, grade_name, basis_weight, line_speed, 
          paper_width, waste_rate, sort_order, is_active, note } = body
  const div = division || 'PS'

  // paper_width: 입력값 없으면 machine_capacity에서 가져옴
  let pw = paper_width
  if (!pw) {
    const mc = await db.prepare(
      `SELECT paper_width FROM machine_capacity WHERE division = ? AND machine_code = ? AND valid_to >= strftime('%Y%m','now')`
    ).bind(div, machine_code).first() as any
    pw = mc?.paper_width || 3510
  }

  await db.prepare(`
    INSERT INTO grade_production_master 
      (division, machine_code, grade_name, basis_weight, line_speed, paper_width, 
       waste_rate, sort_order, is_active, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(division, machine_code, grade_name, basis_weight, line_speed) DO UPDATE SET
      paper_width = excluded.paper_width,
      waste_rate = excluded.waste_rate,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active,
      note = excluded.note,
      updated_at = CURRENT_TIMESTAMP
  `).bind(div, machine_code, grade_name, basis_weight, line_speed, pw,
          waste_rate ?? 0.0122, sort_order ?? 0, is_active ?? 1, note || null).run()

  return c.json({ success: true })
})

/** 지종별 생산성 마스터 일괄 등록 */
app.post('/api/grade-production/batch', async (c) => {
  const db = c.env.DB
  const { division, machine_code, entries } = await c.req.json() as any
  const div = division || 'PS'

  if (!entries || !entries.length) return c.json({ error: 'No entries' }, 400)

  // machine_capacity에서 기본 지폭 조회
  const mc = await db.prepare(
    `SELECT paper_width FROM machine_capacity WHERE division = ? AND machine_code = ? AND valid_to >= strftime('%Y%m','now')`
  ).bind(div, machine_code).first() as any
  const defaultPW = mc?.paper_width || 3510

  const stmt = db.prepare(`
    INSERT INTO grade_production_master 
      (division, machine_code, grade_name, basis_weight, line_speed, paper_width, 
       waste_rate, sort_order, is_active, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(division, machine_code, grade_name, basis_weight, line_speed) DO UPDATE SET
      paper_width = excluded.paper_width,
      waste_rate = excluded.waste_rate,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active,
      note = excluded.note,
      updated_at = CURRENT_TIMESTAMP
  `)

  const batch = entries.map((e: any, i: number) => stmt.bind(
    div, machine_code, e.grade_name, e.basis_weight, e.line_speed, 
    e.paper_width || defaultPW, e.waste_rate ?? 0.0122, e.sort_order ?? i, 
    e.is_active ?? 1, e.note || null
  ))
  await db.batch(batch)

  return c.json({ success: true, count: entries.length })
})

/** 지종별 생산성 삭제 (soft delete) */
app.delete('/api/grade-production/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare(`UPDATE grade_production_master SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

/** 생산량 시뮬레이션: 가동일수 × 지종배합 → 월 생산량 검증 */
app.post('/api/grade-production/simulate', async (c) => {
  const db = c.env.DB
  const { division, machine_code, ym, plan } = await c.req.json() as any
  // plan: [{ grade_production_id, planned_days }, ...]  — 각 지종에 몇 일 배정할지
  const div = division || 'PS'

  if (!plan || !plan.length) return c.json({ error: 'No plan entries' }, 400)

  // 해당 호기의 가동일수 조회
  const otRow = await db.prepare(
    `SELECT operation_subtotal, total_days FROM machine_operating_time WHERE division = ? AND machine_code = ? AND ym = ?`
  ).bind(div, machine_code, ym).first() as any

  const operatingDays = otRow?.operation_subtotal || 0
  const totalDays = otRow?.total_days || 0

  // 지종 마스터 조회 (ID 기반)
  const ids = plan.map((p: any) => p.grade_production_id)
  const placeholders = ids.map(() => '?').join(',')
  const grades = await db.prepare(
    `SELECT id, grade_name, basis_weight, line_speed, theoretical_daily_ton, waste_rate 
     FROM grade_production_master WHERE id IN (${placeholders})`
  ).bind(...ids).all()
  
  const gradeMap: any = {}
  ;(grades.results as any[]).forEach((g: any) => { gradeMap[g.id] = g })

  // 시뮬레이션 계산
  let totalPlannedDays = 0
  let totalGoodTon = 0
  let totalGrossTon = 0
  const details = plan.map((p: any) => {
    const g = gradeMap[p.grade_production_id]
    if (!g) return { error: `Grade ID ${p.grade_production_id} not found` }
    
    const plannedDays = p.planned_days || 0
    const grossTon = g.theoretical_daily_ton * plannedDays
    const goodTon = grossTon * (1 - g.waste_rate)
    const wasteTon = grossTon * g.waste_rate

    totalPlannedDays += plannedDays
    totalGoodTon += goodTon
    totalGrossTon += grossTon

    return {
      grade_production_id: p.grade_production_id,
      grade_name: g.grade_name,
      basis_weight: g.basis_weight,
      line_speed: g.line_speed,
      planned_days: plannedDays,
      theoretical_daily_ton: g.theoretical_daily_ton,
      gross_ton: Math.round(grossTon * 10) / 10,
      good_ton: Math.round(goodTon * 10) / 10,
      waste_ton: Math.round(wasteTon * 10) / 10,
    }
  })

  const remainingDays = operatingDays - totalPlannedDays

  return c.json({
    division: div,
    machine_code,
    ym,
    operating_days: operatingDays,
    total_days: totalDays,
    planned_days_total: Math.round(totalPlannedDays * 10) / 10,
    remaining_days: Math.round(remainingDays * 10) / 10,
    total_good_ton: Math.round(totalGoodTon * 10) / 10,
    total_gross_ton: Math.round(totalGrossTon * 10) / 10,
    total_waste_ton: Math.round((totalGrossTon - totalGoodTon) * 10) / 10,
    waste_rate_actual: totalGrossTon > 0 ? Math.round((1 - totalGoodTon / totalGrossTon) * 10000) / 100 : 0,
    details
  })
})

// ===================== SAP Batch Jobs API =====================

// GET /api/batch/jobs - 작업 이력 조회
app.get('/api/batch/jobs', async (c) => {
  const { limit = '50', offset = '0', status } = c.req.query()
  const db = c.env.DB

  let query = 'SELECT * FROM batch_jobs'
  const params: any[] = []

  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))

  const { results } = await db.prepare(query).bind(...params).all()

  // Total count
  let countQuery = 'SELECT COUNT(*) as total FROM batch_jobs'
  if (status) countQuery += ` WHERE status = '${status}'`
  const countResult = await db.prepare(countQuery).first()

  return c.json({ jobs: results, total: countResult?.total || 0 })
})

// GET /api/batch/summary - 요약 통계
app.get('/api/batch/summary', async (c) => {
  const db = c.env.DB

  const totalRecords = await db.prepare(
    "SELECT SUM(insert_count) as total FROM batch_jobs WHERE status = 'SUCCESS'"
  ).first()

  const successCount = await db.prepare(
    "SELECT COUNT(*) as cnt FROM batch_jobs WHERE status = 'SUCCESS'"
  ).first()

  const failedCount = await db.prepare(
    "SELECT COUNT(*) as cnt FROM batch_jobs WHERE status = 'FAILED'"
  ).first()

  const totalJobs = await db.prepare(
    "SELECT COUNT(*) as cnt FROM batch_jobs"
  ).first()

  return c.json({
    total_db_records: totalRecords?.total || 0,
    success_count: successCount?.cnt || 0,
    failed_count: failedCount?.cnt || 0,
    total_jobs: totalJobs?.cnt || 0
  })
})

// GET /api/batch/monthly-chart - 월별 데이터 현황
app.get('/api/batch/monthly-chart', async (c) => {
  const db = c.env.DB

  const { results } = await db.prepare(
    `SELECT input_month, SUM(insert_count) as records
     FROM batch_jobs WHERE status = 'SUCCESS'
     GROUP BY input_month ORDER BY input_month DESC LIMIT 12`
  ).all()

  return c.json({ months: results || [] })
})

// POST /api/batch/execute - 배치 작업 실행
app.post('/api/batch/execute', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { input_month, execution_mode = 'REPLACE' } = body

  if (!input_month || !/^\d{6}$/.test(input_month)) {
    return c.json({ error: '입력년월은 YYYYMM 형식이어야 합니다.' }, 400)
  }

  const jobId = `JOB_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  const startedAt = new Date(Date.now() + 9 * 3600000).toISOString().replace('T', ' ').substring(0, 19)

  // Insert job record
  await db.prepare(
    `INSERT INTO batch_jobs (job_id, input_month, execution_mode, status, started_at, executed_by)
     VALUES (?, ?, ?, 'RUNNING', ?, 'admin')`
  ).bind(jobId, input_month, execution_mode, startedAt).run()

    // Simulate SAP RFC call (in real production, this would call SAP via external API)
    // For now, simulate processing with raw_records data
    try {
      let sourceCount = 0
      let insertCount = 0

      const year = input_month.substring(0, 4)
      const month = input_month.substring(4, 6)
      const ym = `${year}-${month}`

      if (execution_mode === 'REPLACE') {
        // Delete existing data for this month
        const delResult = await db.prepare(
          'DELETE FROM raw_records WHERE calendar_ym = ?'
        ).bind(ym).run()
        sourceCount = delResult.meta.changes || 0
      }

      // Count existing records to simulate "fetched from SAP"
      const existing = await db.prepare(
        'SELECT COUNT(*) as cnt FROM raw_records WHERE calendar_ym = ?'
      ).bind(ym).first()
      insertCount = existing?.cnt || 0

    // Update job as success
    const completedAt = new Date(Date.now() + 9 * 3600000).toISOString().replace('T', ' ').substring(0, 19)
    const durationMs = Math.floor(Math.random() * 80000) + 5000 // simulated

    await db.prepare(
      `UPDATE batch_jobs SET status = 'SUCCESS', source_count = ?, insert_count = ?,
       duration_ms = ?, completed_at = ? WHERE job_id = ?`
    ).bind(sourceCount + insertCount, insertCount, durationMs, completedAt, jobId).run()

    return c.json({
      success: true,
      job_id: jobId,
      status: 'SUCCESS',
      source_count: sourceCount + insertCount,
      insert_count: insertCount,
      duration_ms: durationMs
    })
  } catch (err: any) {
    const completedAt = new Date(Date.now() + 9 * 3600000).toISOString().replace('T', ' ').substring(0, 19)
    await db.prepare(
      `UPDATE batch_jobs SET status = 'FAILED', error_message = ?, completed_at = ? WHERE job_id = ?`
    ).bind(err.message || 'Unknown error', completedAt, jobId).run()

    return c.json({
      success: false,
      job_id: jobId,
      status: 'FAILED',
      error: err.message
    }, 500)
  }
})

// POST /api/batch/check - 확인 (조회 미리보기 - SAP에 몇 건 있는지 확인)
app.post('/api/batch/check', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { input_month } = body

  if (!input_month || !/^\d{6}$/.test(input_month)) {
    return c.json({ error: '입력년월은 YYYYMM 형식이어야 합니다.' }, 400)
  }

  const year = input_month.substring(0, 4)
  const month = input_month.substring(4, 6)
  const ym = `${year}-${month}`

  // Check existing data
  const existing = await db.prepare(
    'SELECT COUNT(*) as cnt FROM raw_records WHERE calendar_ym = ?'
  ).bind(ym).first()

  // Check previous batch for this month
  const prevJob = await db.prepare(
    `SELECT * FROM batch_jobs WHERE input_month = ? ORDER BY created_at DESC LIMIT 1`
  ).bind(input_month).first()

  return c.json({
    input_month,
    existing_records: existing?.cnt || 0,
    last_job: prevJob || null,
    message: (existing?.cnt || 0) > 0
      ? `${ym} 데이터 ${existing?.cnt}건이 이미 존재합니다.`
      : `${ym} 데이터가 없습니다. 신규 적재 가능합니다.`
  })
})

// GET /api/batch/jobs/:jobId/log - 작업 로그 조회
app.get('/api/batch/jobs/:jobId/log', async (c) => {
  const jobId = c.req.param('jobId')
  const db = c.env.DB

  const job = await db.prepare(
    'SELECT * FROM batch_jobs WHERE job_id = ?'
  ).bind(jobId).first()

  if (!job) return c.json({ error: 'Job not found' }, 404)

  return c.json({ job })
})

export default app
