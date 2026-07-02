-- =====================================================
-- module-materialcost: 초기 데이터 (Seed Data)
-- =====================================================

-- 원단위 계산 제외규칙 초기 데이터
-- PM2: 화이트레저 자재그룹 → KB 지종 생산량 제외
-- PM3: 신문지/마닐라 자재그룹 → CB(CCKB)/IV 지종 생산량 제외
INSERT INTO mc_exclusion_rules (MACHINE_CODE, MATERIAL_GROUP_KEYWORD, EXCLUDED_PRODUCT_TYPE, DESCRIPTION) VALUES
('PM2', '화이트레저', 'KB', 'PM2 화이트레저 원단위 계산 시 KB 지종 생산량 제외'),
('PM3', '신문지', 'CB', 'PM3 신문지 원단위 계산 시 CB(CCKB) 지종 생산량 제외'),
('PM3', '신문지', 'IV', 'PM3 신문지 원단위 계산 시 IV 지종 생산량 제외'),
('PM3', '마닐라', 'CB', 'PM3 마닐라 원단위 계산 시 CB(CCKB) 지종 생산량 제외'),
('PM3', '마닐라', 'IV', 'PM3 마닐라 원단위 계산 시 IV 지종 생산량 제외');

-- 제지 제품 마스터 초기 데이터
INSERT INTO mc_master_paper_products (PRODUCT_HIERARCHY_LEVEL3, GRADE_CODE, GRADE_NAME, GRADE_DETAIL) VALUES
('PPL3_01', 'SC', 'SC (백판지)', 'SC 고평량/저평량'),
('PPL3_01', 'IV', 'IV (아이보리)', NULL),
('PPL3_02', 'KB', 'KB (크라프트백)', NULL),
('PPL3_02', 'ACB', 'ACB (코팅판지)', NULL),
('PPL3_03', 'CB', 'CB (CCKB)', NULL);

-- 화장지 제품 마스터 초기 데이터
INSERT INTO mc_master_tissue_products (CATEGORY, PRODUCT_NAME) VALUES
('RT', 'RT-고지'),
('RT', 'RT-펄프'),
('FT', 'FT'),
('KT', 'KT'),
('PCMC', 'PCMC'),
('기타', '기타 펄프');

-- 제지 원자재 마스터 샘플 데이터
INSERT INTO mc_master_paper_raw_materials (CATEGORY1, MATERIAL_CLASS, MATERIAL_SUBCLASS, MATERIAL_CODE, MATERIAL_NAME, MATERIAL_GROUP) VALUES
('원자재', '고지', '국내고지', '1200001', '국내파지(SC)', '국내 파지'),
('원자재', '고지', '국내고지', '1200002', '국내파지(IV)', '국내 파지'),
('원자재', '고지', '수입고지', '1200021', '수입파지(OCC)', '수입 파지'),
('원자재', '펄프', 'NBKP', '1100001', 'NBKP', '펄프'),
('원자재', '펄프', 'LBKP', '1100002', 'LBKP', '펄프');

-- 제지 부자재 마스터 샘플 데이터
INSERT INTO mc_master_paper_sub_materials (MATERIAL_CODE, MATERIAL_NAME, MATERIAL_GROUP) VALUES
('2100001', '전분(양성)', '약품'),
('2100002', '사이즈프레스(SP)', '약품'),
('2100003', '염료', '약품'),
('2200001', '석탄', '연료');

-- 화장지 원자재 마스터 샘플 데이터
INSERT INTO mc_master_tissue_raw_materials (CATEGORY, MATERIAL_CODE, MATERIAL_NAME) VALUES
('펄프', '1100010', 'NBKP(화장지)'),
('펄프', '1100011', 'LBKP(화장지)'),
('고지', '1200030', '파지(화장지)'),
('약품', '2100010', '유연제');


-- =====================================================
-- Phase 확장 대응: 원가 항목 마스터 초기 데이터
-- =====================================================

-- Phase 1: 원부재료비 (MATERIAL)
INSERT INTO mc_cost_items (COST_TYPE, COST_CODE, COST_NAME, COST_BEHAVIOR, UNIT_OF_MEASURE, PHASE, ALLOC_BASIS, CALC_FORMULA, SORT_ORDER, IS_ACTIVE, DESCRIPTION) VALUES
('MATERIAL', 'MAT_RAW_DOMESTIC', '국내고지', 'VARIABLE', 'kg', 1, 'DIRECT', 'usage_qty × moving_avg_price', 110, 1, '국내 파지 원재료비'),
('MATERIAL', 'MAT_RAW_IMPORT', '수입고지', 'VARIABLE', 'kg', 1, 'DIRECT', 'usage_qty × moving_avg_price', 120, 1, '수입 파지 원재료비'),
('MATERIAL', 'MAT_PULP_NBKP', 'NBKP', 'VARIABLE', 'kg', 1, 'DIRECT', 'usage_qty × moving_avg_price', 130, 1, 'NBKP 펄프'),
('MATERIAL', 'MAT_PULP_LBKP', 'LBKP', 'VARIABLE', 'kg', 1, 'DIRECT', 'usage_qty × moving_avg_price', 140, 1, 'LBKP 펄프'),
('MATERIAL', 'MAT_SUB_STARCH', '전분', 'VARIABLE', 'kg', 1, 'DIRECT', 'usage_qty × moving_avg_price', 210, 1, '전분 부자재'),
('MATERIAL', 'MAT_SUB_CHEMICAL', '약품류', 'VARIABLE', 'kg', 1, 'DIRECT', 'usage_qty × moving_avg_price', 220, 1, '약품 부자재 합계'),
('MATERIAL', 'MAT_SUB_COAL', '석탄', 'SEMI_VARIABLE', 'kg', 1, 'DIRECT', 'usage_qty × moving_avg_price', 230, 1, '석탄 연료비');

