-- ===== 제품 마스터 =====
INSERT OR IGNORE INTO products (product_code, product_name, unit_id, unit_of_measure, description) VALUES
  ('PRD-PM2-01', '백상지(A급)', 1, 'ton', 'PM2 백상지 A급'),
  ('PRD-PM2-02', '백상지(B급)', 1, 'ton', 'PM2 백상지 B급'),
  ('PRD-PM3-01', '아트지', 2, 'ton', 'PM3 아트지'),
  ('PRD-PM3-02', '스노우화이트', 2, 'ton', 'PM3 스노우화이트'),
  ('PRD-TS-01', '두루마리(3겹)', 4, 'ton', '화장지 두루마리 3겹'),
  ('PRD-TS-02', '미용티슈', 4, 'ton', '화장지 미용티슈');

-- ===== BOM (원단위: 제품 1ton 생산당 자재 소요량) =====
-- PM2 백상지(A급) BOM
INSERT OR IGNORE INTO bom (product_id, material_id, unit_consumption, notes) VALUES
  (1, 1, 0.267, 'LBKP 0.267ton/제품ton'),
  (1, 2, 0.150, 'NBKP 0.150ton/제품ton'),
  (1, 3, 0.208, 'DIP 0.208ton/제품ton'),
  (1, 4, 0.400, 'OCC 0.400ton/제품ton'),
  (1, 6, 3.750, '전분 3.75kg/제품ton'),
  (1, 7, 0.708, 'AKD 0.708kg/제품ton'),
  (1, 8, 1.000, 'PAM 1.0kg/제품ton'),
  (1, 9, 0.500, '탈묵제 0.5kg/제품ton'),
  (1, 13, 0.125, 'GCC 0.125ton/제품ton'),
  (1, 14, 2.333, '라텍스 2.333kg/제품ton');

-- PM2 백상지(B급) BOM (A급 대비 약간 상이)
INSERT OR IGNORE INTO bom (product_id, material_id, unit_consumption, notes) VALUES
  (2, 1, 0.220, 'LBKP'),
  (2, 2, 0.120, 'NBKP'),
  (2, 3, 0.250, 'DIP'),
  (2, 4, 0.480, 'OCC'),
  (2, 6, 3.500, '전분'),
  (2, 7, 0.650, 'AKD'),
  (2, 8, 0.900, 'PAM'),
  (2, 13, 0.100, 'GCC'),
  (2, 14, 2.000, '라텍스');

-- PM3 아트지 BOM
INSERT OR IGNORE INTO bom (product_id, material_id, unit_consumption, notes) VALUES
  (3, 1, 0.268, 'LBKP'),
  (3, 2, 0.211, 'NBKP'),
  (3, 4, 0.333, 'OCC'),
  (3, 5, 0.171, 'ONP'),
  (3, 6, 3.619, '전분'),
  (3, 7, 0.686, 'AKD'),
  (3, 8, 0.905, 'PAM'),
  (3, 12, 1.429, '증백제'),
  (3, 13, 0.114, 'GCC'),
  (3, 14, 2.095, '라텍스');

-- PM3 스노우화이트 BOM
INSERT OR IGNORE INTO bom (product_id, material_id, unit_consumption, notes) VALUES
  (4, 1, 0.300, 'LBKP'),
  (4, 2, 0.250, 'NBKP'),
  (4, 4, 0.280, 'OCC'),
  (4, 6, 4.000, '전분'),
  (4, 7, 0.750, 'AKD'),
  (4, 8, 1.000, 'PAM'),
  (4, 12, 1.800, '증백제'),
  (4, 13, 0.130, 'GCC'),
  (4, 14, 2.500, '라텍스');

-- 화장지 두루마리 BOM
INSERT OR IGNORE INTO bom (product_id, material_id, unit_consumption, notes) VALUES
  (5, 1, 0.494, 'LBKP'),
  (5, 2, 0.329, 'NBKP'),
  (5, 6, 2.941, '전분'),
  (5, 10, 0.647, '소포제'),
  (5, 12, 0.941, '증백제'),
  (5, 15, 2.118, '습강제');

-- 화장지 미용티슈 BOM
INSERT OR IGNORE INTO bom (product_id, material_id, unit_consumption, notes) VALUES
  (6, 1, 0.530, 'LBKP'),
  (6, 2, 0.350, 'NBKP'),
  (6, 6, 3.200, '전분'),
  (6, 10, 0.700, '소포제'),
  (6, 12, 1.100, '증백제'),
  (6, 15, 2.400, '습강제');
