-- 기준정보 매핑 INDEX 테이블들

-- 1) 제지 제품분류
CREATE TABLE IF NOT EXISTS master_paper_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_hierarchy_level3 TEXT NOT NULL,
  grade_code TEXT NOT NULL,
  grade_name TEXT NOT NULL,
  grade_detail TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2) 제지 원재료 분류
CREATE TABLE IF NOT EXISTS master_paper_raw_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category1 TEXT,
  material_class TEXT NOT NULL,
  material_subclass TEXT NOT NULL,
  material_code TEXT NOT NULL,
  material_name TEXT NOT NULL,
  material_group TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3) 제지 부재료 분류
CREATE TABLE IF NOT EXISTS master_paper_sub_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_code TEXT NOT NULL,
  material_name TEXT NOT NULL,
  material_group TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4) 화장지 제품분류
CREATE TABLE IF NOT EXISTS master_tissue_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5) 화장지 원재료 분류
CREATE TABLE IF NOT EXISTS master_tissue_raw_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  material_code TEXT NOT NULL,
  material_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_paper_products_grade ON master_paper_products(grade_code);
CREATE INDEX IF NOT EXISTS idx_paper_raw_code ON master_paper_raw_materials(material_code);
CREATE INDEX IF NOT EXISTS idx_paper_sub_code ON master_paper_sub_materials(material_code);
CREATE INDEX IF NOT EXISTS idx_tissue_products_cat ON master_tissue_products(category);
CREATE INDEX IF NOT EXISTS idx_tissue_raw_code ON master_tissue_raw_materials(material_code);
