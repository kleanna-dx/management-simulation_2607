-- 제품 마스터 테이블
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_code TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  unit_id INTEGER NOT NULL,
  unit_of_measure TEXT NOT NULL DEFAULT 'ton',
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id)
);

-- BOM (자재명세서) - 제품 1단위 생산에 필요한 자재 원단위
CREATE TABLE IF NOT EXISTS bom (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  unit_consumption REAL NOT NULL DEFAULT 0,  -- 원단위: 제품 1ton 생산 시 자재 소요량
  effective_date TEXT DEFAULT '2026-01-01',   -- 적용 시작일
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (material_id) REFERENCES materials(id),
  UNIQUE(product_id, material_id)
);

-- 시뮬레이션 저장 테이블
CREATE TABLE IF NOT EXISTS simulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sim_name TEXT NOT NULL,
  base_year INTEGER NOT NULL,
  base_month INTEGER NOT NULL,
  sim_data TEXT NOT NULL,  -- JSON: [{product_id, planned_qty}]
  result_data TEXT,        -- JSON: 계산 결과
  created_by TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit_id);
CREATE INDEX IF NOT EXISTS idx_bom_product ON bom(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_material ON bom(material_id);
