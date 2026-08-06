-- ============================================================
-- 전력비 이동계획 시스템 (Power Cost Rolling Plan System)
-- ============================================================

-- 1. 공장 마스터
CREATE TABLE IF NOT EXISTS power_factories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factory_code TEXT NOT NULL UNIQUE,           -- 'cheongju', 'eumseong'
  factory_name TEXT NOT NULL,                  -- '청주공장', '음성공장'
  contract_kw REAL DEFAULT 0,                  -- 계약전력 (kW): 110000, 4500
  tariff_type TEXT DEFAULT '',                 -- 요금제: '산업용고압B-III', '산업용고압A-I'
  division TEXT NOT NULL DEFAULT 'PS',         -- 사업부
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 호기(라인) 마스터
CREATE TABLE IF NOT EXISTS power_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factory_code TEXT NOT NULL,                  -- FK → power_factories.factory_code
  line_code TEXT NOT NULL,                     -- 'PM2', 'PM3', 'TM3', 'TM4', 'TM5', 'GA2'~'GA6', 'SD5','SD6','LAM'
  line_name TEXT NOT NULL,                     -- '제지2', '제지3', '화장지3', ...
  category TEXT NOT NULL DEFAULT '',           -- '제지', '화장지', '가공', '생리대', '라미네이팅'
  unit TEXT NOT NULL DEFAULT 'kg',             -- 생산단위: 'kg' or 'EA'
  standard_kwh_per_ton REAL DEFAULT 0,         -- 표준 전력원단위 (kWh/톤): PM3=568, TM3=2371
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  division TEXT NOT NULL DEFAULT 'PS',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(factory_code, line_code)
);

-- 3. 호기별 배분율 (월별)
CREATE TABLE IF NOT EXISTS power_allocation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_code TEXT NOT NULL,                     -- FK → power_lines.line_code
  year_month TEXT NOT NULL,                    -- '2026-01'
  cost_ratio REAL DEFAULT 0,                   -- 전력사용비율(요금배분키) %: 0~100
  ess_ratio REAL DEFAULT 0,                    -- ESS 배분율 %
  division TEXT NOT NULL DEFAULT 'PS',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(division, line_code, year_month)
);

-- 4. 한전 고지서 (공장별 월별 전사 합계)
CREATE TABLE IF NOT EXISTS power_bill (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factory_code TEXT NOT NULL,
  year_month TEXT NOT NULL,                    -- '2026-01'
  -- 전력사용량 (kWh)
  total_kwh_main REAL DEFAULT 0,              -- 모고객 총 사용량
  total_kwh_ess REAL DEFAULT 0,               -- ESS 총 발전량
  -- 전기요금 (원)
  fee_main REAL DEFAULT 0,                    -- ① 모고객 전기요금 (한전 고지)
  fee_ess REAL DEFAULT 0,                     -- ② ESS 요금
  fee_spc REAL DEFAULT 0,                     -- ③ SPC 지급금
  fee_dr_settlement REAL DEFAULT 0,           -- ④ DR 정산금 (차감)
  fee_boiler_deduct REAL DEFAULT 0,           -- ⑤ 복합보일러 차감비 (차감)
  fee_samsung_comp REAL DEFAULT 0,            -- ⑥ 삼성보상금 (차감)
  -- 기본요금 정보
  base_fee REAL DEFAULT 0,
  env_fee REAL DEFAULT 0,
  fuel_adj REAL DEFAULT 0,
  vat REAL DEFAULT 0,
  division TEXT NOT NULL DEFAULT 'PS',
  source_note TEXT DEFAULT '',                 -- 출처/비고
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(factory_code, year_month)
);

-- 5. 생산계획 (호기별 월별)
CREATE TABLE IF NOT EXISTS power_production_plan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_code TEXT NOT NULL,
  year_month TEXT NOT NULL,                    -- '2026-01'
  planned_qty REAL DEFAULT 0,                  -- 계획 생산량 (kg or EA)
  planned_hours REAL DEFAULT 0,               -- 계획 가동시간 (Hr)
  planned_downtime REAL DEFAULT 0,            -- 계획 운휴시간 (Hr)
  division TEXT NOT NULL DEFAULT 'PS',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(division, line_code, year_month)
);

