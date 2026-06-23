import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { mainPage } from './pages/main'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

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
  const currentYear = parseInt(year), currentMonth = parseInt(month)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const results = await db.prepare(`
    SELECT u.id as unit_id, u.unit_code, u.unit_name,
      SUM(COALESCE(prev.total_cost,0)) as prev_total_cost, SUM(cur.total_cost) as cur_total_cost,
      SUM(cur.total_cost-COALESCE(prev.total_cost,0)) as cost_diff,
      SUM((cur.usage_qty-COALESCE(prev.usage_qty,0))*COALESCE(prev.unit_price,0)) as total_qty_effect,
      SUM((cur.unit_price-COALESCE(prev.unit_price,0))*cur.usage_qty) as total_price_effect,
      COUNT(cur.id) as material_count, MAX(cur.production_qty) as production_qty
    FROM monthly_records cur JOIN units u ON cur.unit_id=u.id
    LEFT JOIN monthly_records prev ON cur.unit_id=prev.unit_id AND cur.material_id=prev.material_id AND prev.year=? AND prev.month=?
    WHERE cur.year=? AND cur.month=?
    GROUP BY u.id, u.unit_code, u.unit_name ORDER BY u.id
  `).bind(prevYear, prevMonth, currentYear, currentMonth).all()
  return c.json(results.results)
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

// ============ BOM API ============

app.get('/api/bom', async (c) => {
  const db = c.env.DB
  const product_id = c.req.query('product_id')
  let query = `SELECT b.*, p.product_code, p.product_name, p.unit_id, m.material_code, m.material_name, m.category, m.unit_of_measure
    FROM bom b JOIN products p ON b.product_id = p.id JOIN materials m ON b.material_id = m.id WHERE 1=1`
  if (product_id) query += ` AND b.product_id = ${product_id}`
  query += ' ORDER BY p.product_code, m.category, m.material_code'
  const results = await db.prepare(query).all()
  return c.json(results.results)
})

app.post('/api/bom', async (c) => {
  const db = c.env.DB
  const { product_id, material_id, unit_consumption, notes } = await c.req.json()
  const result = await db.prepare(`
    INSERT INTO bom (product_id, material_id, unit_consumption, notes)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(product_id, material_id) DO UPDATE SET unit_consumption = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
  `).bind(product_id, material_id, unit_consumption, notes || '', unit_consumption, notes || '').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.delete('/api/bom/:id', async (c) => {
  const db = c.env.DB
  await db.prepare('DELETE FROM bom WHERE id = ?').bind(c.req.param('id')).run()
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

// ============ 메인 페이지 ============
app.get('/', (c) => {
  return c.html(mainPage())
})

export default app
