-- SAP BW 엑셀 37개 컬럼 전체를 저장하기 위한 raw_records 테이블
-- 기존 monthly_records는 집계용으로 유지, raw_records는 원본 데이터 전체 저장

CREATE TABLE IF NOT EXISTS raw_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- 기본 기간/호기 정보
  calendar_ym TEXT,                    -- 달력연도/월 (예: 202605)
  process_code TEXT,                   -- 공정 코드
  process_name TEXT,                   -- 공정명
  machine_code TEXT,                   -- 생산호기 코드
  machine_name TEXT,                   -- 생산호기명
  -- 제품계층 구조
  product_level1 TEXT,                 -- 제품계층 구조레벨 1
  product_level1_name TEXT,            -- 제품계층 구조레벨 1명
  product_level2 TEXT,                 -- 제품 계층구조레벨 2
  product_level2_name TEXT,            -- 제품 계층구조레벨 2명
  product_level3 TEXT,                 -- 제품 계층구조레벨 3
  product_level3_name TEXT,            -- 제품 계층구조레벨 3명
  product_level4 TEXT,                 -- 제품 계층구조레벨 4
  product_level4_name TEXT,            -- 제품 계층구조레벨 4명
  -- 자재 정보
  material_code TEXT,                  -- 자재 (원본 코드 그대로)
  material_name TEXT,                  -- 자재명
  material_group TEXT,                 -- 자재 그룹
  material_group_name TEXT,            -- 자재 그룹명
  material_group_major TEXT,           -- 자재그룹(대분류)
  material_group_major_name TEXT,      -- 자재그룹(대분류)명
  product_type_code TEXT,              -- 지종/제품구분
  product_type_name TEXT,              -- 지종/제품구분명
  -- 계획 데이터
  plan_unit_consumption REAL,          -- 계획 원단위(KG/Ton)(당월)
  component_qty REAL,                  -- 구성부품수량(당월)
  base_qty REAL,                       -- 기준수량(당월)
  plan_unit_consumption_waste REAL,    -- 계획 원단위(폐품포함)(당월)
  plan_unit_price REAL,                -- 계획 단가(당월)
  plan_alloc_qty REAL,                 -- 계획 배부수량(당월)
  -- 생산 데이터
  total_production REAL,               -- 총생산량(당월)
  production_qty REAL,                 -- 생산수량(당월)
  waste_qty REAL,                      -- 폐품수량(당월)
  -- 실적 데이터
  actual_unit_consumption REAL,        -- 실제 원단위(KG/Ton)(당월)
  actual_alloc_qty REAL,               -- 실제 배부수량(당월)
  actual_unit_price REAL,              -- 실제단가(당월)
  issue_qty REAL,                      -- 출고수량(당월)
  issue_amount REAL,                   -- 출고금액(당월)
  -- 차이 분석
  plan_vs_usage_diff REAL,             -- 계획대비 사용량 차이
  plan_vs_price_diff REAL,             -- 계획대비 단가 차이
  -- 메타
  data_source TEXT DEFAULT 'SAP_BW',   -- 데이터 소스 (SAP_BW, MANUAL 등)
  file_name TEXT,                      -- 업로드된 파일명
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_raw_calendar_ym ON raw_records(calendar_ym);
CREATE INDEX IF NOT EXISTS idx_raw_machine ON raw_records(machine_code);
CREATE INDEX IF NOT EXISTS idx_raw_material ON raw_records(material_code);
CREATE INDEX IF NOT EXISTS idx_raw_machine_period ON raw_records(machine_code, calendar_ym);
CREATE INDEX IF NOT EXISTS idx_raw_material_group ON raw_records(material_group_name);
