-- ============================================================
-- 전력비 시스템 재구성: 시간당 kWh 기반 전력량 산출
-- ============================================================

-- 1. power_lines에 시간당 kWh 컬럼 추가 (마스터 데이터)
ALTER TABLE power_lines ADD COLUMN kwh_per_hour_running REAL DEFAULT 0;  -- 가동 시 시간당 kWh
ALTER TABLE power_lines ADD COLUMN kwh_per_hour_standby REAL DEFAULT 0;  -- 운휴 시 시간당 kWh (대기전력)

-- 2. power_bill 테이블에 부하별 요금단가 컬럼 추가
ALTER TABLE power_bill ADD COLUMN rate_peak REAL DEFAULT 0;          -- 첨두부하 단가 (원/kWh)
ALTER TABLE power_bill ADD COLUMN rate_mid REAL DEFAULT 0;           -- 중간부하 단가 (원/kWh)
ALTER TABLE power_bill ADD COLUMN rate_off REAL DEFAULT 0;           -- 경부하 단가 (원/kWh)
ALTER TABLE power_bill ADD COLUMN rate_avg REAL DEFAULT 0;           -- 평균단가 (원/kWh) — 단순화용

-- 3. 마스터 데이터 업데이트 — PM2/PM3/LAM의 시간당 kWh
-- PM2 제지2: 가동시 약 580kWh/톤 × 시간당생산량 기준 → 약 6,300 kWh/h
-- PM3 제지3: 568kWh/톤 × 시간당생산량 기준 → 약 20,800 kWh/h  
-- LAM 라미네이팅: 300kWh/톤 기준 → 약 2,850 kWh/h
UPDATE power_lines SET 
  kwh_per_hour_running = 6300, 
  kwh_per_hour_standby = 350
WHERE line_code = 'PM2' AND division = 'PS';

UPDATE power_lines SET 
  kwh_per_hour_running = 20800, 
  kwh_per_hour_standby = 800
WHERE line_code = 'PM3' AND division = 'PS';

UPDATE power_lines SET 
  kwh_per_hour_running = 2850, 
  kwh_per_hour_standby = 150
WHERE line_code = 'LAM' AND division = 'PS';

-- 4. 기존 고지서에 평균단가 추가 (2026-01 샘플)
UPDATE power_bill SET 
  rate_peak = 210.5,
  rate_mid = 165.3,
  rate_off = 95.8,
  rate_avg = 164.9
WHERE year_month = '2026-01' AND factory_code = 'cheongju';
