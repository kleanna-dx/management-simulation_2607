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

// SAP 형식 엑셀 파싱 결과를 DB에 일괄 등록 (집계용 monthly_records + 원본 raw_records)
app.post('/api/upload/smart', async (c) => {
  try {
  const db = c.env.DB
  const { rows, rawRows, fileName } = await c.req.json()
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
        data_source, file_name
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
        'SAP_BW', fileName || ''
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
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_level2_name,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as material_cost
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH'
      AND CAST(actual_alloc_qty AS REAL) != 0
      ${catFilter}
    GROUP BY machine_code, 
      CASE 
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
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
          WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
          WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
          ELSE product_level2_name
        END as product_level2_name,
        product_level4,
        MAX(CAST(total_production AS REAL)) as total_prod
      FROM raw_records
      WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH'
        AND CAST(total_production AS REAL) > 0
      GROUP BY machine_code, 
        CASE 
          WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
          WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
          ELSE product_level2_name
        END,
        product_level4
    )
    GROUP BY machine_code, product_level2_name
    ORDER BY machine_code, production DESC
  `

  // 당월 재료비 + 생산량
  const curCostResult = await db.prepare(costSql).bind(ym).all()
  const curCostData = curCostResult.results as any[]
  const curProdResult = await db.prepare(prodSql).bind(ym).all()
  const curProdMap = new Map<string, number>()
  for (const p of curProdResult.results as any[]) {
    curProdMap.set(`${p.machine_code}|${p.product_level2_name}`, Number(p.production) || 0)
  }

  // 전월 재료비 + 생산량
  let prevCostMap = new Map<string, number>()
  let prevProdMap = new Map<string, number>()
  if (prevYm) {
    const prevCostResult = await db.prepare(costSql).bind(prevYm).all()
    for (const row of prevCostResult.results as any[]) {
      prevCostMap.set(`${row.machine_code}|${row.product_level2_name}`, Number(row.material_cost) || 0)
    }
    const prevProdResult = await db.prepare(prodSql).bind(prevYm).all()
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
    const cur_production = curProdMap.get(key) || 0
    const prev_material_cost = prevCostMap.get(key) || 0
    const prev_production = prevProdMap.get(key) || 0
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
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
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
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH'
      AND CAST(actual_alloc_qty AS REAL) != 0
      ${catFilter}
    GROUP BY machine_code, 
      CASE 
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
        ELSE product_level2_name
      END,
      material_group_name
    ORDER BY machine_code, product_level2_name, material_cost DESC
  `
  
  // 당월 조회
  const curResult = await db.prepare(baseSql).bind(ym).all()
  const curData = curResult.results as any[]
  
  // 전월 조회
  let prevMap = new Map<string, any>()
  if (prevYm) {
    const prevResult = await db.prepare(baseSql).bind(prevYm).all()
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
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
        ELSE product_level2_name
      END as product_level2_name,
      SUM(CAST(actual_alloc_qty AS REAL) * CAST(actual_unit_price AS REAL)) as material_cost,
      SUM(CAST(actual_alloc_qty AS REAL)) as total_alloc_qty,
      SUM(CAST(plan_vs_usage_diff AS REAL)) as usage_diff,
      SUM(CAST(plan_vs_price_diff AS REAL)) as price_diff,
      COUNT(*) as row_count
    FROM raw_records
    WHERE calendar_ym = ? AND calendar_ym != 'CALMONTH'
      AND CAST(actual_alloc_qty AS REAL) != 0
      ${catFilter}
    GROUP BY machine_code, material_group_major_name,
      CASE 
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
        WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
        ELSE product_level2_name
      END
    ORDER BY machine_code, material_group_major_name, material_cost DESC
  `

  const curResult = await db.prepare(baseSql).bind(ym).all()
  const curData = curResult.results as any[]

  let prevMap = new Map<string, any>()
  if (prevYm) {
    const prevResult = await db.prepare(baseSql).bind(prevYm).all()
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
  
  let where = '1=1'
  const params: any[] = []
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
          WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
          WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
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
          WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) < 250 THEN 'SC저평량'
          WHEN product_level2_name = 'SC' AND CAST(SUBSTR(product_level4, -3) AS INTEGER) >= 250 THEN 'SC고평량'
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

// ============ Raw Records (원본 데이터) 조회 API ============

// 원본 데이터 조회 (필터링, 페이징)
app.get('/api/raw-records', async (c) => {
  const db = c.env.DB
  const ym = c.req.query('ym') // 예: 202605
  const machine = c.req.query('machine') // PM2, PM3
  const category = c.req.query('category') // RAW, SUB (material_group_major_name 기반)
  const search = c.req.query('search')
  const page = parseInt(c.req.query('page') || '0')
  const limit = parseInt(c.req.query('limit') || '100')

  let where = '1=1'
  const params: any[] = []

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

  // Data
  params.push(limit, page * limit)
  const dataResult = await db.prepare(`SELECT * FROM raw_records WHERE ${where} ORDER BY machine_code, material_group_name, material_name LIMIT ? OFFSET ?`).bind(...params).all()

  return c.json({ total, page, limit, data: dataResult.results })
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
  
  let ymFilter = ''
  const params: any[] = []
  if (ym) { ymFilter = ' WHERE calendar_ym = ?'; params.push(ym) }

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

// ============ 메인 페이지 ============
app.get('/', (c) => {
  return c.html(mainPage())
})

export default app
