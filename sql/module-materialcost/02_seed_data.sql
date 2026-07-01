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
