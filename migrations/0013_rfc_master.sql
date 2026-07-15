-- RFC Master: 동적으로 RFC 함수 등록/관리
CREATE TABLE IF NOT EXISTS rfc_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rfc_code TEXT UNIQUE NOT NULL,          -- 고유 코드 (예: BL, INV, COST)
  rfc_function TEXT NOT NULL,             -- SAP RFC 함수명 (예: Z_BI_WEB_EX_BL)
  description TEXT,                       -- 설명 (예: 수익성 분석 데이터)
  target_table TEXT NOT NULL,             -- 적재 대상 테이블 (예: raw_records)
  param_name TEXT DEFAULT 'I_CMONTH',     -- 매개변수명
  param_format TEXT DEFAULT 'YYYYMM',     -- 매개변수 형식
  sort_order INTEGER DEFAULT 0,           -- 표시 순서
  is_active INTEGER DEFAULT 1,            -- 활성 여부
  created_at TEXT DEFAULT (datetime('now', '+9 hours')),
  updated_at TEXT DEFAULT (datetime('now', '+9 hours'))
);

-- batch_jobs에 rfc_code 컬럼 추가
ALTER TABLE batch_jobs ADD COLUMN rfc_code TEXT DEFAULT 'ALL';
