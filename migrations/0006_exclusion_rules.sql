-- 투입제외 규칙 테이블: 호기별 자재그룹이 투입되지 않는 제품지종 매핑
CREATE TABLE IF NOT EXISTS exclusion_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_code TEXT NOT NULL,          -- PM2, PM3
  material_group_keyword TEXT NOT NULL, -- 자재그룹 키워드 (예: '화이트', '신문지')
  excluded_product_type TEXT NOT NULL,  -- 제외 지종 (예: 'KB', 'CB', 'IV')
  description TEXT,                     -- 설명
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 규칙 삽입
INSERT INTO exclusion_rules (machine_code, material_group_keyword, excluded_product_type, description)
VALUES 
  ('PM2', '화이트', 'KB', 'PM2 화이트레저는 KB 지종에 투입X'),
  ('PM3', '신문지', 'CB', 'PM3 신문지는 CCKB(CB) 지종에 투입X'),
  ('PM3', '신문지', 'IV', 'PM3 신문지는 IV 지종에 투입X'),
  ('PM3', '마닐라', 'CB', 'PM3 마닐라는 CCKB(CB) 지종에 투입X'),
  ('PM3', '마닐라', 'IV', 'PM3 마닐라는 IV 지종에 투입X');
