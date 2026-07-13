-- ============================================================
-- 0009: 가동시간 모듈 단위 변경 (시간 → 일 기준)
-- 
-- 변경 사유: 현장 관리 편의상 "일(day)" 단위로 입력/관리
-- 계산식: 월 총일수 - (운휴 + 점검 + 고장 + 품종교체 + 기타) = 가동일수
-- 생산량: 가동일수 × 24 × 시간당생산량 = 최대생산능력(톤)
-- ============================================================

-- 기존 테이블 삭제 후 재생성 (개발 단계)
DROP TABLE IF EXISTS machine_operating_time;

-- 월별 가동시간 입력 테이블 (일 단위)
CREATE TABLE IF NOT EXISTS machine_operating_time (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division TEXT NOT NULL DEFAULT 'PS',
  machine_code TEXT NOT NULL,
  ym TEXT NOT NULL,  -- YYYYMM

  -- === 월 총일수 (해당월 달력일수, ex: 30, 31, 28) ===
  total_days REAL NOT NULL DEFAULT 0,

  -- === 비가동 일수 (제외 항목) ===
  -- 운휴 (계획 정지): 수요 감소, 재고 과다 등으로 의도적 정지
  shutdown_days REAL NOT NULL DEFAULT 0,
  -- 정기점검/보수 (PM: Preventive Maintenance)
  maintenance_days REAL NOT NULL DEFAULT 0,
  -- 고장정지 (BM: Breakdown Maintenance)
  breakdown_days REAL NOT NULL DEFAULT 0,
  -- 품종교체 (Grade Change): 지종 전환 시 손실시간
  grade_change_days REAL NOT NULL DEFAULT 0,
  -- 기타 정지 (청소, 시운전 등)
  other_stop_days REAL NOT NULL DEFAULT 0,

  -- === 계산 결과 (자동 계산 — GENERATED STORED) ===
  -- 가동일수 = total - shutdown - maintenance - breakdown - grade_change - other
  operating_days REAL GENERATED ALWAYS AS (
    total_days - shutdown_days - maintenance_days - breakdown_days - grade_change_days - other_stop_days
  ) STORED,

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
