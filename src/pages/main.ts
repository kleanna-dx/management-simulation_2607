export function mainPage(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>원부자재 사전원가 분석</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
          colors: {
            primary: { 50:'#eef2ff', 100:'#e0e7ff', 200:'#c7d2fe', 300:'#a5b4fc', 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca', 800:'#3730a3', 900:'#312e81' },
            slate: { 750: '#293548' }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; }
    .pill-tab { padding: 7px 16px; border-radius: 9999px; font-size: 13px; font-weight: 500; transition: all 0.15s; cursor: pointer; border: 1px solid transparent; }
    .pill-tab-active { background: #4f46e5; color: white; border-color: #4f46e5; box-shadow: 0 2px 8px rgba(79,70,229,0.3); }
    .pill-tab-inactive { background: white; color: #4b5563; border-color: #e5e7eb; }
    .pill-tab-inactive:hover { background: #f9fafb; border-color: #d1d5db; }
    .card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02); }
    .positive { color: #dc2626; }
    .negative { color: #2563eb; }
    .btn-primary { background: #4f46e5; color: white; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; transition: all 0.15s; border: none; cursor: pointer; }
    .btn-primary:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
    .btn-delete { background: #fef2f2; color: #dc2626; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; border: none; cursor: pointer; transition: all 0.15s; }
    .btn-delete:hover { background: #fee2e2; }
    .data-table { width: 100%; font-size: 13px; border-collapse: collapse; }
    .data-table thead { background: #f8fafc; }
    .data-table th { padding: 12px 16px; text-align: left; font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    .data-table td { padding: 12px 16px; color: #334155; border-bottom: 1px solid #f1f5f9; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .fade-in { animation: fadeIn 0.25s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .unit-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }
    .unit-chip-pm2 { background: #dbeafe; color: #1d4ed8; }
    .unit-chip-pm3 { background: #e9d5ff; color: #7c3aed; }
    .unit-chip-chem { background: #fef3c7; color: #b45309; }
    .unit-chip-tissue { background: #d1fae5; color: #047857; }
    .summary-card { padding: 20px; border-radius: 14px; border: 1px solid #f1f5f9; transition: all 0.2s; background: white; }
    .summary-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }
    .chart-container { height: 200px; position: relative; }
    .gradient-header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .stat-value { font-variant-numeric: tabular-nums; }
    select, input[type="number"], input[type="text"] { font-size: 13px; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  </style>
</head>
<body class="bg-slate-50 min-h-screen">
  <!-- Header -->
  <header class="gradient-header text-white">
    <div class="max-w-[1400px] mx-auto px-6 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <i class="fas fa-chart-pie text-lg"></i>
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight">원부자재 사전원가 분석</h1>
            <p class="text-xs text-white/70 mt-0.5">Material Cost Pre-Analysis System</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-white/80"><i class="fas fa-user-circle mr-1.5"></i>관리자</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Navigation -->
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-40">
    <div class="max-w-[1400px] mx-auto px-6 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button onclick="switchTab('dashboard')" id="tab-dashboard" class="pill-tab pill-tab-active">
            <i class="fas fa-chart-line mr-1.5"></i>통합 분석
          </button>
          <button onclick="switchTab('detail')" id="tab-detail" class="pill-tab pill-tab-inactive">
            <i class="fas fa-table mr-1.5"></i>상세 분석표
          </button>
          <button onclick="switchTab('upload')" id="tab-upload" class="pill-tab pill-tab-inactive">
            <i class="fas fa-file-excel mr-1.5"></i>데이터 업로드
          </button>
          <button onclick="switchTab('input')" id="tab-input" class="pill-tab pill-tab-inactive">
            <i class="fas fa-keyboard mr-1.5"></i>수동 입력
          </button>
          <button onclick="switchTab('master')" id="tab-master" class="pill-tab pill-tab-inactive">
            <i class="fas fa-cog mr-1.5"></i>기준정보
          </button>
        </div>
        <!-- Filters -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
            <select id="analysisYear" class="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 pr-6 cursor-pointer" onchange="loadAnalysis()">
              <option value="2026">2026년</option>
              <option value="2025">2025년</option>
            </select>
            <select id="analysisMonth" class="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 pr-6 cursor-pointer" onchange="loadAnalysis()">
              <option value="6">6월</option>
              <option value="5">5월</option>
              <option value="4">4월</option>
              <option value="3">3월</option>
              <option value="2">2월</option>
              <option value="1">1월</option>
            </select>
          </div>
          <div class="flex gap-1">
            <button onclick="setUnitFilter('')" id="unit-btn-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="setUnitFilter('1')" id="unit-btn-1" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">PM2</button>
            <button onclick="setUnitFilter('2')" id="unit-btn-2" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">PM3</button>
            <button onclick="setUnitFilter('3')" id="unit-btn-3" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">제지약품</button>
            <button onclick="setUnitFilter('4')" id="unit-btn-4" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">화장지</button>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Content -->
  <main class="max-w-[1400px] mx-auto px-6 py-6">
    <!-- Dashboard Tab -->
    <div id="content-dashboard" class="fade-in space-y-5">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="summary-card">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"><i class="fas fa-calendar-minus text-slate-400 text-xs"></i></div>
            <span class="text-xs font-medium text-slate-400">전월 총원가</span>
          </div>
          <p id="s-prev" class="text-lg font-bold text-gray-900 stat-value">-</p>
        </div>
        <div class="summary-card">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"><i class="fas fa-calendar text-slate-400 text-xs"></i></div>
            <span class="text-xs font-medium text-slate-400">당월 총원가</span>
          </div>
          <p id="s-cur" class="text-lg font-bold text-gray-900 stat-value">-</p>
        </div>
        <div class="summary-card" style="border-color: #c7d2fe; background: linear-gradient(135deg, #eef2ff, #e0e7ff)">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-primary-200/50 flex items-center justify-center"><i class="fas fa-boxes text-primary-500 text-xs"></i></div>
            <span class="text-xs font-medium text-primary-500">수량차이 효과</span>
          </div>
          <p id="s-qty" class="text-lg font-bold stat-value">-</p>
          <p class="text-[10px] text-slate-400 mt-1">사용량 변동 영향</p>
        </div>
        <div class="summary-card" style="border-color: #fde68a; background: linear-gradient(135deg, #fffbeb, #fef3c7)">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-amber-200/50 flex items-center justify-center"><i class="fas fa-won-sign text-amber-500 text-xs"></i></div>
            <span class="text-xs font-medium text-amber-600">단가차이 효과</span>
          </div>
          <p id="s-price" class="text-lg font-bold stat-value">-</p>
          <p class="text-[10px] text-slate-400 mt-1">단가 변동 영향</p>
        </div>
        <div class="summary-card" style="border-color: #fecaca; background: linear-gradient(135deg, #fef2f2, #fee2e2)">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-red-200/50 flex items-center justify-center"><i class="fas fa-arrow-trend-up text-red-500 text-xs"></i></div>
            <span class="text-xs font-medium text-red-500">총 원가차이</span>
          </div>
          <p id="s-total" class="text-lg font-bold stat-value">-</p>
          <p class="text-[10px] text-slate-400 mt-1">전월 대비 증감</p>
        </div>
      </div>

      <!-- Charts (FIXED HEIGHT) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">호기별 원가 비교</h3>
            <span class="text-[10px] text-gray-400">전월 vs 당월</span>
          </div>
          <div class="chart-container">
            <canvas id="unitChart"></canvas>
          </div>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">손익효과 분해</h3>
            <span class="text-[10px] text-gray-400">수량효과 vs 단가효과</span>
          </div>
          <div class="chart-container">
            <canvas id="effectChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Unit Summary Table -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700">호기별 원가 요약</h3>
          <span class="text-xs text-gray-400" id="period-label"></span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>호기</th>
                <th class="text-right">생산량</th>
                <th class="text-right">전월 원가</th>
                <th class="text-right">당월 원가</th>
                <th class="text-right">수량효과</th>
                <th class="text-right">단가효과</th>
                <th class="text-right">총 차이</th>
                <th class="text-right">증감률</th>
              </tr>
            </thead>
            <tbody id="unit-summary-body"></tbody>
          </table>
        </div>
      </div>

      <!-- Top Impact -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-fire text-orange-400 mr-1.5"></i>원가 영향 TOP 10</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th class="w-8">#</th>
                <th>호기</th>
                <th>구분</th>
                <th>자재명</th>
                <th class="text-right">전월원가</th>
                <th class="text-right">당월원가</th>
                <th class="text-right">수량효과</th>
                <th class="text-right">단가효과</th>
                <th class="text-right">총차이</th>
                <th class="text-right">증감률</th>
              </tr>
            </thead>
            <tbody id="top-impact-body"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detail Tab -->
    <div id="content-detail" class="hidden fade-in">
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700">전월 대비 상세 분석표</h3>
          <button onclick="exportCSV()" class="btn-primary">
            <i class="fas fa-download mr-1.5"></i>CSV 내보내기
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>호기</th>
                <th>구분</th>
                <th>자재코드</th>
                <th>자재명</th>
                <th>단위</th>
                <th class="text-right">전월수량</th>
                <th class="text-right">당월수량</th>
                <th class="text-right">수량차이</th>
                <th class="text-right">전월단가</th>
                <th class="text-right">당월단가</th>
                <th class="text-right">단가차이</th>
                <th class="text-right">전월원가</th>
                <th class="text-right">당월원가</th>
                <th class="text-right">수량효과</th>
                <th class="text-right">단가효과</th>
                <th class="text-right">총차이</th>
              </tr>
            </thead>
            <tbody id="detail-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Upload Tab -->
    <div id="content-upload" class="hidden fade-in">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-700">엑셀 데이터 업로드</h3>
            <p class="text-xs text-gray-400 mt-1">엑셀 파일로 원부자재 실적 데이터를 일괄 등록합니다.</p>
          </div>
          <button onclick="downloadTemplate()" class="btn-primary">
            <i class="fas fa-file-download mr-1.5"></i>양식 다운로드
          </button>
        </div>

        <div id="upload-area" class="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer group"
             ondragover="event.preventDefault(); this.classList.add('border-primary-400','bg-primary-50/50')"
             ondragleave="this.classList.remove('border-primary-400','bg-primary-50/50')"
             ondrop="handleDrop(event)"
             onclick="document.getElementById('file-input').click()">
          <input type="file" id="file-input" accept=".xlsx,.xls,.csv" class="hidden" onchange="handleFileSelect(event)">
          <div class="w-16 h-16 bg-gray-100 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
            <i class="fas fa-cloud-upload-alt text-2xl text-gray-300 group-hover:text-primary-400 transition-colors"></i>
          </div>
          <p class="text-sm font-medium text-gray-600">파일을 드래그하거나 클릭하여 업로드</p>
          <p class="text-xs text-gray-400 mt-2">.xlsx, .xls, .csv 파일 지원</p>
        </div>

        <div id="upload-preview" class="hidden mt-6">
          <div class="flex items-center justify-between mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-file-excel text-green-600"></i>
              </div>
              <div>
                <p id="upload-filename" class="text-sm font-medium text-gray-700"></p>
                <p id="upload-info" class="text-xs text-gray-400"></p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="resetUpload()" class="px-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50">취소</button>
              <button onclick="submitUpload()" class="btn-primary">
                <i class="fas fa-check mr-1"></i>업로드 (<span id="upload-count">0</span>건)
              </button>
            </div>
          </div>
          <div class="overflow-x-auto border border-gray-200 rounded-xl max-h-80">
            <table class="data-table">
              <thead id="preview-head"></thead>
              <tbody id="preview-body"></tbody>
            </table>
          </div>
        </div>

        <div class="mt-6 p-5 bg-slate-50 rounded-xl">
          <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">업로드 양식</h4>
          <div class="overflow-x-auto">
            <table class="text-xs w-full">
              <thead><tr class="border-b border-gray-200">
                <th class="py-2 text-left font-semibold text-gray-500">컬럼명</th>
                <th class="py-2 text-left font-semibold text-gray-500">설명</th>
                <th class="py-2 text-left font-semibold text-gray-500">예시</th>
                <th class="py-2 text-left font-semibold text-gray-500">필수</th>
              </tr></thead>
              <tbody>
                <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">호기코드</td><td class="text-gray-500">호기 코드</td><td class="text-gray-400">PM2, PM3, CHEM, TISSUE</td><td><span class="text-red-500">*</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">자재코드</td><td class="text-gray-500">자재 코드</td><td class="text-gray-400">RM-001, SM-001</td><td><span class="text-red-500">*</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">년도</td><td class="text-gray-500">실적 년도</td><td class="text-gray-400">2026</td><td><span class="text-red-500">*</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">월</td><td class="text-gray-500">실적 월</td><td class="text-gray-400">6</td><td><span class="text-red-500">*</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">사용량</td><td class="text-gray-500">사용 수량</td><td class="text-gray-400">3200</td><td><span class="text-red-500">*</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">단가</td><td class="text-gray-500">원 단위</td><td class="text-gray-400">880000</td><td><span class="text-red-500">*</span></td></tr>
                <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">생산량</td><td class="text-gray-500">생산 수량</td><td class="text-gray-400">12500</td><td class="text-gray-400">선택</td></tr>
                <tr><td class="py-2 font-mono text-primary-600">비고</td><td class="text-gray-500">메모</td><td class="text-gray-400"></td><td class="text-gray-400">선택</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Tab -->
    <div id="content-input" class="hidden fade-in">
      <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">실적 데이터 수동 입력</h3>
        <form id="record-form" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">호기</label>
            <select id="input-unit" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400" required></select>
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">원부자재</label>
            <select id="input-material" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400" required></select>
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">년도</label>
            <input type="number" id="input-year" value="2026" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" required>
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">월</label>
            <input type="number" id="input-month" min="1" max="12" value="6" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" required>
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">사용량</label>
            <input type="number" id="input-qty" step="0.01" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" placeholder="0" required>
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">단가 (원)</label>
            <input type="number" id="input-price" step="0.01" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" placeholder="0" required>
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">생산량</label>
            <input type="number" id="input-production" step="0.01" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" placeholder="0">
          </div>
          <div class="flex items-end">
            <button type="submit" class="btn-primary w-full py-2.5"><i class="fas fa-plus mr-1.5"></i>등록</button>
          </div>
        </form>
      </div>
      <div class="card overflow-hidden mt-5">
        <div class="px-5 py-4 border-b border-slate-100">
          <h3 class="text-sm font-semibold text-gray-700">등록된 실적</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr><th>호기</th><th>자재</th><th>기간</th><th class="text-right">사용량</th><th class="text-right">단가</th><th class="text-right">총원가</th><th class="text-right">생산량</th><th class="text-center">관리</th></tr>
            </thead>
            <tbody id="recent-records"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Master Tab -->
    <div id="content-master" class="hidden fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Units Master -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">호기 관리</h3>
            <button onclick="document.getElementById('unit-form').classList.toggle('hidden')" class="btn-primary text-xs !py-1.5 !px-3">
              <i class="fas fa-plus mr-1"></i>신규
            </button>
          </div>
          <form id="unit-form" class="hidden mb-4 p-4 bg-slate-50 rounded-xl space-y-2">
            <div class="flex gap-2">
              <input type="text" id="new-unit-code" placeholder="코드 (예: PM5)" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
              <input type="text" id="new-unit-name" placeholder="호기명" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
              <button type="submit" class="btn-primary !py-2">등록</button>
            </div>
          </form>
          <div id="units-list" class="space-y-2"></div>
        </div>
        <!-- Materials Master -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">원부자재 관리</h3>
            <button onclick="document.getElementById('material-form').classList.toggle('hidden')" class="btn-primary text-xs !py-1.5 !px-3">
              <i class="fas fa-plus mr-1"></i>신규
            </button>
          </div>
          <form id="material-form" class="hidden mb-4 p-4 bg-slate-50 rounded-xl space-y-2">
            <div class="flex gap-2">
              <input type="text" id="new-mat-code" placeholder="코드" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
              <input type="text" id="new-mat-name" placeholder="자재명" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
            </div>
            <div class="flex gap-2">
              <select id="new-mat-category" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="RAW">원자재</option>
                <option value="SUB">부자재</option>
              </select>
              <input type="text" id="new-mat-uom" placeholder="단위" value="kg" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
              <button type="submit" class="btn-primary !py-2">등록</button>
            </div>
          </form>
          <div id="materials-list" class="space-y-2 max-h-[450px] overflow-y-auto"></div>
        </div>
      </div>

      <!-- Production Qty Master -->
      <div class="card p-6 mt-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-700">월별 생산량 관리</h3>
            <p class="text-xs text-gray-400 mt-0.5">호기별 월간 생산량을 등록합니다. 원단위 분석에 활용됩니다.</p>
          </div>
        </div>
        <form id="production-form" class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5 p-4 bg-slate-50 rounded-xl">
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase mb-1">호기</label>
            <select id="prod-unit" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"></select>
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase mb-1">년도</label>
            <input type="number" id="prod-year" value="2026" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase mb-1">월</label>
            <input type="number" id="prod-month" value="6" min="1" max="12" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-400 uppercase mb-1">생산량</label>
            <input type="number" id="prod-qty" step="0.01" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="ton">
          </div>
          <div class="flex items-end">
            <button type="submit" class="btn-primary w-full py-2"><i class="fas fa-save mr-1"></i>저장</button>
          </div>
        </form>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>호기</th><th>기간</th><th class="text-right">생산량</th></tr></thead>
            <tbody id="production-list"></tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <script>
    let analysisData = null, unitSummaryData = null, unitsCache = [], materialsCache = [];
    let unitChartInstance = null, effectChartInstance = null, currentUnitFilter = '', uploadData = [];

    document.addEventListener('DOMContentLoaded', async () => {
      await loadMasterData();
      await loadAnalysis();
    });

    function switchTab(tab) {
      ['dashboard','detail','upload','input','master'].forEach(t => {
        document.getElementById('content-' + t)?.classList.add('hidden');
        const el = document.getElementById('tab-' + t);
        if (el) { el.classList.remove('pill-tab-active'); el.classList.add('pill-tab-inactive'); }
      });
      document.getElementById('content-' + tab)?.classList.remove('hidden');
      const a = document.getElementById('tab-' + tab);
      if (a) { a.classList.add('pill-tab-active'); a.classList.remove('pill-tab-inactive'); }
      if (tab === 'input') loadRecentRecords();
      if (tab === 'master') { loadUnitsList(); loadMaterialsList(); loadProductionList(); }
    }

    function setUnitFilter(id) {
      currentUnitFilter = id;
      document.querySelectorAll('[id^="unit-btn-"]').forEach(b => { b.classList.remove('pill-tab-active'); b.classList.add('pill-tab-inactive'); });
      (id ? document.getElementById('unit-btn-'+id) : document.getElementById('unit-btn-all'))?.classList.add('pill-tab-active');
      (id ? document.getElementById('unit-btn-'+id) : document.getElementById('unit-btn-all'))?.classList.remove('pill-tab-inactive');
      loadAnalysis();
    }

    async function loadMasterData() {
      const [u, m] = await Promise.all([fetch('/api/units').then(r=>r.json()), fetch('/api/materials').then(r=>r.json())]);
      unitsCache = u; materialsCache = m;
      document.getElementById('input-unit').innerHTML = u.map(x=>'<option value="'+x.id+'">'+x.unit_name+' ('+x.unit_code+')</option>').join('');
      document.getElementById('input-material').innerHTML = m.map(x=>'<option value="'+x.id+'">'+(x.category==='RAW'?'[원]':'[부]')+' '+x.material_name+'</option>').join('');
      document.getElementById('prod-unit').innerHTML = u.map(x=>'<option value="'+x.id+'">'+x.unit_name+'</option>').join('');
    }

    async function loadAnalysis() {
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value;
      const params = new URLSearchParams({ year, month });
      if (currentUnitFilter) params.set('unit_id', currentUnitFilter);
      const [comp, summary] = await Promise.all([
        fetch('/api/analysis/comparison?'+params).then(r=>r.json()),
        fetch('/api/analysis/unit-summary?'+new URLSearchParams({year,month})).then(r=>r.json())
      ]);
      analysisData = comp; unitSummaryData = summary;
      document.getElementById('period-label').textContent = comp.summary?.period ? comp.summary.period.previous + ' vs ' + comp.summary.period.current : '';
      renderDashboard(); renderDetailTable();
    }

    function renderDashboard() {
      if (!analysisData) return;
      const s = analysisData.summary;
      document.getElementById('s-prev').textContent = formatWon(s.total_prev_cost);
      document.getElementById('s-cur').textContent = formatWon(s.total_cur_cost);
      setVC('s-qty', s.total_qty_effect);
      setVC('s-price', s.total_price_effect);
      setVC('s-total', s.total_cost_diff);
      renderUnitChart(); renderEffectChart(); renderUnitSummaryTable(); renderTopImpact();
    }

    function setVC(id, v) {
      const el = document.getElementById(id);
      el.textContent = formatSignedWon(v);
      el.className = 'text-lg font-bold stat-value ' + (v > 0 ? 'positive' : v < 0 ? 'negative' : 'text-gray-900');
    }

    function renderUnitChart() {
      if (!unitSummaryData?.length) return;
      const ctx = document.getElementById('unitChart').getContext('2d');
      if (unitChartInstance) unitChartInstance.destroy();
      unitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: unitSummaryData.map(u=>u.unit_name),
          datasets: [
            { label: '전월', data: unitSummaryData.map(u=>u.prev_total_cost), backgroundColor: '#c7d2fe', borderRadius: 6, barPercentage: 0.6 },
            { label: '당월', data: unitSummaryData.map(u=>u.cur_total_cost), backgroundColor: '#4f46e5', borderRadius: 6, barPercentage: 0.6 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position:'top', align:'end', labels: { boxWidth:8, usePointStyle:true, pointStyle:'circle', font:{size:11} } } },
          scales: { y: { beginAtZero:true, grid:{color:'#f1f5f9'}, ticks:{font:{size:10}, callback:v=>(v/100000000).toFixed(1)+'억'} }, x: { grid:{display:false}, ticks:{font:{size:11}} } }
        }
      });
    }

    function renderEffectChart() {
      if (!unitSummaryData?.length) return;
      const ctx = document.getElementById('effectChart').getContext('2d');
      if (effectChartInstance) effectChartInstance.destroy();
      effectChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: unitSummaryData.map(u=>u.unit_name),
          datasets: [
            { label: '수량효과', data: unitSummaryData.map(u=>u.total_qty_effect), backgroundColor: '#818cf8', borderRadius: 6, barPercentage: 0.6 },
            { label: '단가효과', data: unitSummaryData.map(u=>u.total_price_effect), backgroundColor: '#fbbf24', borderRadius: 6, barPercentage: 0.6 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position:'top', align:'end', labels: { boxWidth:8, usePointStyle:true, pointStyle:'circle', font:{size:11} } } },
          scales: { y: { grid:{color:'#f1f5f9'}, ticks:{font:{size:10}, callback:v=>(v/100000000).toFixed(2)+'억'} }, x: { grid:{display:false}, ticks:{font:{size:11}} } }
        }
      });
    }

    function renderUnitSummaryTable() {
      const tb = document.getElementById('unit-summary-body');
      if (!unitSummaryData?.length) { tb.innerHTML='<tr><td colspan="8" class="text-center py-8 text-gray-400">데이터 없음</td></tr>'; return; }
      tb.innerHTML = unitSummaryData.map(u => {
        const pct = u.prev_total_cost>0 ? ((u.cost_diff/u.prev_total_cost)*100).toFixed(1) : '-';
        return \`<tr>
          <td><span class="unit-chip \${getCC(u.unit_code)}">\${u.unit_name}</span></td>
          <td class="text-right text-gray-500">\${fmt(u.production_qty)}</td>
          <td class="text-right">\${formatWon(u.prev_total_cost)}</td>
          <td class="text-right font-medium">\${formatWon(u.cur_total_cost)}</td>
          <td class="text-right \${u.total_qty_effect>0?'positive':'negative'}">\${formatSignedWon(u.total_qty_effect)}</td>
          <td class="text-right \${u.total_price_effect>0?'positive':'negative'}">\${formatSignedWon(u.total_price_effect)}</td>
          <td class="text-right font-semibold \${u.cost_diff>0?'positive':'negative'}">\${formatSignedWon(u.cost_diff)}</td>
          <td class="text-right"><span class="text-xs px-2 py-0.5 rounded-full font-medium \${u.cost_diff>0?'bg-red-50 text-red-600':'bg-blue-50 text-blue-600'}">\${pct!=='-'?(u.cost_diff>0?'+':'')+pct+'%':'-'}</span></td>
        </tr>\`;
      }).join('');
    }

    function renderTopImpact() {
      const tb = document.getElementById('top-impact-body');
      if (!analysisData?.items?.length) { tb.innerHTML='<tr><td colspan="10" class="text-center py-8 text-gray-400">데이터 없음</td></tr>'; return; }
      const sorted = [...analysisData.items].sort((a,b)=>Math.abs(b.cost_diff)-Math.abs(a.cost_diff)).slice(0,10);
      tb.innerHTML = sorted.map((i,idx) => \`<tr>
        <td class="font-bold text-gray-300">\${idx+1}</td>
        <td><span class="unit-chip \${getCC(i.unit_code)}">\${i.unit_name}</span></td>
        <td><span class="text-[10px] px-1.5 py-0.5 rounded font-medium \${i.category==='RAW'?'bg-blue-50 text-blue-600':'bg-emerald-50 text-emerald-600'}">\${i.category==='RAW'?'원자재':'부자재'}</span></td>
        <td class="font-medium">\${i.material_name}</td>
        <td class="text-right text-gray-500">\${formatWon(i.prev_total_cost)}</td>
        <td class="text-right">\${formatWon(i.cur_total_cost)}</td>
        <td class="text-right \${i.qty_effect>0?'positive':'negative'}">\${formatSignedWon(i.qty_effect)}</td>
        <td class="text-right \${i.price_effect>0?'positive':'negative'}">\${formatSignedWon(i.price_effect)}</td>
        <td class="text-right font-semibold \${i.cost_diff>0?'positive':'negative'}">\${formatSignedWon(i.cost_diff)}</td>
        <td class="text-right"><span class="text-xs \${i.cost_diff>0?'text-red-500':'text-blue-500'}">\${i.cost_change_pct!=null?(i.cost_diff>0?'+':'')+i.cost_change_pct+'%':'-'}</span></td>
      </tr>\`).join('');
    }

    function renderDetailTable() {
      const tb = document.getElementById('detail-table-body');
      if (!analysisData?.items?.length) { tb.innerHTML='<tr><td colspan="16" class="text-center py-8 text-gray-400">데이터 없음</td></tr>'; return; }
      tb.innerHTML = analysisData.items.map(i => \`<tr>
        <td><span class="unit-chip \${getCC(i.unit_code)}">\${i.unit_name}</span></td>
        <td><span class="text-[10px] px-1.5 py-0.5 rounded \${i.category==='RAW'?'bg-blue-50 text-blue-600':'bg-emerald-50 text-emerald-600'}">\${i.category==='RAW'?'원':'부'}</span></td>
        <td class="text-gray-400 font-mono text-[11px]">\${i.material_code}</td>
        <td class="font-medium">\${i.material_name}</td>
        <td class="text-gray-400 text-xs">\${i.unit_of_measure}</td>
        <td class="text-right">\${fmt(i.prev_usage_qty)}</td>
        <td class="text-right">\${fmt(i.cur_usage_qty)}</td>
        <td class="text-right \${i.qty_diff>0?'positive':'negative'}">\${fmtS(i.qty_diff)}</td>
        <td class="text-right">\${fmt(i.prev_unit_price)}</td>
        <td class="text-right">\${fmt(i.cur_unit_price)}</td>
        <td class="text-right \${i.price_diff>0?'positive':'negative'}">\${fmtS(i.price_diff)}</td>
        <td class="text-right">\${formatWon(i.prev_total_cost)}</td>
        <td class="text-right">\${formatWon(i.cur_total_cost)}</td>
        <td class="text-right font-medium \${i.qty_effect>0?'positive':'negative'}">\${formatSignedWon(i.qty_effect)}</td>
        <td class="text-right font-medium \${i.price_effect>0?'positive':'negative'}">\${formatSignedWon(i.price_effect)}</td>
        <td class="text-right font-bold \${i.cost_diff>0?'positive':'negative'}">\${formatSignedWon(i.cost_diff)}</td>
      </tr>\`).join('');
    }

    // Excel Upload
    function handleDrop(e) { e.preventDefault(); e.currentTarget.classList.remove('border-primary-400','bg-primary-50/50'); processFile(e.dataTransfer.files[0]); }
    function handleFileSelect(e) { processFile(e.target.files[0]); }
    function processFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
        const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!json.length) { alert('데이터가 없습니다.'); return; }
        uploadData = json;
        document.getElementById('upload-area').classList.add('hidden');
        document.getElementById('upload-preview').classList.remove('hidden');
        document.getElementById('upload-filename').textContent = file.name;
        document.getElementById('upload-info').textContent = json.length+'행';
        document.getElementById('upload-count').textContent = json.length;
        const h = Object.keys(json[0]);
        document.getElementById('preview-head').innerHTML = '<tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr>';
        document.getElementById('preview-body').innerHTML = json.slice(0,15).map(r=>'<tr>'+h.map(x=>'<td>'+(r[x]??'')+'</td>').join('')+'</tr>').join('');
      };
      reader.readAsArrayBuffer(file);
    }
    async function submitUpload() {
      if (!uploadData.length) return;
      const records = uploadData.map(row => {
        const uc = row['호기코드']||row['unit_code']||row['호기'];
        const mc = row['자재코드']||row['material_code']||row['자재'];
        const unit = unitsCache.find(u=>u.unit_code===uc||u.unit_name===uc);
        const mat = materialsCache.find(m=>m.material_code===mc||m.material_name===mc);
        if (!unit||!mat) return null;
        return { unit_id:unit.id, material_id:mat.id, year:parseInt(row['년도']||row['year']||2026), month:parseInt(row['월']||row['month']||6), usage_qty:parseFloat(row['사용량']||row['usage_qty']||0), unit_price:parseFloat(row['단가']||row['unit_price']||0), production_qty:parseFloat(row['생산량']||row['production_qty']||0), notes:row['비고']||'' };
      }).filter(Boolean);
      if (!records.length) { alert('매핑 실패. 컬럼명을 확인하세요.'); return; }
      const res = await fetch('/api/records/bulk', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({records})});
      if (res.ok) { alert((await res.json()).count+'건 업로드 완료!'); resetUpload(); loadAnalysis(); }
    }
    function resetUpload() { uploadData=[]; document.getElementById('upload-area').classList.remove('hidden'); document.getElementById('upload-preview').classList.add('hidden'); document.getElementById('file-input').value=''; }
    function downloadTemplate() {
      const t = [
        {호기코드:'PM2',자재코드:'RM-001',년도:2026,월:6,사용량:3200,단가:880000,생산량:12500,비고:''},
        {호기코드:'PM3',자재코드:'SM-001',년도:2026,월:6,사용량:45000,단가:1250,생산량:11000,비고:''},
      ];
      const ws=XLSX.utils.json_to_sheet(t); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'실적데이터'); XLSX.writeFile(wb,'원부자재_업로드양식.xlsx');
    }

    // CSV Export
    function exportCSV() {
      if (!analysisData?.items?.length) return alert('데이터 없음');
      const h='호기,구분,자재코드,자재명,단위,전월수량,당월수량,수량차이,전월단가,당월단가,단가차이,전월원가,당월원가,수량효과,단가효과,총차이\\n';
      const rows=analysisData.items.map(i=>[i.unit_name,i.category==='RAW'?'원자재':'부자재',i.material_code,i.material_name,i.unit_of_measure,i.prev_usage_qty,i.cur_usage_qty,i.qty_diff,i.prev_unit_price,i.cur_unit_price,i.price_diff,i.prev_total_cost,i.cur_total_cost,i.qty_effect,i.price_effect,i.cost_diff].join(',')).join('\\n');
      const blob=new Blob(['\\uFEFF'+h+rows],{type:'text/csv;charset=utf-8;'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='원가분석_'+document.getElementById('analysisYear').value+'_'+document.getElementById('analysisMonth').value+'월.csv'; a.click();
    }

    // Manual Input
    document.getElementById('record-form').addEventListener('submit', async(e)=>{
      e.preventDefault();
      const data={unit_id:+document.getElementById('input-unit').value, material_id:+document.getElementById('input-material').value, year:+document.getElementById('input-year').value, month:+document.getElementById('input-month').value, usage_qty:+document.getElementById('input-qty').value, unit_price:+document.getElementById('input-price').value, production_qty:+(document.getElementById('input-production').value||0)};
      const r=await fetch('/api/records',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      if(r.ok){alert('저장!'); document.getElementById('input-qty').value=''; document.getElementById('input-price').value=''; document.getElementById('input-production').value=''; loadRecentRecords(); loadAnalysis();}
    });

    async function loadRecentRecords() {
      const y=document.getElementById('analysisYear').value, m=document.getElementById('analysisMonth').value;
      const recs = await fetch('/api/records?year='+y+'&month='+m).then(r=>r.json());
      document.getElementById('recent-records').innerHTML = recs.map(r=>\`<tr>
        <td><span class="unit-chip \${getCC(r.unit_code)}">\${r.unit_name}</span></td>
        <td class="font-medium">\${r.material_name}</td>
        <td class="text-gray-400">\${r.year}-\${String(r.month).padStart(2,'0')}</td>
        <td class="text-right">\${fmt(r.usage_qty)} \${r.unit_of_measure}</td>
        <td class="text-right">\${fmt(r.unit_price)}원</td>
        <td class="text-right font-medium">\${formatWon(r.total_cost)}</td>
        <td class="text-right">\${fmt(r.production_qty)}</td>
        <td class="text-center"><button onclick="deleteRecord(\${r.id})" class="btn-delete">삭제</button></td>
      </tr>\`).join('');
    }
    async function deleteRecord(id) { if(!confirm('삭제?')) return; await fetch('/api/records/'+id,{method:'DELETE'}); loadRecentRecords(); loadAnalysis(); }

    // Master
    document.getElementById('unit-form').addEventListener('submit', async(e)=>{
      e.preventDefault();
      await fetch('/api/units',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({unit_code:document.getElementById('new-unit-code').value,unit_name:document.getElementById('new-unit-name').value})});
      loadUnitsList(); loadMasterData(); document.getElementById('new-unit-code').value=''; document.getElementById('new-unit-name').value='';
    });
    document.getElementById('material-form').addEventListener('submit', async(e)=>{
      e.preventDefault();
      await fetch('/api/materials',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({material_code:document.getElementById('new-mat-code').value,material_name:document.getElementById('new-mat-name').value,category:document.getElementById('new-mat-category').value,unit_of_measure:document.getElementById('new-mat-uom').value})});
      loadMaterialsList(); loadMasterData();
    });

    // Production form
    document.getElementById('production-form').addEventListener('submit', async(e)=>{
      e.preventDefault();
      const unitId = document.getElementById('prod-unit').value;
      const year = document.getElementById('prod-year').value;
      const month = document.getElementById('prod-month').value;
      const qty = document.getElementById('prod-qty').value;
      // Update production_qty for all records of this unit/period
      const res = await fetch('/api/records?unit_id='+unitId+'&year='+year+'&month='+month).then(r=>r.json());
      if (res.length > 0) {
        const records = res.map(r => ({...r, production_qty: parseFloat(qty), unit_id: r.unit_id, material_id: r.material_id, year: r.year, month: r.month, usage_qty: r.usage_qty, unit_price: r.unit_price}));
        await fetch('/api/records/bulk', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({records})});
        alert('생산량 업데이트 완료 ('+res.length+'건)');
      } else {
        alert('해당 기간에 등록된 실적이 없습니다. 실적 데이터를 먼저 등록해주세요.');
      }
      loadProductionList(); loadAnalysis();
    });

    async function loadProductionList() {
      const y=document.getElementById('analysisYear').value, m=document.getElementById('analysisMonth').value;
      const data = await fetch('/api/analysis/unit-summary?year='+y+'&month='+m).then(r=>r.json());
      document.getElementById('production-list').innerHTML = data.map(u=>\`<tr>
        <td><span class="unit-chip \${getCC(u.unit_code)}">\${u.unit_name}</span></td>
        <td class="text-gray-500">\${y}-\${String(m).padStart(2,'0')}</td>
        <td class="text-right font-medium">\${fmt(u.production_qty)}</td>
      </tr>\`).join('') || '<tr><td colspan="3" class="text-center py-4 text-gray-400">데이터 없음</td></tr>';
    }

    async function loadUnitsList() {
      const units=await fetch('/api/units').then(r=>r.json());
      document.getElementById('units-list').innerHTML = units.map(u=>\`
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
          <div class="flex items-center gap-3">
            <span class="unit-chip \${getCC(u.unit_code)}">\${u.unit_name}</span>
            <span class="text-xs font-mono text-gray-400">\${u.unit_code}</span>
            <span class="text-xs text-gray-400">\${u.description||''}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">활성</span>
        </div>
      \`).join('');
    }
    async function loadMaterialsList() {
      const mats=await fetch('/api/materials').then(r=>r.json());
      document.getElementById('materials-list').innerHTML = mats.map(m=>\`
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-[10px] px-2 py-0.5 rounded font-medium \${m.category==='RAW'?'bg-blue-50 text-blue-600':'bg-emerald-50 text-emerald-600'}">\${m.category==='RAW'?'원자재':'부자재'}</span>
            <span class="text-sm font-medium text-gray-700">\${m.material_name}</span>
            <span class="text-xs font-mono text-gray-400">\${m.material_code}</span>
          </div>
          <span class="text-xs text-gray-400">\${m.unit_of_measure}</span>
        </div>
      \`).join('');
    }

    // Utilities
    function getCC(c) { return c==='PM2'?'unit-chip-pm2':c==='PM3'?'unit-chip-pm3':c==='CHEM'?'unit-chip-chem':c==='TISSUE'?'unit-chip-tissue':'bg-gray-100 text-gray-600'; }
    function fmt(n) { return n==null?'-':Math.round(n).toLocaleString('ko-KR'); }
    function fmtS(n) { if(n==null) return '-'; const v=Math.round(n); return (v>0?'+':'')+v.toLocaleString('ko-KR'); }
    function formatWon(n) {
      if(n==null) return '-';
      const abs=Math.abs(n);
      if(abs>=100000000) return (n/100000000).toFixed(1)+'억';
      if(abs>=10000) return (n/10000).toFixed(0)+'만원';
      return Math.round(n).toLocaleString('ko-KR')+'원';
    }
    function formatSignedWon(n) {
      if(n==null) return '-';
      const s=n>0?'+':'', abs=Math.abs(n);
      if(abs>=100000000) return s+(n/100000000).toFixed(1)+'억';
      if(abs>=10000) return s+Math.round(n/10000).toLocaleString('ko-KR')+'만원';
      return s+Math.round(n).toLocaleString('ko-KR')+'원';
    }
  </script>
</body>
</html>`;
}
