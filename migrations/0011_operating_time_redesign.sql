-- ============================================================
-- 0011: 가동시간 테이블 필드 전면 재설계
-- 
-- 구조: 계획운휴 + 가동일수(정상/폐품/비계획/초출/절지) + 비가동일수(정비/세척/사고)
-- 총 조업일수 = 계획운휴 + 가동소계 + 비가동소계
-- ============================================================

DROP TABLE IF EXISTS machine_operating_time;

CREATE TABLE IF NOT EXISTS machine_operating_time (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division TEXT NOT NULL DEFAULT 'PS',
  machine_code TEXT NOT NULL,
  ym TEXT NOT NULL,  -- YYYYMM

  -- === 월 총일수 (달력일수) ===
  total_days REAL NOT NULL DEFAULT 0,

  -- === 계획운휴 ===
  planned_shutdown_days REAL NOT NULL DEFAULT 0,

  -- === 가동일수 항목 ===
  -- 정상 가동 (제품 생산)
  operation_normal_days REAL NOT NULL DEFAULT 0,
  -- 폐품 (폐품 발생 손실 환산일수)
  operation_waste_days REAL NOT NULL DEFAULT 0,
  -- 비계획생산 (긴급 추가 생산 등)
  operation_unplanned_days REAL NOT NULL DEFAULT 0,
  -- 초출 (기동 손실: 예 30분×5회/월)
  operation_startup_days REAL NOT NULL DEFAULT 0,
  -- 절지 (지종 전환 손실: 예 60분×4회/월)
  operation_cutting_days REAL NOT NULL DEFAULT 0,

  -- === 가동일수 소계 (자동계산) ===
  operation_subtotal REAL GENERATED ALWAYS AS (
    operation_normal_days + operation_waste_days + operation_unplanned_days + operation_startup_days + operation_cutting_days
  ) STORED,

  -- === 비가동일수 항목 ===
  -- 정비 (정기보수: 예 16h/회)
  downtime_maintenance_days REAL NOT NULL DEFAULT 0,
  -- 세척 (예 4h/회)
  downtime_cleaning_days REAL NOT NULL DEFAULT 0,
  -- 사고 등 (돌발 정지)
  downtime_accident_days REAL NOT NULL DEFAULT 0,

  -- === 비가동일수 소계 (자동계산) ===
  downtime_subtotal REAL GENERATED ALWAYS AS (
    downtime_maintenance_days + downtime_cleaning_days + downtime_accident_days
  ) STORED,

  -- === 총 조업일수 (자동계산) = 계획운휴 + 가동소계 + 비가동소계 ===
  total_operating_days REAL GENERATED ALWAYS AS (
    planned_shutdown_days + (operation_normal_days + operation_waste_days + operation_unplanned_days + operation_startup_days + operation_cutting_days) + (downtime_maintenance_days + downtime_cleaning_days + downtime_accident_days)
  ) STORED,

  -- 메타
  note TEXT,
  saved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(division, machine_code, ym)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_operating_time_ym ON machine_operating_time(ym);
CREATE INDEX IF NOT EXISTS idx_operating_time_division ON machine_operating_time(division, ym);