-- Phase 2: 전력비 (ELECTRICITY) - 구조만 잡아둠, 실제 데이터는 Phase 2 착수 시 INSERT
INSERT INTO mc_cost_items (COST_TYPE, COST_CODE, COST_NAME, COST_BEHAVIOR, UNIT_OF_MEASURE, PHASE, ALLOC_BASIS, CALC_FORMULA, SORT_ORDER, IS_ACTIVE, DESCRIPTION) VALUES
('ELECTRICITY', 'ELEC_PM2', 'PM2 전력비', 'SEMI_VARIABLE', 'kWh', 2, 'RUNTIME_HOUR', 'runtime_hour × power_rate × machine_capacity', 310, 0, 'PM2 라인 전력비 (Phase 2에서 활성화)'),
('ELECTRICITY', 'ELEC_PM3', 'PM3 전력비', 'SEMI_VARIABLE', 'kWh', 2, 'RUNTIME_HOUR', 'runtime_hour × power_rate × machine_capacity', 320, 0, 'PM3 라인 전력비 (Phase 2에서 활성화)'),
('ELECTRICITY', 'ELEC_TM', 'TM 전력비', 'SEMI_VARIABLE', 'kWh', 2, 'RUNTIME_HOUR', 'runtime_hour × power_rate × machine_capacity', 330, 0, 'TM 라인 전력비 (Phase 2에서 활성화)');

-- Phase 2: 물류비 (LOGISTICS)
INSERT INTO mc_cost_items (COST_TYPE, COST_CODE, COST_NAME, COST_BEHAVIOR, UNIT_OF_MEASURE, PHASE, ALLOC_BASIS, CALC_FORMULA, SORT_ORDER, IS_ACTIVE, DESCRIPTION) VALUES
('LOGISTICS', 'LOG_DOMESTIC', '국내 운송비', 'VARIABLE', '톤', 2, 'SHIPMENT_TON', 'shipment_ton × transport_rate_per_ton', 410, 0, '국내 출하 운송비 (Phase 2에서 활성화)'),
('LOGISTICS', 'LOG_EXPORT', '수출 운송비', 'VARIABLE', '톤', 2, 'SHIPMENT_TON', 'shipment_ton × transport_rate_per_ton', 420, 0, '수출 물류비 (Phase 2에서 활성화)');

-- Phase 3: 고정비 (LABOR, DEPRECIATION, MAINTENANCE, CONSUMABLE)
INSERT INTO mc_cost_items (COST_TYPE, COST_CODE, COST_NAME, COST_BEHAVIOR, UNIT_OF_MEASURE, PHASE, ALLOC_BASIS, CALC_FORMULA, SORT_ORDER, IS_ACTIVE, DESCRIPTION) VALUES
('LABOR', 'LABOR_DIRECT', '직접노무비', 'FIXED', '인', 3, 'PRODUCTION_QTY', 'headcount × avg_salary', 510, 0, '직접 투입인원 인건비 (Phase 3에서 활성화)'),
('LABOR', 'LABOR_INDIRECT', '간접노무비', 'FIXED', '인', 3, 'PRODUCTION_QTY', 'headcount × avg_salary', 520, 0, '간접 인건비 (Phase 3에서 활성화)'),
('DEPRECIATION', 'DEP_MACHINE', '기계장치 감가상각', 'FIXED', '원', 3, 'PRODUCTION_QTY', 'monthly_depreciation_amount (정액법)', 610, 0, '기계장치 감가상각 (Phase 3에서 활성화)'),
('DEPRECIATION', 'DEP_BUILDING', '건물 감가상각', 'FIXED', '원', 3, 'PRODUCTION_QTY', 'monthly_depreciation_amount (정액법)', 620, 0, '건물 감가상각 (Phase 3에서 활성화)'),
('MAINTENANCE', 'MAINT_REGULAR', '정기 수선유지비', 'SEMI_VARIABLE', '원', 3, 'PRODUCTION_QTY', 'fixed_base + variable_per_ton × production_qty', 710, 0, '정기 수선유지비 (Phase 3에서 활성화)'),
('CONSUMABLE', 'CONS_GENERAL', '소모품비', 'SEMI_VARIABLE', '원', 3, 'PRODUCTION_QTY', 'fixed_base + variable_per_ton × production_qty', 810, 0, '일반 소모품 (Phase 3에서 활성화)');

-- Phase 4: 판관비 (SELLING)
INSERT INTO mc_cost_items (COST_TYPE, COST_CODE, COST_NAME, COST_BEHAVIOR, UNIT_OF_MEASURE, PHASE, ALLOC_BASIS, CALC_FORMULA, SORT_ORDER, IS_ACTIVE, DESCRIPTION) VALUES
('SELLING', 'SELL_SALES_COMMISSION', '판매수수료', 'VARIABLE', '원', 4, 'REVENUE', 'revenue × commission_rate', 910, 0, '판매수수료 (Phase 4에서 활성화)'),
('SELLING', 'SELL_ADMIN', '관리비', 'FIXED', '원', 4, 'REVENUE', 'fixed_monthly_amount', 920, 0, '일반관리비 (Phase 4에서 활성화)');
