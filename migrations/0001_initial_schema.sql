-- 호기 마스터 테이블
CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_code TEXT UNIQUE NOT NULL,
  unit_name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 원부자재 마스터 테이블
CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_code TEXT UNIQUE NOT NULL,
  material_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'RAW',  -- RAW(원자재), SUB(부자재)
  unit_of_measure TEXT NOT NULL DEFAULT 'kg',  -- kg, L, EA, m 등
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 월별 실적 데이터 테이블 (핵심 테이블)
CREATE TABLE IF NOT EXISTS monthly_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  usage_qty REAL NOT NULL DEFAULT 0,        -- 사용량
  unit_price REAL NOT NULL DEFAULT 0,       -- 단가 (원/단위)
  total_cost REAL GENERATED ALWAYS AS (usage_qty * unit_price) STORED,  -- 총 원가
  production_qty REAL DEFAULT 0,            -- 생산량 (원단위 계산용)
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id),
  FOREIGN KEY (material_id) REFERENCES materials(id),
  UNIQUE(unit_id, material_id, year, month)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_records_unit ON monthly_records(unit_id);
CREATE INDEX IF NOT EXISTS idx_records_material ON monthly_records(material_id);
CREATE INDEX IF NOT EXISTS idx_records_period ON monthly_records(year, month);
CREATE INDEX IF NOT EXISTS idx_records_unit_period ON monthly_records(unit_id, year, month);
