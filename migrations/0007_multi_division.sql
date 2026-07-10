-- 0007: 멀티 사업부 지원을 위한 division 컬럼 추가
-- PS(제지), HL(생활용품) 사업부 데이터를 구분합니다.

-- raw_records에 division 컬럼 추가
ALTER TABLE raw_records ADD COLUMN division TEXT DEFAULT 'PS';

-- monthly_records에 division 컬럼 추가
ALTER TABLE monthly_records ADD COLUMN division TEXT DEFAULT 'PS';

-- inventory_stock에 division 컬럼 추가
ALTER TABLE inventory_stock ADD COLUMN division TEXT DEFAULT 'PS';

-- manual_inputs에 division 컬럼 추가
ALTER TABLE manual_inputs ADD COLUMN division TEXT DEFAULT 'PS';

-- 인덱스 추가 (사업부별 조회 성능)
CREATE INDEX IF NOT EXISTS idx_raw_records_division ON raw_records(division);
CREATE INDEX IF NOT EXISTS idx_raw_records_div_ym_machine ON raw_records(division, calendar_ym, machine_code);
CREATE INDEX IF NOT EXISTS idx_monthly_records_division ON monthly_records(division);

-- HL사업부 전용 마스터 테이블 (초지기/가공기별 제품 기준)
CREATE TABLE IF NOT EXISTS master_hl_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_code TEXT,
  product_name TEXT,
  product_category TEXT,  -- 두루마리, 미용티슈, 물티슈, 생리대, 기저귀
  brand TEXT,             -- 깨끗한나라, 보솜이, 순수한면
  machine_type TEXT,      -- tissue_machine, converting, wet_tissue, pad
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS master_hl_raw_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_code TEXT,
  material_name TEXT,
  material_group TEXT,        -- PULP, NONWOVEN, CHEM, FILM, ETC
  material_group_detail TEXT, -- VIRGIN, SPUNLACE, SAP, PE 등
  unit TEXT DEFAULT 'kg',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