-- 6. 롤링계획 헤더 (이력관리)
CREATE TABLE IF NOT EXISTS power_rolling_plan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_name TEXT NOT NULL DEFAULT '',          -- '2026년 1월 이동계획 Rev.3'
  base_month TEXT NOT NULL,                    -- 기준월 '2026-01'
  revision_no INTEGER DEFAULT 1,              -- 갱신 회차
  factory_code TEXT NOT NULL DEFAULT 'cheongju',
  is_active INTEGER DEFAULT 1,                -- 현재 활성 버전
  division TEXT NOT NULL DEFAULT 'PS',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT DEFAULT ''
);

-- 7. 롤링계획 상세 (호기별 월별 계산결과)
CREATE TABLE IF NOT EXISTS power_rolling_detail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,                   -- FK → power_rolling_plan.id
  line_code TEXT NOT NULL,
  year_month TEXT NOT NULL,
  -- 전력사용량 (kWh)
  kwh_main REAL DEFAULT 0,                    -- 호기별 모고객 kWh
  kwh_ess REAL DEFAULT 0,                     -- 호기별 ESS kWh
  kwh_total REAL DEFAULT 0,                   -- 합계
  -- 전기요금 (원)
  cost_main REAL DEFAULT 0,                   -- 호기별 모고객 요금
  cost_ess REAL DEFAULT 0,                    -- 호기별 ESS 요금
  cost_spc REAL DEFAULT 0,                    -- SPC 지급금 배분
  cost_dr REAL DEFAULT 0,                     -- DR 정산금 배분
  cost_boiler REAL DEFAULT 0,                 -- 복합보일러 차감 배분
  cost_samsung REAL DEFAULT 0,                -- 삼성보상금 배분
  -- 합계
  cost_kepco REAL DEFAULT 0,                  -- 한전기준 = ①+②
  cost_kepco_spc REAL DEFAULT 0,              -- 한전+SPC = ①+②+③
  cost_accounting REAL DEFAULT 0,             -- 회계비용 = ①+②+③−④−⑤−⑥
  -- 단가 (원/kWh)
  rate_kepco REAL DEFAULT 0,                  -- 한전기준 단가
  rate_spc REAL DEFAULT 0,                    -- SPC포함 단가
  rate_accounting REAL DEFAULT 0,             -- 회계비용 단가
  -- 파생 지표
  production_qty REAL DEFAULT 0,              -- 생산량
  power_unit_kwh_per_ton REAL DEFAULT 0,      -- 전력원단위 (kWh/톤)
  power_cost_per_ton REAL DEFAULT 0,          -- 전력비 원단위 (원/톤) ← 시뮬레이터 연동 핵심
  operating_hours REAL DEFAULT 0,             -- 가동시간
  productivity_per_day REAL DEFAULT 0,        -- 생산성(생산량/일)
  UNIQUE(plan_id, line_code, year_month)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_power_alloc_ym ON power_allocation(year_month);
CREATE INDEX IF NOT EXISTS idx_power_bill_ym ON power_bill(year_month);
CREATE INDEX IF NOT EXISTS idx_power_plan_ym ON power_production_plan(year_month);
CREATE INDEX IF NOT EXISTS idx_power_rolling_active ON power_rolling_plan(is_active, division);
CREATE INDEX IF NOT EXISTS idx_power_detail_plan ON power_rolling_detail(plan_id);
CREATE INDEX IF NOT EXISTS idx_power_detail_line_ym ON power_rolling_detail(line_code, year_month);

-- ============================================================
-- 초기 마스터 데이터 삽입
-- ============================================================

