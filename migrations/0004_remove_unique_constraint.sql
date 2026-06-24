-- monthly_records 테이블에서 UNIQUE 제약 제거
-- 제품별 개별 행이 모두 저장되어야 하므로 동일 호기/자재/월 합산하지 않음

-- 기존 테이블을 백업하고 새로 생성
CREATE TABLE IF NOT EXISTS monthly_records_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  usage_qty REAL NOT NULL DEFAULT 0,
  unit_price REAL NOT NULL DEFAULT 0,
  total_cost REAL GENERATED ALWAYS AS (usage_qty * unit_price) STORED,
  production_qty REAL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id),
  FOREIGN KEY (material_id) REFERENCES materials(id)
);

-- 기존 데이터 복사
INSERT INTO monthly_records_new (id, unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes, created_at, updated_at)
SELECT id, unit_id, material_id, year, month, usage_qty, unit_price, production_qty, notes, created_at, updated_at FROM monthly_records;

-- 기존 테이블 삭제 후 교체
DROP TABLE monthly_records;
ALTER TABLE monthly_records_new RENAME TO monthly_records;

-- 인덱스 재생성 (UNIQUE 없이)
CREATE INDEX IF NOT EXISTS idx_records_unit ON monthly_records(unit_id);
CREATE INDEX IF NOT EXISTS idx_records_material ON monthly_records(material_id);
CREATE INDEX IF NOT EXISTS idx_records_period ON monthly_records(year, month);
CREATE INDEX IF NOT EXISTS idx_records_unit_period ON monthly_records(unit_id, year, month);
CREATE INDEX IF NOT EXISTS idx_records_unit_mat_period ON monthly_records(unit_id, material_id, year, month);
