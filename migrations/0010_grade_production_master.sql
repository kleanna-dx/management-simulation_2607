-- ============================================================
-- 0010: 지종별 생산성 마스터 (Grade Production Master)
-- 
-- 이론생산성(톤/일) = 평량(g/㎡) × 지폭(mm) × 선속(m/min) × 1440 × 10⁻⁹
-- 총중량 = 양품 / (1 - 폐품율)
-- ============================================================

-- machine_capacity에 지폭(paper_width) 추가
ALTER TABLE machine_capacity ADD COLUMN paper_width REAL DEFAULT 0;

-- 지폭 초기값 세팅 (PM3=3510mm, PM2=3510mm 가정)
UPDATE machine_capacity SET paper_width = 3510 WHERE division = 'PS' AND machine_code IN ('PM2','PM3');

-- 지종별 생산성 마스터 테이블
CREATE TABLE IF NOT EXISTS grade_production_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division TEXT NOT NULL DEFAULT 'PS',
  machine_code TEXT NOT NULL,
  
  -- 지종 정보
  grade_name TEXT NOT NULL,           -- 지종명 (SC, SC고평량, IV, KB, ACB, CB 등)
  basis_weight REAL NOT NULL,         -- 평량 (g/㎡)
  line_speed REAL NOT NULL,           -- 선속 (m/min)
  paper_width REAL,                   -- 지폭 (mm) — NULL이면 machine_capacity에서 참조
  
  -- 자동 계산 (GENERATED)
  -- 이론생산성(톤/일) = 평량 × 지폭 × 선속 × 1440 × 10⁻⁹
  -- paper_width가 NULL이면 0으로 계산됨 → API에서 machine_capacity.paper_width로 대체
  theoretical_daily_ton REAL GENERATED ALWAYS AS (
    basis_weight * COALESCE(paper_width, 0) * line_speed * 1440 * 0.000000001
  ) STORED,
  
  -- 폐품율 (기본 1.22% = 0.0122)
  waste_rate REAL NOT NULL DEFAULT 0.0122,
  
  -- 양품 이론생산성(톤/일) = 이론생산성 × (1 - 폐품율)
  -- → API에서 계산 (GENERATED에서 다른 GENERATED 참조 불가)
  
  -- 메타
  sort_order INTEGER DEFAULT 0,       -- 표시 순서
  is_active INTEGER DEFAULT 1,        -- 활성/비활성
  note TEXT,
  valid_from TEXT NOT NULL DEFAULT '202401',
  valid_to TEXT DEFAULT '999912',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 동일 호기+지종+평량+선속 중복 방지
  UNIQUE(division, machine_code, grade_name, basis_weight, line_speed)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_grade_prod_division ON grade_production_master(division, machine_code);
CREATE INDEX IF NOT EXISTS idx_grade_prod_active ON grade_production_master(division, machine_code, is_active);

-- ============================================================
-- 초기 데이터: PM3 (제지3호기) — 검증시트 기반
-- 지폭 3510mm 고정, 폐품율 1.22% 일괄
-- ============================================================
INSERT OR IGNORE INTO grade_production_master 
  (division, machine_code, grade_name, basis_weight, line_speed, paper_width, waste_rate, sort_order, note)
VALUES
  -- SC (Standard Coated)
  ('PS', 'PM3', 'SC', 300, 300, 3510, 0.0122, 1, 'SC 300gsm 300m/min'),
  ('PS', 'PM3', 'SC', 350, 280, 3510, 0.0122, 2, 'SC 350gsm 280m/min'),
  ('PS', 'PM3', 'SC', 400, 250, 3510, 0.0122, 3, 'SC 400gsm 250m/min'),
  -- SC고평량
  ('PS', 'PM3', 'SC고평량', 450, 220, 3510, 0.0122, 10, 'SC고평량 450gsm'),
  ('PS', 'PM3', 'SC고평량', 500, 200, 3510, 0.0122, 11, 'SC고평량 500gsm'),
  -- IV (Ivory)
  ('PS', 'PM3', 'IV', 250, 350, 3510, 0.0122, 20, 'IV 250gsm'),
  ('PS', 'PM3', 'IV', 300, 320, 3510, 0.0122, 21, 'IV 300gsm'),
  -- ACB
  ('PS', 'PM3', 'ACB', 280, 330, 3510, 0.0122, 30, 'ACB 280gsm'),
  -- CB
  ('PS', 'PM3', 'CB', 270, 340, 3510, 0.0122, 40, 'CB 270gsm');

-- ============================================================
-- 초기 데이터: PM2 (제지2호기) — 예시 데이터
-- ============================================================
INSERT OR IGNORE INTO grade_production_master 
  (division, machine_code, grade_name, basis_weight, line_speed, paper_width, waste_rate, sort_order, note)
VALUES
  ('PS', 'PM2', 'SC', 300, 320, 3510, 0.0122, 1, 'PM2 SC 300gsm'),
  ('PS', 'PM2', 'SC', 350, 300, 3510, 0.0122, 2, 'PM2 SC 350gsm'),
  ('PS', 'PM2', 'IV', 250, 370, 3510, 0.0122, 20, 'PM2 IV 250gsm'),
  ('PS', 'PM2', 'KB', 200, 400, 3510, 0.0122, 50, 'PM2 KB 200gsm');