-- 공장
INSERT OR IGNORE INTO power_factories (factory_code, factory_name, contract_kw, tariff_type, division)
VALUES
  ('cheongju', '청주공장', 110000, '산업용고압B-III', 'PS'),
  ('eumseong', '음성공장', 4500, '산업용고압A-I', 'PS');

-- 호기(라인) 마스터
INSERT OR IGNORE INTO power_lines (factory_code, line_code, line_name, category, unit, standard_kwh_per_ton, display_order, division)
VALUES
  ('cheongju', 'PM2', '제지2', '제지', 'kg', 580, 1, 'PS'),
  ('cheongju', 'PM3', '제지3', '제지', 'kg', 568, 2, 'PS'),
  ('cheongju', 'TM3', '화장지3', '화장지', 'kg', 2371, 3, 'PS'),
  ('cheongju', 'TM4', '화장지4', '화장지', 'kg', 2200, 4, 'PS'),
  ('cheongju', 'TM5', '화장지5', '화장지', 'kg', 2100, 5, 'PS'),
  ('cheongju', 'GA2', '가공2', '가공', 'EA', 150, 6, 'PS'),
  ('cheongju', 'GA3', '가공3', '가공', 'EA', 160, 7, 'PS'),
  ('cheongju', 'GA4', '가공4', '가공', 'EA', 155, 8, 'PS'),
  ('cheongju', 'GA5', '가공5', '가공', 'EA', 170, 9, 'PS'),
  ('cheongju', 'GA6', '가공6', '가공', 'EA', 165, 10, 'PS'),
  ('cheongju', 'SD5', '생리대5', '생리대', 'EA', 120, 11, 'PS'),
  ('cheongju', 'SD6', '생리대6', '생리대', 'EA', 125, 12, 'PS'),
  ('cheongju', 'LAM', '라미네이팅', '라미네이팅', 'kg', 300, 13, 'PS');

-- 샘플 배분율 (2026-01 기준)
INSERT OR IGNORE INTO power_allocation (line_code, year_month, cost_ratio, ess_ratio, division)
VALUES
  ('PM2', '2026-01', 21.5, 22.0, 'PS'),
  ('PM3', '2026-01', 69.0, 68.0, 'PS'),
  ('TM3', '2026-01', 2.8, 3.0, 'PS'),
  ('TM4', '2026-01', 8.8, 9.0, 'PS'),
  ('TM5', '2026-01', 14.6, 15.0, 'PS'),
  ('GA2', '2026-01', 1.2, 1.0, 'PS'),
  ('GA3', '2026-01', 1.5, 1.2, 'PS'),
  ('GA4', '2026-01', 1.3, 1.1, 'PS'),
  ('GA5', '2026-01', 1.8, 1.5, 'PS'),
  ('GA6', '2026-01', 1.6, 1.3, 'PS'),
  ('SD5', '2026-01', 0.8, 0.7, 'PS'),
  ('SD6', '2026-01', 0.9, 0.8, 'PS'),
  ('LAM', '2026-01', 0.5, 0.4, 'PS');

-- 샘플 고지서 데이터 (2026-01)
INSERT OR IGNORE INTO power_bill (factory_code, year_month, total_kwh_main, total_kwh_ess, fee_main, fee_ess, fee_spc, fee_dr_settlement, fee_boiler_deduct, fee_samsung_comp, division)
VALUES
  ('cheongju', '2026-01', 21340000, 1850000, 3520000000, 285000000, 134000000, 28000000, 15000000, 5000000, 'PS');

-- 샘플 생산계획 (2026-01)
INSERT OR IGNORE INTO power_production_plan (line_code, year_month, planned_qty, planned_hours, planned_downtime, division)
VALUES
  ('PM2', '2026-01', 8500000, 696, 24, 'PS'),
  ('PM3', '2026-01', 25918232, 696, 24, 'PS'),
  ('TM3', '2026-01', 1200000, 672, 48, 'PS'),
  ('TM4', '2026-01', 2800000, 696, 24, 'PS'),
  ('TM5', '2026-01', 4500000, 696, 24, 'PS');
