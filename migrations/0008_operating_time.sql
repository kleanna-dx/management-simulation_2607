-- ============================================================
-- 0008: 가동시간(Operating Time) 모듈
-- 
-- 월별 호기별 가동시간 관리
-- 월 총시간 - (운휴 + 점검 + ...) = 가동가능시간
-- 가동시간 × 시간당생산량 = 최대생산능력(톤)
-- ============================================================

-- 호기별 기준정보 (시간당 생산능력 등)
CREATE TABLE IF NOT EXISTS machine_capacity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division TEXT NOT NULL DEFAULT 'PS',
  machine_code TEXT NOT NULL,
  -- 시간당 생산능력 (톤/시간)
  hourly_capacity REAL NOT NULL DEFAULT 0,
  -- 기준 평량 (g/m², PS사업부용 — 평량에 따라 속도 달라짐)
  basis_weight_ref REAL,
  -- 메모
  note TEXT,
  -- 유효기간 (변경 이력 관리)
  valid_from TEXT NOT NULL DEFAULT '202401',
  valid_to TEXT DEFAULT '999912',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 월별 가동시간 입력 테이블
CREATE TABLE IF NOT EXISTS machine_operating_time (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division TEXT NOT NULL DEFAULT 'PS',
  machine_code TEXT NOT NULL,
  ym TEXT NOT NULL,  -- YYYYMM

  -- === 월 총시간 구성 ===
  -- 월 달력일수 × 24 = 월 총시간 (자동 계산 가능)
  total_hours REAL NOT NULL DEFAULT 0,

  -- === 비가동 시간 (제외 항목) ===
  -- 운휴 (계획 정지): 수요 감소, 재고 과다 등으로 의도적 정지
  shutdown_hours REAL NOT NULL DEFAULT 0,
  -- 정기점검/보수 (PM: Preventive Maintenance)
  maintenance_hours REAL NOT NULL DEFAULT 0,
  -- 고장정지 (BM: Breakdown Maintenance)
  breakdown_hours REAL NOT NULL DEFAULT 0,
  -- 품종교체 (Grade Change): 지종 전환 시 손실시간
  grade_change_hours REAL NOT NULL DEFAULT 0,
  -- 기타 정지 (청소, 시운전 등)
  other_stop_hours REAL NOT NULL DEFAULT 0,

  -- === 계산 결과 (저장 or 계산) ===
  -- 가동가능시간 = total - shutdown - maintenance - breakdown - grade_change - other
  operating_hours REAL GENERATED ALWAYS AS (
    total_hours - shutdown_hours - maintenance_hours - breakdown_hours - grade_change_hours - other_stop_hours
  ) STORED,

  -- 생산능력(톤) = 가동시간 × 시간당생산능력 (별도 계산, join 필요)
  -- → API에서 machine_capacity.hourly_capacity와 조합하여 반환

  -- 메타
  note TEXT,
  saved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- 유니크 제약: 동일 호기+월 중복 방지
  UNIQUE(division, machine_code, ym)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_operating_time_ym ON machine_operating_time(ym);
CREATE INDEX IF NOT EXISTS idx_operating_time_division ON machine_operating_time(division, ym);
CREATE INDEX IF NOT EXISTS idx_machine_capacity_division ON machine_capacity(division, machine_code);

-- === 초기 데이터: PS사업부 호기별 시간당 생산능력 ===
INSERT OR IGNORE INTO machine_capacity (division, machine_code, hourly_capacity, basis_weight_ref, note, valid_from)
VALUES 
  ('PS', 'PM2', 5.2, 300, 'PM2 평균 시간당 생산능력 (SC 300gsm 기준)', '202401'),
  ('PS', 'PM3', 4.8, 350, 'PM3 평균 시간당 생산능력 (SC고평량 350gsm 기준)', '202401');

-- === 초기 데이터: HL사업부 호기별 시간당 생산능력 ===
INSERT OR IGNORE INTO machine_capacity (division, machine_code, hourly_capacity, note, valid_from)
VALUES 
  ('HL', 'TM5', 3.5, '초지 5호기 시간당 생산능력', '202401'),
  ('HL', 'TM6', 4.0, '초지 6호기 시간당 생산능력', '202401'),
  ('HL', 'CV1', 2.8, '가공 1호기 시간당 생산능력', '202401'),
  ('HL', 'CV2', 2.8, '가공 2호기 시간당 생산능력', '202401'),
  ('HL', 'CV3', 3.0, '가공 3호기 시간당 생산능력', '202401'),
  ('HL', 'CV4', 2.5, '가공 4호기 시간당 생산능력 (미용티슈)', '202401'),
  ('HL', 'CV5', 3.2, '가공 5호기 시간당 생산능력', '202401'),
  ('HL', 'CV6', 3.2, '가공 6호기 시간당 생산능력', '202401'),
  ('HL', 'WT1', 1.5, '물티슈 라인 시간당 생산능력', '202401'),
  ('HL', 'PD1', 1.2, '패드 라인 시간당 생산능력', '202401');
