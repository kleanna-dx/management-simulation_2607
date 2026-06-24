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

// ============ SAP 엑셀 스마트 업로드 API ============

// SAP 형식 엑셀 파싱 결과를 DB에 일괄 등록
app.post('/api/upload/smart', async (c) => {
  const db = c.env.DB
  const { rows } = await c.req.json()
  // rows: SAP 엑셀에서 파싱된 데이터 배열
  // 각 row: { period, machine, mat_group_code, mat_group_desc, product_type, mat_code, mat_name, unit, 
  //           total_production, production_qty, actual_unit_consumption, actual_unit_price, 
  //           issue_qty, issue_amount, plan_vs_usage_diff, plan_vs_price_diff, product_level1, ... }

  if (!rows || !rows.length) return c.json({ error: 'no data' }, 400)

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
    // 카테고리 분류: 펄프/고지 → RAW, 약품/기타 → SUB
    const desc = (row.mat_group_desc || '').toLowerCase()
    const category = (desc.includes('펄프') || desc.includes('고지')) ? 'RAW' : 'SUB'
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

  // 5. Aggregate: 같은 (unit_id, material_id, year, month) → 합산
  const aggregated = new Map<string, any>()
  for (const r of records) {
    const key = `${r.unit_id}-${r.material_id}-${r.year}-${r.month}`
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)
      existing.usage_qty += r.usage_qty
      existing.total_cost += r.total_cost
      existing.production_qty = Math.max(existing.production_qty, r.production_qty)
    } else {
      aggregated.set(key, { ...r })
    }
  }

  // Recalculate unit_price from aggregated total_cost / usage_qty
  const finalRecords = [...aggregated.values()].map(r => ({
    ...r,
    unit_price: r.usage_qty > 0 ? Math.round(r.total_cost / r.usage_qty) : r.unit_price
  }))

  // 6. Batch insert
  const stmt = db.prepare(`
    INSERT INTO monthly_records (unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(unit_id, material_id, year, month) 
    DO UPDATE SET usage_qty = ?, unit_price = ?, production_qty = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
  `)
  
  const batchSize = 50
  let inserted = 0
  for (let i = 0; i < finalRecords.length; i += batchSize) {
    const chunk = finalRecords.slice(i, i + batchSize)
    const batch = chunk.map(r => 
      stmt.bind(r.unit_id, r.material_id, r.year, r.month, r.usage_qty, r.unit_price, r.production_qty, r.notes || '',
                r.usage_qty, r.unit_price, r.production_qty, r.notes || '')
    )
    await db.batch(batch)
    inserted += chunk.length
  }

  return c.json({
    success: true,
    summary: {
      total_rows: rows.length,
      records_inserted: inserted,
      new_materials: newMatCount,
      skipped: skipped.length,
      aggregated_from: records.length
    }
  })
})

// ============ 메인 페이지 ============
app.get('/', (c) => {
  return c.html(mainPage())
})

export default app
