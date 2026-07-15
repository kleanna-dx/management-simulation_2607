-- SAP RFC Batch Jobs table
CREATE TABLE IF NOT EXISTS batch_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT UNIQUE NOT NULL,
  input_month TEXT NOT NULL,          -- YYYYMM format
  execution_mode TEXT NOT NULL DEFAULT 'REPLACE',  -- REPLACE or INSERT
  status TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING, RUNNING, SUCCESS, FAILED
  source_count INTEGER DEFAULT 0,     -- T_DATA 처리건수
  insert_count INTEGER DEFAULT 0,     -- INSERT 적재건수
  error_count INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER DEFAULT 0,
  executed_by TEXT DEFAULT 'admin',
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now', '+9 hours')),
  log_data TEXT                        -- JSON log details
);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_input_month ON batch_jobs(input_month);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created ON batch_jobs(created_at DESC);

-- Monthly data summary for chart
CREATE TABLE IF NOT EXISTS batch_monthly_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year_month TEXT UNIQUE NOT NULL,    -- YYYYMM format
  total_records INTEGER DEFAULT 0,
  last_sync_at TEXT,
  updated_at TEXT DEFAULT (datetime('now', '+9 hours'))
);
