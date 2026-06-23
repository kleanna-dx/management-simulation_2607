import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { mainPage } from './pages/main'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ============ API Routes ============

// 호기 목록 조회
app.get('/api/units', async (c) => {
  const db = c.env.DB
  const results = await db.prepare('SELECT * FROM units WHERE is_active = 1 ORDER BY id').all()
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

// 일괄 등록 (엑셀 업로드용)
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

// 실적 삭제
app.delete('/api/records/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('DELETE FROM monthly_records WHERE id = ?').bind(id).run()
  return c.json({ success: true })
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
  const orderedParams: any[] = [prevYear, prevMonth, currentYear, currentMonth]
  
  if (unit_id) {
    unitFilter = 'AND cur.unit_id = ?'
    orderedParams.push(parseInt(unit_id))
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
      COALESCE(prev.usage_qty, 0) as prev_usage_qty,
      COALESCE(prev.unit_price, 0) as prev_unit_price,
      COALESCE(prev.total_cost, 0) as prev_total_cost,
      COALESCE(prev.production_qty, 0) as prev_production_qty,
      cur.usage_qty as cur_usage_qty,
      cur.unit_price as cur_unit_price,
      cur.total_cost as cur_total_cost,
      cur.production_qty as cur_production_qty,
      (cur.usage_qty - COALESCE(prev.usage_qty, 0)) as qty_diff,
      (cur.unit_price - COALESCE(prev.unit_price, 0)) as price_diff,
      (cur.total_cost - COALESCE(prev.total_cost, 0)) as cost_diff,
      ((cur.usage_qty - COALESCE(prev.usage_qty, 0)) * COALESCE(prev.unit_price, 0)) as qty_effect,
      ((cur.unit_price - COALESCE(prev.unit_price, 0)) * cur.usage_qty) as price_effect,
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

  const results = await db.prepare(query).bind(...orderedParams).all()
  
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
    ORDER BY u.id
  `

  const results = await db.prepare(query).bind(prevYear, prevMonth, currentYear, currentMonth).all()
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

// ============ 메인 페이지 ============
app.get('/', (c) => {
  return c.html(mainPage())
})

export default app
