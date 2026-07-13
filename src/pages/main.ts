export function mainPage(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>원부자재 사전원가 분석</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%231e40af'/%3E%3Cpath d='M6 22 L12 16 L18 19 L26 10' stroke='%2393c5fd' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='26' cy='10' r='2' fill='%2393c5fd'/%3E%3Ctext x='7' y='28' font-size='7' fill='%2393c5fd' font-family='sans-serif' font-weight='bold'%3E%E2%82%A9%3C/text%3E%3C/svg%3E">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
          colors: {
            primary: { 50:'#f0f7f4', 100:'#dbeee4', 200:'#A3C5D4', 300:'#A2C695', 400:'#739D79', 500:'#5A7C8E', 600:'#4B6C61', 700:'#3d5850', 800:'#2f4540', 900:'#243530' },
            sage: { 50:'#f4f9f0', 100:'#DCF8A8', 200:'#c5e89a', 300:'#A2C695', 400:'#739D79', 500:'#4B6C61', 600:'#3d5850', 700:'#2f4540', 800:'#243530', 900:'#1a2820' },
            steel: { 50:'#f2f7fa', 100:'#e1eef4', 200:'#A3C5D4', 300:'#7eaabb', 400:'#5A7C8E', 500:'#4a6a7a', 600:'#3c5563', 700:'#2e424d', 800:'#213038', 900:'#172028' },
            slate: { 750: '#293548' }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
    .pill-tab { padding: 7px 16px; border-radius: 9999px; font-size: 13px; font-weight: 500; transition: all 0.15s; cursor: pointer; border: 1px solid transparent; }
    .pill-tab-active { background: #4B6C61; color: white; border-color: #4B6C61; box-shadow: 0 2px 8px rgba(75,108,97,0.3); }
    .pill-tab-inactive { background: white; color: #4b5563; border-color: #e5e7eb; }
    .pill-tab-inactive:hover { background: #f0f7f4; border-color: #A2C695; }
    .card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02); }
    .card-header-toggle { cursor: pointer; user-select: none; transition: background 0.15s; }
    .card-header-toggle:hover { background: #f4f9f0; }
    .card-body-collapsible { transition: max-height 0.3s ease, opacity 0.2s ease; overflow: hidden; }
    .card-body-collapsed { max-height: 0 !important; opacity: 0; overflow: hidden; }
    .card-chevron { transition: transform 0.3s ease; display: inline-block; }
    .card-chevron-collapsed { transform: rotate(-90deg); }
    .positive { color: #dc2626; }
    .negative { color: #2563eb; }
    .btn-primary { background: #5A7C8E; color: white; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; transition: all 0.15s; border: none; cursor: pointer; }
    .btn-primary:hover { background: #4B6C61; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(90,124,142,0.3); }
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
    .unit-chip-pm2 { background: #e1eef4; color: #3c5563; }
    .unit-chip-pm3 { background: #dbeee4; color: #3d5850; }
    .unit-chip-chem { background: #fef3c7; color: #b45309; }
    .unit-chip-tissue { background: #d1fae5; color: #047857; }
    .summary-card { padding: 20px; border-radius: 14px; border: 1px solid #f1f5f9; transition: all 0.2s; background: white; }
    .summary-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }
    .chart-container { height: 200px; position: relative; }
    .gradient-header { background: linear-gradient(135deg, #4B6C61 0%, #5A7C8E 100%); }
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
    <div class="max-w-[1800px] mx-auto px-6 py-5">
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
          <select id="divisionSelect" onchange="onDivisionChange()" class="bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-semibold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-white/50 cursor-pointer">
            <option value="PS" class="text-gray-800">PS사업부 (제지)</option>
            <option value="HL" class="text-gray-800">HL사업부 (생활용품)</option>
          </select>
        </div>
      </div>
    </div>
  </header>

  <!-- Navigation -->
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-40">
    <div class="max-w-[1800px] mx-auto px-6 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button onclick="switchTab('datainput')" id="tab-datainput" class="pill-tab pill-tab-inactive">
            <i class="fas fa-file-upload mr-1.5"></i>데이터 입력
          </button>
          <button onclick="switchTab('dashboard')" id="tab-dashboard" class="pill-tab pill-tab-active">
            <i class="fas fa-chart-line mr-1.5"></i>사용현황 분석
          </button>
          <button onclick="switchTab('forecast')" id="tab-forecast" class="pill-tab pill-tab-inactive">
            <i class="fas fa-chart-area mr-1.5"></i>전월 대비 예상 손익
          </button>
          <button onclick="switchTab('master')" id="tab-master" class="pill-tab pill-tab-inactive">
            <i class="fas fa-cog mr-1.5"></i>기준정보
          </button>
          <button onclick="switchTab('simflow')" id="tab-simflow" class="pill-tab pill-tab-inactive">
            <i class="fas fa-flask mr-1.5"></i>통합 시뮬레이션
          </button>
          <button onclick="switchTab('optime')" id="tab-optime" class="pill-tab pill-tab-inactive">
            <i class="fas fa-clock mr-1.5"></i>가동시간
          </button>
        </div>
        <!-- Filters -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
            <select id="analysisYear" class="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 pr-6 cursor-pointer" onchange="updatePeriodHint()">
              <option value="2026">2026년</option>
              <option value="2025">2025년</option>
            </select>
            <select id="analysisMonth" class="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 pr-6 cursor-pointer" onchange="updatePeriodHint()">
              <option value="6">6월</option>
              <option value="5" selected>5월</option>
              <option value="4">4월</option>
              <option value="3">3월</option>
              <option value="2">2월</option>
              <option value="1">1월</option>
            </select>
            <button onclick="loadAnalysis()" class="ml-1 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition shadow-sm"><i class="fas fa-search mr-1"></i>조회</button>
            <span id="period-hint" class="text-xs text-blue-600 font-medium ml-1 whitespace-nowrap"></span>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Content -->
  <main class="max-w-[1800px] mx-auto px-6 py-6">
    <!-- Dashboard Tab -->
    <div id="content-dashboard" class="fade-in space-y-5">
      <!-- Action Bar -->
      <div class="flex items-center justify-end">
        <button onclick="exportDashboardExcel()" class="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition flex items-center gap-2">
          <i class="fas fa-file-excel"></i>엑셀 다운로드 (분석 전체)
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="summary-card">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"><i class="fas fa-industry text-slate-500 text-xs"></i></div>
            <span class="text-xs font-medium text-slate-500">제지 전체 원단위</span>
          </div>
          <p id="s-total-uc" class="text-lg font-bold text-gray-900 stat-value">-</p>
          <p class="text-[10px] text-slate-400 mt-1">천원/톤</p>
        </div>
        <div class="summary-card" style="border-color: #bfdbfe; background: linear-gradient(135deg, #eff6ff, #dbeafe)">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-blue-200/50 flex items-center justify-center"><i class="fas fa-cogs text-blue-500 text-xs"></i></div>
            <span class="text-xs font-medium text-blue-600">호기별 원단위</span>
          </div>
          <div id="s-machine-uc-container" class="flex items-center gap-3">
            <div>
              <span class="text-[10px] text-gray-400">-</span>
              <p class="text-base font-bold text-gray-900">-</p>
            </div>
          </div>
          <p class="text-[10px] text-slate-400 mt-1">천원/톤</p>
        </div>
        <div class="summary-card" style="border-color: #c7d2fe; background: linear-gradient(135deg, #eef2ff, #e0e7ff)">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-primary-200/50 flex items-center justify-center"><i class="fas fa-boxes text-primary-500 text-xs"></i></div>
            <span class="text-xs font-medium text-primary-500">사용량차이</span>
          </div>
          <p id="s-qty" class="text-lg font-bold stat-value">-</p>
          <p class="text-[10px] text-slate-400 mt-1">전월대비 손익 효과(예상)</p>
        </div>
        <div class="summary-card" style="border-color: #fde68a; background: linear-gradient(135deg, #fffbeb, #fef3c7)">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-amber-200/50 flex items-center justify-center"><i class="fas fa-won-sign text-amber-500 text-xs"></i></div>
            <span class="text-xs font-medium text-amber-600">단가차이 효과</span>
          </div>
          <p id="s-price" class="text-lg font-bold stat-value">-</p>
          <p class="text-[10px] text-slate-400 mt-1">전월대비 손익 효과(예상)</p>
        </div>
        <div class="summary-card" style="border-color: #bbf7d0; background: linear-gradient(135deg, #f0fdf4, #dcfce7)">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-green-200/50 flex items-center justify-center"><i class="fas fa-chart-line text-green-600 text-xs"></i></div>
            <span class="text-xs font-medium text-green-700">재료비 종합</span>
          </div>
          <p id="s-total" class="text-lg font-bold stat-value">-</p>
          <p class="text-[10px] text-slate-400 mt-1">전월대비 손익 효과(예상)</p>
        </div>
      </div>

      <!-- Charts (FIXED HEIGHT) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">호기별 원단위 추이</h3>
            <span class="text-[10px] text-gray-400">전월 vs 당월 (천원/톤)</span>
          </div>
          <div class="chart-container">
            <canvas id="unitChart"></canvas>
          </div>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">손익효과 분해</h3>
            <span class="text-[10px] text-gray-400">사용량차이 vs 단가차이 (억원)</span>
          </div>
          <div class="chart-container">
            <canvas id="effectChart"></canvas>
          </div>
        </div>
      </div>

      <!-- 재료비 총괄 (호기별 지종별) + 원재료 손익 통합 카드 -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between card-header-toggle" onclick="toggleCard('card-overview')">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-chart-bar text-steel-400 mr-1.5"></i>재료비 총괄 (호기별 지종별)</h3>
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation();setOverviewFilter('ALL')" id="ov-filter-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="event.stopPropagation();setOverviewFilter('RAW')" id="ov-filter-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">원재료</button>
            <button onclick="event.stopPropagation();setOverviewFilter('SUB')" id="ov-filter-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">부재료</button>
            <i class="fas fa-chevron-down card-chevron card-chevron-collapsed text-gray-400 ml-2" id="card-overview-chevron"></i>
          </div>
        </div>
        <div id="card-overview" class="card-body-collapsible card-body-collapsed">
        <div class="px-5 py-3 bg-gradient-to-r from-sage-50/50 to-transparent border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                <i class="fas fa-coins text-sage-600 text-xs"></i>
              </div>
              <div>
                <div class="text-[10px] text-gray-500 leading-tight"><span id="profit-label">원/부자재 손익</span> <span class="text-gray-400">(전월원단위-당월원단위)×생산량</span></div>
                <div class="flex items-center gap-1.5">
                  <span id="overview-profit-value" class="text-lg font-bold text-gray-800">-</span>
                  <span class="text-[10px] text-gray-500">억원</span>
                </div>
              </div>
            </div>
          </div>
          <button onclick="toggleProfitDetail()" class="px-3 py-1.5 text-xs bg-sage-50 text-sage-700 rounded-lg hover:bg-sage-100 transition font-medium border border-sage-200">
            <i class="fas fa-search-plus mr-1"></i>상세보기
          </button>
        </div>

        <!-- 손익 상세 테이블 (숨김 상태) -->
        <div id="profit-detail-section" class="hidden border-b border-slate-100">
          <div class="px-5 py-2.5 bg-slate-50 flex items-center justify-between">
            <h4 class="text-xs font-semibold text-gray-600" id="profit-detail-title"><i class="fas fa-list-alt text-sage-400 mr-1"></i>호기별 지종별 원/부자재 손익 상세</h4>
            <span class="text-xs text-gray-400">단위: 억원</span>
          </div>
          <div class="overflow-x-auto max-h-[360px] overflow-y-auto">
            <table class="data-table text-xs">
              <thead class="sticky top-0 bg-white z-10">
                <tr>
                  <th class="!py-2">호기</th>
                  <th class="!py-2">지종</th>
                  <th class="!py-2 text-right">전월 원단위(천원/톤)</th>
                  <th class="!py-2 text-right">당월 원단위(천원/톤)</th>
                  <th class="!py-2 text-right">원단위 차이</th>
                  <th class="!py-2 text-right">생산량(당월)</th>
                  <th class="!py-2 text-right" id="profit-detail-col-header">원/부자재 손익(억원)</th>
                </tr>
              </thead>
              <tbody id="profit-detail-body"></tbody>
              <tfoot class="bg-slate-50 font-semibold sticky bottom-0" id="profit-detail-foot"></tfoot>
            </table>
          </div>
        </div>

        <!-- 재료비 총괄 테이블 -->
        <div class="overflow-x-auto">
          <table class="data-table text-xs" id="overview-table">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th rowspan="2" class="!py-2 text-center border-r border-slate-200">호기</th>
                <th rowspan="2" class="!py-2 text-center border-r border-slate-200">지종</th>
                <th colspan="5" class="!py-1 text-center bg-steel-50 border-b border-slate-200">당월</th>
                <th colspan="5" class="!py-1 text-center bg-amber-50 border-b border-slate-200">전월</th>
                <th colspan="5" class="!py-1 text-center bg-sage-50 border-b border-slate-200">예상</th>
              </tr>
              <tr>
                <th class="!py-1.5 text-right bg-steel-50">재료비(억원)</th>
                <th class="!py-1.5 text-right bg-steel-50">생산량(톤)</th>
                <th class="!py-1.5 text-right bg-steel-50">호기비중(%)</th>
                <th class="!py-1.5 text-right bg-steel-50">원단위(천원/톤)</th>
                <th class="!py-1.5 text-right bg-steel-50 border-r border-slate-200">전체비중(%)</th>
                <th class="!py-1.5 text-right bg-amber-50">재료비(억원)</th>
                <th class="!py-1.5 text-right bg-amber-50">생산량(톤)</th>
                <th class="!py-1.5 text-right bg-amber-50">호기비중(%)</th>
                <th class="!py-1.5 text-right bg-amber-50">원단위(천원/톤)</th>
                <th class="!py-1.5 text-right bg-amber-50 border-r border-slate-200">전체비중(%)</th>
                <th class="!py-1.5 text-right bg-sage-50">재료비(억원)</th>
                <th class="!py-1.5 text-right bg-sage-50">생산량(톤)</th>
                <th class="!py-1.5 text-right bg-sage-50">호기비중(%)</th>
                <th class="!py-1.5 text-right bg-sage-50">원단위(천원/톤)</th>
                <th class="!py-1.5 text-right bg-sage-50">전체비중(%)</th>
              </tr>
            </thead>
            <tbody id="dash-overview-body"></tbody>
            <tfoot class="bg-slate-50 font-semibold sticky bottom-0" id="dash-overview-foot"></tfoot>
          </table>
        </div>
        </div><!-- /card-overview -->
      </div>

      <!-- 1) 호기별 > 제품레벨2 > 자재그룹명별 재료비 요약 -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between card-header-toggle" onclick="toggleCard('card-matcost')">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-layer-group text-sage-500 mr-1.5"></i>호기별 제품구분별 자재그룹 재료비 요약</h3>
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation();setMatCostFilter('ALL')" id="mc-filter-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="event.stopPropagation();setMatCostFilter('RAW')" id="mc-filter-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">원재료</button>
            <button onclick="event.stopPropagation();setMatCostFilter('SUB')" id="mc-filter-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">부재료</button>
            <span class="text-xs text-gray-400 ml-2">실적배부수량 x 실적단가</span>
            <i class="fas fa-chevron-down card-chevron card-chevron-collapsed text-gray-400 ml-2" id="card-matcost-chevron"></i>
          </div>
        </div>
        <div id="card-matcost" class="card-body-collapsible card-body-collapsed">
        <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th class="!py-2">호기</th>
                <th class="!py-2">제품구분(레벨2)</th>
                <th class="!py-2">자재그룹명</th>
                <th class="!py-2 text-right">재료비(억원,당월)</th>
                <th class="!py-2 text-right">재료비(억원,전월)</th>
                <th class="!py-2 text-right">전월대비 차이</th>
                <th class="!py-2 text-right">사용량차이</th>
                <th class="!py-2 text-right">단가차이</th>
                <th class="!py-2 text-right">건수</th>
              </tr>
            </thead>
            <tbody id="dash-matcost-body"></tbody>
            <tfoot class="bg-slate-50 font-semibold sticky bottom-0">
              <tr>
                <td colspan="3" class="!py-2 text-center">합계</td>
                <td class="!py-2 text-right" id="dash-matcost-total-cur">-</td>
                <td class="!py-2 text-right" id="dash-matcost-total-prev">-</td>
                <td class="!py-2 text-right" id="dash-matcost-total-diff">-</td>
                <td class="!py-2 text-right" id="dash-matcost-total-usage">-</td>
                <td class="!py-2 text-right" id="dash-matcost-total-price">-</td>
                <td class="!py-2 text-right" id="dash-matcost-total-rows">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div><!-- /card-matcost -->
      </div>

      <!-- 2) 호기별 > 자재그룹(대분류)명 > 제품구분별 재료비 요약 -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between card-header-toggle" onclick="toggleCard('card-matgroup')">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-cubes text-sage-400 mr-1.5"></i>호기별 자재그룹(대분류)별 제품구분 재료비</h3>
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation();setMatGroupFilter('ALL')" id="mg-filter-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="event.stopPropagation();setMatGroupFilter('RAW')" id="mg-filter-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">원재료</button>
            <button onclick="event.stopPropagation();setMatGroupFilter('SUB')" id="mg-filter-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">부재료</button>
            <i class="fas fa-chevron-down card-chevron card-chevron-collapsed text-gray-400 ml-2" id="card-matgroup-chevron"></i>
          </div>
        </div>
        <div id="card-matgroup" class="card-body-collapsible card-body-collapsed">
        <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th class="!py-2">호기</th>
                <th class="!py-2">자재그룹(대분류)명</th>
                <th class="!py-2">제품구분(레벨2)</th>
                <th class="!py-2 text-right">재료비(억원,당월)</th>
                <th class="!py-2 text-right">재료비(억원,전월)</th>
                <th class="!py-2 text-right">사용량차이</th>
                <th class="!py-2 text-right">단가차이</th>
                <th class="!py-2 text-right">배부수량(당월)</th>
                <th class="!py-2 text-right">배부수량(전월)</th>
              </tr>
            </thead>
            <tbody id="dash-matgroup-body"></tbody>
            <tfoot class="bg-slate-50 font-semibold sticky bottom-0">
              <tr>
                <td colspan="3" class="!py-2 text-center">합계</td>
                <td class="!py-2 text-right" id="mg-total-cur">-</td>
                <td class="!py-2 text-right" id="mg-total-prev">-</td>
                <td class="!py-2 text-right" id="mg-total-usage">-</td>
                <td class="!py-2 text-right" id="mg-total-price">-</td>
                <td class="!py-2 text-right" id="mg-total-qty-cur">-</td>
                <td class="!py-2 text-right" id="mg-total-qty-prev">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div><!-- /card-matgroup -->
      </div>

      <!-- 3) 호기별 제품레벨2별 총생산량 합계 -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between card-header-toggle" onclick="toggleCard('card-production')">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-industry text-sage-300 mr-1.5"></i>호기별 제품구분별 총생산량 합계</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">제품 레벨4 기준 중복제거 합산</span>
            <i class="fas fa-chevron-down card-chevron card-chevron-collapsed text-gray-400 ml-2" id="card-production-chevron"></i>
          </div>
        </div>
        <div id="card-production" class="card-body-collapsible card-body-collapsed">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>호기</th>
                <th>호기명</th>
                <th>제품구분(레벨2)</th>
                <th class="text-right">총생산량</th>
              </tr>
            </thead>
            <tbody id="dash-production-body"></tbody>
            <tfoot class="bg-slate-50 font-semibold">
              <tr>
                <td colspan="3" class="text-center">합계</td>
                <td class="text-right" id="dash-production-total">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div><!-- /card-production -->
      </div>

      <!-- 4) 생산량 분석 대시보드 -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between card-header-toggle" onclick="toggleCard('card-prodanalysis')">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-chart-line text-steel-400 mr-1.5"></i>생산량 분석 (호기별 지종별)</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">당월 / 전월 비교 · 총생산량, 생산수량, 폐품수량</span>
            <i class="fas fa-chevron-down card-chevron card-chevron-collapsed text-gray-400 ml-2" id="card-prodanalysis-chevron"></i>
          </div>
        </div>
        <div id="card-prodanalysis" class="card-body-collapsible card-body-collapsed">
        <div class="overflow-x-auto">
          <table class="data-table text-xs" id="prod-analysis-table">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th rowspan="2" class="!py-2 text-center border-r border-slate-200">행 레이블</th>
                <th colspan="3" class="!py-1 text-center bg-steel-50 border-b border-slate-200">당월</th>
                <th colspan="3" class="!py-1 text-center bg-amber-50 border-b border-slate-200">전월</th>
                <th colspan="3" class="!py-1 text-center bg-sage-50 border-b border-slate-200">증감</th>
              </tr>
              <tr>
                <th class="!py-1.5 text-right bg-steel-50">총생산량</th>
                <th class="!py-1.5 text-right bg-steel-50">생산수량</th>
                <th class="!py-1.5 text-right bg-steel-50 border-r border-slate-200">폐품수량</th>
                <th class="!py-1.5 text-right bg-amber-50">총생산량</th>
                <th class="!py-1.5 text-right bg-amber-50">생산수량</th>
                <th class="!py-1.5 text-right bg-amber-50 border-r border-slate-200">폐품수량</th>
                <th class="!py-1.5 text-right bg-sage-50">총생산량</th>
                <th class="!py-1.5 text-right bg-sage-50">생산수량</th>
                <th class="!py-1.5 text-right bg-sage-50">폐품수량</th>
              </tr>
            </thead>
            <tbody id="prod-analysis-body"></tbody>
            <tfoot class="bg-slate-50 font-semibold sticky bottom-0" id="prod-analysis-foot"></tfoot>
          </table>
        </div>
        </div><!-- /card-prodanalysis -->
      </div>

      <!-- 5) 믹스 효과 분석 대시보드 -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between card-header-toggle" onclick="toggleCard('card-mixeffect')">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-random text-sage-500 mr-1.5"></i>믹스 효과 분석 (호기 믹스 + 지종 믹스)</h3>
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation();setMixEffectFilter('ALL')" id="mix-filter-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="event.stopPropagation();setMixEffectFilter('RAW')" id="mix-filter-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">원재료</button>
            <button onclick="event.stopPropagation();setMixEffectFilter('SUB')" id="mix-filter-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">부재료</button>
            <span class="text-xs text-gray-400 ml-2">단위: 원단위차이(천원/톤), 수량차이(톤), 금액효과(억원)</span>
            <i class="fas fa-chevron-down card-chevron card-chevron-collapsed text-gray-400 ml-2" id="card-mixeffect-chevron"></i>
          </div>
        </div>
        <div id="card-mixeffect" class="card-body-collapsible card-body-collapsed">
        <div class="overflow-x-auto">
          <table class="data-table text-xs" id="mix-effect-table">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th rowspan="2" class="!py-2 text-center border-r border-slate-200 w-24">구분</th>
                <th colspan="3" class="!py-1 text-center bg-steel-50 border-b border-slate-200">당월</th>
                <th colspan="3" class="!py-1 text-center bg-sage-50 border-b border-slate-200">예상</th>
              </tr>
              <tr>
                <th class="!py-1.5 text-right bg-steel-50 w-20">원단위차이</th>
                <th class="!py-1.5 text-right bg-steel-50 w-20">수량차이</th>
                <th class="!py-1.5 text-right bg-steel-50 w-20 border-r border-slate-200">금액효과</th>
                <th class="!py-1.5 text-right bg-sage-50 w-20">원단위차이</th>
                <th class="!py-1.5 text-right bg-sage-50 w-20">수량차이</th>
                <th class="!py-1.5 text-right bg-sage-50 w-20">금액효과</th>
              </tr>
            </thead>
            <tbody id="mix-effect-body"></tbody>
          </table>
        </div>
        </div><!-- /card-mixeffect -->
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

    <!-- 데이터 입력 Tab (메인) -->
    <div id="content-datainput" class="hidden fade-in space-y-5">
      <!-- 서브탭 네비게이션 -->
      <div class="flex items-center gap-2">
        <button onclick="switchDataInputSub('upload')" id="di-tab-upload" class="pill-tab pill-tab-active text-xs !px-4 !py-2">
          <i class="fas fa-file-excel mr-1.5"></i>원/부자재 실적 데이터 입력
        </button>
        <button onclick="switchDataInputSub('dataview')" id="di-tab-dataview" class="pill-tab pill-tab-inactive text-xs !px-4 !py-2">
          <i class="fas fa-database mr-1.5"></i>원/부자재 실적 데이터 조회
        </button>
        <button onclick="switchDataInputSub('inventory')" id="di-tab-inventory" class="pill-tab pill-tab-inactive text-xs !px-4 !py-2">
          <i class="fas fa-boxes-stacked mr-1.5"></i>기초재고 입력
        </button>
        <button onclick="switchDataInputSub('manual')" id="di-tab-manual" class="pill-tab pill-tab-inactive text-xs !px-4 !py-2">
          <i class="fas fa-edit mr-1.5"></i>부서 수기 입력
        </button>
        <button onclick="switchDataInputSub('calcresult')" id="di-tab-calcresult" class="pill-tab pill-tab-inactive text-xs !px-4 !py-2">
          <i class="fas fa-calculator mr-1.5"></i>계산결과
        </button>
      </div>

    <!-- 서브: Raw 데이터 입력 (Upload) -->
    <div id="content-upload" class="fade-in">
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
          <p class="text-xs text-gray-400 mt-2">.xlsx, .xls, .csv 파일 지원 | SAP 형식 자동 감지</p>
        </div>

        <div id="upload-preview" class="hidden mt-6">
          <div class="flex items-center justify-between mb-4 p-4 bg-sage-50 rounded-xl border border-green-200">
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
          <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">지원 형식</h4>
          
          <div class="mb-4 p-4 bg-sage-50 border border-sage-200 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-sage-100 text-sage-700 text-xs font-bold">SAP 형식</span>
              <span class="text-xs text-sage-600 font-medium">자동 감지</span>
            </div>
            <p class="text-xs text-gray-600 mb-2">SAP에서 추출한 원재료 DB 파일을 그대로 업로드하면 자동으로 인식합니다.</p>
            <div class="text-xs text-gray-500 space-y-1">
              <p><b>필수 컬럼:</b> 달력연도/월, 생산호기, 자재, 출고수량, 실제단가, 출고금액</p>
              <p><b>자동 처리:</b> 신규 자재 자동 등록 | 동일 호기/자재/월 데이터 합산 | 단가 재계산</p>
            </div>
          </div>
          
          <div class="p-4 bg-sage-50 border border-sage-200 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-steel-50 text-steel-400 text-xs font-bold">SAP BW 주요 컬럼</span>
              <span class="text-xs text-steel-400 font-medium">자동 매핑</span>
            </div>
            <div class="overflow-x-auto">
              <table class="text-xs w-full">
                <thead><tr class="border-b border-gray-200">
                  <th class="py-2 text-left font-semibold text-gray-500">컬럼명</th>
                  <th class="py-2 text-left font-semibold text-gray-500">설명</th>
                  <th class="py-2 text-left font-semibold text-gray-500">예시</th>
                  <th class="py-2 text-left font-semibold text-gray-500">필수</th>
                </tr></thead>
                <tbody>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">달력연도/월</td><td class="text-gray-500">실적 기간 (YYYYMM)</td><td class="text-gray-400">202605</td><td><span class="text-red-500">*</span></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">생산호기</td><td class="text-gray-500">호기 코드</td><td class="text-gray-400" id="upload-machine-example">PM2, PM3</td><td><span class="text-red-500">*</span></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">자재</td><td class="text-gray-500">자재 코드 (7자리)</td><td class="text-gray-400">1200000</td><td><span class="text-red-500">*</span></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">자재명</td><td class="text-gray-500">자재 이름</td><td class="text-gray-400">화이트레저(B)</td><td><span class="text-red-500">*</span></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">자재 그룹명</td><td class="text-gray-500">자재 그룹 분류</td><td class="text-gray-400">고지 : 화이트레저</td><td><span class="text-red-500">*</span></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">실제 배부수량</td><td class="text-gray-500">실 사용량 (kg)</td><td class="text-gray-400">15674</td><td><span class="text-red-500">*</span></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">실제단가</td><td class="text-gray-500">실 단가 (원/kg)</td><td class="text-gray-400">335</td><td><span class="text-red-500">*</span></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">총생산량</td><td class="text-gray-500">총 생산량 (kg)</td><td class="text-gray-400">104256</td><td class="text-gray-400">선택</td></tr>
                  <tr><td class="py-2 font-mono text-primary-600">출고금액</td><td class="text-gray-500">출고 금액 (원)</td><td class="text-gray-400">946668270</td><td class="text-gray-400">선택</td></tr>
                </tbody>
              </table>
            </div>
            <p class="text-[10px] text-gray-400 mt-2">* SAP BW에서 다운받은 엑셀(ZOHPP100/101)을 그대로 업로드하세요. 43개 컬럼 전체를 자동 인식합니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 서브: 데이터 조회 -->
    <div id="content-dataview" class="hidden fade-in space-y-5">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-sm font-semibold text-gray-700">업로드 데이터 조회 (원본 전체 컬럼)</h3>
            <p class="text-xs text-gray-400 mt-1">SAP BW에서 업로드된 원본 데이터를 37개 컬럼 전체로 조회합니다.</p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <select id="dv-year" class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" onchange="loadDataView()">
              <option value="2026">2026년</option>
              <option value="2025">2025년</option>
            </select>
            <select id="dv-month" class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" onchange="loadDataView()">
              <option value="05">5월</option>
              <option value="06">6월</option>
              <option value="04">4월</option>
              <option value="03">3월</option>
              <option value="02">2월</option>
              <option value="01">1월</option>
              <option value="07">7월</option>
              <option value="08">8월</option>
              <option value="09">9월</option>
              <option value="10">10월</option>
              <option value="11">11월</option>
              <option value="12">12월</option>
            </select>
            <select id="dv-unit" class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" onchange="loadDataView()">
              <option value="">전체 호기</option>
              <option value="PM2">PM2</option>
              <option value="PM3">PM3</option>
            </select>
            <select id="dv-category" class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" onchange="loadDataView()">
              <option value="">전체 분류</option>
              <option value="RAW">원재료</option>
              <option value="SUB">부재료</option>
            </select>
            <select id="dv-mat-group" class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" onchange="loadDataView()">
              <option value="">전체 자재구분</option>
            </select>
            <input type="text" id="dv-search" placeholder="자재명 검색..." class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-32" onkeyup="if(event.key==='Enter')loadDataView()">
            <button onclick="loadDataView()" class="btn-primary text-xs !py-1.5 !px-3"><i class="fas fa-search mr-1"></i>조회</button>
            <button onclick="exportDataViewCSV()" class="bg-sage-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-green-100 transition">
              <i class="fas fa-download mr-1"></i>CSV
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div class="grid grid-cols-4 gap-4 mb-5">
          <div class="bg-slate-50 rounded-xl p-3 text-center">
            <p class="text-[10px] text-gray-400 mb-0.5">총 레코드</p>
            <p class="text-lg font-bold text-gray-800 stat-value" id="dv-total-count">-</p>
          </div>
          <div class="bg-steel-50 rounded-xl p-3 text-center">
            <p class="text-[10px] text-gray-400 mb-0.5">총 출고수량</p>
            <p class="text-lg font-bold text-steel-400 stat-value" id="dv-total-qty">-</p>
          </div>
          <div class="bg-sage-50 rounded-xl p-3 text-center">
            <p class="text-[10px] text-gray-400 mb-0.5">총 출고금액</p>
            <p class="text-lg font-bold text-sage-700 stat-value" id="dv-total-cost">-</p>
          </div>
          <div class="bg-steel-50 rounded-xl p-3 text-center">
            <p class="text-[10px] text-gray-400 mb-0.5">자재 종류</p>
            <p class="text-lg font-bold text-steel-500 stat-value" id="dv-mat-count">-</p>
          </div>
        </div>

        <!-- Data Table - Full 37 columns with horizontal scroll -->
        <div class="overflow-x-auto overflow-y-auto max-h-[550px] border border-gray-100 rounded-xl">
          <table class="data-table text-[11px] whitespace-nowrap" id="dv-table">
            <thead class="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th class="!px-2">#</th>
                <th class="!px-2">달력연도/월</th>
                <th class="!px-2">공정</th>
                <th class="!px-2">공정명</th>
                <th class="!px-2">생산호기</th>
                <th class="!px-2">생산호기명</th>
                <th class="!px-2">제품레벨1</th>
                <th class="!px-2">제품레벨1명</th>
                <th class="!px-2">제품레벨2</th>
                <th class="!px-2">제품레벨2명</th>
                <th class="!px-2">제품레벨3</th>
                <th class="!px-2">제품레벨3명</th>
                <th class="!px-2">제품레벨4</th>
                <th class="!px-2">제품레벨4명</th>
                <th class="!px-2">자재코드</th>
                <th class="!px-2">자재명</th>
                <th class="!px-2">자재구분</th>
                <th class="!px-2">자재그룹</th>
                <th class="!px-2">자재그룹명</th>
                <th class="!px-2">대분류</th>
                <th class="!px-2">대분류명</th>
                <th class="!px-2">지종구분</th>
                <th class="!px-2">지종구분명</th>
                <th class="!px-2 text-right">계획원단위</th>
                <th class="!px-2 text-right">구성부품수량</th>
                <th class="!px-2 text-right">기준수량</th>
                <th class="!px-2 text-right">계획원단위(폐품)</th>
                <th class="!px-2 text-right">계획단가</th>
                <th class="!px-2 text-right">계획배부수량</th>
                <th class="!px-2 text-right">총생산량</th>
                <th class="!px-2 text-right">생산수량</th>
                <th class="!px-2 text-right">폐품수량</th>
                <th class="!px-2 text-right">실제원단위</th>
                <th class="!px-2 text-right">실제배부수량</th>
                <th class="!px-2 text-right">실제단가</th>
                <th class="!px-2 text-right">출고수량</th>
                <th class="!px-2 text-right">출고금액</th>
                <th class="!px-2 text-right">사용량차이</th>
                <th class="!px-2 text-right">단가차이</th>
              </tr>
            </thead>
            <tbody id="dv-tbody"></tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4">
          <p class="text-xs text-gray-400" id="dv-page-info">-</p>
          <div class="flex items-center gap-2">
            <select id="dv-page-size" class="border border-gray-200 rounded-lg px-2 py-1 text-xs" onchange="loadDataView()">
              <option value="50">50건</option>
              <option value="100" selected>100건</option>
              <option value="200">200건</option>
              <option value="500">500건</option>
            </select>
            <button onclick="dvChangePage(-1)" class="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition" id="dv-prev-btn" disabled>
              <i class="fas fa-chevron-left mr-1"></i>이전
            </button>
            <span class="text-xs text-gray-500" id="dv-page-num">-</span>
            <button onclick="dvChangePage(1)" class="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition" id="dv-next-btn" disabled>
              다음<i class="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 서브: 부서 수기 입력 -->
    <div id="content-manual" class="hidden fade-in space-y-4">
      <!-- Header -->
      <div class="card px-5 py-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-edit text-emerald-500 mr-1.5"></i>전월대비 예상실적 (수기입력)</h3>
            <!-- 부서 구분 토글 -->
            <div class="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              <button onclick="setManualDept('production')" id="mn-dept-production" class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all bg-blue-500 text-white shadow-sm">
                <i class="fas fa-industry mr-1"></i>생산
              </button>
              <button onclick="setManualDept('purchase')" id="mn-dept-purchase" class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all text-gray-500 hover:text-gray-700">
                <i class="fas fa-truck mr-1"></i>구매
              </button>
            </div>
            <div class="w-px h-5 bg-slate-200"></div>
            <div id="mn-machine-btns" class="flex items-center gap-1">
              <button onclick="setManualMachine('PM2')" id="mn-mc-pm2" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">PM2</button>
              <button onclick="setManualMachine('PM3')" id="mn-mc-pm3" class="pill-tab pill-tab-active text-xs !px-3 !py-1">PM3</button>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-400" id="mn-period-label"></span>
            <div class="flex items-center gap-1.5 border-r border-slate-200 pr-2">
              <input type="text" id="mn-user-name" placeholder="이름/계정" class="w-20 text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" value="">
            </div>
            <button onclick="downloadManualTemplate()" class="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition font-medium"><i class="fas fa-file-download mr-1"></i>양식 다운로드</button>
            <label class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer font-medium">
              <i class="fas fa-file-excel mr-1"></i>엑셀 업로드
              <input type="file" accept=".xlsx,.xls" class="hidden" onchange="uploadManualExcel(event)">
            </label>
            <button onclick="saveManualData()" class="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition font-medium"><i class="fas fa-save mr-1"></i>저장</button>
            <button onclick="loadManualData()" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-gray-600 hover:bg-slate-200 transition font-medium"><i class="fas fa-sync-alt mr-1"></i>불러오기</button>
            <button onclick="toggleManualHistory()" class="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition font-medium"><i class="fas fa-history mr-1"></i>히스토리</button>
          </div>
        </div>
        <!-- 부서 안내 배너 -->
        <div id="mn-dept-banner" class="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
          <i class="fas fa-info-circle text-blue-400 text-xs"></i>
          <span class="text-[11px] text-blue-700" id="mn-dept-desc"><b>생산부서</b> — 사용량(kg)과 원단위(kg/톤)를 입력합니다.</span>
        </div>
        <!-- 마지막 저장 정보 표시 -->
        <div id="mn-last-save-info" class="mt-2 hidden">
          <span class="text-[10px] text-gray-400"><i class="fas fa-info-circle mr-1"></i>마지막 저장: <span id="mn-last-saved-by"></span> | <span id="mn-last-saved-at"></span></span>
        </div>
      </div>

      <!-- 히스토리 패널 -->
      <div id="mn-history-panel" class="card px-5 py-4 hidden">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-semibold text-gray-700"><i class="fas fa-history text-amber-400 mr-1.5"></i>저장 히스토리</h4>
          <button onclick="toggleManualHistory()" class="text-xs text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="overflow-x-auto max-h-48">
          <table class="w-full text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-3 py-1.5 text-left font-semibold text-gray-600 w-8">#</th>
                <th class="px-3 py-1.5 text-left font-semibold text-gray-600">저장자</th>
                <th class="px-3 py-1.5 text-left font-semibold text-gray-600">저장 시각</th>
                <th class="px-3 py-1.5 text-center font-semibold text-gray-600 w-20">작업</th>
              </tr>
            </thead>
            <tbody id="mn-history-body">
              <tr><td colspan="4" class="text-center py-4 text-gray-400">히스토리가 없습니다.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 엑셀 업로드 미리보기 모달 -->
      <div id="mn-preview-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/40" onclick="if(event.target===this) closeManualPreview()">
        <div class="bg-white rounded-xl shadow-2xl w-[90vw] max-w-4xl max-h-[80vh] flex flex-col">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-search text-blue-500 mr-2"></i>엑셀 데이터 미리보기</h3>
            <button onclick="closeManualPreview()" class="text-gray-400 hover:text-gray-600 text-lg"><i class="fas fa-times"></i></button>
          </div>
          <div class="flex-1 overflow-auto p-4">
            <div id="mn-preview-summary" class="mb-3 text-xs text-gray-500"></div>
            <div class="overflow-x-auto">
              <table class="w-full text-[11px] border-collapse" id="mn-preview-table">
                <thead class="sticky top-0 bg-slate-100">
                  <tr id="mn-preview-thead"></tr>
                </thead>
                <tbody id="mn-preview-tbody"></tbody>
              </table>
            </div>
          </div>
          <div class="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-xl">
            <span class="text-xs text-gray-400" id="mn-preview-count"></span>
            <div class="flex gap-2">
              <button onclick="closeManualPreview()" class="text-xs px-4 py-2 rounded-lg bg-slate-100 text-gray-600 hover:bg-slate-200 transition font-medium">취소</button>
              <button onclick="applyManualPreview()" class="text-xs px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition font-medium"><i class="fas fa-check mr-1"></i>적용하기</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 생산량 섹션 -->
      <div class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-emerald-50/50">
          <div class="flex items-center gap-2">
            <h4 class="text-xs font-semibold text-gray-700"><i class="fas fa-industry text-blue-400 mr-1"></i>지종별 생산량 (톤)</h4>
          </div>
        </div>
        <div class="p-4 overflow-x-auto">
          <table class="text-xs border-collapse w-full max-w-3xl">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-2 py-1.5 text-left font-semibold text-gray-600 w-16"></th>
                <th class="px-2 py-1.5 text-center font-semibold text-blue-700 border-l border-slate-200" id="mn-prev-prod-header">04월 (실적)</th>
                <th class="px-2 py-1.5 text-center font-semibold text-emerald-700 border-l border-slate-200" id="mn-cur-prod-header">05월 (예상)</th>
              </tr>
            </thead>
            <tbody id="mn-prod-body"></tbody>
            <tfoot>
              <tr class="border-t-2 border-slate-300 bg-slate-50 font-bold">
                <td class="px-2 py-1.5 text-xs">합계</td>
                <td class="px-2 py-1.5 text-right font-mono border-l border-slate-200" id="mn-prev-prod-total">-</td>
                <td class="px-2 py-1.5 text-right font-mono border-l border-slate-200" id="mn-cur-prod-total">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 자재별 상세 테이블 -->
      <div class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h4 class="text-xs font-semibold text-gray-700"><i class="fas fa-cubes text-amber-400 mr-1"></i>자재별 원가 상세</h4>
          <div class="flex items-center gap-2">
            <select id="mn-mat-group-filter" class="border border-gray-200 rounded-lg px-2 py-1 text-[10px] focus:ring-1 focus:ring-emerald-200" onchange="filterManualTable()">
              <option value="">전체 자재그룹</option>
            </select>
          </div>
        </div>
        <div class="overflow-x-auto" style="max-height:calc(100vh - 340px)">
          <table class="w-full text-[11px] border-collapse whitespace-nowrap" id="mn-detail-table">
            <thead class="sticky top-0 z-10" id="mn-detail-thead"></thead>
            <tbody id="mn-detail-body">
              <tr><td colspan="20" class="text-center py-8 text-gray-400"><i class="fas fa-arrow-up mr-2"></i>호기 선택 후 불러오기를 클릭하세요</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 서브: 계산결과 -->
    <div id="content-calcresult" class="hidden fade-in space-y-4">
      <!-- 호기 선택 -->
      <div class="card p-4">
        <div class="flex items-center gap-4">
          <label class="text-xs font-semibold text-gray-600"><i class="fas fa-industry mr-1.5 text-indigo-500"></i>호기 선택</label>
          <select id="cr-machine-select" onchange="loadCalcResultData()" class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200">
            <option value="PM2">PM2 (제지 2호기)</option>
            <option value="PM3">PM3 (제지 3호기)</option>
          </select>
          <button onclick="loadCalcResultData()" class="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <i class="fas fa-sync-alt mr-1"></i>불러오기
          </button>
          <span id="cr-load-status" class="text-xs text-gray-400"></span>
        </div>
      </div>

      <!-- 안내 메시지 (데이터 미로드 시) -->
      <div id="cr-empty-msg" class="card p-8 text-center">
        <i class="fas fa-info-circle text-3xl text-slate-300 mb-3"></i>
        <p class="text-sm text-gray-500">호기를 선택하고 불러오기를 클릭하세요.</p>
        <p class="text-xs text-gray-400 mt-1">부서 수기 입력 탭에서 저장된 데이터를 기반으로 계산합니다.</p>
      </div>

      <!-- 요약 대시보드 -->
      <div id="cr-dashboard" class="hidden">
        <!-- 기간/호기 정보 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span id="cr-period-label" class="text-sm font-semibold text-gray-700"></span>
            <span id="cr-machine-label" class="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium"></span>
          </div>
          <button onclick="exportCalcResultExcel()" class="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <i class="fas fa-file-excel mr-1"></i>엑셀 다운로드
          </button>
        </div>

        <!-- 요약 카드 4개 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div class="card p-4 border-l-4 border-l-blue-500">
            <p class="text-xs text-gray-500 mb-1">당월 총 재료비</p>
            <p id="cr-total-cost" class="text-lg font-bold text-gray-800">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5">백만원</p>
          </div>
          <div class="card p-4 border-l-4 border-l-indigo-500">
            <p class="text-xs text-gray-500 mb-1">평균 원단위</p>
            <p id="cr-avg-unitcost" class="text-lg font-bold text-gray-800">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5">원/톤</p>
          </div>
          <div class="card p-4 border-l-4 border-l-emerald-500">
            <p class="text-xs text-gray-500 mb-1">단가 절감 효과</p>
            <p id="cr-saving-effect" class="text-lg font-bold text-blue-600">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5">원 (양수=절감)</p>
          </div>
          <div class="card p-4 border-l-4 border-l-rose-500">
            <p class="text-xs text-gray-500 mb-1">단가 악화 효과</p>
            <p id="cr-worse-effect" class="text-lg font-bold text-red-500">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5">원 (음수=악화)</p>
          </div>
        </div>



        <!-- 자재별 상세 결과 테이블 -->
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-semibold text-gray-600"><i class="fas fa-table mr-1.5"></i>자재별 계산 상세</h4>
            <div class="flex items-center gap-2">
              <select id="cr-group-filter" onchange="filterCalcResult()" class="text-xs border border-slate-200 rounded px-2 py-1">
                <option value="">전체 그룹</option>
              </select>
              <select id="cr-sort" onchange="renderCalcResultTable()" class="text-xs border border-slate-200 rounded px-2 py-1">
                <option value="group-asc">자재그룹순</option>
                <option value="effect-desc">손익효과순 (악화 먼저)</option>
                <option value="effect-asc">손익효과순 (절감 먼저)</option>
                <option value="cost-desc">재료비순 (높은순)</option>
                <option value="name-asc">자재명순</option>
              </select>
            </div>
          </div>
          <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table class="w-full text-xs">
              <thead class="sticky top-0 z-10">
                <tr class="bg-slate-100 text-gray-600 border-b border-slate-300">
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">No</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">자재코드</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">자재명</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">그룹</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">기초재고수량(톤)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">기초재고단가(원/kg)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">입고수량(톤)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">입고단가(원/kg)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap bg-amber-50">사용단가(원/kg)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">전월단가(원/kg)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap bg-blue-50">전월대비 손익효과</th>
                </tr>
              </thead>
              <tbody id="cr-detail-body"></tbody>
              <tfoot id="cr-detail-foot" class="bg-slate-50 font-semibold border-t-2 border-slate-300"></tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 서브: 기초재고 입력 -->
    <div id="content-inventory" class="hidden fade-in space-y-4">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-boxes-stacked text-amber-500 mr-1.5"></i>원부자재 기초재고 입력</h3>
            <p class="text-xs text-gray-400 mt-1">월별 자재 기초재고 수량 및 단가를 엑셀로 업로드하거나 직접 입력합니다.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="downloadInventoryTemplate()" class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"><i class="fas fa-file-download mr-1"></i>양식 다운로드</button>
            <button onclick="exportInventoryExcel()" class="px-3 py-1.5 border border-emerald-200 rounded-lg text-xs text-emerald-700 hover:bg-emerald-50"><i class="fas fa-file-export mr-1"></i>엑셀 저장</button>
            <button onclick="document.getElementById('inv-file-input').click()" class="btn-primary text-xs !py-1.5"><i class="fas fa-file-excel mr-1"></i>엑셀 업로드</button>
            <input type="file" id="inv-file-input" accept=".xlsx,.xls,.csv" class="hidden" onchange="uploadInventoryFile(event)">
          </div>
        </div>

        <!-- 필터 -->
        <div class="flex items-center gap-3 mb-4 flex-wrap">
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500">월:</label>
            <select id="inv-month-filter" class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-emerald-400" onchange="loadInventoryData()">
              <option value="">전체</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500">플랜트:</label>
            <select id="inv-plant-filter" class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-emerald-400" onchange="loadInventoryData()">
              <option value="">전체</option>
              <option value="P100">P100</option>
              <option value="P200">P200</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500">자재그룹:</label>
            <select id="inv-group-filter" class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-emerald-400" onchange="loadInventoryData()">
              <option value="">전체</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500">자재유형:</label>
            <select id="inv-type-filter" class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-emerald-400" onchange="loadInventoryData()">
              <option value="">전체</option>
            </select>
          </div>
          <button onclick="loadInventoryData()" class="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-gray-600"><i class="fas fa-sync mr-1"></i>새로고침</button>
          <span id="inv-count" class="text-[10px] text-gray-400 ml-auto"></span>
        </div>

        <!-- 수동 추가 행 -->
        <div class="bg-amber-50/50 border border-amber-100 rounded-xl p-3 mb-4">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-semibold text-amber-700"><i class="fas fa-plus-circle mr-0.5"></i>수동 추가:</span>
            <input id="inv-add-month" type="text" class="w-20 text-[10px] border border-amber-200 rounded px-1.5 py-1" placeholder="26년 5월">
            <input id="inv-add-plant" type="text" class="w-14 text-[10px] border border-amber-200 rounded px-1.5 py-1" placeholder="P100">
            <input id="inv-add-mat-group" type="text" class="w-14 text-[10px] border border-amber-200 rounded px-1.5 py-1" placeholder="1200">
            <input id="inv-add-mat-type" type="text" class="w-14 text-[10px] border border-amber-200 rounded px-1.5 py-1" placeholder="ROH2">
            <input id="inv-add-mat-type-name" type="text" class="w-32 text-[10px] border border-amber-200 rounded px-1.5 py-1" placeholder="자재유형명">
            <input id="inv-add-mat-id" type="text" class="w-20 text-[10px] border border-amber-200 rounded px-1.5 py-1" placeholder="자재(ID)">
            <input id="inv-add-mat-name" type="text" class="w-28 text-[10px] border border-amber-200 rounded px-1.5 py-1" placeholder="자재내역">
            <input id="inv-add-qty" type="text" inputmode="numeric" class="w-24 text-[10px] border border-amber-200 rounded px-1.5 py-1 text-right comma-fmt" placeholder="기초재고수량">
            <input id="inv-add-price" type="text" inputmode="numeric" class="w-20 text-[10px] border border-amber-200 rounded px-1.5 py-1 text-right comma-fmt" placeholder="기초재고단가">
            <button onclick="addInventoryRow()" class="text-[10px] px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"><i class="fas fa-plus"></i> 추가</button>
          </div>
        </div>

        <!-- 테이블 -->
        <div class="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-100 rounded-xl">
          <table class="w-full text-xs border-collapse">
            <thead class="sticky top-0 z-10">
              <tr class="bg-slate-50 border-b">
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">월</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">플랜트</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">자재그룹</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">자재유형</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">자재유형명</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">자재</th>
                <th class="px-2 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">자재내역</th>
                <th class="px-2 py-2 text-center font-semibold text-gray-600 whitespace-nowrap">통화</th>
                <th class="px-2 py-2 text-center font-semibold text-gray-600 whitespace-nowrap">단위</th>
                <th class="px-2 py-2 text-right font-semibold text-blue-700 whitespace-nowrap border-l border-slate-200">기초재고-수량</th>
                <th class="px-2 py-2 text-right font-semibold text-blue-700 whitespace-nowrap">기초재고-단가</th>
                <th class="px-2 py-2 text-right font-semibold text-emerald-700 whitespace-nowrap border-l border-slate-200">입고-수량</th>
                <th class="px-2 py-2 text-right font-semibold text-emerald-700 whitespace-nowrap">입고-단가</th>
                <th class="px-2 py-2 text-right font-semibold text-orange-700 whitespace-nowrap border-l border-slate-200">출고-수량</th>
                <th class="px-2 py-2 text-right font-semibold text-orange-700 whitespace-nowrap">출고-단가</th>
                <th class="px-2 py-2 text-right font-semibold text-purple-700 whitespace-nowrap border-l border-slate-200">기말재고-수량</th>
                <th class="px-2 py-2 text-right font-semibold text-purple-700 whitespace-nowrap">기말재고-단가</th>
                <th class="px-2 py-2 text-center font-semibold text-gray-600 whitespace-nowrap">삭제</th>
              </tr>
            </thead>
            <tbody id="inv-table-body">
              <tr><td colspan="18" class="text-center text-gray-400 py-8">데이터를 업로드하거나 수동 추가해주세요.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    </div><!-- /content-datainput -->

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

      <!-- 매핑 INDEX 기준정보 -->
      <div class="card p-6 mt-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-database text-sage-500 mr-1.5"></i>매핑 INDEX 기준정보</h3>
            <p class="text-xs text-gray-400 mt-0.5">제지/화장지 제품분류 및 원부재료 분류 매핑 기준을 관리합니다.</p>
          </div>
        </div>
        <!-- Sub tabs for master index -->
        <div class="flex flex-wrap gap-1 mb-4 border-b border-slate-200 pb-3">
          <button onclick="switchMasterIdx('material-mapping')" id="midx-tab-material-mapping" class="pill-tab pill-tab-active text-xs !px-3 !py-1.5"><i class="fas fa-link mr-1"></i>자재구분 매핑</button>
          <button onclick="switchMasterIdx('exclusion-rules')" id="midx-tab-exclusion-rules" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5"><i class="fas fa-ban mr-1"></i>투입제외 규칙</button>
          <button onclick="switchMasterIdx('paper-products')" id="midx-tab-paper-products" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">제지 제품분류</button>
          <button onclick="switchMasterIdx('paper-raw')" id="midx-tab-paper-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">제지 원재료</button>
          <button onclick="switchMasterIdx('paper-sub')" id="midx-tab-paper-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">제지 부재료</button>
          <button onclick="switchMasterIdx('tissue-products')" id="midx-tab-tissue-products" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">화장지 제품</button>
          <button onclick="switchMasterIdx('tissue-raw')" id="midx-tab-tissue-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">화장지 원재료</button>
        </div>

        <!-- 투입제외 규칙 -->
        <div id="midx-exclusion-rules" class="midx-section hidden">
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="text-xs text-gray-500">호기별 자재그룹이 투입되지 않는 제품 지종을 설정합니다.</span>
              <p class="text-[10px] text-gray-400 mt-0.5">예: PM3의 신문지 → CB(CCKB)·IV 제외 → 원단위 역산 시 유효생산량에서 차감</p>
            </div>
            <button onclick="showExclusionRuleForm()" class="btn-primary text-xs !py-1.5 !px-3"><i class="fas fa-plus mr-1"></i>규칙 추가</button>
          </div>
          <!-- 신규 추가 폼 -->
          <div id="excl-rule-form" class="hidden mb-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <div class="flex items-center gap-2 flex-wrap">
              <select id="excl-machine" class="text-xs border border-slate-200 rounded px-2 py-1.5">
                <option value="PM2">PM2</option>
                <option value="PM3">PM3</option>
              </select>
              <input type="text" id="excl-keyword" placeholder="자재그룹 키워드 (예: 화이트, 신문지)" class="text-xs border border-slate-200 rounded px-2 py-1.5 w-48">
              <input type="text" id="excl-product" placeholder="제외 지종 (예: KB, CB, IV)" class="text-xs border border-slate-200 rounded px-2 py-1.5 w-32">
              <input type="text" id="excl-desc" placeholder="설명 (선택)" class="text-xs border border-slate-200 rounded px-2 py-1.5 w-48">
              <button onclick="addExclusionRule()" class="text-xs px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"><i class="fas fa-check mr-1"></i>등록</button>
              <button onclick="document.getElementById('excl-rule-form').classList.add('hidden')" class="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <!-- 규칙 테이블 -->
          <div class="overflow-x-auto">
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-3 py-2 text-left font-semibold text-gray-600 w-8">#</th>
                  <th class="px-3 py-2 text-left font-semibold text-gray-600">호기</th>
                  <th class="px-3 py-2 text-left font-semibold text-gray-600">자재그룹 키워드</th>
                  <th class="px-3 py-2 text-left font-semibold text-gray-600">제외 지종</th>
                  <th class="px-3 py-2 text-left font-semibold text-gray-600">설명</th>
                  <th class="px-3 py-2 text-center font-semibold text-gray-600 w-20">작업</th>
                </tr>
              </thead>
              <tbody id="midx-exclusion-rules-body">
                <tr><td colspan="6" class="text-center text-gray-400 py-6">로딩중...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 자재구분 매핑 -->
        <div id="midx-material-mapping" class="midx-section">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500">원부자재 데이터의 자재명 → 매핑 INDEX 기준의 자재구분 분류</span>
              <div class="flex items-center gap-1.5 ml-4">
                <span id="mapping-stat-total" class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">전체: -</span>
                <span id="mapping-stat-mapped" class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">매핑완료: -</span>
                <span id="mapping-stat-unmapped" class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">미매핑: -</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="downloadMappingTemplate()" class="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200"><i class="fas fa-download mr-1"></i>양식 다운로드</button>
              <label class="text-xs bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg hover:bg-sage-100 cursor-pointer border border-sage-200"><i class="fas fa-file-excel mr-1"></i>엑셀 업로드<input type="file" accept=".xlsx,.xls,.csv" onchange="uploadMappingExcel(event)" class="hidden"></label>
              <span class="border-l border-gray-200 mx-1"></span>
              <button onclick="loadMaterialMapping('all')" id="mm-filter-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
              <button onclick="loadMaterialMapping('mapped')" id="mm-filter-mapped" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">매핑완료</button>
              <button onclick="loadMaterialMapping('unmapped')" id="mm-filter-unmapped" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">미매핑</button>
            </div>
          </div>
          <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table class="data-table text-xs">
              <thead class="sticky top-0 bg-white z-10">
                <tr>
                  <th class="!py-2 w-8">#</th>
                  <th class="!py-2">자재코드</th>
                  <th class="!py-2">자재명</th>
                  <th class="!py-2">대분류</th>
                  <th class="!py-2">구분(원/부)</th>
                  <th class="!py-2">자재구분(매핑)</th>
                  <th class="!py-2">매핑출처</th>
                  <th class="!py-2 w-16">상태</th>
                </tr>
              </thead>
              <tbody id="midx-material-mapping-body"></tbody>
            </table>
          </div>
        </div>

        <!-- 제지 제품분류 -->
        <div id="midx-paper-products" class="midx-section hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-gray-500">제품 계층구조레벨3 / 지종코드 / 지종 / 지종(세부)</span>
            <div class="flex gap-2">
              <button onclick="addMasterRow('paper-products')" class="text-xs bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg hover:bg-sage-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
              <button onclick="clearMasterTable('paper-products')" class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><i class="fas fa-trash mr-1"></i>전체 삭제</button>
            </div>
          </div>
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table class="data-table text-xs">
              <thead class="sticky top-0 bg-white z-10">
                <tr>
                  <th class="!py-2 w-8">#</th>
                  <th class="!py-2">제품 계층구조레벨3</th>
                  <th class="!py-2">지종코드</th>
                  <th class="!py-2">지종</th>
                  <th class="!py-2">지종(세부)</th>
                  <th class="!py-2 w-16">작업</th>
                </tr>
              </thead>
              <tbody id="midx-paper-products-body"></tbody>
            </table>
          </div>
        </div>

        <!-- 제지 원재료 분류 -->
        <div id="midx-paper-raw" class="midx-section hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-gray-500">분류1 / 자재분류 / 자재(소분류) / 자재코드 / 자재명 / 자재그룹</span>
            <div class="flex gap-2">
              <button onclick="addMasterRow('paper-raw')" class="text-xs bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg hover:bg-sage-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
              <button onclick="clearMasterTable('paper-raw')" class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><i class="fas fa-trash mr-1"></i>전체 삭제</button>
            </div>
          </div>
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table class="data-table text-xs">
              <thead class="sticky top-0 bg-white z-10">
                <tr>
                  <th class="!py-2 w-8">#</th>
                  <th class="!py-2">분류1</th>
                  <th class="!py-2">자재분류</th>
                  <th class="!py-2">자재(소분류)</th>
                  <th class="!py-2">자재코드</th>
                  <th class="!py-2">자재명</th>
                  <th class="!py-2">자재그룹</th>
                  <th class="!py-2 w-16">작업</th>
                </tr>
              </thead>
              <tbody id="midx-paper-raw-body"></tbody>
            </table>
          </div>
        </div>

        <!-- 제지 부재료 분류 -->
        <div id="midx-paper-sub" class="midx-section hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-gray-500">자재코드 / 자재명 / 자재그룹</span>
            <div class="flex gap-2">
              <button onclick="addMasterRow('paper-sub')" class="text-xs bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg hover:bg-sage-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
              <button onclick="clearMasterTable('paper-sub')" class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><i class="fas fa-trash mr-1"></i>전체 삭제</button>
            </div>
          </div>
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table class="data-table text-xs">
              <thead class="sticky top-0 bg-white z-10">
                <tr>
                  <th class="!py-2 w-8">#</th>
                  <th class="!py-2">자재코드</th>
                  <th class="!py-2">자재명</th>
                  <th class="!py-2">자재그룹</th>
                  <th class="!py-2 w-16">작업</th>
                </tr>
              </thead>
              <tbody id="midx-paper-sub-body"></tbody>
            </table>
          </div>
        </div>

        <!-- 화장지 제품분류 -->
        <div id="midx-tissue-products" class="midx-section hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-gray-500">분류 / 제품명</span>
            <div class="flex gap-2">
              <button onclick="addMasterRow('tissue-products')" class="text-xs bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg hover:bg-sage-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
              <button onclick="clearMasterTable('tissue-products')" class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><i class="fas fa-trash mr-1"></i>전체 삭제</button>
            </div>
          </div>
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table class="data-table text-xs">
              <thead class="sticky top-0 bg-white z-10">
                <tr>
                  <th class="!py-2 w-8">#</th>
                  <th class="!py-2">분류</th>
                  <th class="!py-2">제품명</th>
                  <th class="!py-2 w-16">작업</th>
                </tr>
              </thead>
              <tbody id="midx-tissue-products-body"></tbody>
            </table>
          </div>
        </div>

        <!-- 화장지 원재료 분류 -->
        <div id="midx-tissue-raw" class="midx-section hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-gray-500">분류 / 자재코드 / 재료명</span>
            <div class="flex gap-2">
              <button onclick="addMasterRow('tissue-raw')" class="text-xs bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg hover:bg-sage-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
              <button onclick="clearMasterTable('tissue-raw')" class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"><i class="fas fa-trash mr-1"></i>전체 삭제</button>
            </div>
          </div>
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table class="data-table text-xs">
              <thead class="sticky top-0 bg-white z-10">
                <tr>
                  <th class="!py-2 w-8">#</th>
                  <th class="!py-2">분류</th>
                  <th class="!py-2">자재코드</th>
                  <th class="!py-2">재료명</th>
                  <th class="!py-2 w-16">작업</th>
                </tr>
              </thead>
              <tbody id="midx-tissue-raw-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div id="content-simulation" class="hidden fade-in space-y-5">
      <!-- Header & Controls -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-flask text-primary-400 mr-1.5"></i>지종별 생산량 손익 시뮬레이션</h3>
            <p class="text-xs text-gray-400 mt-1">당월 실적을 기준으로 차월 생산량/원단위를 변경하여 손익 변화를 시뮬레이션합니다.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1">
              <button onclick="setSimCatFilter('ALL')" id="sim-cat-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
              <button onclick="setSimCatFilter('RAW')" id="sim-cat-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">원재료</button>
              <button onclick="setSimCatFilter('SUB')" id="sim-cat-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">부재료</button>
            </div>
            <button onclick="loadSimProfitBase()" class="btn-primary text-xs !py-1.5"><i class="fas fa-sync mr-1"></i>기준 데이터 로드</button>
            <button onclick="resetSimToBase()" class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"><i class="fas fa-undo mr-1"></i>초기화</button>
          </div>
        </div>

        <!-- Guide -->
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
          <div class="flex items-start gap-2">
            <i class="fas fa-info-circle text-blue-400 mt-0.5"></i>
            <div class="text-xs text-blue-700 space-y-1">
              <p class="font-medium">사용 방법</p>
              <p>1. 기준 데이터를 로드하면 <span class="font-semibold">당월 실적</span>이 기준값으로 설정됩니다.</p>
              <p>2. <span class="font-semibold text-blue-900">차월 생산량(톤)</span> 또는 <span class="font-semibold text-blue-900">차월 원단위(천원/톤)</span>를 계획에 맞게 수정하세요.</p>
              <p>3. 수정 즉시 당월 대비 차월 손익이 자동 계산됩니다.</p>
              <p>4. 손익(억원) = (기준원단위 - 시뮬원단위) × 시뮬생산량 | 양수 = 비용절감, 음수 = 비용증가</p>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
          <div class="summary-card">
            <p class="text-[10px] font-medium text-gray-400 uppercase">기준 총재료비</p>
            <p id="sim-base-total" class="text-lg font-bold text-gray-900 mt-2 stat-value">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5" id="sim-base-label">당월 실적</p>
          </div>
          <div class="summary-card">
            <p class="text-[10px] font-medium text-gray-400 uppercase">시뮬 총재료비</p>
            <p id="sim-new-total" class="text-lg font-bold text-gray-900 mt-2 stat-value">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5" id="sim-target-label">차월 예상</p>
          </div>
          <div class="summary-card" style="border-color:#c7d2fe; background:linear-gradient(135deg,#eef2ff,#e0e7ff)">
            <p class="text-[10px] font-medium text-primary-500 uppercase">당월 대비 손익(억원)</p>
            <p id="sim-profit-total" class="text-lg font-bold mt-2 stat-value">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5">절감(+) / 증가(-)</p>
          </div>
          <div class="summary-card" style="border-color:#bfdbfe; background:linear-gradient(135deg,#eff6ff,#dbeafe)">
            <p class="text-[10px] font-medium text-steel-400 uppercase">생산량 효과(억원)</p>
            <p id="sim-prod-effect" class="text-lg font-bold mt-2 stat-value">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5">생산량 변동분</p>
          </div>
          <div class="summary-card" style="border-color:#fde68a; background:linear-gradient(135deg,#fffbeb,#fef3c7)">
            <p class="text-[10px] font-medium text-amber-600 uppercase">원단위 효과(억원)</p>
            <p id="sim-unit-effect" class="text-lg font-bold mt-2 stat-value">-</p>
            <p class="text-[10px] text-gray-400 mt-0.5">원단위 변동분</p>
          </div>
        </div>
      </div>

      <!-- Simulation Table -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-table text-sage-400 mr-1.5"></i>시뮬레이션 입력 테이블</h3>
          <div class="flex items-center gap-2">
            <button onclick="addSimRow()" class="text-xs text-primary-600 hover:text-primary-700 font-medium"><i class="fas fa-plus mr-1"></i>행 추가</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table" id="sim-profit-table">
            <thead>
              <tr class="bg-slate-50">
                <th rowspan="2" class="!border-r border-slate-200">호기</th>
                <th rowspan="2" class="!border-r border-slate-200">지종</th>
                <th colspan="3" class="text-center !border-b !border-r border-slate-200 bg-gray-50">기준 (당월 실적)</th>
                <th colspan="3" class="text-center !border-b !border-r border-slate-200 bg-blue-50/50">시뮬레이션 (차월 계획)</th>
                <th colspan="3" class="text-center !border-b border-slate-200 bg-green-50/50">손익 결과</th>
                <th rowspan="2" class="text-center">삭제</th>
              </tr>
              <tr class="bg-slate-50">
                <th class="text-right text-[10px]">생산량(톤)</th>
                <th class="text-right text-[10px]">원단위(천원/톤)</th>
                <th class="text-right text-[10px] !border-r border-slate-200">재료비(억원)</th>
                <th class="text-right text-[10px] bg-blue-50/50">생산량(톤)</th>
                <th class="text-right text-[10px] bg-blue-50/50">원단위(천원/톤)</th>
                <th class="text-right text-[10px] !border-r border-slate-200 bg-blue-50/50">재료비(억원)</th>
                <th class="text-right text-[10px] bg-green-50/50">생산량효과</th>
                <th class="text-right text-[10px] bg-green-50/50">원단위효과</th>
                <th class="text-right text-[10px] bg-green-50/50">총손익(억원)</th>
              </tr>
            </thead>
            <tbody id="sim-profit-body"></tbody>
            <tfoot id="sim-profit-foot"></tfoot>
          </table>
        </div>
      </div>

      <!-- Chart: Profit by Product -->
      <div class="card p-5">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">지종별 손익 효과 비교</h3>
        <div style="height:250px; position:relative;">
          <canvas id="simProfitChart"></canvas>
        </div>
      </div>
    </div>

    <!-- 전월 대비 예상 손익 (메인 탭 래퍼) -->
    <div id="content-profitanalysis" class="hidden fade-in space-y-4">
      <!-- 서브탭 네비게이션 (상단 고정) -->
      <div class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm pt-2 pb-2 -mx-1 px-1 border-b border-slate-100 shadow-sm" id="pa-sticky-header">
        <!-- 데이터 소스 선택 (서브탭 위) -->
        <div class="flex items-center gap-3 mb-2 px-1" id="sim-source-panel">
          <span class="text-[10px] font-semibold text-gray-500 uppercase"><i class="fas fa-database mr-1"></i>데이터 소스</span>
          <label class="flex items-center gap-1.5 cursor-pointer group" id="sim-source-manual-label">
            <input type="radio" name="sim-source" value="manual" id="sim-source-manual" onchange="onSimSourceChange()" disabled class="accent-emerald-500 w-3 h-3">
            <span class="text-[11px] text-gray-600 group-hover:text-gray-800">
              <i class="fas fa-pen-to-square text-emerald-500 mr-0.5"></i>수기입력
              <span id="sim-source-manual-info" class="text-[10px] text-gray-400">(미저장)</span>
            </span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer group">
            <input type="radio" name="sim-source" value="actual" id="sim-source-actual" onchange="onSimSourceChange()" checked class="accent-blue-500 w-3 h-3">
            <span class="text-[11px] text-gray-600 group-hover:text-gray-800">
              <i class="fas fa-chart-bar text-blue-500 mr-0.5"></i>전월 실적
            </span>
          </label>
          <span id="sim-source-notice" class="text-[10px] text-amber-600 hidden"><i class="fas fa-exclamation-triangle mr-0.5"></i>수기입력 미저장</span>
        </div>
        <!-- 서브탭 버튼 -->
        <div class="flex items-center gap-2">
          <button onclick="switchProfitSub('forecast')" id="pa-tab-forecast" class="pill-tab pill-tab-active text-xs !px-4 !py-2">
            <i class="fas fa-chart-area mr-1.5"></i>전월 대비 예상
          </button>
          <button onclick="switchProfitSub('detail')" id="pa-tab-detail" class="pill-tab pill-tab-inactive text-xs !px-4 !py-2">
            <i class="fas fa-table mr-1.5"></i>상세 분석표
          </button>
          <button onclick="switchProfitSub('simulation')" id="pa-tab-simulation" class="pill-tab pill-tab-inactive text-xs !px-4 !py-2">
            <i class="fas fa-flask mr-1.5"></i>시뮬레이션
          </button>
        </div>
      </div>

    <!-- Forecast Tab (전월 대비 예상 실적) -->
    <div id="content-forecast" class="fade-in space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-chart-area text-sage-500 mr-1.5"></i>전월 대비 예상 실적</h3>
          <div id="fc-machine-btns" class="flex items-center gap-1">
            <button onclick="setFcMachineFilter('PM2')" id="fc-mc-pm2" class="pill-tab pill-tab-active text-xs !px-3 !py-1">PM2</button>
            <button onclick="setFcMachineFilter('PM3')" id="fc-mc-pm3" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">PM3</button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400" id="fc-period-label"></span>
          <span id="fc-manual-badge" class="hidden text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium"><i class="fas fa-link mr-0.5"></i>수기입력 연동</span>
        </div>
      </div>

      <!-- 상단: 생산량 요약 (당월 실적 + 차월 예상) -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b">
                <th class="px-2 py-1.5 text-left font-semibold text-gray-600 w-20"></th>
                <th colspan="2" class="px-2 py-1.5 text-center font-semibold text-blue-700 border-l border-slate-200" id="fc-cur-header">당월 (실적)</th>
                <th colspan="2" class="px-2 py-1.5 text-center font-semibold text-emerald-700 border-l border-slate-200" id="fc-next-header">차월 (예상)</th>
              </tr>
              <tr class="bg-slate-50/50 border-b text-[10px] text-gray-500">
                <th class="px-2 py-1"></th>
                <th class="px-2 py-1 text-center border-l border-slate-200">지종</th>
                <th class="px-2 py-1 text-right">생산량(톤)</th>
                <th class="px-2 py-1 text-center border-l border-slate-200">지종</th>
                <th class="px-2 py-1 text-right">생산량(톤)</th>
              </tr>
            </thead>
            <tbody id="fc-prod-body"></tbody>
            <tfoot id="fc-prod-foot"></tfoot>
          </table>
        </div>
      </div>

      <!-- 하단: 자재별 상세 (좌: 당월실적 | 중앙: 차월예상 | 우: 손익효과) -->
      <div class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="text-xs font-semibold text-gray-700"><i class="fas fa-cubes text-primary-400 mr-1.5"></i>자재별 원가 상세</h3>
            <select id="fc-product-filter" class="border border-gray-200 rounded-lg px-2 py-1 text-[10px] focus:ring-1 focus:ring-emerald-200" onchange="filterFcByProduct()">
              <option value="">전체 자재</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="downloadFcExcel()" class="text-[10px] px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"><i class="fas fa-download mr-1"></i>엑셀 다운로드</button>
            <label class="text-[10px] px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"><i class="fas fa-upload mr-1"></i>엑셀 업로드<input type="file" accept=".xlsx,.xls" class="hidden" onchange="uploadFcExcel(event)"></label>
          </div>
        </div>
        <div class="overflow-x-auto" style="max-height:calc(100vh - 320px)">
          <table class="w-full text-[11px] border-collapse whitespace-nowrap" id="fc-detail-table">
            <thead class="sticky top-0 z-10">
              <tr class="bg-slate-100 border-b">
                <th colspan="2" class="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-slate-300" rowspan="2">구분 / 자재</th>
                <th colspan="5" class="px-2 py-1.5 text-center font-semibold text-blue-700 border-r border-slate-300" id="fc-detail-cur-header">당월 (실적)</th>
                <th colspan="7" class="px-2 py-1.5 text-center font-semibold text-emerald-700 border-r border-slate-300" id="fc-detail-next-header">차월 (예상)</th>
                <th colspan="3" class="px-2 py-1.5 text-center font-semibold text-amber-700" id="fc-detail-diff-header">손익 효과</th>
                <th class="px-2 py-1.5 text-center font-semibold text-gray-500 border-l border-slate-300" rowspan="2">이슈사항</th>
              </tr>
              <tr class="bg-slate-50 border-b text-[10px] text-gray-500">
                <th class="px-1.5 py-1 text-right border-l border-slate-200">사용량(kg)</th>
                <th class="px-1.5 py-1 text-right">원단위(kg/톤)</th>
                <th class="px-1.5 py-1 text-right">사용단가(원/kg)</th>
                <th class="px-1.5 py-1 text-right">비용(억원)</th>
                <th class="px-1.5 py-1 text-right border-r border-slate-300">톤당비용(천원/톤)</th>
                <th class="px-1.5 py-1 text-right">사용량(kg)</th>
                <th class="px-1.5 py-1 text-right">원단위(kg/톤)</th>
                <th class="px-1.5 py-1 text-right">입고단가(원/kg)</th>
                <th class="px-1.5 py-1 text-right">기초재고단가</th>
                <th class="px-1.5 py-1 text-right">사용단가(원/kg)</th>
                <th class="px-1.5 py-1 text-right">비용(억원)</th>
                <th class="px-1.5 py-1 text-right border-r border-slate-300">톤당비용(천원/톤)</th>
                <th class="px-1.5 py-1 text-right">사용량차이(억원)</th>
                <th class="px-1.5 py-1 text-right">단가차이(억원)</th>
                <th class="px-1.5 py-1 text-right border-r border-slate-300">재료비종합(억원)</th>
              </tr>
            </thead>
            <tbody id="fc-detail-body"></tbody>
            <tfoot id="fc-detail-foot"></tfoot>
          </table>
        </div>
      </div>
    </div>
    </div><!-- /content-profitanalysis -->

    <!-- ========== 시뮬레이션 플로우 탭 ========== -->
    <div id="content-simflow" class="hidden fade-in">
      <!-- 통합 시뮬레이션 헤더 -->
      <div class="card px-5 py-4 mb-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-flask text-indigo-500 mr-1.5"></i>통합 시뮬레이션</h3>
            <p class="text-[11px] text-gray-400 mt-1">생산량 조절 · 지종 믹스 · 호기 배분 · 자재 구성 변경을 한 화면에서 시뮬레이션합니다.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-500">호기:</label>
              <select id="usim-machine" class="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-200" onchange="loadUnifiedSim()">
                <option value="PM2">PM2</option>
                <option value="PM3" selected>PM3</option>
              </select>
            </div>
            <button onclick="loadUnifiedSim()" class="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium shadow-sm"><i class="fas fa-sync-alt mr-1"></i>데이터 로드</button>
            <button onclick="resetUnifiedSim()" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-gray-600 hover:bg-slate-200 transition font-medium"><i class="fas fa-undo mr-1"></i>초기화</button>
          </div>
        </div>
      </div>

      <!-- Step 1~3 조건 설정 영역 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Step 1: 호기/생산량 -->
        <div class="card px-4 py-3">
          <h4 class="text-xs font-semibold text-gray-600 mb-3 flex items-center"><span class="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold mr-2">1</span>생산량 조절</h4>
          <div class="space-y-2" id="usim-production-inputs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] text-gray-500">전월 실적:</span>
              <span class="text-[11px] font-semibold text-gray-700" id="usim-prev-prod">-</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-[11px] text-gray-600 w-20">차월 생산량:</label>
              <input type="text" id="usim-prod-ton" class="flex-1 text-xs border border-slate-200 rounded px-2 py-1.5 text-right font-mono focus:ring-1 focus:ring-indigo-200" placeholder="톤" oninput="onUsimProdChange()">
              <span class="text-[10px] text-gray-400">톤</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-gray-400">변동률:</span>
              <span class="text-[11px] font-semibold" id="usim-prod-pct">-</span>
            </div>
          </div>
        </div>

        <!-- Step 2: 지종 믹스 -->
        <div class="card px-4 py-3">
          <h4 class="text-xs font-semibold text-gray-600 mb-3 flex items-center"><span class="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold mr-2">2</span>지종 믹스 (생산 비중)</h4>
          <div class="space-y-1.5" id="usim-grade-mix">
            <div class="text-[10px] text-gray-400 italic">데이터 로드 후 표시됩니다</div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[10px] text-gray-400">합계:</span>
            <span class="text-[11px] font-bold" id="usim-grade-total">100%</span>
          </div>
        </div>

        <!-- Step 3: 자재 구성 변경 -->
        <div class="card px-4 py-3">
          <h4 class="text-xs font-semibold text-gray-600 mb-3 flex items-center"><span class="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-[10px] font-bold mr-2">3</span>자재 구성 변경</h4>
          <div class="space-y-2" id="usim-mat-changes">
            <div class="text-[10px] text-gray-400 italic">아래 자재 목록에서 변경사항을 추가하세요</div>
          </div>
          <div class="mt-2 flex gap-2">
            <button onclick="openMatChangeModal('replace')" class="flex-1 text-[10px] px-2 py-1.5 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition font-medium"><i class="fas fa-exchange-alt mr-1"></i>대체</button>
            <button onclick="openMatChangeModal('ratio')" class="flex-1 text-[10px] px-2 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition font-medium"><i class="fas fa-percentage mr-1"></i>비율</button>
            <button onclick="openMatChangeModal('add')" class="flex-1 text-[10px] px-2 py-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition font-medium"><i class="fas fa-plus mr-1"></i>신규</button>
          </div>
        </div>
      </div>

      <!-- 실행 버튼 -->
      <div class="flex items-center justify-center mb-4">
        <button onclick="runUnifiedSim()" class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]">
          <i class="fas fa-play mr-2"></i>시뮬레이션 실행
        </button>
      </div>

      <!-- 결과 영역 -->
      <div id="usim-result-area" class="hidden space-y-4">
        <!-- 요약 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="card px-4 py-3 text-center">
            <div class="text-[10px] text-gray-400 uppercase font-semibold">전월 원단위</div>
            <div class="text-lg font-bold text-gray-700 mt-1" id="usim-r-base-uc">-</div>
            <div class="text-[10px] text-gray-400">천원/톤</div>
          </div>
          <div class="card px-4 py-3 text-center">
            <div class="text-[10px] text-gray-400 uppercase font-semibold">시뮬 원단위</div>
            <div class="text-lg font-bold text-indigo-600 mt-1" id="usim-r-sim-uc">-</div>
            <div class="text-[10px] text-gray-400">천원/톤</div>
          </div>
          <div class="card px-4 py-3 text-center">
            <div class="text-[10px] text-gray-400 uppercase font-semibold">원단위 변화</div>
            <div class="text-lg font-bold mt-1" id="usim-r-uc-diff">-</div>
            <div class="text-[10px] text-gray-400">천원/톤</div>
          </div>
          <div class="card px-4 py-3 text-center">
            <div class="text-[10px] text-gray-400 uppercase font-semibold">절감/악화 금액</div>
            <div class="text-lg font-bold mt-1" id="usim-r-savings">-</div>
            <div class="text-[10px] text-gray-400">백만원</div>
          </div>
        </div>

        <!-- 변경사항 요약 -->
        <div class="card px-4 py-3" id="usim-changes-summary-card">
          <h4 class="text-xs font-semibold text-gray-600 mb-2"><i class="fas fa-list-check text-amber-500 mr-1.5"></i>적용된 변경사항</h4>
          <div id="usim-changes-summary" class="space-y-1"></div>
        </div>

        <!-- 상세 테이블 -->
        <div class="card overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h4 class="text-xs font-semibold text-gray-600"><i class="fas fa-table text-slate-400 mr-1.5"></i>자재별 비교 상세</h4>
            <button onclick="downloadUsimExcel()" class="text-[10px] px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"><i class="fas fa-download mr-1"></i>엑셀 다운로드</button>
          </div>
          <div class="overflow-x-auto" style="max-height:400px">
            <table class="w-full text-[11px] border-collapse whitespace-nowrap">
              <thead class="sticky top-0 z-10 bg-slate-50">
                <tr class="border-b">
                  <th class="px-2 py-2 text-left font-semibold text-gray-600">자재명</th>
                  <th class="px-2 py-2 text-left font-semibold text-gray-500 text-[10px]">그룹</th>
                  <th class="px-2 py-2 text-right font-semibold text-blue-600">전월 사용량(kg)</th>
                  <th class="px-2 py-2 text-right font-semibold text-blue-600">전월 단가(원/kg)</th>
                  <th class="px-2 py-2 text-right font-semibold text-blue-600">전월 비용(백만원)</th>
                  <th class="px-2 py-2 text-right font-semibold text-indigo-600">시뮬 사용량(kg)</th>
                  <th class="px-2 py-2 text-right font-semibold text-indigo-600">시뮬 단가(원/kg)</th>
                  <th class="px-2 py-2 text-right font-semibold text-indigo-600">시뮬 비용(백만원)</th>
                  <th class="px-2 py-2 text-right font-semibold text-amber-600">차이(백만원)</th>
                  <th class="px-2 py-2 text-center font-semibold text-gray-500">상태</th>
                </tr>
              </thead>
              <tbody id="usim-detail-body"></tbody>
              <tfoot id="usim-detail-foot" class="bg-slate-50 font-semibold"></tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- 자재 구성 변경 모달 -->
      <div id="usim-mat-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-700" id="usim-modal-title">자재 구성 변경</h3>
            <button onclick="closeMatChangeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
          </div>
          <div class="px-5 py-4 overflow-y-auto" style="max-height:calc(80vh - 140px)">
            <!-- 모달 내용은 JS에서 동적 생성 -->
            <div id="usim-modal-body"></div>
          </div>
          <div class="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
            <button onclick="closeMatChangeModal()" class="px-4 py-2 text-xs rounded-lg bg-slate-100 text-gray-600 hover:bg-slate-200">취소</button>
            <button onclick="applyMatChange()" class="px-4 py-2 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium shadow-sm">적용</button>
          </div>
        </div>
      </div>
    </div><!-- /content-simflow -->

    <!-- ============ 가동시간 (Operating Time) ============ -->
    <div id="content-optime" class="hidden fade-in">
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- 헤더 -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-clock text-amber-500 mr-1.5"></i>월별 가동시간 관리</h3>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">계획운휴 + 가동일수 + 비가동일수 = 총 조업일수</span>
          </div>
          <div class="flex items-center gap-2">
            <select id="ot-year" class="text-xs border border-gray-200 rounded-lg px-2 py-1" onchange="loadOperatingTime()">
              <option value="2026">2026</option><option value="2025">2025</option>
            </select>
            <select id="ot-month" class="text-xs border border-gray-200 rounded-lg px-2 py-1" onchange="loadOperatingTime()">
              <option value="01">1월</option><option value="02">2월</option><option value="03">3월</option>
              <option value="04">4월</option><option value="05">5월</option><option value="06" selected>6월</option>
              <option value="07">7월</option><option value="08">8월</option><option value="09">9월</option>
              <option value="10">10월</option><option value="11">11월</option><option value="12">12월</option>
            </select>
            <button onclick="saveOperatingTime()" class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm">
              <i class="fas fa-save mr-1"></i>저장
            </button>
          </div>
        </div>

        <!-- 요약 카드 -->
        <div id="ot-summary-cards" class="px-6 py-3 bg-gradient-to-r from-amber-50/50 to-white border-b border-slate-100">
          <div class="flex items-center gap-4">
            <div class="text-center">
              <p class="text-[10px] text-gray-400">가동일수 소계</p>
              <p id="ot-total-operating" class="text-base font-bold text-gray-800">-</p>
            </div>
            <div class="w-px h-8 bg-slate-200"></div>
            <div class="text-center">
              <p class="text-[10px] text-gray-400">가동률</p>
              <p id="ot-utilization" class="text-base font-bold text-emerald-600">-</p>
            </div>
            <div class="w-px h-8 bg-slate-200"></div>
            <div class="text-center">
              <p class="text-[10px] text-gray-400">최대 생산능력</p>
              <p id="ot-max-production" class="text-base font-bold text-blue-600">-</p>
            </div>
            <div class="w-px h-8 bg-slate-200"></div>
            <div class="text-center">
              <p class="text-[10px] text-gray-400">비가동 소계</p>
              <p id="ot-total-stop" class="text-base font-bold text-red-500">-</p>
            </div>
            <div class="w-px h-8 bg-slate-200"></div>
            <div class="text-center">
              <p class="text-[10px] text-gray-400">계획운휴</p>
              <p id="ot-shutdown" class="text-base font-bold text-orange-500">-</p>
            </div>
          </div>
        </div>

        <!-- 입력 테이블 -->
        <div class="px-6 py-4 overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50 text-gray-500">
                <th class="px-2 py-2 text-left font-medium" rowspan="2">호기</th>
                <th class="px-2 py-2 text-center font-medium" rowspan="2">월<br>총일수</th>
                <th class="px-2 py-2 text-center font-medium bg-orange-50 text-orange-600" rowspan="2">계획<br>운휴</th>
                <th class="px-2 py-2 text-center font-medium bg-emerald-50 text-emerald-600" colspan="6">가동일수</th>
                <th class="px-2 py-2 text-center font-medium bg-red-50 text-red-500" colspan="4">비가동일수</th>
                <th class="px-2 py-2 text-center font-medium text-blue-600" rowspan="2">최대생산<br><span class="text-[9px]">(톤)</span></th>
                <th class="px-2 py-2 text-center font-medium" rowspan="2">비고</th>
              </tr>
              <tr class="bg-slate-50 text-gray-500 text-[10px]">
                <th class="px-1 py-1 text-center text-emerald-600">정상</th>
                <th class="px-1 py-1 text-center text-emerald-600">폐품</th>
                <th class="px-1 py-1 text-center text-emerald-600">비계획</th>
                <th class="px-1 py-1 text-center text-emerald-600">초출</th>
                <th class="px-1 py-1 text-center text-emerald-600">절지</th>
                <th class="px-1 py-1 text-center font-bold text-emerald-700 bg-emerald-100">소계</th>
                <th class="px-1 py-1 text-center text-red-500">정비</th>
                <th class="px-1 py-1 text-center text-red-500">세척</th>
                <th class="px-1 py-1 text-center text-red-500">사고등</th>
                <th class="px-1 py-1 text-center font-bold text-red-600 bg-red-100">소계</th>
              </tr>
            </thead>
            <tbody id="ot-table-body">
              <tr><td colspan="11" class="text-center py-8 text-gray-400">로딩 중...</td></tr>
            </tbody>
            <tfoot id="ot-table-foot" class="bg-slate-50 font-semibold border-t-2 border-slate-200">
            </tfoot>
          </table>
        </div>

        <!-- 시간당 생산능력 설정 -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-semibold text-gray-600"><i class="fas fa-tachometer-alt text-blue-400 mr-1"></i>호기별 시간당 생산능력 (톤/시간)</h4>
            <button onclick="saveCapacity()" class="px-2 py-1 bg-blue-500 text-white text-[10px] font-semibold rounded hover:bg-blue-600 transition">
              <i class="fas fa-save mr-0.5"></i>능력치 저장
            </button>
          </div>
          <div id="ot-capacity-container" class="flex flex-wrap gap-3">
            <!-- 동적 생성 -->
          </div>
        </div>
      </div>

      <!-- ============ 지종별 생산성 마스터 ============ -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-5">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-industry text-blue-500 mr-1.5"></i>지종별 생산성 마스터</h3>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">이론생산성 = 평량 × 지폭 × 선속 × 1440 × 10⁻⁹</span>
          </div>
          <div class="flex items-center gap-2">
            <select id="gp-machine-select" class="text-xs border border-gray-200 rounded-lg px-2 py-1" onchange="loadGradeProduction()">
              <!-- 동적: divisionMachines에서 -->
            </select>
            <button onclick="addGradeRow()" class="px-2 py-1 bg-blue-500 text-white text-[10px] font-semibold rounded hover:bg-blue-600 transition">
              <i class="fas fa-plus mr-0.5"></i>행 추가
            </button>
            <button onclick="saveGradeProduction()" class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm">
              <i class="fas fa-save mr-1"></i>저장
            </button>
          </div>
        </div>

        <!-- 요약 -->
        <div id="gp-summary" class="px-6 py-3 bg-gradient-to-r from-blue-50/50 to-white border-b border-slate-100">
          <div class="flex items-center gap-4 text-xs">
            <span class="text-gray-500">등록 지종: <strong id="gp-count" class="text-gray-800">-</strong>개</span>
            <span class="text-gray-500">가중평균 생산성: <strong id="gp-avg-prod" class="text-blue-700">-</strong> 톤/일</span>
            <span class="text-gray-500">폐품율: <strong id="gp-waste-rate" class="text-red-500">-</strong></span>
          </div>
        </div>

        <!-- 테이블 -->
        <div class="px-6 py-4 overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50 text-gray-500">
                <th class="px-2 py-2 text-left font-medium w-8">#</th>
                <th class="px-2 py-2 text-left font-medium">지종</th>
                <th class="px-2 py-2 text-center font-medium">평량<br><span class="text-[9px]">(g/㎡)</span></th>
                <th class="px-2 py-2 text-center font-medium">선속<br><span class="text-[9px]">(m/min)</span></th>
                <th class="px-2 py-2 text-center font-medium">지폭<br><span class="text-[9px]">(mm)</span></th>
                <th class="px-2 py-2 text-center font-medium text-blue-600">이론생산성<br><span class="text-[9px]">(톤/일)</span></th>
                <th class="px-2 py-2 text-center font-medium text-emerald-600">양품생산성<br><span class="text-[9px]">(톤/일)</span></th>
                <th class="px-2 py-2 text-center font-medium text-red-400">폐품율<br><span class="text-[9px]">(%)</span></th>
                <th class="px-2 py-2 text-center font-medium">비고</th>
                <th class="px-2 py-2 text-center font-medium w-8">삭제</th>
              </tr>
            </thead>
            <tbody id="gp-table-body">
              <tr><td colspan="10" class="text-center py-6 text-gray-400">호기를 선택하세요</td></tr>
            </tbody>
            <tfoot id="gp-table-foot" class="bg-slate-50 font-semibold border-t-2 border-slate-200">
            </tfoot>
          </table>
        </div>
      </div>

    </div><!-- /content-optime -->

  </main>

  <script>
    let analysisData = null, unitSummaryData = null, unitsCache = [], materialsCache = [];
    let productsCache = [], simResultData = null;
    let unitChartInstance = null, effectChartInstance = null, currentUnitFilter = '', uploadData = [];

    // ============ 사업부 (Division) 관리 ============
    var currentDivision = 'PS';  // 현재 활성 사업부
    var divisionConfig = null;   // 현재 사업부 설정 (API로부터)
    var divisionMachines = [];   // 현재 사업부 호기 목록

    // ============ 공통코드 (Common Codes) ============
    // CC 객체: 페이지 로드 시 /api/common-codes에서 fetch 후 캐싱
    // 모든 하드코딩 매핑(호기→플랜트, 호기→칩컬러, 호기→기본지종)을 대체
    var CC = {
      machines: [{code:'PM2',name:'제지 2호기'},{code:'PM3',name:'제지 3호기'}],  // fallback
      machinePlantMap: { 'PM2': 'P100', 'PM3': 'P100' },
      machineChipMap: { 'PM2': 'unit-chip-pm2', 'PM3': 'unit-chip-pm3' },
      machineDefaultGrades: { 'PM2': ['SC','IV','KB'], 'PM3': ['SC고평량','SC저평량','IV','ACB','CB'] },
      plants: [{ code: 'P100', name: '청주공장', location: '충북 청주' }],
      materialGroups: [],
      unitCostLabel: '천원/톤',
      productionUnit: '톤',
      usageUnit: 'kg'
    };

    /** 공통코드 로드 (division 변경 시 호출) */
    async function loadCommonCodes(div) {
      try {
        var res = await fetch('/api/common-codes?division=' + (div || currentDivision));
        if (!res.ok) return;
        var data = await res.json();
        CC.machines = data.machines || CC.machines;
        CC.machinePlantMap = data.machinePlantMap || CC.machinePlantMap;
        CC.machineChipMap = data.machineChipMap || CC.machineChipMap;
        CC.machineDefaultGrades = data.machineDefaultGrades || CC.machineDefaultGrades;
        CC.plants = data.plants || CC.plants;
        CC.materialGroups = data.materialGroups || CC.materialGroups;
        CC.unitCostLabel = data.unitCostLabel || CC.unitCostLabel;
        CC.productionUnit = data.productionUnit || CC.productionUnit;
        CC.usageUnit = data.usageUnit || CC.usageUnit;
      } catch(e) { console.warn('Common codes load error:', e); }
    }

    async function onDivisionChange() {
      var sel = document.getElementById('divisionSelect');
      currentDivision = sel.value;
      try {
        // 공통코드 + 사업부 설정 동시 로드
        await loadCommonCodes(currentDivision);
        var res = await fetch('/api/divisions/' + currentDivision);
        divisionConfig = await res.json();
        divisionMachines = divisionConfig.machines || [];
        updateMachineSelects();
        updateDivisionUI();

        // 현재 활성 탭에 따라 데이터 재조회
        var activeTab = document.querySelector('.pill-tab-active');
        var tabId = '';
        if (activeTab) {
          var onclick = activeTab.getAttribute('onclick') || '';
          var match = onclick.match(/switchTab\(['"](\w+)['"]\)/);
          if (match) tabId = match[1];
        }
        // 어떤 탭이든 대시보드 데이터 재로드
        await loadAnalysis();
      } catch(e) {
        console.error('Division change error:', e);
      }
    }

    function updateMachineSelects() {
      if (!divisionMachines || !divisionMachines.length) return;
      
      // 1) select 드롭다운 업데이트 (id 기반)
      var selectIds = ['dv-unit', 'cr-machine-select', 'excl-machine', 'usim-machine'];
      selectIds.forEach(function(id) {
        var sel = document.getElementById(id);
        if (!sel) return;
        var currentVal = sel.value;
        var html = '';
        if (id === 'dv-unit') html = '<option value="">전체 호기</option>';
        divisionMachines.forEach(function(m) {
          html += '<option value="' + m.code + '">' + m.code + ' (' + m.name + ')</option>';
        });
        sel.innerHTML = html;
        // 기존 값 유지 시도, 없으면 첫 번째 호기 선택
        if (currentVal && sel.querySelector('option[value="' + currentVal + '"]')) {
          sel.value = currentVal;
        } else if (divisionMachines.length > 0) {
          sel.value = id === 'dv-unit' ? '' : divisionMachines[0].code;
        }
      });

      // 2) 버튼형 호기 선택 (수동입력, 예상손익 탭)
      var mnBtnContainer = document.getElementById('mn-machine-btns');
      if (mnBtnContainer) {
        var btnHtml = '';
        divisionMachines.forEach(function(m, idx) {
          var cls = idx === 0 ? 'pill-tab pill-tab-active text-xs !px-3 !py-1' : 'pill-tab pill-tab-inactive text-xs !px-3 !py-1';
          btnHtml += '<button onclick="setManualMachine(' + String.fromCharCode(39) + m.code + String.fromCharCode(39) + ')" id="mn-mc-' + m.code.toLowerCase() + '" class="' + cls + '">' + m.code + '</button>';
        });
        mnBtnContainer.innerHTML = btnHtml;
        // 기본 호기 업데이트
        if (typeof mnMachine !== 'undefined') mnMachine = divisionMachines[0].code;
      }

      var fcBtnContainer = document.getElementById('fc-machine-btns');
      if (fcBtnContainer) {
        var btnHtml = '';
        divisionMachines.forEach(function(m, idx) {
          var cls = idx === 0 ? 'pill-tab pill-tab-active text-xs !px-3 !py-1' : 'pill-tab pill-tab-inactive text-xs !px-3 !py-1';
          btnHtml += '<button onclick="setFcMachineFilter(' + String.fromCharCode(39) + m.code + String.fromCharCode(39) + ')" id="fc-mc-' + m.code.toLowerCase() + '" class="' + cls + '">' + m.code + '</button>';
        });
        fcBtnContainer.innerHTML = btnHtml;
        // 기본 호기 업데이트
        if (typeof fcMachineFilter !== 'undefined') fcMachineFilter = divisionMachines[0].code;
      }

      // 3) 플랜트 select 동적 업데이트 (공통코드 기반)
      var plantSelect = document.getElementById('inv-plant-filter');
      if (plantSelect && CC.plants && CC.plants.length) {
        var plantHtml = '<option value="">전체</option>';
        CC.plants.forEach(function(p) {
          plantHtml += '<option value="' + p.code + '">' + p.code + ' (' + p.name + ')</option>';
        });
        plantSelect.innerHTML = plantHtml;
      }

      // 4) 업로드 안내 호기 예시 동적 업데이트
      var uploadMcExample = document.getElementById('upload-machine-example');
      if (uploadMcExample && divisionMachines.length) {
        uploadMcExample.textContent = divisionMachines.map(function(m){ return m.code || m; }).join(', ');
      }
    }

    function updateDivisionUI() {
      // 사업부에 따른 UI 라벨 업데이트
      var badge = document.getElementById('division-badge');
      if (badge && divisionConfig) {
        badge.textContent = divisionConfig.name;
        badge.className = currentDivision === 'PS' 
          ? 'text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold'
          : 'text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold';
      }
    }

    function getDivisionParam() {
      return '&division=' + currentDivision;
    }

    // 숫자 입력 필드 천원단위 쉼표 포맷팅 유틸
    function commaVal(el) {
      var raw = el.value.replace(/[^0-9.\-]/g, '');
      if (raw === '' || raw === '-') { el.value = raw; return; }
      var num = parseFloat(raw);
      if (isNaN(num)) { el.value = ''; return; }
      el.value = Math.round(num).toLocaleString('ko-KR');
    }
    function parseComma(v) {
      if (!v) return 0;
      return parseFloat(String(v).replace(/,/g, '')) || 0;
    }
    function setCommaInput(el, val) {
      if (val == null || val === '') { el.value = ''; return; }
      var n = parseFloat(String(val).replace(/,/g, ''));
      if (isNaN(n)) { el.value = ''; return; }
      el.value = Math.round(n).toLocaleString('ko-KR');
    }

    document.addEventListener('DOMContentLoaded', async () => {
      // 공통코드 초기 로드 (모든 매핑 정보 한 번에 가져오기)
      await loadCommonCodes(currentDivision);

      // 사업부 설정 초기 로드
      try {
        var divRes = await fetch('/api/divisions/' + currentDivision);
        divisionConfig = await divRes.json();
        divisionMachines = divisionConfig.machines || [];
        updateMachineSelects();
      } catch(e) { console.warn('Division config load failed:', e); }

      // 가용 월 목록에서 최신 데이터 월의 다음 달을 기본값으로 설정
      // (시스템 로직: 선택월 = 예상월, 실적 = 선택월-1)
      // 따라서 최신 데이터가 202605이면 → 분석월을 6으로 설정 (5월 실적 → 6월 예상)
      try {
        var months = await fetch('/api/available-months?division=' + currentDivision).then(function(r){return r.json();});
        if (months && months.length > 0) {
          var latestYm = months[0]; // 내림차순이므로 첫 번째가 최신
          var latestYear = parseInt(latestYm.substring(0, 4));
          var latestMonth = parseInt(latestYm.substring(4, 6));
          // 다음 달로 설정 (예상월)
          var targetMonth = latestMonth + 1;
          var targetYear = latestYear;
          if (targetMonth > 12) { targetMonth = 1; targetYear++; }
          var yearSel = document.getElementById('analysisYear');
          var monthSel = document.getElementById('analysisMonth');
          if (yearSel) yearSel.value = String(targetYear);
          if (monthSel) monthSel.value = String(targetMonth);
        }
      } catch(e) { console.warn('가용월 로드 실패:', e); }
      await loadMasterData();
      await loadAnalysis();
    });

    // 천원단위 쉼표 자동 포맷팅 (blur: 쉼표추가, focus: 쉼표제거)
    document.addEventListener('focusin', function(e) {
      var el = e.target;
      if (!el || el.tagName !== 'INPUT') return;
      if (!el.classList.contains('comma-fmt')) return;
      var raw = String(el.value).replace(/,/g, '');
      el.value = raw;
    });
    document.addEventListener('focusout', function(e) {
      var el = e.target;
      if (!el || el.tagName !== 'INPUT') return;
      if (!el.classList.contains('comma-fmt')) return;
      var raw = String(el.value).replace(/,/g, '');
      if (raw === '' || raw === '-') return;
      var n = parseFloat(raw);
      if (isNaN(n)) return;
      el.value = Math.round(n).toLocaleString('ko-KR');
    });

    function switchTab(tab) {
      ['dashboard','detail','upload','dataview','master','simulation','forecast','datainput','manual','calcresult','profitanalysis','simflow','optime'].forEach(t => {
        document.getElementById('content-' + t)?.classList.add('hidden');
        const el = document.getElementById('tab-' + t);
        if (el) { el.classList.remove('pill-tab-active'); el.classList.add('pill-tab-inactive'); }
      });
      if (tab === 'datainput') {
        document.getElementById('content-datainput')?.classList.remove('hidden');
        var activeSub = document.querySelector('#content-datainput [id^="di-tab-"].pill-tab-active');
        var subId = activeSub ? activeSub.id.replace('di-tab-','') : 'upload';
        switchDataInputSub(subId);
      } else if (tab === 'forecast') {
        document.getElementById('content-profitanalysis')?.classList.remove('hidden');
        var activeSub = document.querySelector('[id^="pa-tab-"].pill-tab-active');
        var subId2 = activeSub ? activeSub.id.replace('pa-tab-','') : 'forecast';
        switchProfitSub(subId2);
      } else if (tab === 'simflow') {
        document.getElementById('content-simflow')?.classList.remove('hidden');
        loadUnifiedSim();
      } else if (tab === 'optime') {
        document.getElementById('content-optime')?.classList.remove('hidden');
        loadOperatingTime();
        initGpMachineSelect();
      } else {
        document.getElementById('content-' + tab)?.classList.remove('hidden');
      }
      const a = document.getElementById('tab-' + tab);
      if (a) { a.classList.add('pill-tab-active'); a.classList.remove('pill-tab-inactive'); }
      if (tab === 'master') { loadUnitsList(); loadMaterialsList(); loadMasterIdx(currentMidxTab); }
    }

    function switchDataInputSub(sub) {
      ['upload','dataview','manual','calcresult','inventory'].forEach(function(s) {
        var el = document.getElementById('content-' + s);
        if (el) el.classList.add('hidden');
        var btn = document.getElementById('di-tab-' + s);
        if (btn) { btn.classList.remove('pill-tab-active'); btn.classList.add('pill-tab-inactive'); }
      });
      var target = document.getElementById('content-' + sub);
      if (target) target.classList.remove('hidden');
      var activeBtn = document.getElementById('di-tab-' + sub);
      if (activeBtn) { activeBtn.classList.add('pill-tab-active'); activeBtn.classList.remove('pill-tab-inactive'); }
      if (sub === 'dataview') { initDataView(); }
      if (sub === 'manual') { loadManualData(); }
      if (sub === 'calcresult') { renderCalcResult(); }
      if (sub === 'inventory') { loadInventoryData(); }
    }

    function switchProfitSub(sub) {
      ['forecast','detail','simulation'].forEach(function(s) {
        var el = document.getElementById('content-' + s);
        if (el) el.classList.add('hidden');
        var btn = document.getElementById('pa-tab-' + s);
        if (btn) { btn.classList.remove('pill-tab-active'); btn.classList.add('pill-tab-inactive'); }
      });
      var target = document.getElementById('content-' + sub);
      if (target) target.classList.remove('hidden');
      var activeBtn = document.getElementById('pa-tab-' + sub);
      if (activeBtn) { activeBtn.classList.add('pill-tab-active'); activeBtn.classList.remove('pill-tab-inactive'); }

      // content-detail과 content-simulation은 content-profitanalysis 외부에 있으므로
      // 서브탭 전환 시 profitanalysis 내부로 이동시켜 sticky 헤더 아래에 표시
      var container = document.getElementById('content-profitanalysis');
      if (container && (sub === 'detail' || sub === 'simulation')) {
        var targetEl = document.getElementById('content-' + sub);
        if (targetEl && targetEl.parentNode !== container) {
          container.appendChild(targetEl);
        }
      }

      // 상단으로 스크롤
      var stickyEl = document.getElementById('pa-sticky-header');
      if (stickyEl) stickyEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (sub === 'forecast') { loadForecast(); }
      if (sub === 'detail') { loadDetailAnalysis(); }
      if (sub === 'simulation') { loadSimProfitBase(); }
    }

    function setUnitFilter(id) {
      currentUnitFilter = id;
      document.querySelectorAll('[id^="unit-btn-"]').forEach(b => { b.classList.remove('pill-tab-active'); b.classList.add('pill-tab-inactive'); });
      (id ? document.getElementById('unit-btn-'+id) : document.getElementById('unit-btn-all'))?.classList.add('pill-tab-active');
      (id ? document.getElementById('unit-btn-'+id) : document.getElementById('unit-btn-all'))?.classList.remove('pill-tab-inactive');
      loadAnalysis();
    }

    async function loadMasterData() {
      const [u, m, p] = await Promise.all([fetch('/api/units').then(r=>r.json()), fetch('/api/materials').then(r=>r.json()), fetch('/api/products').then(r=>r.json())]);
      unitsCache = u; materialsCache = m; productsCache = p;
    }

    // ============ 매핑 INDEX 기준정보 ============
    let currentMidxTab = 'material-mapping';

    function switchMasterIdx(tab) {
      currentMidxTab = tab;
      document.querySelectorAll('.midx-section').forEach(el => el.classList.add('hidden'));
      document.getElementById('midx-' + tab).classList.remove('hidden');
      ['material-mapping','exclusion-rules','paper-products','paper-raw','paper-sub','tissue-products','tissue-raw'].forEach(t => {
        const btn = document.getElementById('midx-tab-' + t);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(t === tab ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      if (tab === 'material-mapping') {
        loadMaterialMapping('all');
      } else if (tab === 'exclusion-rules') {
        loadExclusionRules();
      } else {
        loadMasterIdx(tab);
      }
    }

    // ---- 자재구분 매핑 ----
    let currentMappingFilter = 'all';

    async function loadMaterialMapping(filter) {
      currentMappingFilter = filter;
      ['all','mapped','unmapped'].forEach(f => {
        const btn = document.getElementById('mm-filter-' + f);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(f === filter ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      const res = await fetch('/api/master/material-mapping?filter=' + filter).then(r => r.json());
      document.getElementById('mapping-stat-total').textContent = '\uc804\uccb4: ' + res.total;
      document.getElementById('mapping-stat-mapped').textContent = '\ub9e4\ud551\uc644\ub8cc: ' + res.mapped_count;
      document.getElementById('mapping-stat-unmapped').textContent = '\ubbf8\ub9e4\ud551: ' + res.unmapped_count;
      _mappingData = res.data;
      renderMaterialMapping(res.data);
    }

    function renderMaterialMapping(data) {
      const tbody = document.getElementById('midx-material-mapping-body');
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-400 py-6">\ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(function(d, i) {
        var statusBadge = d.mapped_group
          ? '<span class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">\uc644\ub8cc</span>'
          : '<span class="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-medium">\ubbf8\ub9e4\ud551</span>';
        var categoryBadge = d.category === 'RAW'
          ? '<span class="px-1.5 py-0.5 bg-steel-50 text-steel-400 rounded text-[10px]">\uc6d0\uc7ac\ub8cc</span>'
          : '<span class="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">\ubd80\uc7ac\ub8cc</span>';
        var groupCell = d.mapped_group
          ? '<span class="px-2 py-0.5 bg-sage-50 text-sage-700 rounded text-[10px] font-medium">' + d.mapped_group + '</span>'
          : '<button onclick="assignMaterialGroup(' + i + ')" class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] hover:bg-sage-50 hover:text-sage-600 transition"><i class="fas fa-plus mr-0.5"></i>\ud560\ub2f9</button>';
        var sourceCell = d.mapping_source || '<span class="text-gray-300">-</span>';
        return '<tr class="hover:bg-sage-50/30' + (d.mapped_group ? '' : ' bg-red-50/20') + '">' +
          '<td class="!py-1.5 text-gray-400">' + (i+1) + '</td>' +
          '<td class="!py-1.5 font-mono text-[11px]">' + d.material_code_short + '</td>' +
          '<td class="!py-1.5">' + d.material_name + '</td>' +
          '<td class="!py-1.5"><span class="text-[10px] text-gray-500">' + (d.material_group_major_name || d.material_group_major) + '</span></td>' +
          '<td class="!py-1.5">' + categoryBadge + '</td>' +
          '<td class="!py-1.5">' + groupCell + '</td>' +
          '<td class="!py-1.5 text-[10px] text-gray-500">' + sourceCell + '</td>' +
          '<td class="!py-1.5 text-center">' + statusBadge + '</td>' +
          '</tr>';
      }).join('');
    }

    var _mappingData = [];
    async function assignMaterialGroup(idx) {
      var item = _mappingData[idx];
      if (!item) return;
      var group = prompt('\uc790\uc7ac\uad6c\ubd84\uba85\uc744 \uc785\ub825\ud558\uc138\uc694 (예: \uc811\uc9c0\ub958, LATEX\ub958, L-BKP \ub4f1):');
      if (!group) return;
      var targetTable = item.category === 'RAW' ? 'paper-raw' : 'paper-sub';
      await fetch('/api/master/material-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_code: item.material_code,
          material_name: item.material_name,
          material_group: group,
          target_table: targetTable
        })
      });
      loadMaterialMapping(currentMappingFilter);
    }

    // 자재구분 매핑 모달 닫기
    function closeMappingModal() {
      var modal = document.getElementById('mapping-upload-modal');
      if (modal) modal.remove();
    }

    // 자재구분 매핑 엑셀 업로드
    async function uploadMappingExcel(event) {
      var file = event.target.files[0];
      if (!file) return;
      event.target.value = '';

      var reader = new FileReader();
      reader.onload = async function(e) {
        try {
          var data = new Uint8Array(e.target.result);
          var workbook = XLSX.read(data, { type: 'array' });
          var ws = workbook.Sheets[workbook.SheetNames[0]];
          var rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

          if (!rows || rows.length === 0) {
            alert('엑셀 파일에 데이터가 없습니다.');
            return;
          }

          // 컬럼 매핑 탐색 (유연하게 매핑)
          var firstRow = rows[0];
          var keys = Object.keys(firstRow);

          // 자재코드 컬럼 찾기
          var codeKey = keys.find(function(k) { return /자재코드|material.?code|코드/i.test(k); }) || keys[0];
          // 자재명 컬럼 찾기
          var nameKey = keys.find(function(k) { return /자재명|material.?name|명/i.test(k); }) || keys[1];
          // 자재구분(매핑) 컬럼 찾기
          var groupKey = keys.find(function(k) { return /자재구분|자재그룹|material.?group|구분|매핑/i.test(k); }) || keys[2];
          // 대상테이블 컬럼 찾기
          var tableKey = keys.find(function(k) { return /대상|테이블|target|table|원재료|부재료|화장지/i.test(k); }) || null;

          // 미리보기 모달 표시
          var previewHtml = '<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" id="mapping-upload-modal">';
          previewHtml += '<div class="bg-white rounded-xl shadow-2xl w-[750px] max-h-[80vh] flex flex-col">';
          previewHtml += '<div class="p-4 border-b flex items-center justify-between">';
          previewHtml += '<div><h3 class="font-bold text-sm">자재구분 매핑 엑셀 업로드 미리보기</h3>';
          previewHtml += '<p class="text-xs text-gray-500 mt-0.5">총 ' + rows.length + '건 | 컬럼: ' + keys.join(', ') + '</p></div>';
          previewHtml += '<button onclick="closeMappingModal()" class="text-gray-400 hover:text-gray-600 text-lg"><i class="fas fa-times"></i></button></div>';

          // 컬럼 매핑 설정
          previewHtml += '<div class="p-4 bg-slate-50 border-b">';
          previewHtml += '<div class="text-xs font-medium text-gray-700 mb-2"><i class="fas fa-columns mr-1"></i>컬럼 매핑 설정</div>';
          previewHtml += '<div class="grid grid-cols-4 gap-3">';
          // 자재코드
          previewHtml += '<div><label class="text-[10px] text-gray-500 block mb-0.5">자재코드</label>';
          previewHtml += '<select id="mm-col-code" class="w-full text-xs border rounded px-2 py-1">';
          keys.forEach(function(k) { previewHtml += '<option value="'+k+'"'+(k===codeKey?' selected':'')+'>'+k+'</option>'; });
          previewHtml += '</select></div>';
          // 자재명
          previewHtml += '<div><label class="text-[10px] text-gray-500 block mb-0.5">자재명</label>';
          previewHtml += '<select id="mm-col-name" class="w-full text-xs border rounded px-2 py-1">';
          keys.forEach(function(k) { previewHtml += '<option value="'+k+'"'+(k===nameKey?' selected':'')+'>'+k+'</option>'; });
          previewHtml += '</select></div>';
          // 자재구분
          previewHtml += '<div><label class="text-[10px] text-gray-500 block mb-0.5">자재구분(매핑)</label>';
          previewHtml += '<select id="mm-col-group" class="w-full text-xs border rounded px-2 py-1">';
          keys.forEach(function(k) { previewHtml += '<option value="'+k+'"'+(k===groupKey?' selected':'')+'>'+k+'</option>'; });
          previewHtml += '</select></div>';
          // 대상테이블
          previewHtml += '<div><label class="text-[10px] text-gray-500 block mb-0.5">대상테이블</label>';
          previewHtml += '<select id="mm-col-table" class="w-full text-xs border rounded px-2 py-1">';
          previewHtml += '<option value="">(일괄 지정)</option>';
          keys.forEach(function(k) { previewHtml += '<option value="'+k+'"'+(tableKey && k===tableKey?' selected':'')+'>'+k+'</option>'; });
          previewHtml += '</select></div>';
          previewHtml += '</div>';
          // 일괄 대상테이블 지정
          previewHtml += '<div class="mt-2 flex items-center gap-2">';
          previewHtml += '<span class="text-[10px] text-gray-500">일괄 대상테이블:</span>';
          previewHtml += '<select id="mm-bulk-table" class="text-xs border rounded px-2 py-1">';
          previewHtml += '<option value="paper-raw">제지 원재료</option>';
          previewHtml += '<option value="paper-sub">제지 부재료</option>';
          previewHtml += '<option value="tissue-raw">화장지 원재료</option>';
          previewHtml += '</select>';
          previewHtml += '<span class="text-[10px] text-gray-400">(대상테이블 컬럼이 없거나 비어있을 때 사용)</span>';
          previewHtml += '</div></div>';

          // 데이터 미리보기 테이블
          previewHtml += '<div class="p-4 overflow-y-auto flex-1">';
          previewHtml += '<table class="data-table text-xs w-full">';
          previewHtml += '<thead><tr><th class="!py-1.5">#</th>';
          keys.forEach(function(k) { previewHtml += '<th class="!py-1.5">'+k+'</th>'; });
          previewHtml += '</tr></thead><tbody>';
          var previewCount = Math.min(rows.length, 20);
          for (var pi = 0; pi < previewCount; pi++) {
            previewHtml += '<tr>';
            previewHtml += '<td class="!py-1 text-gray-400">' + (pi+1) + '</td>';
            keys.forEach(function(k) { previewHtml += '<td class="!py-1">' + (rows[pi][k] || '') + '</td>'; });
            previewHtml += '</tr>';
          }
          if (rows.length > 20) {
            previewHtml += '<tr><td colspan="'+(keys.length+1)+'" class="text-center text-gray-400 !py-2">... 외 ' + (rows.length - 20) + '건</td></tr>';
          }
          previewHtml += '</tbody></table></div>';

          // 버튼
          previewHtml += '<div class="p-4 border-t flex justify-end gap-2">';
          previewHtml += '<button onclick="closeMappingModal()" class="px-4 py-2 text-xs text-gray-600 border rounded-lg hover:bg-gray-50">취소</button>';
          previewHtml += '<button onclick="confirmMappingUpload()" class="px-4 py-2 text-xs bg-sage-600 text-white rounded-lg hover:bg-sage-700 font-medium"><i class="fas fa-upload mr-1"></i>업로드 확인 (' + rows.length + '건)</button>';
          previewHtml += '</div></div></div>';

          document.body.insertAdjacentHTML('beforeend', previewHtml);

          // 업로드 데이터를 전역에 저장
          window._mappingUploadRows = rows;
        } catch(err) {
          alert('엑셀 파싱 오류: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    async function confirmMappingUpload() {
      var rows = window._mappingUploadRows;
      if (!rows || rows.length === 0) return;

      var codeKey = document.getElementById('mm-col-code').value;
      var nameKey = document.getElementById('mm-col-name').value;
      var groupKey = document.getElementById('mm-col-group').value;
      var tableKey = document.getElementById('mm-col-table').value;
      var bulkTable = document.getElementById('mm-bulk-table').value;

      // 데이터 변환
      var items = rows.map(function(row) {
        var targetTable = '';
        if (tableKey && row[tableKey]) {
          var tv = String(row[tableKey]).trim();
          if (/원재료|paper.?raw|제지.*원/i.test(tv)) targetTable = 'paper-raw';
          else if (/부재료|paper.?sub|제지.*부/i.test(tv)) targetTable = 'paper-sub';
          else if (/화장지|tissue/i.test(tv)) targetTable = 'tissue-raw';
          else targetTable = tv;
        }
        if (!targetTable) targetTable = bulkTable;

        return {
          material_code: String(row[codeKey] || '').trim(),
          material_name: String(row[nameKey] || '').trim(),
          material_group: String(row[groupKey] || '').trim(),
          target_table: targetTable
        };
      }).filter(function(item) {
        return item.material_code && item.material_group;
      });

      if (items.length === 0) {
        alert('유효한 데이터가 없습니다. 자재코드와 자재구분이 모두 필요합니다.');
        return;
      }

      // 업로드 확인
      var uploadBtn = document.querySelector('#mapping-upload-modal button[onclick="confirmMappingUpload()"]');
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>업로드 중...';
      }

      try {
        var resp = await fetch('/api/master/material-mapping/bulk-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items })
        });
        var result = await resp.json();

        document.getElementById('mapping-upload-modal').remove();
        window._mappingUploadRows = null;

        if (result.success) {
          var msg = '업로드 완료!\\n';
          msg += '- 신규 등록: ' + result.inserted + '건\\n';
          msg += '- 업데이트: ' + result.updated + '건\\n';
          if (result.skipped > 0) msg += '- 건너뜀: ' + result.skipped + '건\\n';
          if (result.errors && result.errors.length > 0) msg += '\\n오류:\\n' + result.errors.join('\\n');
          alert(msg);
          loadMaterialMapping(currentMappingFilter);
        } else {
          alert('업로드 실패: ' + (result.error || 'Unknown error'));
        }
      } catch(err) {
        alert('업로드 오류: ' + err.message);
        if (uploadBtn) {
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = '<i class="fas fa-upload mr-1"></i>업로드 확인';
        }
      }
    }

    // 자재구분 매핑 양식 다운로드 (미매핑 자재 리스트 포함)
    async function downloadMappingTemplate() {
      try {
        var res = await fetch('/api/master/material-mapping?filter=unmapped').then(function(r){return r.json();});
        var unmappedList = (res && res.data) ? res.data : [];
        
        var templateData = [];
        if (unmappedList.length > 0) {
          unmappedList.forEach(function(d) {
            templateData.push({
              '자재코드': d.material_code_short || d.material_code,
              '자재명': d.material_name || '',
              '대분류': d.material_group_major_name || '',
              '원부구분': d.category === 'RAW' ? '원재료' : '부재료',
              '자재구분': ''  // 사용자가 입력할 컬럼
            });
          });
        } else {
          templateData.push({
            '자재코드': '(미매핑 자재 없음)',
            '자재명': '',
            '대분류': '',
            '원부구분': '',
            '자재구분': ''
          });
        }
        
        var ws = XLSX.utils.json_to_sheet(templateData);
        var colWidths = [{ wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
        ws['!cols'] = colWidths;
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '미매핑자재');
        XLSX.writeFile(wb, '자재구분_매핑_양식_미매핑' + unmappedList.length + '건.xlsx');
      } catch(e) {
        console.error('Mapping template download error:', e);
        alert('양식 다운로드 오류: ' + e.message);
      }
    }

    async function loadMasterIdx(tab) {
      if (tab === 'material-mapping') { loadMaterialMapping(currentMappingFilter); return; }
      const res = await fetch('/api/master/' + tab).then(r => r.json());
      renderMasterIdx(tab, res);
    }

    function renderMasterIdx(tab, data) {
      const tbody = document.getElementById('midx-' + tab + '-body');
      if (!data || data.length === 0) {
        const colCount = tab === 'paper-products' ? 6 : tab === 'paper-raw' ? 8 : tab === 'paper-sub' ? 5 : tab === 'tissue-products' ? 4 : 5;
        tbody.innerHTML = '<tr><td colspan="'+colCount+'" class="text-center text-gray-400 py-6">\ub4f1\ub85d\ub41c \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</td></tr>';
        return;
      }
      if (tab === 'paper-products') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-sage-50/30" id="master-row-paper-products-'+d.id+'">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5">'+d.product_hierarchy_level3+'</td>' +
          '<td class="!py-1.5 font-mono">'+d.grade_code+'</td>' +
          '<td class="!py-1.5 font-semibold">'+d.grade_name+'</td>' +
          '<td class="!py-1.5 text-gray-600">'+(d.grade_detail||'-')+'</td>' +
          '<td class="!py-1.5"><button onclick="editMasterRow(&quot;paper-products&quot;,'+d.id+')" class="text-blue-400 hover:text-blue-600 mr-2"><i class="fas fa-pen text-[10px]"></i></button><button onclick="deleteMasterRow(&quot;paper-products&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      } else if (tab === 'paper-raw') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-sage-50/30" id="master-row-paper-raw-'+d.id+'">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5">'+(d.category1||'-')+'</td>' +
          '<td class="!py-1.5">'+d.material_class+'</td>' +
          '<td class="!py-1.5">'+d.material_subclass+'</td>' +
          '<td class="!py-1.5 font-mono">'+d.material_code+'</td>' +
          '<td class="!py-1.5">'+d.material_name+'</td>' +
          '<td class="!py-1.5"><span class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">'+d.material_group+'</span></td>' +
          '<td class="!py-1.5"><button onclick="editMasterRow(&quot;paper-raw&quot;,'+d.id+')" class="text-blue-400 hover:text-blue-600 mr-2"><i class="fas fa-pen text-[10px]"></i></button><button onclick="deleteMasterRow(&quot;paper-raw&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      } else if (tab === 'paper-sub') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-sage-50/30" id="master-row-paper-sub-'+d.id+'">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5 font-mono">'+d.material_code+'</td>' +
          '<td class="!py-1.5">'+d.material_name+'</td>' +
          '<td class="!py-1.5"><span class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">'+d.material_group+'</span></td>' +
          '<td class="!py-1.5"><button onclick="editMasterRow(&quot;paper-sub&quot;,'+d.id+')" class="text-blue-400 hover:text-blue-600 mr-2"><i class="fas fa-pen text-[10px]"></i></button><button onclick="deleteMasterRow(&quot;paper-sub&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      } else if (tab === 'tissue-products') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-sage-50/30" id="master-row-tissue-products-'+d.id+'">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5"><span class="px-1.5 py-0.5 bg-sage-50 text-sage-600 rounded text-[10px]">'+d.category+'</span></td>' +
          '<td class="!py-1.5">'+d.product_name+'</td>' +
          '<td class="!py-1.5"><button onclick="editMasterRow(&quot;tissue-products&quot;,'+d.id+')" class="text-blue-400 hover:text-blue-600 mr-2"><i class="fas fa-pen text-[10px]"></i></button><button onclick="deleteMasterRow(&quot;tissue-products&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      } else if (tab === 'tissue-raw') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-sage-50/30" id="master-row-tissue-raw-'+d.id+'">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5"><span class="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">'+d.category+'</span></td>' +
          '<td class="!py-1.5 font-mono">'+d.material_code+'</td>' +
          '<td class="!py-1.5">'+d.material_name+'</td>' +
          '<td class="!py-1.5"><button onclick="editMasterRow(&quot;tissue-raw&quot;,'+d.id+')" class="text-blue-400 hover:text-blue-600 mr-2"><i class="fas fa-pen text-[10px]"></i></button><button onclick="deleteMasterRow(&quot;tissue-raw&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      }
    }

    // 기준정보 마스터 인라인 수정
    var masterEditCache = {};
    async function editMasterRow(tab, id) {
      // 현재 데이터 가져오기
      const allData = await fetch('/api/master/' + tab).then(r => r.json());
      const row = allData.find(function(d) { return d.id === id; });
      if (!row) { alert('데이터를 찾을 수 없습니다.'); return; }
      masterEditCache = row;

      var tr = document.getElementById('master-row-' + tab + '-' + id);
      if (!tr) return;

      var inp = function(val, name, w) {
        return '<input type="text" value="' + (val||'').replace(/"/g,'&quot;') + '" data-field="' + name + '" class="border border-blue-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-400 ' + (w||'w-full') + '">';
      };
      var btnSave = '<button onclick="saveMasterRow(&quot;'+tab+'&quot;,'+id+')" class="text-green-600 hover:text-green-800 mr-1"><i class="fas fa-check"></i></button>';
      var btnCancel = '<button onclick="loadMasterIdx(&quot;'+tab+'&quot;)" class="text-gray-400 hover:text-gray-600"><i class="fas fa-undo"></i></button>';

      if (tab === 'paper-products') {
        tr.innerHTML =
          '<td class="!py-1.5 text-gray-400">-</td>' +
          '<td class="!py-1.5">' + inp(row.product_hierarchy_level3, 'product_hierarchy_level3') + '</td>' +
          '<td class="!py-1.5">' + inp(row.grade_code, 'grade_code') + '</td>' +
          '<td class="!py-1.5">' + inp(row.grade_name, 'grade_name') + '</td>' +
          '<td class="!py-1.5">' + inp(row.grade_detail, 'grade_detail') + '</td>' +
          '<td class="!py-1.5">' + btnSave + btnCancel + '</td>';
      } else if (tab === 'paper-raw') {
        tr.innerHTML =
          '<td class="!py-1.5 text-gray-400">-</td>' +
          '<td class="!py-1.5">' + inp(row.category1, 'category1') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_class, 'material_class') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_subclass, 'material_subclass') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_code, 'material_code') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_name, 'material_name') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_group, 'material_group') + '</td>' +
          '<td class="!py-1.5">' + btnSave + btnCancel + '</td>';
      } else if (tab === 'paper-sub') {
        tr.innerHTML =
          '<td class="!py-1.5 text-gray-400">-</td>' +
          '<td class="!py-1.5">' + inp(row.material_code, 'material_code') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_name, 'material_name') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_group, 'material_group') + '</td>' +
          '<td class="!py-1.5">' + btnSave + btnCancel + '</td>';
      } else if (tab === 'tissue-products') {
        tr.innerHTML =
          '<td class="!py-1.5 text-gray-400">-</td>' +
          '<td class="!py-1.5">' + inp(row.category, 'category') + '</td>' +
          '<td class="!py-1.5">' + inp(row.product_name, 'product_name') + '</td>' +
          '<td class="!py-1.5">' + btnSave + btnCancel + '</td>';
      } else if (tab === 'tissue-raw') {
        tr.innerHTML =
          '<td class="!py-1.5 text-gray-400">-</td>' +
          '<td class="!py-1.5">' + inp(row.category, 'category') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_code, 'material_code') + '</td>' +
          '<td class="!py-1.5">' + inp(row.material_name, 'material_name') + '</td>' +
          '<td class="!py-1.5">' + btnSave + btnCancel + '</td>';
      }
      tr.classList.add('bg-blue-50/50');
    }

    async function saveMasterRow(tab, id) {
      var tr = document.getElementById('master-row-' + tab + '-' + id);
      if (!tr) return;
      var inputs = tr.querySelectorAll('input[data-field]');
      var body = {};
      inputs.forEach(function(inp) { body[inp.dataset.field] = inp.value; });

      try {
        await fetch('/api/master/' + tab + '/' + id, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(body)
        });
        loadMasterIdx(tab);
      } catch(e) {
        alert('수정 실패: ' + e.message);
      }
    }

    async function deleteMasterRow(tab, id) {
      if (!confirm('\uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?')) return;
      await fetch('/api/master/' + tab + '/' + id, { method: 'DELETE' });
      loadMasterIdx(tab);
    }

    // ---- 투입제외 규칙 관리 ----
    var _exclusionRules = [];

    async function loadExclusionRules() {
      var res = await fetch('/api/exclusion-rules').then(function(r) { return r.json(); });
      _exclusionRules = res || [];
      renderExclusionRules();
    }

    function renderExclusionRules() {
      var tbody = document.getElementById('midx-exclusion-rules-body');
      if (!tbody) return;
      if (!_exclusionRules.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-6">등록된 규칙이 없습니다.</td></tr>';
        return;
      }
      tbody.innerHTML = _exclusionRules.map(function(r, i) {
        return '<tr class="hover:bg-indigo-50/30 border-b border-slate-100" id="excl-row-' + r.id + '">' +
          '<td class="px-3 py-1.5 text-gray-400">' + (i + 1) + '</td>' +
          '<td class="px-3 py-1.5"><span class="px-2 py-0.5 rounded text-[10px] font-semibold ' + (r.machine_code === 'PM2' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700') + '">' + r.machine_code + '</span></td>' +
          '<td class="px-3 py-1.5 font-medium">' + r.material_group_keyword + '</td>' +
          '<td class="px-3 py-1.5"><span class="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-medium">' + r.excluded_product_type + '</span></td>' +
          '<td class="px-3 py-1.5 text-gray-500">' + (r.description || '-') + '</td>' +
          '<td class="px-3 py-1.5 text-center">' +
            '<button onclick="editExclusionRule(' + r.id + ')" class="text-blue-400 hover:text-blue-600 mr-2"><i class="fas fa-pen text-[10px]"></i></button>' +
            '<button onclick="deleteExclusionRule(' + r.id + ')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button>' +
          '</td></tr>';
      }).join('');
    }

    function showExclusionRuleForm() {
      document.getElementById('excl-rule-form').classList.remove('hidden');
    }

    async function addExclusionRule() {
      var machine = document.getElementById('excl-machine').value;
      var keyword = document.getElementById('excl-keyword').value.trim();
      var product = document.getElementById('excl-product').value.trim();
      var desc = document.getElementById('excl-desc').value.trim();
      if (!keyword || !product) { alert('자재그룹 키워드와 제외 지종을 입력하세요.'); return; }
      await fetch('/api/exclusion-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machine_code: machine, material_group_keyword: keyword, excluded_product_type: product, description: desc })
      });
      document.getElementById('excl-keyword').value = '';
      document.getElementById('excl-product').value = '';
      document.getElementById('excl-desc').value = '';
      document.getElementById('excl-rule-form').classList.add('hidden');
      loadExclusionRules();
    }

    async function editExclusionRule(id) {
      var rule = _exclusionRules.find(function(r) { return r.id === id; });
      if (!rule) return;
      var tr = document.getElementById('excl-row-' + id);
      if (!tr) return;
      var inp = function(val, name, w) {
        return '<input type="text" value="' + (val || '').replace(/"/g, '&quot;') + '" data-field="' + name + '" class="border border-blue-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-blue-400 ' + (w || 'w-full') + '">';
      };
      tr.innerHTML =
        '<td class="px-3 py-1.5 text-gray-400">-</td>' +
        '<td class="px-3 py-1.5"><select data-field="machine_code" class="text-xs border border-blue-300 rounded px-1.5 py-0.5">' + ((divisionMachines || [{code:'PM2'},{code:'PM3'}]).map(function(m){ var mc = m.code || m; return '<option value="' + mc + '"' + (rule.machine_code === mc ? ' selected' : '') + '>' + mc + '</option>'; }).join('')) + '</select></td>' +
        '<td class="px-3 py-1.5">' + inp(rule.material_group_keyword, 'material_group_keyword', 'w-32') + '</td>' +
        '<td class="px-3 py-1.5">' + inp(rule.excluded_product_type, 'excluded_product_type', 'w-20') + '</td>' +
        '<td class="px-3 py-1.5">' + inp(rule.description, 'description', 'w-40') + '</td>' +
        '<td class="px-3 py-1.5 text-center"><button onclick="saveExclusionRule(' + id + ')" class="text-green-600 hover:text-green-800 mr-1"><i class="fas fa-check"></i></button><button onclick="loadExclusionRules()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-undo"></i></button></td>';
      tr.classList.add('bg-blue-50/50');
    }

    async function saveExclusionRule(id) {
      var tr = document.getElementById('excl-row-' + id);
      if (!tr) return;
      var body = {};
      tr.querySelectorAll('[data-field]').forEach(function(el) {
        body[el.getAttribute('data-field')] = el.value || el.textContent;
      });
      await fetch('/api/exclusion-rules/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      loadExclusionRules();
    }

    async function deleteExclusionRule(id) {
      if (!confirm('이 규칙을 삭제하시겠습니까?')) return;
      await fetch('/api/exclusion-rules/' + id, { method: 'DELETE' });
      loadExclusionRules();
    }

    async function clearMasterTable(tab) {
      if (!confirm('\uc804\uccb4 \ub370\uc774\ud130\ub97c \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c? \uc774 \uc791\uc5c5\uc740 \ub418\ub3cc\ub9b4 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.')) return;
      await fetch('/api/master/' + tab, { method: 'DELETE' });
      loadMasterIdx(tab);
    }

    function addMasterRow(tab) {
      let body;
      if (tab === 'paper-products') {
        body = { product_hierarchy_level3: prompt('\uc81c\ud488 \uacc4\uce35\uad6c\uc870\ub808\ubca84 3:') || '', grade_code: prompt('\uc9c0\uc885\ucf54\ub4dc:') || '', grade_name: prompt('\uc9c0\uc885:') || '', grade_detail: prompt('\uc9c0\uc885(\uc138\ubd80):') || '' };
        if (!body.grade_code || !body.grade_name) return;
      } else if (tab === 'paper-raw') {
        body = { category1: prompt('\ubd84\ub8581:') || '', material_class: prompt('\uc790\uc7ac\ubd84\ub958:') || '', material_subclass: prompt('\uc790\uc7ac(\uc18c\ubd84\ub958):') || '', material_code: prompt('\uc790\uc7ac\ucf54\ub4dc:') || '', material_name: prompt('\uc790\uc7ac\uba85:') || '', material_group: prompt('\uc790\uc7ac\uadf8\ub8f9:') || '' };
        if (!body.material_code || !body.material_name) return;
      } else if (tab === 'paper-sub') {
        body = { material_code: prompt('\uc790\uc7ac\ucf54\ub4dc:') || '', material_name: prompt('\uc790\uc7ac\uba85:') || '', material_group: prompt('\uc790\uc7ac\uadf8\ub8f9:') || '' };
        if (!body.material_code || !body.material_name) return;
      } else if (tab === 'tissue-products') {
        body = { category: prompt('\ubd84\ub958:') || '', product_name: prompt('\uc81c\ud488\uba85:') || '' };
        if (!body.category || !body.product_name) return;
      } else if (tab === 'tissue-raw') {
        body = { category: prompt('\ubd84\ub958:') || '', material_code: prompt('\uc790\uc7ac\ucf54\ub4dc:') || '', material_name: prompt('\uc7ac\ub8cc\uba85:') || '' };
        if (!body.material_code || !body.material_name) return;
      }
      fetch('/api/master/' + tab, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
        .then(() => loadMasterIdx(tab));
    }

    function updatePeriodHint() {
      var y = parseInt(document.getElementById('analysisYear').value);
      var m = parseInt(document.getElementById('analysisMonth').value);
      // 선택월 = 예상월, 실적 = 선택월-1
      var prevM = m === 1 ? 12 : m - 1;
      var hint = '(' + prevM + '월 실적 기준 → ' + m + '월 예상)';
      var el = document.getElementById('period-hint');
      if (el) el.textContent = hint;
    }

    async function loadAnalysis() {
      updatePeriodHint();
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value;
      const ym = year + month.padStart(2, '0');
      const params = new URLSearchParams({ year, month, division: currentDivision });
      if (currentUnitFilter) params.set('unit_id', currentUnitFilter);
      const [comp, summary] = await Promise.all([
        fetch('/api/analysis/comparison?'+params).then(r=>r.json()),
        fetch('/api/analysis/unit-summary?'+new URLSearchParams({year,month,division:currentDivision})).then(r=>r.json())
      ]);
      analysisData = comp; unitSummaryData = summary;
      var periodEl = document.getElementById('period-label');
      if (periodEl) periodEl.textContent = comp.summary?.period ? comp.summary.period.previous + ' vs ' + comp.summary.period.current : '';
      renderDashboard(); renderDetailTable();
      loadDashboardSummary(ym);
      // 기준월 변경 시 다른 탭도 갱신
      if (typeof loadForecast === 'function') try { loadForecast(); } catch(e) {}
      if (typeof loadSimProfitBase === 'function') try { loadSimProfitBase(); } catch(e) {}
      if (typeof loadInventoryData === 'function') try { loadInventoryData(); } catch(e) {}
      if (typeof loadDataView === 'function') try { loadDataView(); } catch(e) {}
      // 수기입력은 호기 선택 상태가 있어야만 갱신
      if (mnMachine && typeof loadManualData === 'function') try { loadManualData(); } catch(e) {}
    }

    function renderDashboard() {
      if (!analysisData) return;
      const s = analysisData.summary;
      // 사용량차이, 단가차이, 재료비종합 → 억원 단위 표시
      setVC('s-qty', s.total_qty_effect);
      setVC('s-price', s.total_price_effect);
      setVC('s-total', s.total_cost_diff);
      renderUnitChart(); renderEffectChart(); renderUnitSummaryTable(); renderTopImpact();
    }

    let matCostCategoryFilter = 'ALL';
    let matGroupCategoryFilter = 'ALL';
    let overviewCategoryFilter = 'ALL';
    let mixEffectCategoryFilter = 'ALL';

    async function loadDashboardSummary(ym) {
      var dv = '&division=' + currentDivision;
      const [matCost, prodSummary, matGroup, overview, prodAnalysis, mixEffect] = await Promise.all([
        fetch('/api/dashboard/material-cost-summary?ym=' + ym + dv + (matCostCategoryFilter !== 'ALL' ? '&category=' + matCostCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/production-summary?ym=' + ym + dv).then(r => r.json()),
        fetch('/api/dashboard/material-by-group?ym=' + ym + dv + (matGroupCategoryFilter !== 'ALL' ? '&category=' + matGroupCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/material-overview?ym=' + ym + dv + (overviewCategoryFilter !== 'ALL' ? '&category=' + overviewCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/production-analysis?ym=' + ym + dv).then(r => r.json()),
        fetch('/api/dashboard/mix-effect?ym=' + ym + dv + (mixEffectCategoryFilter !== 'ALL' ? '&category=' + mixEffectCategoryFilter : '')).then(r => r.json())
      ]);

      // 원단위 카드 계산 (overview 데이터 기반 - 이미 톤 단위) — 동적 호기
      var machineCosts = {};
      var machineProds = {};
      if (overview && overview.length) {
        overview.forEach(function(item) {
          var cost = Number(item.cur_material_cost) || 0;
          var prod = Number(item.cur_production) || 0;
          var mc = item.machine_code;
          if (!machineCosts[mc]) { machineCosts[mc] = 0; machineProds[mc] = 0; }
          machineCosts[mc] += cost;
          machineProds[mc] += prod;
        });
      }
      var totalCost = 0, totalProd = 0;
      Object.keys(machineCosts).forEach(function(mc) { totalCost += machineCosts[mc]; totalProd += machineProds[mc]; });
      var totalUC = totalProd > 0 ? totalCost / totalProd / 1000 : 0;
      document.getElementById('s-total-uc').textContent = totalUC > 0 ? totalUC.toFixed(1) : '-';

      // 호기별 원단위 카드 동적 렌더링
      var ucContainer = document.getElementById('s-machine-uc-container');
      if (ucContainer) {
        var machines = divisionMachines || Object.keys(machineCosts);
        var ucHtml = '';
        machines.forEach(function(mc, idx) {
          var mcCode = mc.code || mc;
          var mcCost = machineCosts[mcCode] || 0;
          var mcProd = machineProds[mcCode] || 0;
          var mcUC = mcProd > 0 ? mcCost / mcProd / 1000 : 0;
          if (idx > 0) ucHtml += '<div class="text-gray-300">|</div>';
          ucHtml += '<div><span class="text-[10px] text-gray-400">' + mcCode + '</span><p class="text-base font-bold text-gray-900">' + (mcUC > 0 ? mcUC.toFixed(1) : '-') + '</p></div>';
        });
        ucContainer.innerHTML = ucHtml || '<div><span class="text-[10px] text-gray-400">-</span><p class="text-base font-bold text-gray-900">-</p></div>';
      }

      renderOverview(overview);
      renderProfitSummary(overview);
      renderMatCostSummary(matCost);
      renderProductionSummary(prodSummary);
      renderMatGroupSummary(matGroup);
      renderProductionAnalysis(prodAnalysis);
      renderMixEffect(mixEffect);
    }

    function setOverviewFilter(filter) {
      overviewCategoryFilter = filter;
      ['all','raw','sub'].forEach(f => {
        const btn = document.getElementById('ov-filter-' + f);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(f === filter.toLowerCase() ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value.padStart(2, '0');
      const ym = year + month;
      fetch('/api/dashboard/material-overview?ym=' + ym + getDivisionParam() + (filter !== 'ALL' ? '&category=' + filter : ''))
        .then(r => r.json())
        .then(data => { renderOverview(data); renderProfitSummary(data); });
    }

    function renderOverview(data) {
      const tbody = document.getElementById('dash-overview-body');
      const tfoot = document.getElementById('dash-overview-foot');
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="20" class="text-center text-gray-400 py-8">\ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</td></tr>';
        tfoot.innerHTML = '';
        return;
      }
      const fmt = (v) => v != null ? Math.round(Number(v)).toLocaleString() : '-';
      const fmtUnit = (v) => v != null ? Number(v).toFixed(1) : '-';
      const pct = (v) => v != null ? Number(v).toFixed(1) : '-';
      const eok = (v) => v != null ? (Number(v) / 100000000).toFixed(1) : '-';

      // 전체 합산 (전체비중 계산용)
      let grandCurCost = 0, grandPrevCost = 0, grandEstCost = 0;
      data.forEach(d => {
        grandCurCost += Number(d.cur_material_cost) || 0;
        grandPrevCost += Number(d.prev_material_cost) || 0;
        grandEstCost += Number(d.est_material_cost) || 0;
      });

      // 호기별 생산량 합산 (호기비중 계산용)
      const machineProd = {};
      const machinePrevProd = {};
      const machineEstProd = {};
      data.forEach(d => {
        const mc = d.machine_code;
        machineProd[mc] = (machineProd[mc] || 0) + (Number(d.cur_production) || 0);
        machinePrevProd[mc] = (machinePrevProd[mc] || 0) + (Number(d.prev_production) || 0);
        machineEstProd[mc] = (machineEstProd[mc] || 0) + (Number(d.est_production) || 0);
      });

      let prevMachine = '';
      let mCurCost=0, mCurProd=0, mPrevCost=0, mPrevProd=0, mEstCost=0, mEstProd=0;
      const rows = [];

      const subtotalRow = (mc) => {
        const chipClass = getCC(mc);
        const mCurUnit = mCurProd > 0 ? mCurCost / mCurProd / 1000 : 0;
        const mPrevUnit = mPrevProd > 0 ? mPrevCost / mPrevProd / 1000 : 0;
        const mEstUnit = mEstProd > 0 ? mEstCost / mEstProd / 1000 : 0;
        return '<tr class="bg-slate-100 font-semibold border-b-2 border-slate-300">' +
          '<td class="!py-1.5 border-r border-slate-200"><span class="unit-chip '+chipClass+'">'+mc+'</span></td>' +
          '<td class="!py-1.5 border-r border-slate-200">\uc694\uc57d</td>' +
          '<td class="!py-1.5 text-right font-mono">'+eok(mCurCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mCurProd)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">100.0</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmtUnit(mCurUnit)+'</td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">'+(grandCurCost>0?pct(mCurCost/grandCurCost*100):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+eok(mPrevCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mPrevProd)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">100.0</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmtUnit(mPrevUnit)+'</td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">'+(grandPrevCost>0?pct(mPrevCost/grandPrevCost*100):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '</tr>';
      };

      let grandCurProd=0, grandPrevProd=0, grandEstProd=0;
      data.forEach(d => {
        const curCost = Number(d.cur_material_cost) || 0;
        const curProd = Number(d.cur_production) || 0;
        const prevCost = Number(d.prev_material_cost) || 0;
        const prevProd = Number(d.prev_production) || 0;
        const estCost = Number(d.est_material_cost) || 0;
        const estProd = Number(d.est_production) || 0;

        if (prevMachine && d.machine_code !== prevMachine) {
          rows.push(subtotalRow(prevMachine));
          mCurCost=0; mCurProd=0; mPrevCost=0; mPrevProd=0; mEstCost=0; mEstProd=0;
        }
        mCurCost+=curCost; mCurProd+=curProd; mPrevCost+=prevCost; mPrevProd+=prevProd; mEstCost+=estCost; mEstProd+=estProd;
        grandCurProd+=curProd; grandPrevProd+=prevProd; grandEstProd+=estProd;

        const machineChanged = d.machine_code !== prevMachine;
        prevMachine = d.machine_code;
        const chipClass = getCC(d.machine_code);
        const mc = d.machine_code;

        // 호기비중: 해당 지종 생산량 / 호기 총생산량 * 100
        const curMachWeight = machineProd[mc] > 0 ? (curProd / machineProd[mc] * 100) : 0;
        const prevMachWeight = machinePrevProd[mc] > 0 ? (prevProd / machinePrevProd[mc] * 100) : 0;
        // 원단위: 재료비(원) / 생산량(톤) / 1000 = 천원/톤
        const curUnit = curProd > 0 ? curCost / curProd / 1000 : 0;
        const prevUnit = prevProd > 0 ? prevCost / prevProd / 1000 : 0;
        // 전체비중: 해당 지종 재료비 / 전체 재료비 * 100
        const curTotalWeight = grandCurCost > 0 ? (curCost / grandCurCost * 100) : 0;
        const prevTotalWeight = grandPrevCost > 0 ? (prevCost / grandPrevCost * 100) : 0;

        rows.push('<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-sage-50/30">' +
          '<td class="!py-1.5 border-r border-slate-200"><span class="unit-chip '+chipClass+'">'+(d.machine_code||'')+'</span></td>' +
          '<td class="!py-1.5 border-r border-slate-200">'+(d.product_level2_name||'-')+'</td>' +
          // 당월
          '<td class="!py-1.5 text-right font-mono">'+eok(curCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(curProd)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+pct(curMachWeight)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmtUnit(curUnit)+'</td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">'+pct(curTotalWeight)+'</td>' +
          // 전월
          '<td class="!py-1.5 text-right font-mono">'+(prevCost?eok(prevCost):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevProd?fmt(prevProd):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevMachWeight?pct(prevMachWeight):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevUnit?fmtUnit(prevUnit):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">'+(prevTotalWeight?pct(prevTotalWeight):'-')+'</td>' +
          // 예상 (공란)
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
          '</tr>');
      });
      // 마지막 호기 소계
      if (prevMachine) rows.push(subtotalRow(prevMachine));
      tbody.innerHTML = rows.join('');

      // 총합계
      const grandCurUnit = grandCurProd > 0 ? grandCurCost / grandCurProd / 1000 : 0;
      const grandPrevUnit = grandPrevProd > 0 ? grandPrevCost / grandPrevProd / 1000 : 0;
      tfoot.innerHTML = '<tr>' +
        '<td colspan="2" class="!py-2 text-center border-r border-slate-200 font-bold">\ucd1d\ud569\uacc4</td>' +
        '<td class="!py-2 text-right font-mono">'+eok(grandCurCost)+'</td>' +
        '<td class="!py-2 text-right font-mono">'+fmt(grandCurProd)+'</td>' +
        '<td class="!py-2 text-right font-mono">100.0</td>' +
        '<td class="!py-2 text-right font-mono">'+fmtUnit(grandCurUnit)+'</td>' +
        '<td class="!py-2 text-right font-mono border-r border-slate-200">100.0</td>' +
        '<td class="!py-2 text-right font-mono">'+eok(grandPrevCost)+'</td>' +
        '<td class="!py-2 text-right font-mono">'+fmt(grandPrevProd)+'</td>' +
        '<td class="!py-2 text-right font-mono">100.0</td>' +
        '<td class="!py-2 text-right font-mono">'+fmtUnit(grandPrevUnit)+'</td>' +
        '<td class="!py-2 text-right font-mono border-r border-slate-200">100.0</td>' +
        '<td class="!py-2 text-right font-mono text-gray-300">-</td>' +
        '<td class="!py-2 text-right font-mono text-gray-300">-</td>' +
        '<td class="!py-2 text-right font-mono text-gray-300">-</td>' +
        '<td class="!py-2 text-right font-mono text-gray-300">-</td>' +
        '<td class="!py-2 text-right font-mono text-gray-300">-</td>' +
        '</tr>';
    }

    function toggleProfitDetail() {
      const section = document.getElementById('profit-detail-section');
      section.classList.toggle('hidden');
    }

    function toggleCard(cardId) {
      var body = document.getElementById(cardId);
      var chevron = document.getElementById(cardId + '-chevron');
      if (!body) return;
      body.classList.toggle('card-body-collapsed');
      if (chevron) {
        chevron.classList.toggle('card-chevron-collapsed');
      }
    }

    function renderProfitSummary(data) {
      // 손익 = (전월원단위 - 당월원단위) * 생산량(당월) / 1000
      // 원단위 = 재료비 / 생산량
      var profitLabel = '';
      if (overviewCategoryFilter === 'RAW') profitLabel = '\uc6d0\uc7ac\ub8cc \uc190\uc775';
      else if (overviewCategoryFilter === 'SUB') profitLabel = '\ubd80\uc7ac\ub8cc \uc190\uc775';
      else profitLabel = '\uc6d0/\ubd80\uc790\uc7ac \uc190\uc775';

      var labelEl = document.getElementById('profit-label');
      if (labelEl) labelEl.textContent = profitLabel;
      var titleEl = document.getElementById('profit-detail-title');
      if (titleEl) titleEl.innerHTML = '<i class="fas fa-list-alt text-sage-400 mr-1"></i>\ud638\uae30\ubcc4 \uc9c0\uc885\ubcc4 ' + profitLabel + ' \uc0c1\uc138';
      var colHeader = document.getElementById('profit-detail-col-header');
      if (colHeader) colHeader.textContent = profitLabel + '(\uc5b5\uc6d0)';

      const profitEl = document.getElementById('overview-profit-value');
      const tbody = document.getElementById('profit-detail-body');
      const tfoot = document.getElementById('profit-detail-foot');

      if (!data || data.length === 0) {
        profitEl.textContent = '-';
        profitEl.className = 'text-2xl font-bold text-gray-800';
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-400 py-6">\ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</td></tr>';
        tfoot.innerHTML = '';
        return;
      }

      const fmt = (v) => v != null ? Math.round(Number(v)).toLocaleString() : '-';
      const diffFmt = (v) => {
        const n = Math.round(Number(v) || 0);
        if (n === 0) return '-';
        if (n < 0) return String.fromCharCode(9651) + Math.abs(n).toLocaleString();
        return n.toLocaleString();
      };
      const diffCell = (v) => {
        const n = Number(v) || 0;
        if (Math.abs(n) < 0.05) return '<td class="!py-1.5 text-right font-mono text-gray-400">-</td>';
        if (n < 0) return '<td class="!py-1.5 text-right font-mono text-red-600">' + String.fromCharCode(9651) + Math.abs(n).toFixed(1) + '</td>';
        return '<td class="!py-1.5 text-right font-mono text-steel-400">' + n.toFixed(1) + '</td>';
      };
      const profitCell = (v) => {
        const eokV = Number(v) / 100000;  // 천원 → 억원
        if (Math.abs(eokV) < 0.005) return '<td class="!py-1.5 text-right font-mono text-gray-400 font-semibold">-</td>';
        if (eokV < 0) return '<td class="!py-1.5 text-right font-mono text-red-600 font-semibold">' + String.fromCharCode(9651) + Math.abs(eokV).toFixed(2) + '</td>';
        return '<td class="!py-1.5 text-right font-mono text-steel-400 font-semibold">' + eokV.toFixed(2) + '</td>';
      };

      let grandProfit = 0;
      let prevMachine = '';
      let mProfit = 0, mPrevUnit = 0, mCurUnit = 0, mProd = 0, mCost = 0, mPrevCost = 0;
      const rows = [];

      const subtotalRow = (mc) => {
        const chipClass = getCC(mc);
        const eokV = mProfit / 100000;
        const cls = eokV < -0.005 ? 'text-red-600' : (eokV > 0.005 ? 'text-steel-400' : 'text-gray-400');
        const val = Math.abs(eokV) < 0.005 ? '-' : (eokV < 0 ? String.fromCharCode(9651) + Math.abs(eokV).toFixed(2) : eokV.toFixed(2));
        return '<tr class="bg-slate-100 font-semibold border-b border-slate-300">' +
          '<td class="!py-1.5"><span class="unit-chip '+chipClass+'">'+mc+'</span></td>' +
          '<td class="!py-1.5">\uc18c\uacc4</td>' +
          '<td class="!py-1.5 text-right font-mono">-</td>' +
          '<td class="!py-1.5 text-right font-mono">-</td>' +
          '<td class="!py-1.5 text-right font-mono">-</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mProd)+'</td>' +
          '<td class="!py-1.5 text-right font-mono '+cls+' font-semibold">'+val+'</td>' +
          '</tr>';
      };

      data.forEach(d => {
        const curCost = Number(d.cur_material_cost) || 0;
        const curProd = Number(d.cur_production) || 0;
        const prevCost = Number(d.prev_material_cost) || 0;
        const prevProd = Number(d.prev_production) || 0;

        const curUnit = curProd > 0 ? curCost / (curProd * 1000) : 0;  // 원/kg
        const prevUnit = prevProd > 0 ? prevCost / (prevProd * 1000) : 0;  // 원/kg
        // 원재료 손익 = (전월원단위 - 당월원단위)(원/kg) * 생산량(톤) * 1000(kg/톤) / 1000(→천원)
        // = (prevUnit - curUnit) * curProd
        const profit = (prevUnit - curUnit) * curProd;

        if (prevMachine && d.machine_code !== prevMachine) {
          rows.push(subtotalRow(prevMachine));
          mProfit = 0; mProd = 0;
        }
        mProfit += profit;
        mProd += curProd;
        grandProfit += profit;

        const machineChanged = d.machine_code !== prevMachine;
        prevMachine = d.machine_code;
        const chipClass = getCC(d.machine_code);

        rows.push('<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-sage-50/30">' +
          '<td class="!py-1.5"><span class="unit-chip '+chipClass+'">'+(d.machine_code||'')+'</span></td>' +
          '<td class="!py-1.5">'+(d.product_level2_name||'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevUnit ? Number(prevUnit).toFixed(1) : '-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+Number(curUnit).toFixed(1)+'</td>' +
          diffCell(prevUnit - curUnit) +
          '<td class="!py-1.5 text-right font-mono">'+fmt(curProd)+'</td>' +
          profitCell(profit) +
          '</tr>');
      });
      if (prevMachine) rows.push(subtotalRow(prevMachine));
      tbody.innerHTML = rows.join('');

      // 총합계 tfoot
      const gEok = grandProfit / 100000;
      const gCls = gEok < -0.005 ? 'text-red-600' : (gEok > 0.005 ? 'text-steel-400' : 'text-gray-400');
      const gVal = Math.abs(gEok) < 0.005 ? '-' : (gEok < 0 ? String.fromCharCode(9651) + Math.abs(gEok).toFixed(2) : gEok.toFixed(2));
      tfoot.innerHTML = '<tr>' +
        '<td colspan="5" class="!py-2 text-center font-bold">\ucd1d\ud569\uacc4</td>' +
        '<td class="!py-2 text-right font-mono">-</td>' +
        '<td class="!py-2 text-right font-mono '+gCls+' font-bold">'+gVal+'</td>' +
        '</tr>';

      // 상단 카드 값 업데이트
      profitEl.textContent = Math.abs(gEok) < 0.005 ? '-' : (gEok < 0 ? String.fromCharCode(9651) + Math.abs(gEok).toFixed(2) + '\uc5b5' : gEok.toFixed(2) + '\uc5b5');
      profitEl.className = 'text-2xl font-bold ' + (gEok < -0.005 ? 'text-red-600' : (gEok > 0.005 ? 'text-steel-400' : 'text-gray-800'));
    }

    function setMatCostFilter(filter) {
      matCostCategoryFilter = filter;
      ['all','raw','sub'].forEach(f => {
        const btn = document.getElementById('mc-filter-' + f);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(f === filter.toLowerCase() ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value.padStart(2, '0');
      const ym = year + month;
      fetch('/api/dashboard/material-cost-summary?ym=' + ym + getDivisionParam() + (filter !== 'ALL' ? '&category=' + filter : ''))
        .then(r => r.json())
        .then(data => renderMatCostSummary(data));
    }

    function renderMatCostSummary(data) {
      const tbody = document.getElementById('dash-matcost-body');
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-400 py-8">데이터가 없습니다.</td></tr>';
        return;
      }
      const fmt = (v) => v != null ? Math.round(Number(v)).toLocaleString() : '-';
      const eok = (v) => v != null ? (Number(v) / 100000000).toFixed(2) : '-';
      // #,##0 ;[빨강]△#,##0 ; -
      const diffFmt = (v) => {
        const n = Number(v) || 0;
        if (Math.abs(n) < 1) return '-';
        const eokV = (Math.abs(n) / 100000000).toFixed(2);
        if (n < 0) return String.fromCharCode(9651) + eokV;
        return eokV;
      };
      const diffCell = (v) => {
        const n = Number(v) || 0;
        if (Math.abs(n) < 1) return '<td class="!py-1.5 text-right font-mono text-gray-400">-</td>';
        const eokV = (Math.abs(n) / 100000000).toFixed(2);
        if (n < 0) return '<td class="!py-1.5 text-right font-mono text-red-600">' + String.fromCharCode(9651) + eokV + '</td>';
        return '<td class="!py-1.5 text-right font-mono">' + eokV + '</td>';
      };
      let totalCur = 0, totalPrev = 0, totalUsage = 0, totalPrice = 0, totalRows = 0;
      let prevMachine = '';
      let mCur = 0, mPrev = 0, mUsage = 0, mPrice = 0, mRows = 0;
      const rows = [];
      const subtotalRow = (mc) => {
        const chipClass = getCC(mc);
        const dEl = (v) => { const n=Number(v); if(Math.abs(n)<1) return '<td class="!py-1.5 text-right font-mono text-gray-400">-</td>'; const ev=(Math.abs(n)/100000000).toFixed(2); if(n<0) return '<td class="!py-1.5 text-right font-mono text-red-600">'+String.fromCharCode(9651)+ev+'</td>'; return '<td class="!py-1.5 text-right font-mono">'+ev+'</td>'; };
        return '<tr class="bg-slate-100 font-semibold">' +
          '<td class="!py-1.5"><span class="unit-chip '+chipClass+'">'+mc+'</span></td>' +
          '<td class="!py-1.5" colspan="2">소계</td>' +
          '<td class="!py-1.5 text-right font-mono">' + eok(mCur) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + (mPrev ? eok(mPrev) : '-') + '</td>' +
          dEl(mCur - mPrev) +
          dEl(mUsage) +
          dEl(mPrice) +
          '<td class="!py-1.5 text-right">' + fmt(mRows) + '</td></tr>';
      };
      data.forEach(d => {
        const curCost = Number(d.material_cost) || 0;
        const prevCost = Number(d.prev_material_cost) || 0;
        const diff = curCost - prevCost;
        const usageDiff = Number(d.usage_diff) || 0;
        const priceDiff = Number(d.price_diff) || 0;
        totalCur += curCost; totalPrev += prevCost; totalUsage += usageDiff; totalPrice += priceDiff; totalRows += Number(d.row_count) || 0;
        if (prevMachine && d.machine_code !== prevMachine) {
          rows.push(subtotalRow(prevMachine));
          mCur=0; mPrev=0; mUsage=0; mPrice=0; mRows=0;
        }
        mCur += curCost; mPrev += prevCost; mUsage += usageDiff; mPrice += priceDiff; mRows += Number(d.row_count) || 0;
        const machineChanged = d.machine_code !== prevMachine;
        prevMachine = d.machine_code;
        const chipClass = getCC(d.machine_code);
        rows.push('<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-sage-50/30">' +
          '<td class="!py-1.5"><span class="unit-chip ' + chipClass + '">' + (d.machine_code||'') + '</span></td>' +
          '<td class="!py-1.5">' + (d.product_level2_name||'-') + '</td>' +
          '<td class="!py-1.5">' + (d.material_group_name||'-') + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold">' + eok(curCost) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-500">' + (prevCost ? eok(prevCost) : '-') + '</td>' +
          diffCell(diff) +
          diffCell(usageDiff) +
          diffCell(priceDiff) +
          '<td class="!py-1.5 text-right text-gray-400">' + (d.row_count||'') + '</td>' +
          '</tr>');
      });
      if (prevMachine) rows.push(subtotalRow(prevMachine));
      tbody.innerHTML = rows.join('');
      document.getElementById('dash-matcost-total-cur').textContent = eok(totalCur);
      document.getElementById('dash-matcost-total-prev').textContent = eok(totalPrev);
      const totalDiff = totalCur - totalPrev;
      const diffEl = document.getElementById('dash-matcost-total-diff');
      diffEl.textContent = diffFmt(totalDiff);
      diffEl.className = '!py-2 text-right font-mono ' + (totalDiff < 0 ? 'text-red-600' : '');
      const usageEl = document.getElementById('dash-matcost-total-usage');
      usageEl.textContent = diffFmt(totalUsage);
      usageEl.className = '!py-2 text-right font-mono ' + (totalUsage < 0 ? 'text-red-600' : '');
      const priceEl = document.getElementById('dash-matcost-total-price');
      priceEl.textContent = diffFmt(totalPrice);
      priceEl.className = '!py-2 text-right font-mono ' + (totalPrice < 0 ? 'text-red-600' : '');
      document.getElementById('dash-matcost-total-rows').textContent = fmt(totalRows);
    }

    function renderProductionSummary(data) {
      const tbody = document.getElementById('dash-production-body');
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-400 py-8">데이터가 없습니다.</td></tr>';
        return;
      }
      const fmt = (v) => v != null ? Math.round(Number(v)).toLocaleString() : '-';
      let grandTotal = 0;
      let prevMachine = '';
      tbody.innerHTML = data.map(d => {
        grandTotal += Number(d.total_production) || 0;
        const machineChanged = d.machine_code !== prevMachine;
        prevMachine = d.machine_code;
        const chipClass = getCC(d.machine_code);
        return '<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-sage-50/30">' +
          '<td><span class="unit-chip ' + chipClass + '">' + (d.machine_code||'') + '</span></td>' +
          '<td>' + (d.machine_name||'-') + '</td>' +
          '<td>' + (d.product_level2_name||'-') + '</td>' +
          '<td class="text-right font-mono font-semibold">' + fmt(d.total_production) + '</td>' +
          '</tr>';
      }).join('');
      document.getElementById('dash-production-total').textContent = fmt(grandTotal);
    }

    function renderProductionAnalysis(data) {
      const tbody = document.getElementById('prod-analysis-body');
      const tfoot = document.getElementById('prod-analysis-foot');
      if (!data || !data.rows || data.rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-400 py-8">\ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</td></tr>';
        tfoot.innerHTML = '';
        return;
      }
      var fmt = function(v) { return v != null ? Math.round(Number(v)).toLocaleString() : '-'; };
      var delta = String.fromCharCode(9651);
      var fmtDiff = function(v) {
        var n = Number(v) || 0;
        if (n === 0) return '<span class="text-gray-400">-</span>';
        if (n > 0) return '<span class="text-steel-400">+' + Math.round(n).toLocaleString() + '</span>';
        return '<span class="text-red-600">' + delta + Math.round(Math.abs(n)).toLocaleString() + '</span>';
      };

      // 호기별로 그룹핑하여 소계행 포함
      var rows = data.rows;
      var subtotals = data.subtotals || [];
      var subMap = {};
      subtotals.forEach(function(s) { subMap[s.machine_code] = s; });

      // 호기 순서 결정
      var machineOrder = [];
      var seen = {};
      rows.forEach(function(r) {
        if (!seen[r.machine_code]) { machineOrder.push(r.machine_code); seen[r.machine_code] = true; }
      });

      var html = '';
      machineOrder.forEach(function(mc) {
        var machineRows = rows.filter(function(r) { return r.machine_code === mc; });
        var sub = subMap[mc] || {};
        // 호기 소계 행 (볼드)
        html += '<tr class="bg-slate-50 font-semibold border-t-2 border-slate-300">' +
          '<td class="!py-2"><span class="unit-chip ' + (getCC(mc)) + '">' + mc + '</span></td>' +
          '<td class="!py-2 text-right font-mono">' + fmt(sub.cur_total_production) + '</td>' +
          '<td class="!py-2 text-right font-mono">' + fmt(sub.cur_production_qty) + '</td>' +
          '<td class="!py-2 text-right font-mono border-r border-slate-200">' + fmt(sub.cur_waste_qty) + '</td>' +
          '<td class="!py-2 text-right font-mono">' + fmt(sub.prev_total_production) + '</td>' +
          '<td class="!py-2 text-right font-mono">' + fmt(sub.prev_production_qty) + '</td>' +
          '<td class="!py-2 text-right font-mono border-r border-slate-200">' + fmt(sub.prev_waste_qty) + '</td>' +
          '<td class="!py-2 text-right font-mono">' + fmtDiff((sub.cur_total_production||0) - (sub.prev_total_production||0)) + '</td>' +
          '<td class="!py-2 text-right font-mono">' + fmtDiff((sub.cur_production_qty||0) - (sub.prev_production_qty||0)) + '</td>' +
          '<td class="!py-2 text-right font-mono">' + fmtDiff((sub.cur_waste_qty||0) - (sub.prev_waste_qty||0)) + '</td>' +
          '</tr>';
        // 상세 행
        machineRows.forEach(function(r) {
          html += '<tr class="hover:bg-sage-50/30">' +
            '<td class="!py-1.5 pl-8 text-gray-600">' + r.product_level2_name + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmt(r.cur_total_production) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmt(r.cur_production_qty) + '</td>' +
            '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmt(r.cur_waste_qty) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmt(r.prev_total_production) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmt(r.prev_production_qty) + '</td>' +
            '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmt(r.prev_waste_qty) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmtDiff(r.cur_total_production - r.prev_total_production) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmtDiff(r.cur_production_qty - r.prev_production_qty) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmtDiff(r.cur_waste_qty - r.prev_waste_qty) + '</td>' +
            '</tr>';
        });
      });
      tbody.innerHTML = html;

      // 총합계 footer
      var gt = data.grandTotal || {};
      tfoot.innerHTML = '<tr class="border-t-2 border-slate-400">' +
        '<td class="!py-2 text-center font-bold">\ucd1d\ud569\uacc4</td>' +
        '<td class="!py-2 text-right font-mono">' + fmt(gt.cur_total_production) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmt(gt.cur_production_qty) + '</td>' +
        '<td class="!py-2 text-right font-mono border-r border-slate-200">' + fmt(gt.cur_waste_qty) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmt(gt.prev_total_production) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmt(gt.prev_production_qty) + '</td>' +
        '<td class="!py-2 text-right font-mono border-r border-slate-200">' + fmt(gt.prev_waste_qty) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtDiff((gt.cur_total_production||0) - (gt.prev_total_production||0)) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtDiff((gt.cur_production_qty||0) - (gt.prev_production_qty||0)) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtDiff((gt.cur_waste_qty||0) - (gt.prev_waste_qty||0)) + '</td>' +
        '</tr>';
    }

    function renderMixEffect(data) {
      var tbody = document.getElementById('mix-effect-body');
      if (!data || !data.scenario2) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-400 py-8">\ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</td></tr>';
        return;
      }
      var delta = String.fromCharCode(9651);
      var fmtV = function(v) {
        var n = Number(v) || 0;
        if (Math.abs(n) < 0.05) return '<span class="text-gray-400"> - </span>';
        if (n < 0) return '<span class="text-red-600">' + delta + Math.abs(n).toFixed(1) + '</span>';
        return '<span class="text-steel-400">' + n.toFixed(1) + '</span>';
      };

      var s2 = data.scenario2;
      var s3 = data.scenario3;
      var html = '';

      // 호기 믹스 헤더행
      html += '<tr class="bg-sage-50/50 border-t-2 border-sage-200">' +
        '<td class="!py-2 font-bold text-sage-700"><i class="fas fa-exchange-alt mr-1 text-sage-400"></i>\ud638\uae30 \ubbf9\uc2a4</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtV(s2.machineMix[0]?.col1) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtV(s2.machineMix[0]?.col2) + '</td>' +
        '<td class="!py-2 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(s2.machineMix[0]?.col3) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + (s3 ? fmtV(s3.machineMix[0]?.col1) : '<span class="text-gray-400"> - </span>') + '</td>' +
        '<td class="!py-2 text-right font-mono">' + (s3 ? fmtV(s3.machineMix[0]?.col2) : '<span class="text-gray-400"> - </span>') + '</td>' +
        '<td class="!py-2 text-right font-mono font-semibold">' + (s3 ? fmtV(s3.machineMix[0]?.col3) : '<span class="text-gray-400"> - </span>') + '</td>' +
        '</tr>';

      // 호기 믹스 PM3행 (시나리오2에만)
      if (s2.machineMix.length > 1) {
        html += '<tr class="bg-sage-50/30">' +
          '<td class="!py-1.5 pl-6 text-gray-500 text-[11px]"></td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(s2.machineMix[1]?.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(s2.machineMix[1]?.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(s2.machineMix[1]?.col3) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + (s3 && s3.machineMix.length > 1 ? fmtV(s3.machineMix[1]?.col1) : '<span class="text-gray-400"> - </span>') + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + (s3 && s3.machineMix.length > 1 ? fmtV(s3.machineMix[1]?.col2) : '<span class="text-gray-400"> - </span>') + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold">' + (s3 && s3.machineMix.length > 1 ? fmtV(s3.machineMix[1]?.col3) : '<span class="text-gray-400"> - </span>') + '</td>' +
          '</tr>';
      }

      // 지종 믹스 헤더행
      html += '<tr class="bg-steel-50/50 border-t-2 border-steel-200">' +
        '<td class="!py-2 font-bold text-steel-500"><i class="fas fa-sitemap mr-1 text-steel-400"></i>\uc9c0\uc885 \ubbf9\uc2a4</td>' +
        '<td colspan="3" class="!py-2 border-r border-slate-200"></td>' +
        '<td colspan="3" class="!py-2"></td>' +
        '</tr>';

      // 동적 호기별 지종 믹스 렌더링
      var mixMachineList = data.machineTypesMap ? Object.keys(data.machineTypesMap) : ['PM2','PM3'];
      mixMachineList.forEach(function(mc) {
        var mcTypes = data.machineTypesMap ? (data.machineTypesMap[mc] || []) : (mc === 'PM2' ? (data.pm2Types || []) : (data.pm3Types || []));
        var s2mc = s2.gradeMix[mc] || [];
        var s3mc = (s3 && s3.gradeMix[mc]) || [];
        mcTypes.forEach(function(pt, i) {
          var r2 = s2mc[i] || { col1:0, col2:0, col3:0 };
          var r3 = s3mc[i] || { col1:0, col2:0, col3:0 };
          html += '<tr class="hover:bg-sage-50/30">' +
            '<td class="!py-1.5 pl-4 text-[11px]"><span class="text-gray-400 mr-1">' + mc + '</span>' + pt + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col1) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col2) + '</td>' +
            '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(r2.col3) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmtV(r3.col1) + '</td>' +
            '<td class="!py-1.5 text-right font-mono">' + fmtV(r3.col2) + '</td>' +
            '<td class="!py-1.5 text-right font-mono font-semibold">' + fmtV(r3.col3) + '</td>' +
            '</tr>';
        });

        // 호기 소계
        var s2mcSum = s2mc.reduce(function(a,b){ return a + (b.col3||0); }, 0);
        var s3mcSum = s3mc.reduce(function(a,b){ return a + (b.col3||0); }, 0);
        html += '<tr class="bg-slate-50 font-semibold border-t border-slate-200">' +
          '<td class="!py-1.5 pl-4 text-[11px] text-gray-600">' + mc + ' \uc18c\uacc4</td>' +
          '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmtV(s2mcSum) + '</td>' +
          '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(s3mcSum) + '</td>' +
          '</tr>';
      });

      tbody.innerHTML = html;
    }

    function setMatGroupFilter(filter) {
      matGroupCategoryFilter = filter;
      ['all','raw','sub'].forEach(f => {
        const btn = document.getElementById('mg-filter-' + f);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(f === filter.toLowerCase() ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value.padStart(2, '0');
      const ym = year + month;
      fetch('/api/dashboard/material-by-group?ym=' + ym + getDivisionParam() + (filter !== 'ALL' ? '&category=' + filter : ''))
        .then(r => r.json())
        .then(data => renderMatGroupSummary(data));
    }

    function setMixEffectFilter(filter) {
      mixEffectCategoryFilter = filter;
      ['all','raw','sub'].forEach(f => {
        var btn = document.getElementById('mix-filter-' + f);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(f === filter.toLowerCase() ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;
      fetch('/api/dashboard/mix-effect?ym=' + ym + getDivisionParam() + (filter !== 'ALL' ? '&category=' + filter : ''))
        .then(function(r) { return r.json(); })
        .then(function(data) { renderMixEffect(data); });
    }

    function renderMatGroupSummary(data) {
      const tbody = document.getElementById('dash-matgroup-body');
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-400 py-8">데이터가 없습니다.</td></tr>';
        return;
      }
      const fmt = (v) => v != null ? Math.round(Number(v)).toLocaleString() : '-';
      const eok = (v) => v != null ? (Number(v) / 100000000).toFixed(2) : '-';
      const diffFmt2 = (v) => {
        const n = Number(v) || 0;
        if (Math.abs(n) < 1) return '-';
        const ev = (Math.abs(n) / 100000000).toFixed(2);
        if (n < 0) return String.fromCharCode(9651) + ev;
        return ev;
      };
      const diffCell2 = (v) => {
        const n = Number(v) || 0;
        if (Math.abs(n) < 1) return '<td class="!py-1.5 text-right font-mono text-gray-400">-</td>';
        const ev = (Math.abs(n) / 100000000).toFixed(2);
        if (n < 0) return '<td class="!py-1.5 text-right font-mono text-red-600">' + String.fromCharCode(9651) + ev + '</td>';
        return '<td class="!py-1.5 text-right font-mono">' + ev + '</td>';
      };
      let tCur=0, tPrev=0, tUsage=0, tPrice=0, tQtyCur=0, tQtyPrev=0;
      let prevGroup = '';
      tbody.innerHTML = data.map(d => {
        const curCost = Number(d.material_cost) || 0;
        const prevCost = Number(d.prev_material_cost) || 0;
        const usageDiff = Number(d.usage_diff) || 0;
        const priceDiff = Number(d.price_diff) || 0;
        const qtyCur = Number(d.total_alloc_qty) || 0;
        const qtyPrev = Number(d.prev_alloc_qty) || 0;
        tCur += curCost; tPrev += prevCost; tUsage += usageDiff; tPrice += priceDiff; tQtyCur += qtyCur; tQtyPrev += qtyPrev;
        const groupKey = d.machine_code + '|' + d.material_group_major_name;
        const groupChanged = groupKey !== prevGroup;
        prevGroup = groupKey;
        const chipClass = getCC(d.machine_code);
        return '<tr class="' + (groupChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-sage-50/30">' +
          '<td class="!py-1.5"><span class="unit-chip ' + chipClass + '">' + (d.machine_code||'') + '</span></td>' +
          '<td class="!py-1.5">' + (d.material_group_major_name||'-') + '</td>' +
          '<td class="!py-1.5">' + (d.product_level2_name||'-') + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold">' + eok(curCost) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-500">' + (prevCost ? eok(prevCost) : '-') + '</td>' +
          diffCell2(usageDiff) +
          diffCell2(priceDiff) +
          '<td class="!py-1.5 text-right font-mono">' + fmt(qtyCur) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-500">' + (qtyPrev ? fmt(qtyPrev) : '-') + '</td>' +
          '</tr>';
      }).join('');
      document.getElementById('mg-total-cur').textContent = eok(tCur);
      document.getElementById('mg-total-prev').textContent = eok(tPrev);
      const usEl = document.getElementById('mg-total-usage'); usEl.textContent = diffFmt2(tUsage); usEl.className = '!py-2 text-right font-mono ' + (tUsage < 0 ? 'text-red-600' : '');
      const prEl = document.getElementById('mg-total-price'); prEl.textContent = diffFmt2(tPrice); prEl.className = '!py-2 text-right font-mono ' + (tPrice < 0 ? 'text-red-600' : '');
      document.getElementById('mg-total-qty-cur').textContent = fmt(tQtyCur);
      document.getElementById('mg-total-qty-prev').textContent = fmt(tQtyPrev);
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
      // 원단위 = 총비용(원) ÷ 생산량(kg) ÷ 1000 = 천원/톤
      unitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: unitSummaryData.map(u=>u.unit_name),
          datasets: [
            { label: '전월', data: unitSummaryData.map(u => {
              var prodTon = (u.prev_production_qty || 0) / 1000;
              return prodTon > 0 ? u.prev_total_cost / prodTon / 1000 : 0;
            }), backgroundColor: '#c7d2fe', borderRadius: 6, barPercentage: 0.6 },
            { label: '당월', data: unitSummaryData.map(u => {
              var prodTon = (u.production_qty || 0) / 1000;
              return prodTon > 0 ? u.cur_total_cost / prodTon / 1000 : 0;
            }), backgroundColor: '#4f46e5', borderRadius: 6, barPercentage: 0.6 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position:'top', align:'end', labels: { boxWidth:8, usePointStyle:true, pointStyle:'circle', font:{size:11} } } },
          scales: { y: { beginAtZero:true, grid:{color:'#f1f5f9'}, ticks:{font:{size:10}, callback:v=>Math.round(v).toLocaleString()} }, x: { grid:{display:false}, ticks:{font:{size:11}} } }
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

    function renderUnitSummaryTable() {}

    function renderTopImpact() {}

    // ============ 상세 분석표 (raw_records 기반, 전월 vs 전전월 비교) ============
    async function loadDetailAnalysis() {
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var curMonth = parseInt(month);
      // 기준월 6월 → 전월(5월)=당월실적, 전전월(4월)=전월실적
      var prevMonth = curMonth - 1;
      var prevYear = parseInt(year);
      if (prevMonth < 1) { prevMonth = 12; prevYear--; }
      var prevYm = String(prevYear) + String(prevMonth).padStart(2, '0');
      var prevPrevMonth = prevMonth - 1;
      var prevPrevYear = prevYear;
      if (prevPrevMonth < 1) { prevPrevMonth = 12; prevPrevYear--; }
      var prevPrevYm = String(prevPrevYear) + String(prevPrevMonth).padStart(2, '0');

      var tb = document.getElementById('detail-table-body');
      if (!tb) return;
      tb.innerHTML = '<tr><td colspan="16" class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>로딩 중...</td></tr>';

      try {
        // 전전월(전월실적)과 전월(당월실적) 데이터 동시 로드
        var results = await Promise.all([
          fetch('/api/forecast/material-detail?ym=' + prevPrevYm + getDivisionParam()).then(function(r){return r.json();}),
          fetch('/api/forecast/material-detail?ym=' + prevYm + getDivisionParam()).then(function(r){return r.json();})
        ]);
        var prevData = results[0]; // 전전월 = 전월실적
        var curData = results[1];  // 전월 = 당월실적

        if (!curData || !curData.rows || !curData.rows.length) {
          tb.innerHTML = '<tr><td colspan="16" class="text-center py-8 text-gray-400">데이터가 없습니다</td></tr>';
          return;
        }

        // 전전월 맵 구성 (machine_code + material_code → data)
        var prevMap = {};
        if (prevData && prevData.rows) {
          prevData.rows.forEach(function(r) {
            var key = r.machine_code + '|' + r.material_code;
            prevMap[key] = r;
          });
        }

        // 테이블 헤더 레이블 업데이트
        var headerRow = tb.parentNode.querySelector('thead tr');
        if (headerRow) {
          var ths = headerRow.querySelectorAll('th');
          if (ths.length >= 16) {
            ths[5].textContent = prevPrevYm.substring(2,4) + '.' + prevPrevYm.substring(4) + '수량';
            ths[6].textContent = prevYm.substring(2,4) + '.' + prevYm.substring(4) + '수량';
            ths[8].textContent = prevPrevYm.substring(2,4) + '.' + prevPrevYm.substring(4) + '단가';
            ths[9].textContent = prevYm.substring(2,4) + '.' + prevYm.substring(4) + '단가';
            ths[11].textContent = prevPrevYm.substring(2,4) + '.' + prevPrevYm.substring(4) + '원가';
            ths[12].textContent = prevYm.substring(2,4) + '.' + prevYm.substring(4) + '원가';
          }
        }

        var html = '';
        curData.rows.forEach(function(r) {
          var key = r.machine_code + '|' + r.material_code;
          var prev = prevMap[key] || {};
          var prevUsage = Number(prev.usage_qty) || 0;
          var curUsage = Number(r.usage_qty) || 0;
          var prevPrice = Number(prev.unit_price) || 0;
          var curPrice = Number(r.unit_price) || 0;
          var prevCost = prevUsage * prevPrice;
          var curCost = curUsage * curPrice;
          var qtyDiff = curUsage - prevUsage;
          var priceDiff = curPrice - prevPrice;
          var costDiff = curCost - prevCost;
          var qtyEffect = (curUsage - prevUsage) * prevPrice;
          var priceEffect = (curPrice - prevPrice) * curUsage;

          var chipClass = getCC(r.machine_code);
          var catLabel = (r.material_group_major_name || '').includes('원') ? '원' : '부';
          var catClass = catLabel === '원' ? 'bg-steel-50 text-steel-400' : 'bg-sage-50 text-sage-600';

          html += '<tr class="hover:bg-slate-50/50">';
          html += '<td><span class="unit-chip ' + chipClass + '">' + r.machine_code + '</span></td>';
          html += '<td><span class="text-[10px] px-1.5 py-0.5 rounded ' + catClass + '">' + catLabel + '</span></td>';
          html += '<td class="text-gray-400 font-mono text-[11px]">' + r.material_code + '</td>';
          html += '<td class="font-medium text-xs">' + (r.material_name || '') + '</td>';
          html += '<td class="text-gray-400 text-xs">kg</td>';
          html += '<td class="text-right font-mono text-xs">' + (prevUsage ? Math.round(prevUsage).toLocaleString() : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs">' + (curUsage ? Math.round(curUsage).toLocaleString() : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs ' + (qtyDiff > 0 ? 'text-red-500' : qtyDiff < 0 ? 'text-blue-500' : '') + '">' + (qtyDiff ? Math.round(qtyDiff).toLocaleString() : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs">' + (prevPrice ? Math.round(prevPrice).toLocaleString() : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs">' + (curPrice ? Math.round(curPrice).toLocaleString() : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs ' + (priceDiff > 0 ? 'text-red-500' : priceDiff < 0 ? 'text-blue-500' : '') + '">' + (priceDiff ? Math.round(priceDiff).toLocaleString() : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs">' + (prevCost ? (prevCost/1000000).toFixed(1) : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs">' + (curCost ? (curCost/1000000).toFixed(1) : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs font-medium ' + (qtyEffect > 0 ? 'text-red-500' : qtyEffect < 0 ? 'text-blue-500' : '') + '">' + (qtyEffect ? (qtyEffect/1000000).toFixed(1) : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs font-medium ' + (priceEffect > 0 ? 'text-red-500' : priceEffect < 0 ? 'text-blue-500' : '') + '">' + (priceEffect ? (priceEffect/1000000).toFixed(1) : '-') + '</td>';
          html += '<td class="text-right font-mono text-xs font-bold ' + (costDiff > 0 ? 'text-red-500' : costDiff < 0 ? 'text-blue-500' : '') + '">' + (costDiff ? (costDiff/1000000).toFixed(1) : '-') + '</td>';
          html += '</tr>';
        });
        tb.innerHTML = html;
      } catch(e) {
        console.error('Detail analysis error:', e);
        tb.innerHTML = '<tr><td colspan="16" class="text-center py-8 text-gray-400">데이터 로드 오류</td></tr>';
      }
    }

    function renderDetailTable() {
      const tb = document.getElementById('detail-table-body');
      if (!analysisData?.items?.length) { tb.innerHTML='<tr><td colspan="16" class="text-center py-8 text-gray-400">데이터 없음</td></tr>'; return; }
      tb.innerHTML = analysisData.items.map(i => \`<tr>
        <td><span class="unit-chip \${getCC(i.unit_code)}">\${i.unit_name}</span></td>
        <td><span class="text-[10px] px-1.5 py-0.5 rounded \${i.category==='RAW'?'bg-steel-50 text-steel-400':'bg-sage-50 text-sage-600'}">\${i.category==='RAW'?'원':'부'}</span></td>
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
    let uploadMode = 'simple'; // 'simple' or 'sap'
    let uploadRawData = []; // SAP 원본 37컬럼 전체 데이터
    function handleDrop(e) { e.preventDefault(); e.currentTarget.classList.remove('border-primary-400','bg-primary-50/50'); processFile(e.dataTransfer.files[0]); }
    function handleFileSelect(e) { processFile(e.target.files[0]); }
    
    // SAP 형식 자동 감지
    function detectSAPFormat(headers) {
      // SAP 형식은 반드시 달력연도/월 컬럼이 있어야 함
      var hasPeriod = headers.some(function(h) { return h && (h.includes('달력연도/월') || h.includes('달력연도')); });
      if (!hasPeriod) return false;
      const sapIndicators = ['생산호기', '자재 그룹', '출고수량', '출고금액', '실제단가', '실제 원단위', '자재그룹(대분류)', '생산호기명'];
      const matchCount = sapIndicators.filter(ind => headers.some(h => (h||'').includes(ind))).length;
      return matchCount >= 3;
    }

    function detectRawMaterialFormat(headers) {
      // 원재료 기본형식: 생산호기 있음 + 달력연도/월 없음 + 총생산량(당월) 있음 + 총생산량(전월) 있음
      var hasMachine = headers.some(function(h) { return (h||'').includes('생산호기'); });
      var hasNoPeriod = !headers.some(function(h) { return (h||'').includes('달력연도'); });
      var hasCurProd = headers.some(function(h) { return (h||'').includes('총생산량') && (h||'').includes('당월'); });
      var hasPrevProd = headers.some(function(h) { return (h||'').includes('총생산량') && (h||'').includes('전월'); });
      return hasMachine && hasNoPeriod && hasCurProd && hasPrevProd;
    }

    function parseRawMaterialData(json, headers, assignedYm) {
      // 기준월 assignedYm = '202604' → 당월=202604, 전월=202603
      var curYm = assignedYm;
      var y = parseInt(assignedYm.substring(0, 4));
      var m = parseInt(assignedYm.substring(4, 6)) - 1;
      if (m < 1) { m = 12; y -= 1; }
      var prevYm = String(y) + String(m).padStart(2, '0');

      var findCol = function(keywords) { return headers.findIndex(function(h) { return h && keywords.some(function(k) { return h.includes(k); }); }); };
      // 당월 / 전월 컬럼 구분: (당월)이 포함된 것 vs (전월)이 포함된 것
      var findCurCol = function(keyword) { return headers.findIndex(function(h) { return h && h.includes(keyword) && h.includes('당월'); }); };
      var findPrevCol = function(keyword) { return headers.findIndex(function(h) { return h && h.includes(keyword) && h.includes('전월'); }); };

      var colMachine = findCol(['생산호기']);
      var colLevel1 = findCol(['제품계층 구조레벨 1', '제품계층']);
      var colLevel2 = findCol(['제품 계층구조레벨 2']);
      var colLevel3 = findCol(['제품 계층구조레벨 3']);
      var colLevel4 = findCol(['제품 계층구조레벨 4']);
      // col5 (level4명) - 제품계층4 바로 다음 None 헤더 or check
      var colLevel4Name = colLevel4 >= 0 ? colLevel4 + 1 : -1;
      var colMatGroupMajorName = findCol(['자재그룹(대분류)']);
      // '자재' 컬럼: '자재그룹'이 아닌 정확히 '자재'만 매칭 (exact match or ends with '자재')
      var colMatCode = headers.findIndex(function(h) { return h && h.trim() === '자재'; });
      if (colMatCode < 0) { colMatCode = headers.findIndex(function(h) { return h && h.includes('자재') && !h.includes('자재그룹') && !h.includes('자재명'); }); }
      // 자재명은 자재 다음 컬럼 (None 헤더 = __EMPTY_1)
      var colMatName = colMatCode >= 0 ? colMatCode + 1 : -1;

      // 당월 계획/실적
      var colPlanUnit = findCurCol('계획 원단위(KG/Ton)');
      var colCompQty = findCurCol('구성부품수량');
      var colBaseQty = findCurCol('기준수량');
      var colPlanUnitWaste = findCurCol('계획 원단위(폐품포함)');
      var colPlanPrice = findCurCol('계획 단가');
      var colPlanAlloc = findCurCol('계획 배부수량');
      var colCurTotalProd = findCurCol('총생산량');
      var colCurProdQty = findCurCol('생산수량');
      var colCurWaste = findCurCol('폐품수량');
      var colCurActualUnit = findCurCol('실제 원단위');
      var colCurActualAlloc = findCurCol('실제 배부수량');
      var colCurActualPrice = findCurCol('실제단가');
      var colCurIssueQty = findCurCol('출고수량');
      var colCurIssueAmt = findCurCol('출고금액');
      var colCurUsageDiff = findCol(['계획대비']);
      var colCurPriceDiff = colCurUsageDiff >= 0 ? colCurUsageDiff + 1 : -1;

      // 전월 실적
      var colPrevTotalProd = findPrevCol('총생산량');
      var colPrevProdQty = findPrevCol('생산수량');
      var colPrevWaste = findPrevCol('폐품수량');
      var colPrevActualUnit = findPrevCol('실제 원단위');
      var colPrevActualAlloc = findPrevCol('실제 배부수량');
      var colPrevActualPrice = findPrevCol('실제단가');
      var colPrevIssueQty = findPrevCol('출고수량');
      var colPrevIssueAmt = findPrevCol('출고금액');
      var colPrevUsageDiff = findCol(['전월대비']);
      var colPrevPriceDiff = colPrevUsageDiff >= 0 ? colPrevUsageDiff + 1 : -1;

      var rawRows = [];
      var matGroupMajorCodeMap = { '펄프': '1100', '고지': '1200' };

      json.forEach(function(row) {
        var get = function(colIdx) { return colIdx >= 0 ? String(row[headers[colIdx]] || '') : ''; };
        var getNum = function(colIdx) { return colIdx >= 0 ? (parseFloat(row[headers[colIdx]]) || 0) : 0; };

        var machine = get(colMachine);
        var matCode = get(colMatCode);
        if (!machine || !matCode || matCode === '0') return;

        var matGroupName = get(colMatGroupMajorName);
        var matGroupCode = matGroupMajorCodeMap[matGroupName] || matCode.substring(0, 4);

        // 당월 raw_record
        rawRows.push({
          calendar_ym: curYm,
          process_code: '', process_name: '',
          machine_code: machine, machine_name: machine,
          product_level1: '', product_level1_name: get(colLevel1),
          product_level2: '', product_level2_name: get(colLevel2),
          product_level3: '', product_level3_name: get(colLevel3),
          product_level4: get(colLevel4), product_level4_name: get(colLevel4Name),
          material_code: matCode, material_name: get(colMatName),
          material_group: '', material_group_name: '',
          material_group_major: matGroupCode, material_group_major_name: matGroupName,
          product_type_code: '', product_type_name: '',
          plan_unit_consumption: getNum(colPlanUnit),
          component_qty: getNum(colCompQty),
          base_qty: getNum(colBaseQty),
          plan_unit_consumption_waste: getNum(colPlanUnitWaste),
          plan_unit_price: getNum(colPlanPrice),
          plan_alloc_qty: getNum(colPlanAlloc),
          total_production: getNum(colCurTotalProd),
          production_qty: getNum(colCurProdQty),
          waste_qty: getNum(colCurWaste),
          actual_unit_consumption: getNum(colCurActualUnit),
          actual_alloc_qty: getNum(colCurActualAlloc),
          actual_unit_price: getNum(colCurActualPrice),
          issue_qty: getNum(colCurIssueQty),
          issue_amount: getNum(colCurIssueAmt),
          plan_vs_usage_diff: getNum(colCurUsageDiff),
          plan_vs_price_diff: getNum(colCurPriceDiff)
        });

        // 전월 raw_record (전월 실적 데이터가 있는 경우만)
        var prevProd = getNum(colPrevTotalProd);
        var prevAlloc = getNum(colPrevActualAlloc);
        if (prevProd !== 0 || prevAlloc !== 0) {
          rawRows.push({
            calendar_ym: prevYm,
            process_code: '', process_name: '',
            machine_code: machine, machine_name: machine,
            product_level1: '', product_level1_name: get(colLevel1),
            product_level2: '', product_level2_name: get(colLevel2),
            product_level3: '', product_level3_name: get(colLevel3),
            product_level4: get(colLevel4), product_level4_name: get(colLevel4Name),
            material_code: matCode, material_name: get(colMatName),
            material_group: '', material_group_name: '',
            material_group_major: matGroupCode, material_group_major_name: matGroupName,
            product_type_code: '', product_type_name: '',
            plan_unit_consumption: 0, component_qty: 0, base_qty: 0,
            plan_unit_consumption_waste: 0, plan_unit_price: 0, plan_alloc_qty: 0,
            total_production: prevProd,
            production_qty: getNum(colPrevProdQty),
            waste_qty: getNum(colPrevWaste),
            actual_unit_consumption: getNum(colPrevActualUnit),
            actual_alloc_qty: prevAlloc,
            actual_unit_price: getNum(colPrevActualPrice),
            issue_qty: getNum(colPrevIssueQty),
            issue_amount: getNum(colPrevIssueAmt),
            plan_vs_usage_diff: getNum(colPrevUsageDiff),
            plan_vs_price_diff: getNum(colPrevPriceDiff)
          });
        }
      });

      return { rawRows: rawRows, curYm: curYm, prevYm: prevYm };
    }

    // SAP 형식 데이터를 내부 구조로 변환
    function parseSAPData(json, headers) {
      // 두 번째 행이 기술코드(BIC_xxx, CALMONTH 등)인지 확인 → 스킵
      let dataRows = json;
      if (json.length > 0) {
        const firstVals = Object.values(json[0]);
        if (firstVals.some(v => String(v||'').startsWith('BIC_') || String(v||'').startsWith('CALMONTH'))) {
          dataRows = json.slice(1);
        }
      }
      
      // SAP 컬럼 인덱스 매핑 (헤더에서 찾기)
      const findCol = (keywords) => headers.findIndex(h => h && keywords.some(k => h.includes(k)));
      
      const colMap = {
        period: findCol(['달력연도/월', '달력연도']),
        processCode: findCol(['공정']),
        processName: findCol(['공정명']),
        machine: findCol(['생산호기']),
        machineName: findCol(['생산호기명']),
        productLevel1: findCol(['제품계층 구조레벨 1', '제품계층']),
        productLevel1Name: findCol(['제품계층 구조레벨 1명', '제품계층 구조레벨 1']),
        productLevel2: findCol(['제품 계층구조레벨 2']),
        productLevel2Name: findCol(['제품 계층구조레벨 2명']),
        productLevel3: findCol(['제품 계층구조레벨 3']),
        productLevel3Name: findCol(['제품 계층구조레벨 3명']),
        productLevel4: findCol(['제품 계층구조레벨 4']),
        productLevel4Name: findCol(['제품 계층구조레벨 4명']),
        matCode: findCol(['자재']),
        matName: findCol(['자재명']),
        matGroupCode: findCol(['자재 그룹']),
        matGroupName: findCol(['자재 그룹명']),
        matGroupMajor: findCol(['자재그룹(대분류)']),
        matGroupMajorName: findCol(['자재그룹(대분류)명']),
        productTypeCode: findCol(['지종/제품구분']),
        productTypeName: findCol(['지종/제품구분명']),
        planUnitConsumption: findCol(['계획 원단위(KG/Ton)']),
        componentQty: findCol(['구성부품수량']),
        baseQty: findCol(['기준수량']),
        planUnitConsumptionWaste: findCol(['계획 원단위(폐품포함)']),
        planUnitPrice: findCol(['계획 단가']),
        planAllocQty: findCol(['계획 배부수량']),
        totalProduction: findCol(['총생산량']),
        productionQty: findCol(['생산수량']),
        wasteQty: findCol(['폐품수량']),
        actualUnitConsumption: findCol(['실제 원단위(KG/Ton)']),
        actualAllocQty: findCol(['실제 배부수량']),
        actualUnitPrice: findCol(['실제단가']),
        issueQty: findCol(['출고수량']),
        issueAmount: findCol(['출고금액']),
        planVsUsageDiff: findCol(['계획대비 사용량', '사용량차이', '사용량 차이']),
        planVsPriceDiff: findCol(['계획대비 단가', '단가차이', '단가 차이']),
      };

      // productLevel1Name이 productLevel1과 같은 인덱스를 가리키면 다시 찾기
      if (colMap.productLevel1Name === colMap.productLevel1) {
        colMap.productLevel1Name = headers.findIndex((h,i) => i !== colMap.productLevel1 && h && h.includes('제품계층 구조레벨 1'));
      }
      
      const results = { rows: [], rawRows: [] };
      
      dataRows.forEach(row => {
        const get = (colIdx) => colIdx >= 0 ? String(row[headers[colIdx]] ?? '') : '';
        const getNum = (colIdx) => colIdx >= 0 ? (parseFloat(row[headers[colIdx]]) || 0) : 0;
        
        const period = get(colMap.period);
        const machine = get(colMap.machine);
        const matCodeRaw = get(colMap.matCode);
        const matCode = matCodeRaw.replace(/^0+/, '') || matCodeRaw;
        
        if (!period || !machine || !matCode || matCode === '0') return;
        
        // monthly_records용 (집계 대상)
        results.rows.push({
          period: period,
          machine: machine,
          mat_group_code: get(colMap.matGroupCode),
          mat_group_major: get(colMap.matGroupMajor),
          mat_group_desc: get(colMap.matGroupMajorName) || get(colMap.matGroupName) || '',
          product_type: get(colMap.productTypeName) || get(colMap.productTypeCode) || '',
          product_level1: get(colMap.productLevel1),
          mat_code: matCode,
          mat_name: get(colMap.matName),
          unit: 'KG',
          total_production: getNum(colMap.totalProduction),
          production_qty: getNum(colMap.productionQty),
          actual_unit_consumption: getNum(colMap.actualUnitConsumption),
          actual_unit_price: getNum(colMap.actualUnitPrice),
          issue_qty: getNum(colMap.issueQty),
          issue_amount: getNum(colMap.issueAmount),
          plan_vs_usage_diff: getNum(colMap.planVsUsageDiff),
          plan_vs_price_diff: getNum(colMap.planVsPriceDiff),
        });
        
        // raw_records용 (37컬럼 전체, 원본 그대로)
        results.rawRows.push({
          calendar_ym: period,
          process_code: get(colMap.processCode),
          process_name: get(colMap.processName),
          machine_code: machine,
          machine_name: get(colMap.machineName),
          product_level1: get(colMap.productLevel1),
          product_level1_name: get(colMap.productLevel1Name),
          product_level2: get(colMap.productLevel2),
          product_level2_name: get(colMap.productLevel2Name),
          product_level3: get(colMap.productLevel3),
          product_level3_name: get(colMap.productLevel3Name),
          product_level4: get(colMap.productLevel4),
          product_level4_name: get(colMap.productLevel4Name),
          material_code: matCodeRaw,
          material_name: get(colMap.matName),
          material_group: get(colMap.matGroupCode),
          material_group_name: get(colMap.matGroupName),
          material_group_major: get(colMap.matGroupMajor),
          material_group_major_name: get(colMap.matGroupMajorName),
          product_type_code: get(colMap.productTypeCode),
          product_type_name: get(colMap.productTypeName),
          plan_unit_consumption: getNum(colMap.planUnitConsumption),
          component_qty: getNum(colMap.componentQty),
          base_qty: getNum(colMap.baseQty),
          plan_unit_consumption_waste: getNum(colMap.planUnitConsumptionWaste),
          plan_unit_price: getNum(colMap.planUnitPrice),
          plan_alloc_qty: getNum(colMap.planAllocQty),
          total_production: getNum(colMap.totalProduction),
          production_qty: getNum(colMap.productionQty),
          waste_qty: getNum(colMap.wasteQty),
          actual_unit_consumption: getNum(colMap.actualUnitConsumption),
          actual_alloc_qty: getNum(colMap.actualAllocQty),
          actual_unit_price: getNum(colMap.actualUnitPrice),
          issue_qty: getNum(colMap.issueQty),
          issue_amount: getNum(colMap.issueAmount),
          plan_vs_usage_diff: getNum(colMap.planVsUsageDiff),
          plan_vs_price_diff: getNum(colMap.planVsPriceDiff),
        });
      });
      
      return results;
    }

    function processFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        if (!json.length) { alert('데이터가 없습니다.'); return; }
        
        const headers = Object.keys(json[0]);
        const isSAP = detectSAPFormat(headers);
        const isRawMaterial = !isSAP && detectRawMaterialFormat(headers);
        
        if (isRawMaterial) {
          uploadMode = 'sap';  // 같은 업로드 로직 사용 (rawRows 기반)
          // 기준월 가져오기
          var ymYear = document.getElementById('analysisYear').value;
          var ymMonth = document.getElementById('analysisMonth').value.padStart(2, '0');
          var assignedYm = ymYear + ymMonth;
          // 사용자에게 확인
          var userYm = prompt('기준월을 입력하세요 (YYYYMM 형식):', assignedYm);
          if (!userYm || userYm.length !== 6) { alert('유효한 기준월을 입력하세요 (예: 202604)'); return; }
          
          var parsed = parseRawMaterialData(json, headers, userYm);
          uploadData = [];  // monthly_records용은 없음
          uploadRawData = parsed.rawRows;
          
          document.getElementById('upload-area').classList.add('hidden');
          document.getElementById('upload-preview').classList.remove('hidden');
          document.getElementById('upload-filename').textContent = file.name;
          document.getElementById('upload-info').innerHTML = '<span class="inline-flex items-center px-2 py-0.5 rounded bg-sage-100 text-sage-700 text-xs font-medium mr-2">\uc6d0\uc7ac\ub8cc \uae30\ubcf8\ud615\uc2dd \uac10\uc9c0</span>' +
            '\ub2f9\uc6d4(' + parsed.curYm + ') + \uc804\uc6d4(' + parsed.prevYm + ') | \ucd1d ' + parsed.rawRows.length + '\ud589 \uc800\uc7a5 \uc608\uc815';
          document.getElementById('upload-count').textContent = String(parsed.rawRows.length);
          
          // Preview
          var previewHeaders2 = ['\uae30\uac04','\ud638\uae30','\uc790\uc7ac\ucf54\ub4dc','\uc790\uc7ac\uba85','\uc790\uc7ac\uadf8\ub8f9','\uc81c\ud488\uad6c\ubd84','\ucd1d\uc0dd\uc0b0\ub7c9','\uc2e4\uc81c\ubc30\ubd80\uc218\ub7c9','\uc2e4\uc81c\ub2e8\uac00'];
          document.getElementById('preview-head').innerHTML = '<tr>'+previewHeaders2.map(function(x){return '<th class="text-xs">'+x+'</th>';}).join('')+'</tr>';
          document.getElementById('preview-body').innerHTML = parsed.rawRows.slice(0,20).map(function(r) {
            return '<tr><td>'+r.calendar_ym+'</td><td><span class="unit-chip '+getCC(r.machine_code)+'">'+r.machine_code+'</span></td><td class="font-mono text-xs">'+r.material_code+'</td><td>'+r.material_name+'</td><td>'+r.material_group_major_name+'</td><td class="text-xs">'+r.product_level2_name+'</td><td class="text-right">'+Math.round(r.total_production).toLocaleString()+'</td><td class="text-right">'+Math.round(r.actual_alloc_qty).toLocaleString()+'</td><td class="text-right">'+Math.round(r.actual_unit_price).toLocaleString()+'</td></tr>';
          }).join('');
        } else if (isSAP) {
          uploadMode = 'sap';
          const parsed = parseSAPData(json, headers);
          uploadData = parsed.rows;
          uploadRawData = parsed.rawRows;
          
          document.getElementById('upload-area').classList.add('hidden');
          document.getElementById('upload-preview').classList.remove('hidden');
          document.getElementById('upload-filename').textContent = file.name;
          document.getElementById('upload-info').innerHTML = '<span class="inline-flex items-center px-2 py-0.5 rounded bg-sage-100 text-sage-700 text-xs font-medium mr-2">SAP 형식 감지</span>' + parsed.rows.length + '행 (유효 데이터) | 원본 ' + parsed.rawRows.length + '행 전체 저장';
          document.getElementById('upload-count').textContent = parsed.rows.length;
          
          // SAP preview table
          const previewHeaders = ['기간','호기','자재코드','자재명','자재그룹','제품구분','출고수량','실제단가','출고금액','생산수량'];
          document.getElementById('preview-head').innerHTML = '<tr>'+previewHeaders.map(x=>'<th class="text-xs">'+x+'</th>').join('')+'</tr>';
          document.getElementById('preview-body').innerHTML = parsed.slice(0,20).map(r => 
            '<tr><td>'+r.period+'</td><td><span class="unit-chip '+getCC(r.machine)+'">'+r.machine+'</span></td><td class="font-mono text-xs">'+r.mat_code+'</td><td>'+r.mat_name+'</td><td>'+r.mat_group_desc+'</td><td class="text-xs text-gray-400">'+r.product_type+'</td><td class="text-right">'+fmt(r.issue_qty)+'</td><td class="text-right">'+fmt(Math.round(r.actual_unit_price))+'</td><td class="text-right">'+fmt(r.issue_amount)+'</td><td class="text-right">'+fmt(Math.round(r.production_qty))+'</td></tr>'
          ).join('');
        } else {
          uploadMode = 'simple';
          uploadData = json;
          document.getElementById('upload-area').classList.add('hidden');
          document.getElementById('upload-preview').classList.remove('hidden');
          document.getElementById('upload-filename').textContent = file.name;
          document.getElementById('upload-info').innerHTML = '<span class="inline-flex items-center px-2 py-0.5 rounded bg-steel-50 text-steel-400 text-xs font-medium mr-2">기본 형식</span>' + json.length + '행';
          document.getElementById('upload-count').textContent = json.length;
          const h = Object.keys(json[0]);
          document.getElementById('preview-head').innerHTML = '<tr>'+h.map(x=>'<th class="text-xs">'+x+'</th>').join('')+'</tr>';
          document.getElementById('preview-body').innerHTML = json.slice(0,15).map(r=>'<tr>'+h.map(x=>'<td class="text-xs">'+(r[x]??'')+'</td>').join('')+'</tr>').join('');
        }
      };
      reader.readAsArrayBuffer(file);
    }
    
    async function submitUpload() {
      if (!uploadData.length && !(uploadRawData && uploadRawData.length)) return;
      
      if (uploadMode === 'sap') {
        // SAP 형식: 스마트 업로드 API 호출 (집계 + 원본 전체)
        const btn = event.target;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>처리중...';
        try {
          // 원본 데이터를 청크로 분할 업로드
          const chunkSize = 500;
          const rawData = uploadRawData || [];
          let totalRawInserted = 0;
          let mainResult = null;
          
          for (let i = 0; i < Math.max(rawData.length, 1); i += chunkSize) {
            const rawChunk = rawData.slice(i, i + chunkSize);
            const payload = {
              rows: i === 0 ? uploadData : [],  // monthly rows는 첫 청크에만
              rawRows: rawChunk,
              fileName: document.getElementById('upload-filename')?.textContent || '',
              division: currentDivision || 'PS'
            };
            
            const res = await fetch('/api/upload/smart', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (!res.ok || !result.success) {
              alert('업로드 실패 (청크 ' + i + '): ' + (result.error || '알 수 없는 오류'));
              return;
            }
            totalRawInserted += rawChunk.length;
            if (i === 0) mainResult = result;
          }
          
          alert('업로드 완료!\\n\\n' +
            '총 입력 행: ' + (mainResult?.summary?.total_rows || uploadData.length) + '건\\n' +
            '등록된 레코드: ' + (mainResult?.summary?.records_inserted || 0) + '건\\n' +
            '원본 데이터 저장: ' + totalRawInserted + '건 (37컬럼 전체)\\n' +
            '신규 자재 등록: ' + (mainResult?.summary?.new_materials || 0) + '건\\n' +
            '스킵: ' + (mainResult?.summary?.skipped || 0) + '건\\n' +
            '(동일 호기/자재/월 데이터는 합산됨)');
          resetUpload();
          // 업로드한 데이터 기준으로 분석월을 다음 달로 설정
          // (시스템 로직: 선택월 = 예상월, 업로드 데이터 = 실적)
          if (rawData.length > 0 && rawData[0].calendar_ym) {
            var uploadedYm = rawData[0].calendar_ym;
            var uploadedYear = parseInt(uploadedYm.substring(0, 4));
            var uploadedMonth = parseInt(uploadedYm.substring(4, 6));
            // 다음 달을 분석월로 설정 (실적 데이터의 다음월 = 예상월)
            var nextMonth = uploadedMonth + 1;
            var nextYear = uploadedYear;
            if (nextMonth > 12) { nextMonth = 1; nextYear++; }
            var yearSel = document.getElementById('analysisYear');
            var monthSel = document.getElementById('analysisMonth');
            if (yearSel) yearSel.value = String(nextYear);
            if (monthSel) monthSel.value = String(nextMonth);
          }
          loadAnalysis();
          switchTab('dashboard');
          unitsCache = await fetch('/api/units').then(r=>r.json());
          materialsCache = await fetch('/api/materials').then(r=>r.json());
        } catch(err) {
          alert('업로드 중 오류: ' + err.message);
        } finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-check mr-1"></i>업로드 (<span id="upload-count">0</span>건)';
        }
      } else {
        // 기본 형식: 기존 로직
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
    }
    
    function resetUpload() { uploadData=[]; uploadRawData=[]; uploadMode='simple'; document.getElementById('upload-area').classList.remove('hidden'); document.getElementById('upload-preview').classList.add('hidden'); document.getElementById('file-input').value=''; }
    function downloadTemplate() {
      const t = [
        {'     달력연도/월':202605,'공정':100,'공정명':'점보롤','생산호기':'PM2','생산호기명':'제지 2호기','자재':1200000,'자재명':'화이트레저(B)','자재 그룹':1201,'자재 그룹명':'고지 : 화이트레저','자재그룹(대분류)':1200,'자재그룹(대분류)명':'고지','       실제 원단위(KG/Ton)(당월)':150,'        실제 배부수량(당월)':15674,'      실제단가(당월)':335,'       실제 재료비(당월)':5250831,'       출고수량(당월)':2824806,'      출고금액(당월)':946668270,'      총생산량(당월)':104256},
        {'     달력연도/월':202605,'공정':100,'공정명':'점보롤','생산호기':'PM3','생산호기명':'제지 3호기','자재':1100016,'자재명':'DIP(국내산)','자재 그룹':1101,'자재 그룹명':'펄프 : DIP','자재그룹(대분류)':1100,'자재그룹(대분류)명':'펄프','       실제 원단위(KG/Ton)(당월)':11.4,'        실제 배부수량(당월)':255794,'      실제단가(당월)':899,'       실제 재료비(당월)':229960506,'       출고수량(당월)':255794,'      출고금액(당월)':229960506,'      총생산량(당월)':20594},
      ];
      const ws=XLSX.utils.json_to_sheet(t); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'실적데이터'); XLSX.writeFile(wb,'원부자재_업로드양식_SAP.xlsx');
    }

    // CSV Export
    function exportCSV() {
      if (!analysisData?.items?.length) return alert('데이터 없음');
      const h='호기,구분,자재코드,자재명,단위,전월수량,당월수량,수량차이,전월단가,당월단가,단가차이,전월원가,당월원가,수량효과,단가효과,총차이\\n';
      const rows=analysisData.items.map(i=>[i.unit_name,i.category==='RAW'?'원자재':'부자재',i.material_code,i.material_name,i.unit_of_measure,i.prev_usage_qty,i.cur_usage_qty,i.qty_diff,i.prev_unit_price,i.cur_unit_price,i.price_diff,i.prev_total_cost,i.cur_total_cost,i.qty_effect,i.price_effect,i.cost_diff].join(',')).join('\\n');
      const blob=new Blob(['\\uFEFF'+h+rows],{type:'text/csv;charset=utf-8;'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='원가분석_'+document.getElementById('analysisYear').value+'_'+document.getElementById('analysisMonth').value+'월.csv'; a.click();
    }


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


    async function loadUnitsList() {
      const units=await fetch('/api/units').then(r=>r.json());
      document.getElementById('units-list').innerHTML = units.map(u=>\`
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors" id="unit-item-\${u.id}">
          <div class="flex items-center gap-3">
            <span class="unit-chip \${getCC(u.unit_code)}">\${u.unit_name}</span>
            <span class="text-xs font-mono text-gray-400">\${u.unit_code}</span>
            <span class="text-xs text-gray-400">\${u.description||''}</span>
          </div>
          <div class="flex items-center gap-1">
            <button onclick="editUnit(\${u.id}, '\${u.unit_code}', '\${u.unit_name}', '\${(u.description||'').replace(/'/g,"\\\\'")}' )" class="text-blue-400 hover:text-blue-600 px-1.5"><i class="fas fa-pen text-[10px]"></i></button>
            <button onclick="deleteUnit(\${u.id})" class="text-red-400 hover:text-red-600 px-1.5"><i class="fas fa-times text-xs"></i></button>
          </div>
        </div>
      \`).join('');
    }
    async function loadMaterialsList() {
      const mats=await fetch('/api/materials').then(r=>r.json());
      document.getElementById('materials-list').innerHTML = mats.map(m=>\`
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors" id="mat-item-\${m.id}">
          <div class="flex items-center gap-3">
            <span class="text-[10px] px-2 py-0.5 rounded font-medium \${m.category==='RAW'?'bg-steel-50 text-steel-400':'bg-sage-50 text-sage-600'}">\${m.category==='RAW'?'원자재':'부자재'}</span>
            <span class="text-sm font-medium text-gray-700">\${m.material_name}</span>
            <span class="text-xs font-mono text-gray-400">\${m.material_code}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">\${m.unit_of_measure}</span>
            <button onclick="editMaterial(\${m.id})" class="text-blue-400 hover:text-blue-600 px-1.5"><i class="fas fa-pen text-[10px]"></i></button>
            <button onclick="deleteMaterial(\${m.id})" class="text-red-400 hover:text-red-600 px-1.5"><i class="fas fa-times text-xs"></i></button>
          </div>
        </div>
      \`).join('');
    }

    // ---- 호기/자재 수정/삭제 ----
    function editUnit(id, code, name, desc) {
      var newCode = prompt('호기 코드:', code);
      if (newCode === null) return;
      var newName = prompt('호기명:', name);
      if (newName === null) return;
      var newDesc = prompt('설명:', desc || '');
      if (newDesc === null) newDesc = '';
      fetch('/api/units/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_code: newCode, unit_name: newName, description: newDesc })
      }).then(function() { loadUnitsList(); });
    }

    function deleteUnit(id) {
      if (!confirm('이 호기를 비활성화(삭제)하시겠습니까?')) return;
      fetch('/api/units/' + id, { method: 'DELETE' }).then(function() { loadUnitsList(); });
    }

    function editMaterial(id) {
      fetch('/api/materials').then(function(r) { return r.json(); }).then(function(mats) {
        var m = mats.find(function(x) { return x.id === id; });
        if (!m) return;
        var newCode = prompt('자재코드:', m.material_code);
        if (newCode === null) return;
        var newName = prompt('자재명:', m.material_name);
        if (newName === null) return;
        var newCat = prompt('분류 (RAW/SUB):', m.category);
        if (newCat === null) return;
        var newUom = prompt('단위:', m.unit_of_measure);
        if (newUom === null) return;
        fetch('/api/materials/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ material_code: newCode, material_name: newName, category: newCat, unit_of_measure: newUom })
        }).then(function() { loadMaterialsList(); });
      });
    }

    function deleteMaterial(id) {
      if (!confirm('이 자재를 비활성화(삭제)하시겠습니까?')) return;
      fetch('/api/materials/' + id, { method: 'DELETE' }).then(function() { loadMaterialsList(); });
    }

    // Utilities
    function getCC(c) { 
      // 공통코드(CC) 객체에서 칩 컬러 조회 — 하드코딩 제거
      return (CC.machineChipMap && CC.machineChipMap[c]) || 'bg-gray-100 text-gray-600'; 
    }
    function fmt(n) { return n==null?'-':Math.round(n).toLocaleString('ko-KR'); }
    function fmtS(n) { if(n==null) return '-'; const v=Math.round(n); if(v>0) return '+'+v.toLocaleString('ko-KR'); if(v<0) return '\u25B3'+Math.abs(v).toLocaleString('ko-KR'); return '-'; }
    function formatWon(n) {
      if(n==null) return '-';
      const abs=Math.abs(n);
      if(abs>=100000000) return (n/100000000).toFixed(1)+'억';
      if(abs>=10000) return (n/10000).toFixed(0)+'만원';
      return Math.round(n).toLocaleString('ko-KR')+'원';
    }
    function formatSignedWon(n) {
      if(n==null) return '-';
      const abs=Math.abs(n);
      if(n>0) {
        if(abs>=100000000) return '+'+(n/100000000).toFixed(1)+'\uc5b5';
        if(abs>=10000) return '+'+Math.round(n/10000).toLocaleString('ko-KR')+'\ub9cc\uc6d0';
        return '+'+Math.round(n).toLocaleString('ko-KR')+'\uc6d0';
      } else if(n<0) {
        if(abs>=100000000) return '\u25B3'+(abs/100000000).toFixed(1)+'\uc5b5';
        if(abs>=10000) return '\u25B3'+Math.round(abs/10000).toLocaleString('ko-KR')+'\ub9cc\uc6d0';
        return '\u25B3'+Math.round(abs).toLocaleString('ko-KR')+'\uc6d0';
      }
      return '-';
    }

    // ============ FORECAST (전월 대비 예상 실적) ============
    let fcMachineFilter = (divisionMachines && divisionMachines.length) ? (divisionMachines[0].code || divisionMachines[0]) : 'PM2';
    let fcCurData = null;  // 당월 자재 상세
    let fcCurProd = null;  // 당월 생산량
    let fcUnitByProduct = null;  // 자재코드 × 지종별 원단위
    let fcNextInputs = {}; // 차월 사용자 입력값 저장
    let fcSavedManual = null;  // 수기입력 저장 데이터 (연동)
    let fcManualFlags = {}; // { idx: { usage: true, uc: true } } - 사용자가 직접 수정한 행 추적

    function setFcMachineFilter(mc) {
      fcMachineFilter = mc;
      var fcMachineList = (divisionMachines || []).map(function(m){ return m.code || m; });
      if (!fcMachineList.length) fcMachineList = (CC.machines || []).map(function(m){ return m.code || m; });
      if (!fcMachineList.length) fcMachineList = Object.keys(CC.machineChipMap);
      fcMachineList.forEach(function(k) {
        var btn = document.getElementById('fc-mc-' + k.toLowerCase());
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(k === mc ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      loadForecast();
    }

    async function loadForecast() {
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;
      var curMonth = parseInt(month);
      // 전월(실적) 계산
      var prevMonth = curMonth - 1;
      var prevYear = parseInt(year);
      if (prevMonth < 1) { prevMonth = 12; prevYear--; }
      var prevYmStr = String(prevYear) + '.' + String(prevMonth).padStart(2,'0');
      var curYmStr = year + '.' + month;

      // 헤더 레이블: 전월 실적 vs 기준월 예상
      var labelEl = document.getElementById('fc-period-label');
      if (labelEl) labelEl.textContent = fcMachineFilter + ' | ' + prevYmStr + ' 실적 vs ' + curYmStr + ' 예상';

      var curH = document.getElementById('fc-cur-header');
      var nextH = document.getElementById('fc-next-header');
      var detCurH = document.getElementById('fc-detail-cur-header');
      var detNextH = document.getElementById('fc-detail-next-header');
      if (curH) curH.textContent = prevYmStr + '월 (실적)';
      if (nextH) nextH.textContent = curYmStr + '월 (예상)';
      if (detCurH) detCurH.textContent = prevYmStr + '월 (실적)';
      if (detNextH) detNextH.textContent = curYmStr + '월 (예상)';

      var mcParam = '&machine=' + fcMachineFilter;
      var prevYm = String(prevYear) + String(prevMonth).padStart(2, '0');
      try {
        var results = await Promise.all([
          fetch('/api/forecast/production?ym=' + prevYm).then(function(r){return r.json();}),
          fetch('/api/forecast/material-detail?ym=' + prevYm + mcParam).then(function(r){return r.json();}),
          fetch('/api/forecast/unit-by-product?ym=' + prevYm + mcParam).then(function(r){return r.json();}),
          fetch('/api/manual-input/saved?ym=' + ym + '&machine=' + fcMachineFilter).then(function(r){return r.json();})
        ]);
        fcCurProd = results[0];
        fcCurData = results[1];
        fcUnitByProduct = results[2];
        fcSavedManual = (results[3] && results[3].data) ? results[3].data : null;
        // 수기입력 연동 상태 표시
        var badge = document.getElementById('fc-manual-badge');
        if (badge) {
          if (fcSavedManual) { badge.classList.remove('hidden'); badge.title = '수기입력 저장 데이터(' + (results[3].saved_by || '') + ') 기반 예상'; }
          else { badge.classList.add('hidden'); }
        }
        renderFcProduction();
        renderFcDetail();
        populateFcProductFilter();
      } catch(e) { console.error('Forecast load error:', e); }
    }

    function renderFcProduction() {
      var tbody = document.getElementById('fc-prod-body');
      var tfoot = document.getElementById('fc-prod-foot');
      if (!tbody) return;

      var data = fcCurProd;
      if (!data || !data.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-400 py-4">데이터가 없습니다</td></tr>';
        if (tfoot) tfoot.innerHTML = '';
        return;
      }

      // 호기 필터 & 지종별 합산
      var filtered = data.filter(function(d){return d.machine_code === fcMachineFilter;});
      var typeMap = {};
      filtered.forEach(function(d) {
        var key = d.product_type;
        if (!typeMap[key]) typeMap[key] = 0;
        typeMap[key] += (Number(d.total_production) || Number(d.production_qty) || 0) / 1000;
      });

      // 수기입력 저장 생산량 조회 (차월 예상 기본값) — 소스가 manual일 때만
      var mnProdMap = null;
      if (simSource === 'manual' && fcSavedManual && fcSavedManual.production) {
        mnProdMap = fcSavedManual.production;
      }

      var types = Object.keys(typeMap).sort(function(a,b){return typeMap[b]-typeMap[a];});
      // 수기입력에만 있는 지종도 추가
      if (mnProdMap) {
        Object.keys(mnProdMap).forEach(function(t) {
          if (types.indexOf(t) === -1) types.push(t);
        });
      }
      var grandProd = 0;
      types.forEach(function(t){grandProd += typeMap[t] || 0;});

      var maxRows = Math.max(types.length, 1);
      var html = '';

      // 생산량 행 + 폐품율 행
      for (var i = 0; i < maxRows; i++) {
        var t = types[i] || '';
        var p = t ? Math.round(typeMap[t] || 0) : 0;
        // 차월 예상: 수기입력 저장값 우선, 없으면 당월실적
        var nextP = (mnProdMap && mnProdMap[t] != null) ? Math.round(Number(mnProdMap[t])) : p;
        html += '<tr class="border-b border-slate-50 hover:bg-slate-50/30">';
        if (i === 0) {
          html += '<td class="px-2 py-1 text-[10px] text-gray-400 align-top" rowspan="' + (maxRows + 2) + '"></td>';
        }
        // 당월 실적
        html += '<td class="px-2 py-0.5 text-xs border-l border-slate-200">' + t + '</td>';
        html += '<td class="px-2 py-0.5 text-xs text-right font-mono">' + (p ? p.toLocaleString() : '') + '</td>';
        // 차월 예상 (수기입력 저장값 기반)
        html += '<td class="px-2 py-0.5 text-xs border-l border-slate-200">' + t + '</td>';
        html += '<td class="px-2 py-0.5 text-xs text-right">'
          + '<input type="number" class="w-20 text-right text-xs font-mono border border-slate-200 rounded px-1 py-0.5 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 fc-next-prod" data-type="' + t + '" value="' + nextP + '" onchange="onFcProdChange()">'
          + '</td>';
        html += '</tr>';
      }

      // 차월 합계 계산
      var grandNextProd = 0;
      types.forEach(function(t) {
        var nextV = (mnProdMap && mnProdMap[t] != null) ? Number(mnProdMap[t]) : (typeMap[t] || 0);
        grandNextProd += nextV;
      });

      // 합계 행
      html += '<tr class="border-t border-slate-200 bg-slate-50/50 font-semibold">';
      html += '<td class="px-2 py-1 text-xs border-l border-slate-200">합계</td>';
      html += '<td class="px-2 py-1 text-xs text-right font-mono">' + Math.round(grandProd).toLocaleString() + '</td>';
      html += '<td class="px-2 py-1 text-xs border-l border-slate-200">합계</td>';
      html += '<td class="px-2 py-1 text-xs text-right font-mono" id="fc-next-prod-total">' + Math.round(grandNextProd).toLocaleString() + '</td>';
      html += '</tr>';

      // 폐품율 행
      html += '<tr class="bg-amber-50/50">';
      html += '<td class="px-2 py-1 text-xs border-l border-slate-200 text-amber-700">폐품율</td>';
      html += '<td class="px-2 py-1 text-xs text-right font-mono text-amber-700" id="fc-cur-waste">-</td>';
      html += '<td class="px-2 py-1 text-xs border-l border-slate-200 text-amber-700">폐품율</td>';
      html += '<td class="px-2 py-1 text-xs text-right">'
        + '<input type="number" step="0.01" class="w-16 text-right text-xs font-mono border border-amber-200 rounded px-1 py-0.5 focus:border-amber-400 text-amber-700" id="fc-next-waste-rate" value="8.44" onchange="onFcProdChange()"> %'
        + '</td>';
      html += '</tr>';

      tbody.innerHTML = html;
      if (tfoot) tfoot.innerHTML = '';
    }

    function onFcProdChange() {
      // 차월 합계 갱신
      var inputs = document.querySelectorAll('.fc-next-prod');
      var total = 0;
      inputs.forEach(function(inp) { total += Number(inp.value) || 0; });
      var el = document.getElementById('fc-next-prod-total');
      if (el) el.textContent = Math.round(total).toLocaleString();
      // 손익 재계산
      calcFcProfit();
    }

    function populateFcProductFilter() {
      var sel = document.getElementById('fc-product-filter');
      if (!sel || !fcUnitByProduct || !fcUnitByProduct.unitMap) return;
      // 지종 목록 수집
      var types = {};
      for (var mc in fcUnitByProduct.unitMap) {
        var ptMap = fcUnitByProduct.unitMap[mc];
        for (var pt in ptMap) {
          types[pt] = true;
        }
      }
      var typeList = Object.keys(types).sort();
      var html = '<option value="">전체 자재</option>';
      typeList.forEach(function(t) {
        html += '<option value="' + t + '">' + t + ' 연관 자재만</option>';
      });
      sel.innerHTML = html;
    }

    function filterFcByProduct() {
      var sel = document.getElementById('fc-product-filter');
      var filterType = sel ? sel.value : '';
      if (!fcCurData || !fcCurData.rows) return;

      // 필터 대상 자재코드 목록 구하기
      var allowedCodes = null;
      if (filterType && fcUnitByProduct && fcUnitByProduct.unitMap) {
        allowedCodes = {};
        for (var mc in fcUnitByProduct.unitMap) {
          var ptMap = fcUnitByProduct.unitMap[mc];
          if (filterType in ptMap) {
            allowedCodes[mc] = true;
          }
        }
      }

      // 테이블 행 순회하면서 보이기/숨기기
      var tbody = document.getElementById('fc-detail-body');
      if (!tbody) return;
      var trs = tbody.querySelectorAll('tr');

      var currentGroupVisible = false;
      trs.forEach(function(tr) {
        if (tr.classList.contains('bg-slate-50') && tr.querySelector('td[colspan]')) {
          // 그룹 헤더행 — 다음 데이터 행들이 보이는지에 따라 나중에 처리
          tr._isGroupHeader = true;
          tr._groupHasVisible = false;
          tr.style.display = 'none'; // 일단 숨김
        } else if (tr.classList.contains('bg-slate-100/70')) {
          // 그룹 소계행
          tr.style.display = (allowedCodes === null || currentGroupVisible) ? '' : 'none';
          // 이전 그룹 헤더도 업데이트
        } else {
          // 자재 데이터행 (data-mat 속성으로 판별)
          var matCode = tr.getAttribute('data-mat');
          if (allowedCodes === null) {
            tr.style.display = '';
            currentGroupVisible = true;
          } else {
            var visible = matCode && allowedCodes[matCode];
            tr.style.display = visible ? '' : 'none';
            if (visible) currentGroupVisible = true;
          }
        }
      });

      // 두 번째 패스: 그룹 헤더 표시 여부 결정
      var groupHeader = null;
      var groupHasVisible = false;
      trs.forEach(function(tr) {
        if (tr.classList.contains('bg-slate-50') && tr.querySelector('td[colspan]')) {
          // 이전 그룹 헤더 처리
          if (groupHeader) groupHeader.style.display = groupHasVisible ? '' : 'none';
          groupHeader = tr;
          groupHasVisible = false;
        } else if (tr.classList.contains('bg-slate-100/70')) {
          // 소계행 — 그룹 마감
          if (groupHeader) {
            groupHeader.style.display = groupHasVisible ? '' : 'none';
            tr.style.display = groupHasVisible ? '' : 'none';
          }
          groupHeader = null;
          groupHasVisible = false;
        } else {
          if (tr.style.display !== 'none') groupHasVisible = true;
        }
      });
      // 마지막 그룹 처리
      if (groupHeader) groupHeader.style.display = groupHasVisible ? '' : 'none';
    }

    function renderFcDetail() {
      fcManualFlags = {};  // 새 렌더링시 수동 플래그 초기화
      var tbody = document.getElementById('fc-detail-body');
      if (!tbody || !fcCurData || !fcCurData.rows || !fcCurData.rows.length) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="17" class="text-center text-gray-400 py-6">데이터가 없습니다</td></tr>';
        return;
      }

      var rows = fcCurData.rows;
      var prodTon = (fcCurData.production && fcCurData.production[fcMachineFilter]) ? fcCurData.production[fcMachineFilter] / 1000 : 0;
      var html = '';
      var prevGroup = '';
      var groupUsage = 0, groupCost = 0;
      var grandUsage = 0, grandCost = 0;
      var rowIdx = 0;

      // 그룹별(material_group_name) 소계를 위해 미리 정리
      var grouped = {};
      rows.forEach(function(r) {
        var gk = r.material_group_name || r.material_group_major_name;
        if (!grouped[gk]) grouped[gk] = [];
        grouped[gk].push(r);
      });

      var groupKeys = Object.keys(grouped);
      groupKeys.forEach(function(gk) {
        var items = grouped[gk];
        var gUsage = 0, gCost = 0;

        // 그룹 헤더
        html += '<tr class="bg-slate-50 border-t border-slate-200">';
        html += '<td colspan="2" class="px-2 py-1 text-xs font-semibold text-gray-700 border-r border-slate-300">' + gk + '</td>';
        html += '<td colspan="5" class="border-r border-slate-300"></td>';
        html += '<td colspan="7" class="border-r border-slate-300"></td>';
        html += '<td colspan="3" class="border-r border-slate-300"></td>';
        html += '<td></td>';
        html += '</tr>';

        items.forEach(function(r) {
          var shortCode = r.material_code.replace(/^0+/, '') || r.material_code;
          gUsage += r.usage_qty;
          gCost += r.cost_million * 1000000;
          grandUsage += r.usage_qty;
          grandCost += r.cost_million * 1000000;

          // 수기입력 저장 데이터에서 차월값 조회 — 소스가 manual일 때만
          var mnSaved = null;
          if (simSource === 'manual' && fcSavedManual && fcSavedManual.materials) {
            mnSaved = fcSavedManual.materials[r.material_code] || fcSavedManual.materials[shortCode] || null;
          }
          var mnUsage = mnSaved ? (mnSaved.cur_usage || '') : '';
          var mnIp = mnSaved ? (mnSaved.incoming_price || '') : '';
          var mnSp = mnSaved ? (mnSaved.stock_price || '') : '';
          var mnUp = mnSaved ? (mnSaved.use_price || '') : '';
          var mnUc = mnSaved ? (mnSaved.cur_uc || '') : '';

          // 수기입력 데이터가 있으면 manualFlag 세팅 (자동계산 덮어쓰기 방지)
          if (mnSaved && (mnUsage || mnUc)) {
            if (!fcManualFlags[rowIdx]) fcManualFlags[rowIdx] = {};
            if (mnUsage) fcManualFlags[rowIdx].usage = true;
            if (mnUc) fcManualFlags[rowIdx].uc = true;
          }

          var rid = 'fc-r-' + rowIdx;
          html += '<tr class="hover:bg-blue-50/30 border-b border-slate-50" data-mat="' + r.material_code + '">';
          // 구분/자재
          html += '<td class="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border-r border-slate-100">' + shortCode + '</td>';
          html += '<td class="px-1.5 py-0.5 text-xs border-r border-slate-300">' + r.material_name + '</td>';
          // 당월 실적 5열
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-l border-slate-200">' + Math.round(r.usage_qty).toLocaleString() + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs">' + (r.unit_consumption > 0 ? r.unit_consumption.toFixed(1) : '-') + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs">' + (r.unit_price > 0 ? Math.round(r.unit_price).toLocaleString() : '-') + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs">' + (r.cost_million > 0 ? (r.cost_million / 100).toFixed(2) : '-') + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-r border-slate-300">' + (r.cost_per_ton > 0 ? (r.cost_per_ton / 1000).toFixed(1) : '-') + '</td>';
          // 차월 예상 7열 (수기입력 데이터 연동: 저장값 우선, 없으면 당월실적 기본값)
          var defUsage = mnUsage ? mnUsage : Math.round(r.usage_qty);
          var defUc = mnUc ? mnUc : (r.unit_consumption > 0 ? r.unit_consumption.toFixed(1) : '');
          var defUp = mnUp ? mnUp : (r.unit_price > 0 ? Math.round(r.unit_price) : '');
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="text" inputmode="numeric" class="w-16 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 focus:border-emerald-400 fc-inp comma-fmt" id="' + rid + '-nu" data-row="' + rowIdx + '" data-field="next_usage" value="' + (defUsage ? Math.round(defUsage).toLocaleString() : '') + '" onchange="onFcUsageChange(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" step="0.1" class="w-14 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 focus:border-emerald-400 fc-inp" id="' + rid + '-nuc" data-row="' + rowIdx + '" data-field="next_uc" value="' + defUc + '" onchange="onFcUcChange(' + rowIdx + ')">'
            + '</td>';
          // 입고단가 (수기입력 저장값 연동)
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="text" inputmode="numeric" class="w-14 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 focus:border-emerald-400 fc-inp comma-fmt" data-row="' + rowIdx + '" data-field="incoming_price" value="' + (mnIp ? Math.round(mnIp).toLocaleString() : '') + '" placeholder="-" onchange="calcFcRow(' + rowIdx + ')">'
            + '</td>';
          // 기초재고단가 (수기입력 저장값 연동)
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="text" inputmode="numeric" class="w-14 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 focus:border-emerald-400 fc-inp comma-fmt" data-row="' + rowIdx + '" data-field="stock_price" value="' + (mnSp ? Math.round(mnSp).toLocaleString() : '') + '" placeholder="-" onchange="calcFcRow(' + rowIdx + ')">'
            + '</td>';
          // 사용단가 (수기입력 가중평균값 연동)
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="text" inputmode="numeric" class="w-14 text-right text-[10px] font-mono border border-emerald-200 rounded px-0.5 py-0.5 bg-emerald-50/50 focus:border-emerald-400 fc-inp comma-fmt" data-row="' + rowIdx + '" data-field="next_unit_price" value="' + (defUp ? Math.round(defUp).toLocaleString() : '') + '" placeholder="-" onchange="calcFcRow(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs" id="' + rid + '-ncm">-</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-r border-slate-300" id="' + rid + '-nct">-</td>';
          // 손익 효과 3열
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs" id="' + rid + '-du">-</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs" id="' + rid + '-dp">-</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs font-semibold border-r border-slate-300" id="' + rid + '-dt">-</td>';
          // 이슈사항
          html += '<td class="px-1.5 py-0.5 border-l border-slate-300">'
            + '<input type="text" class="w-28 text-[10px] border border-slate-200 rounded px-1 py-0.5 focus:border-blue-300" data-row="' + rowIdx + '" data-field="issue" placeholder="">'
            + '</td>';
          html += '</tr>';
          rowIdx++;
        });

        // 그룹 소계
        html += '<tr class="bg-slate-100/70 border-t border-slate-200 font-semibold">';
        html += '<td colspan="2" class="px-2 py-1 text-[10px] text-gray-600 border-r border-slate-300">' + gk + ' 소계</td>';
        html += '<td class="px-1.5 py-1 text-right font-mono text-[10px] border-l border-slate-200">' + Math.round(gUsage).toLocaleString() + '</td>';
        html += '<td class="px-1.5 py-1 text-right text-[10px]">-</td>';
        html += '<td class="px-1.5 py-1 text-right text-[10px]">-</td>';
        var gCostEok = gCost / 100000000;
        html += '<td class="px-1.5 py-1 text-right font-mono text-[10px]">' + gCostEok.toFixed(2) + '</td>';
        var gCostPerTon = prodTon > 0 ? gCost / prodTon / 1000 : 0;
        html += '<td class="px-1.5 py-1 text-right font-mono text-[10px] border-r border-slate-300">' + gCostPerTon.toFixed(1) + '</td>';
        html += '<td colspan="7" class="border-r border-slate-300"></td>';
        html += '<td colspan="3" class="border-r border-slate-300"></td>';
        html += '<td></td>';
        html += '</tr>';
      });

      tbody.innerHTML = html;

      // 초기 차월 값 계산
      calcFcProfit();
    }

    function calcFcRow(idx) {
      calcFcProfit();
    }

    function onFcUsageChange(idx) {
      if (!fcManualFlags[idx]) fcManualFlags[idx] = {};
      fcManualFlags[idx].usage = true;
      // 사용량 수정 → 원단위도 연동 갱신
      var nextProdInputs = document.querySelectorAll('.fc-next-prod');
      var nextProdTon = 0;
      nextProdInputs.forEach(function(inp) { nextProdTon += Number(inp.value) || 0; });
      var nuEl = document.getElementById('fc-r-' + idx + '-nu');
      var nucEl = document.getElementById('fc-r-' + idx + '-nuc');
      if (nuEl && nucEl && nextProdTon > 0) {
        var usage = parseComma(nuEl.value);
        nucEl.value = (usage / nextProdTon).toFixed(1);
      }
      calcFcProfit();
    }

    function onFcUcChange(idx) {
      if (!fcManualFlags[idx]) fcManualFlags[idx] = {};
      fcManualFlags[idx].uc = true;
      // 원단위 수정 → 사용량 연동 갱신
      var nextProdInputs = document.querySelectorAll('.fc-next-prod');
      var nextProdTon = 0;
      nextProdInputs.forEach(function(inp) { nextProdTon += Number(inp.value) || 0; });
      var nuEl = document.getElementById('fc-r-' + idx + '-nu');
      var nucEl = document.getElementById('fc-r-' + idx + '-nuc');
      if (nuEl && nucEl) {
        var uc = Number(nucEl.value) || 0;
        nuEl.value = Math.round(uc * nextProdTon).toLocaleString('ko-KR');
      }
      calcFcProfit();
    }

    function calcFcProfit() {
      if (!fcCurData || !fcCurData.rows) return;
      var rows = fcCurData.rows;
      var prodTon = (fcCurData.production && fcCurData.production[fcMachineFilter]) ? fcCurData.production[fcMachineFilter] / 1000 : 0;

      // 차월 지종별 생산량 수집
      var nextProdByType = {};
      var nextProdInputs = document.querySelectorAll('.fc-next-prod');
      var nextProdTon = 0;
      nextProdInputs.forEach(function(inp) {
        var t = inp.getAttribute('data-type');
        var v = Number(inp.value) || 0;
        if (t) nextProdByType[t] = v;
        nextProdTon += v;
      });
      if (nextProdTon === 0) nextProdTon = prodTon;

      var grandDiffUsage = 0, grandDiffPrice = 0, grandDiffTotal = 0;

      rows.forEach(function(r, idx) {
        var rid = 'fc-r-' + idx;
        // 당월 값
        var curUsage = r.usage_qty;
        var curUC = r.unit_consumption;
        var curPrice = r.unit_price;

        var nextUsage, nextUC;
        var manualFlag = fcManualFlags[idx] || {};
        var nuEl = document.getElementById(rid + '-nu');
        var nucEl = document.getElementById(rid + '-nuc');

        if (manualFlag.usage || manualFlag.uc) {
          // 사용자가 직접 수정한 경우: input 값 그대로 사용
          nextUsage = nuEl ? parseComma(nuEl.value) : 0;
          nextUC = nucEl ? (Number(nucEl.value) || 0) : 0;
        } else {
          // 자동 계산: 지종별 원단위 기반 보정
          nextUsage = 0;
          var hasUnitData = false;
          if (fcUnitByProduct && fcUnitByProduct.unitMap && fcUnitByProduct.unitMap[r.material_code]) {
            var ucByType = fcUnitByProduct.unitMap[r.material_code];
            hasUnitData = true;
            for (var pt in ucByType) {
              var typeUC = ucByType[pt];
              var typeProd = nextProdByType[pt] || 0;
              nextUsage += typeUC * typeProd;
            }
          }
          if (!hasUnitData || nextUsage === 0) {
            nextUsage = curUC * nextProdTon;
          }
          nextUC = nextProdTon > 0 ? nextUsage / nextProdTon : 0;

          // input 값 동기화
          if (nuEl) nuEl.value = Math.round(nextUsage).toLocaleString('ko-KR');
          if (nucEl) nucEl.value = nextUC > 0 ? nextUC.toFixed(1) : '';
        }

        // 차월 사용단가 (사용자 입력값 우선)
        var priceInput = document.querySelector('[data-row="' + idx + '"][data-field="next_unit_price"]');
        var nextPrice = priceInput ? (parseComma(priceInput.value) || curPrice) : curPrice;

        // 차월 비용, 톤당비용
        var nextCost = nextUsage * nextPrice;  // 원
        var nextCostEok = nextCost / 100000000;
        var nextCostPerTon = nextProdTon > 0 ? nextCost / nextProdTon / 1000 : 0;  // 천원/톤

        // 셀 업데이트 (비용/톤당비용은 항상 자동)
        var ncmEl = document.getElementById(rid + '-ncm');
        var nctEl = document.getElementById(rid + '-nct');
        if (ncmEl) ncmEl.textContent = nextCostEok > 0 ? nextCostEok.toFixed(2) : '-';
        if (nctEl) nctEl.textContent = nextCostPerTon > 0 ? nextCostPerTon.toFixed(1) : '-';

        // 손익효과 계산
        // 사용량차이(원) = (당월사용량 - 차월사용량) × 당월사용단가 → 양수=절감
        var diffUsage = (curUsage - nextUsage) * curPrice;
        // 단가차이(원) = (당월사용단가 - 차월사용단가) × 차월사용량 → 양수=절감
        var diffPrice = (curPrice - nextPrice) * nextUsage;
        // 재료비종합
        var diffTotal = diffUsage + diffPrice;

        grandDiffUsage += diffUsage;
        grandDiffPrice += diffPrice;
        grandDiffTotal += diffTotal;

        var duEl = document.getElementById(rid + '-du');
        var dpEl = document.getElementById(rid + '-dp');
        var dtEl = document.getElementById(rid + '-dt');

        function fmtDiff(v) {
          if (!v || Math.abs(v) < 1) return '-';
          var eokV = v / 100000000;
          if (Math.abs(eokV) < 0.005) return '-';
          if (eokV > 0) return '+' + eokV.toFixed(2);
          return '\u25B3' + Math.abs(eokV).toFixed(2);
        }
        function diffColor(v) {
          if (!v || Math.abs(v) < 1) return '';
          return v > 0 ? 'text-blue-600' : 'text-red-600';
        }

        if (duEl) { duEl.textContent = fmtDiff(diffUsage); duEl.className = 'px-1.5 py-0.5 text-right font-mono text-xs ' + diffColor(diffUsage); }
        if (dpEl) { dpEl.textContent = fmtDiff(diffPrice); dpEl.className = 'px-1.5 py-0.5 text-right font-mono text-xs ' + diffColor(diffPrice); }
        if (dtEl) { dtEl.textContent = fmtDiff(diffTotal); dtEl.className = 'px-1.5 py-0.5 text-right font-mono text-xs font-semibold border-r border-slate-300 ' + diffColor(diffTotal); }
      });
    }

    // ============ FORECAST 엑셀 다운로드/업로드 ============
    function downloadFcExcel() {
      if (!fcCurData || !fcCurData.rows || !fcCurData.rows.length) {
        alert('데이터가 없습니다. 먼저 조회해주세요.');
        return;
      }
      var rows = fcCurData.rows;
      var prodTon = (fcCurData.production && fcCurData.production[fcMachineFilter]) ? fcCurData.production[fcMachineFilter] / 1000 : 0;

      var excelData = [];
      rows.forEach(function(r, idx) {
        var rid = 'fc-r-' + idx;
        // 현재 화면의 차월 값 읽기
        var nuEl = document.getElementById(rid + '-nu');
        var nucEl = document.getElementById(rid + '-nuc');
        var priceEl = document.querySelector('[data-row="' + idx + '"][data-field="next_unit_price"]');
        var incomingEl = document.querySelector('[data-row="' + idx + '"][data-field="incoming_price"]');
        var stockEl = document.querySelector('[data-row="' + idx + '"][data-field="stock_price"]');
        var issueEl = document.querySelector('[data-row="' + idx + '"][data-field="issue"]');

        excelData.push({
          '자재코드': r.material_code,
          '자재명': r.material_name,
          '자재그룹': r.material_group_name || r.material_group_major_name,
          '당월_사용량(kg)': Math.round(r.usage_qty),
          '당월_원단위(kg/톤)': r.unit_consumption,
          '당월_사용단가(원/kg)': Math.round(r.unit_price),
          '당월_비용(억원)': r.cost_million ? (r.cost_million / 100).toFixed(2) : '',
          '당월_톤당비용(천원/톤)': r.cost_per_ton ? (r.cost_per_ton / 1000).toFixed(1) : '',
          '차월_사용량(kg)': nuEl ? Number(nuEl.value) || '' : '',
          '차월_원단위(kg/톤)': nucEl ? Number(nucEl.value) || '' : '',
          '차월_입고단가(원/kg)': incomingEl ? Number(incomingEl.value) || '' : '',
          '차월_기초재고단가(원/kg)': stockEl ? Number(stockEl.value) || '' : '',
          '차월_사용단가(원/kg)': priceEl ? Number(priceEl.value) || '' : '',
          '이슈사항': issueEl ? issueEl.value : ''
        });
      });

      var ws = XLSX.utils.json_to_sheet(excelData);
      // 컬럼 너비 설정
      ws['!cols'] = [
        {wch:20},{wch:18},{wch:16},
        {wch:14},{wch:14},{wch:14},{wch:14},{wch:14},
        {wch:14},{wch:14},{wch:14},{wch:14},{wch:14},
        {wch:20}
      ];
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '자재별원가상세');

      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      XLSX.writeFile(wb, '전월대비예상실적_' + fcMachineFilter + '_' + year + month + '.xlsx');
    }

    function uploadFcExcel(event) {
      var file = event.target.files[0];
      if (!file) return;
      event.target.value = '';  // 같은 파일 재업로드 가능하게

      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var wb = XLSX.read(e.target.result, {type: 'array'});
          var ws = wb.Sheets[wb.SheetNames[0]];
          var data = XLSX.utils.sheet_to_json(ws);

          if (!data || !data.length) {
            alert('엑셀에 데이터가 없습니다.');
            return;
          }
          if (!fcCurData || !fcCurData.rows) {
            alert('먼저 예상실적 데이터를 조회해주세요.');
            return;
          }

          // 자재코드 기준으로 매핑
          var uploadMap = {};
          data.forEach(function(row) {
            var code = String(row['자재코드'] || '').trim();
            if (code) uploadMap[code] = row;
          });

          var applied = 0;
          fcCurData.rows.forEach(function(r, idx) {
            var uploaded = uploadMap[r.material_code];
            if (!uploaded) return;

            var rid = 'fc-r-' + idx;
            // 차월 사용량
            var nuEl = document.getElementById(rid + '-nu');
            if (nuEl && uploaded['차월_사용량(kg)']) {
              nuEl.value = Math.round(Number(uploaded['차월_사용량(kg)']));
              if (!fcManualFlags[idx]) fcManualFlags[idx] = {};
              fcManualFlags[idx].usage = true;
            }
            // 차월 원단위
            var nucEl = document.getElementById(rid + '-nuc');
            if (nucEl && uploaded['차월_원단위(kg/톤)']) {
              nucEl.value = Number(uploaded['차월_원단위(kg/톤)']).toFixed(1);
              if (!fcManualFlags[idx]) fcManualFlags[idx] = {};
              fcManualFlags[idx].uc = true;
            }
            // 차월 입고단가
            var incomingEl = document.querySelector('[data-row="' + idx + '"][data-field="incoming_price"]');
            if (incomingEl && uploaded['차월_입고단가(원/kg)']) {
              incomingEl.value = Math.round(Number(uploaded['차월_입고단가(원/kg)']));
            }
            // 차월 기초재고단가
            var stockEl = document.querySelector('[data-row="' + idx + '"][data-field="stock_price"]');
            if (stockEl && uploaded['차월_기초재고단가(원/kg)']) {
              stockEl.value = Math.round(Number(uploaded['차월_기초재고단가(원/kg)']));
            }
            // 차월 사용단가
            var priceEl = document.querySelector('[data-row="' + idx + '"][data-field="next_unit_price"]');
            if (priceEl && uploaded['차월_사용단가(원/kg)']) {
              priceEl.value = Math.round(Number(uploaded['차월_사용단가(원/kg)']));
            }
            // 이슈사항
            var issueEl = document.querySelector('[data-row="' + idx + '"][data-field="issue"]');
            if (issueEl && uploaded['이슈사항']) {
              issueEl.value = uploaded['이슈사항'];
            }
            applied++;
          });

          // 재계산
          calcFcProfit();
          alert('엑셀 업로드 완료! ' + applied + '개 자재 반영됨');
        } catch(err) {
          alert('엑셀 파일 처리 오류: ' + err.message);
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    // ============ SIMULATION (지종별 생산량 손익) ============
    let simBaseData = [];  // 기준 데이터
    let simRows = [];      // 시뮬레이션 입력 행들
    let simCatFilter = 'ALL';
    let simProfitChart = null;
    let simManualData = null; // 수기입력 저장 데이터 (시뮬레이션용)
    let simSource = 'actual'; // 'actual' | 'manual'
    let simSourceUserSet = false; // 사용자가 직접 소스를 선택했는지 여부

    function setSimCatFilter(f) {
      simCatFilter = f;
      ['all','raw','sub'].forEach(function(k) {
        var btn = document.getElementById('sim-cat-' + k);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(k === f.toLowerCase() ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      loadSimProfitBase();
    }

    function onSimSourceChange() {
      var manualRadio = document.getElementById('sim-source-manual');
      simSource = (manualRadio && manualRadio.checked) ? 'manual' : 'actual';
      simSourceUserSet = true; // 사용자가 직접 선택함
      // 시뮬레이션 데이터 갱신
      initSimRows();
      renderSimTable();
      calcSimProfit();
      // forecast 서브탭도 갱신 (소스에 따라 수기입력/전월실적 전환)
      renderFcProduction();
      renderFcDetail();
    }

    async function loadSimProfitBase() {
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;
      // 기준월 = 예상월, 전월 = 실적월
      var prevMonth = parseInt(month) - 1;
      var prevYear = parseInt(year);
      if (prevMonth < 1) { prevMonth = 12; prevYear--; }
      var simYmLabel = year + '년 ' + parseInt(month) + '월';
      var simLabelEl = document.getElementById('sim-target-label');
      if (simLabelEl) simLabelEl.textContent = simYmLabel + ' 예상';
      var baseLabelEl = document.getElementById('sim-base-label');
      if (baseLabelEl) baseLabelEl.textContent = prevYear + '년 ' + prevMonth + '월 실적';

      var catParam = simCatFilter !== 'ALL' ? '&category=' + simCatFilter : '';
      var prevYm = String(prevYear) + String(prevMonth).padStart(2, '0');

      try {
        // 기준 데이터(전월 실적) + 수기입력 데이터(기준월) 동시 로드
        var simMachineList = (divisionMachines || []).map(function(m){ return m.code || m; });
        if (!simMachineList.length) simMachineList = Object.keys(CC.machineChipMap);
        var fetchList = [
          fetch('/api/simulation/profit-base?ym=' + prevYm + catParam + getDivisionParam()).then(function(r){return r.json();})
        ];
        simMachineList.forEach(function(mc) {
          fetchList.push(fetch('/api/manual-input/saved?ym=' + ym + '&machine=' + mc + getDivisionParam()).then(function(r){return r.json();}));
        });
        var results = await Promise.all(fetchList);

        simBaseData = results[0].rows || [];

        // 수기입력 데이터 병합 (동적 호기)
        simManualData = null;
        var hasAnyManual = false;
        simMachineList.forEach(function(mc, idx) {
          var mcResult = results[idx + 1];
          var mcData = (mcResult && mcResult.data) ? mcResult.data : null;
          if (mcData) {
            if (!simManualData) simManualData = { production: {}, materials: {}, saved_by: '' };
            simManualData.production[mc] = mcData.production || {};
            if (!simManualData.saved_by) simManualData.saved_by = mcResult.saved_by || '';
            hasAnyManual = true;
          }
        });

        // 소스 선택 UI 상태 업데이트
        var firstManualResult = results[1] || {};
        updateSimSourcePanel(simManualData, firstManualResult.saved_by, firstManualResult.updated_at);

        initSimRows();
        renderSimTable();
        calcSimProfit();
      } catch(e) { console.error('Sim load error:', e); }
    }

    function updateSimSourcePanel(manualData, savedBy, savedAt) {
      var manualRadio = document.getElementById('sim-source-manual');
      var manualInfo = document.getElementById('sim-source-manual-info');
      var notice = document.getElementById('sim-source-notice');
      var manualLabel = document.getElementById('sim-source-manual-label');

      if (manualData) {
        // 수기입력 데이터 있음 → 활성화
        if (manualRadio) { manualRadio.disabled = false; }
        if (manualLabel) { manualLabel.classList.remove('opacity-50'); }
        var infoText = savedBy ? ('(' + savedBy + ' 저장') : '(저장됨';
        if (savedAt) {
          var dt = new Date(savedAt);
          infoText += ', ' + (dt.getMonth()+1) + '/' + dt.getDate();
        }
        infoText += ') \u2714 \uAD8C\uC7A5';
        if (manualInfo) { manualInfo.textContent = infoText; manualInfo.classList.remove('text-gray-400'); manualInfo.classList.add('text-emerald-600'); }
        if (notice) notice.classList.add('hidden');
        // 수기입력 데이터 있으면 기본 선택을 manual로 (사용자가 직접 변경하지 않은 경우에만)
        if (manualRadio && !simSourceUserSet) {
          manualRadio.checked = true;
          simSource = 'manual';
        }
      } else {
        // 수기입력 데이터 없음 → 비활성화
        if (manualRadio) { manualRadio.disabled = true; manualRadio.checked = false; }
        if (manualLabel) { manualLabel.classList.add('opacity-50'); }
        if (manualInfo) { manualInfo.textContent = '(\uBBF8\uC800\uC7A5)'; manualInfo.classList.remove('text-emerald-600'); manualInfo.classList.add('text-gray-400'); }
        if (notice) notice.classList.remove('hidden');
        // 실적 데이터로 강제
        var actualRadio = document.getElementById('sim-source-actual');
        if (actualRadio) actualRadio.checked = true;
        simSource = 'actual';
      }
    }

    function initSimRows() {
      if (simSource === 'manual' && simManualData) {
        // 수기입력 기반: 생산량 데이터를 시뮬레이션 행으로 변환
        simRows = [];
        var rowId = 0;
        var simMcList = (divisionMachines || []).map(function(m){ return m.code || m; });
        if (!simMcList.length) simMcList = Object.keys(CC.machineChipMap);
        simMcList.forEach(function(mc) {
          var prodMap = simManualData.production[mc];
          if (!prodMap) return;
          Object.keys(prodMap).forEach(function(pt) {
            var prodTon = Number(prodMap[pt]) || 0;
            if (prodTon === 0) return;
            // 기준 데이터에서 해당 호기/지종의 원단위 찾기
            var baseRow = simBaseData.find(function(d) { return d.machine_code === mc && d.product_level2_name === pt; });
            var baseUnitCost = baseRow ? baseRow.cur_unit_cost : 0;
            var baseProd = baseRow ? baseRow.cur_production_ton : 0;
            var baseMaterialCost = baseRow ? baseRow.cur_material_cost : 0;
            simRows.push({
              id: rowId++,
              machine_code: mc,
              product_level2_name: pt,
              base_prod: baseProd,
              base_unit_cost: baseUnitCost,
              base_material_cost: baseMaterialCost,
              sim_prod: prodTon,
              sim_unit_cost: baseUnitCost, // 수기입력에선 생산량 기반, 원단위는 동일 유지
              is_new: false
            });
          });
        });
        // 수기입력에 없지만 기준데이터에 있는 행도 추가 (잔여)
        simBaseData.forEach(function(d) {
          var exists = simRows.find(function(r) { return r.machine_code === d.machine_code && r.product_level2_name === d.product_level2_name; });
          if (!exists) {
            simRows.push({
              id: rowId++,
              machine_code: d.machine_code,
              product_level2_name: d.product_level2_name,
              base_prod: d.cur_production_ton,
              base_unit_cost: d.cur_unit_cost,
              base_material_cost: d.cur_material_cost,
              sim_prod: d.cur_production_ton,
              sim_unit_cost: d.cur_unit_cost,
              is_new: false
            });
          }
        });
      } else {
        // 전월 실적 기준: 기존 로직
        simRows = simBaseData.map(function(d, i) {
          return {
            id: i,
            machine_code: d.machine_code,
            product_level2_name: d.product_level2_name,
            base_prod: d.cur_production_ton,
            base_unit_cost: d.cur_unit_cost,
            base_material_cost: d.cur_material_cost,
            sim_prod: d.cur_production_ton,
            sim_unit_cost: d.cur_unit_cost,
            is_new: false
          };
        });
      }
    }

    function resetSimToBase() {
      initSimRows();
      renderSimTable();
      calcSimProfit();
    }

    function addSimRow() {
      var newId = simRows.length > 0 ? Math.max.apply(null, simRows.map(function(r){return r.id;})) + 1 : 0;
      simRows.push({
        id: newId,
        machine_code: 'PM2',
        product_level2_name: '',
        base_prod: 0,
        base_unit_cost: 0,
        base_material_cost: 0,
        sim_prod: 0,
        sim_unit_cost: 0,
        is_new: true
      });
      renderSimTable();
    }

    function removeSimRow(id) {
      simRows = simRows.filter(function(r) { return r.id !== id; });
      renderSimTable();
      calcSimProfit();
    }

    function onSimInputChange(id, field, value) {
      var row = simRows.find(function(r) { return r.id === id; });
      if (!row) return;
      row[field] = parseFloat(value) || 0;
      calcSimProfit();
    }

    function onSimSelectChange(id, field, value) {
      var row = simRows.find(function(r) { return r.id === id; });
      if (!row) return;
      row[field] = value;
    }

    function renderSimTable() {
      var tbody = document.getElementById('sim-profit-body');
      if (!tbody) return;
      var html = '';
      var prevMachine = '';

      simRows.forEach(function(row) {
        var machineChanged = row.machine_code !== prevMachine;
        prevMachine = row.machine_code;
        var chipClass = getCC(row.machine_code);
        var baseCost = row.base_unit_cost * row.base_prod * 1000;  // 원 (원단위*kg)
        var baseCostEok = baseCost / 100000000;  // 억원

        html += '<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-blue-50/20 sim-row" data-id="' + row.id + '">';
        // 호기
        if (row.is_new) {
          html += '<td class="!py-1.5"><select onchange="onSimSelectChange(' + row.id + ',\\'machine_code\\',this.value)" class="border border-gray-200 rounded px-1.5 py-0.5 text-xs w-16">'
            + '<option value="PM2"' + (row.machine_code==='PM2'?' selected':'') + '>PM2</option>'
            + '<option value="PM3"' + (row.machine_code==='PM3'?' selected':'') + '>PM3</option>'
            + '</select></td>';
        } else {
          html += '<td class="!py-1.5"><span class="unit-chip ' + chipClass + '">' + row.machine_code + '</span></td>';
        }
        // 지종
        if (row.is_new) {
          html += '<td class="!py-1.5"><input type="text" value="' + (row.product_level2_name||'') + '" onchange="onSimSelectChange(' + row.id + ',\\'product_level2_name\\',this.value)" class="border border-gray-200 rounded px-2 py-0.5 text-xs w-20" placeholder="지종명"></td>';
        } else {
          html += '<td class="!py-1.5 font-medium">' + row.product_level2_name + '</td>';
        }
        // 기준 생산량(톤)
        html += '<td class="!py-1.5 text-right font-mono text-gray-500">' + (row.base_prod > 0 ? row.base_prod.toFixed(1) : '-') + '</td>';
        // 기준 원단위(원/kg)
        html += '<td class="!py-1.5 text-right font-mono text-gray-500">' + (row.base_unit_cost > 0 ? row.base_unit_cost.toFixed(1) : '-') + '</td>';
        // 기준 재료비(억원)
        html += '<td class="!py-1.5 text-right font-mono text-gray-500 !border-r border-slate-200">' + (baseCostEok > 0 ? baseCostEok.toFixed(2) : '-') + '</td>';
        // 시뮬 생산량 input
        html += '<td class="!py-1.5 bg-blue-50/30"><input type="number" step="0.1" value="' + (row.sim_prod||'') + '" onchange="onSimInputChange(' + row.id + ',\\'sim_prod\\',this.value)" oninput="onSimInputChange(' + row.id + ',\\'sim_prod\\',this.value)" class="w-20 border border-blue-200 rounded px-2 py-0.5 text-xs text-right font-mono focus:ring-1 focus:ring-blue-300 focus:border-blue-300"></td>';
        // 시뮬 원단위 input
        html += '<td class="!py-1.5 bg-blue-50/30"><input type="number" step="0.1" value="' + (row.sim_unit_cost ? row.sim_unit_cost.toFixed(1) : '') + '" onchange="onSimInputChange(' + row.id + ',\\'sim_unit_cost\\',this.value)" oninput="onSimInputChange(' + row.id + ',\\'sim_unit_cost\\',this.value)" class="w-20 border border-blue-200 rounded px-2 py-0.5 text-xs text-right font-mono focus:ring-1 focus:ring-blue-300 focus:border-blue-300"></td>';
        // 시뮬 재료비 (자동계산) - ID 부여하여 실시간 업데이트
        html += '<td id="sim-cost-' + row.id + '" class="!py-1.5 text-right font-mono font-medium !border-r border-slate-200 bg-blue-50/30">-</td>';
        // 손익 결과 셀들 - ID 부여
        html += '<td id="sim-pe-' + row.id + '" class="!py-1.5 text-right font-mono bg-green-50/30">-</td>';
        html += '<td id="sim-ue-' + row.id + '" class="!py-1.5 text-right font-mono bg-green-50/30">-</td>';
        html += '<td id="sim-pr-' + row.id + '" class="!py-1.5 text-right font-mono font-semibold bg-green-50/30">-</td>';
        // 삭제
        html += '<td class="!py-1.5 text-center"><button onclick="removeSimRow(' + row.id + ')" class="text-gray-300 hover:text-red-500 text-xs"><i class="fas fa-trash"></i></button></td>';
        html += '</tr>';
      });
      tbody.innerHTML = html;
    }

    function buildEffectCell(v) {
      var eokV = v * 1000 / 100000000;
      if (Math.abs(eokV) < 0.005) return '<td class="!py-1.5 text-right font-mono text-gray-400 bg-green-50/30">-</td>';
      if (eokV < 0) return '<td class="!py-1.5 text-right font-mono text-red-600 bg-green-50/30">' + String.fromCharCode(9651) + Math.abs(eokV).toFixed(2) + '</td>';
      return '<td class="!py-1.5 text-right font-mono text-blue-600 bg-green-50/30">+' + eokV.toFixed(2) + '</td>';
    }

    function buildProfitCell(v) {
      var eokV = v * 1000 / 100000000;
      if (Math.abs(eokV) < 0.005) return '<td class="!py-1.5 text-right font-mono font-semibold text-gray-400 bg-green-50/30">-</td>';
      if (eokV < 0) return '<td class="!py-1.5 text-right font-mono font-semibold text-red-600 bg-green-50/30">' + String.fromCharCode(9651) + Math.abs(eokV).toFixed(2) + '</td>';
      return '<td class="!py-1.5 text-right font-mono font-semibold text-blue-600 bg-green-50/30">+' + eokV.toFixed(2) + '</td>';
    }

    function calcSimProfit() {
      var totalBaseMatCost = 0;
      var totalSimMatCost = 0;
      var totalProdEffect = 0;
      var totalUnitEffect = 0;
      var totalProfit = 0;
      var chartLabels = [];
      var chartProfits = [];

      simRows.forEach(function(row) {
        var baseMatCost = row.base_unit_cost * row.base_prod;  // 천원
        var simMatCost = row.sim_unit_cost * row.sim_prod;  // 천원
        var profit = baseMatCost - simMatCost;
        // 생산량효과: 생산량 증가 → 비용증가 → 음수
        var pEffect = row.base_unit_cost * (row.base_prod - row.sim_prod);
        // 원단위효과: 원단위 감소 → 비용절감 → 양수
        var uEffect = row.sim_prod * (row.base_unit_cost - row.sim_unit_cost);

        totalBaseMatCost += row.base_material_cost;  // 원래 DB 값 (원 단위)
        totalSimMatCost += simMatCost * 1000;  // 천원 → 원
        totalProdEffect += (-pEffect);
        totalUnitEffect += uEffect;
        totalProfit += profit;

        if (row.product_level2_name) {
          chartLabels.push(row.machine_code + ' ' + row.product_level2_name);
          chartProfits.push(Math.round(profit));
        }

        // 각 행의 손익 결과 셀 업데이트 (억원 단위)
        var costEl = document.getElementById('sim-cost-' + row.id);
        var peEl = document.getElementById('sim-pe-' + row.id);
        var ueEl = document.getElementById('sim-ue-' + row.id);
        var prEl = document.getElementById('sim-pr-' + row.id);

        if (costEl) {
          var simCostEok = simMatCost * 1000 / 100000000;
          costEl.textContent = simCostEok > 0 ? simCostEok.toFixed(2) : '-';
        }
        if (peEl) {
          var peEok = (-pEffect) * 1000 / 100000000;
          if (Math.abs(peEok) < 0.005) { peEl.textContent = '-'; peEl.className = '!py-1.5 text-right font-mono text-gray-400 bg-green-50/30'; }
          else if (peEok < 0) { peEl.innerHTML = String.fromCharCode(9651) + Math.abs(peEok).toFixed(2); peEl.className = '!py-1.5 text-right font-mono text-red-600 bg-green-50/30'; }
          else { peEl.innerHTML = '+' + peEok.toFixed(2); peEl.className = '!py-1.5 text-right font-mono text-blue-600 bg-green-50/30'; }
        }
        if (ueEl) {
          var ueEok = uEffect * 1000 / 100000000;
          if (Math.abs(ueEok) < 0.005) { ueEl.textContent = '-'; ueEl.className = '!py-1.5 text-right font-mono text-gray-400 bg-green-50/30'; }
          else if (ueEok < 0) { ueEl.innerHTML = String.fromCharCode(9651) + Math.abs(ueEok).toFixed(2); ueEl.className = '!py-1.5 text-right font-mono text-red-600 bg-green-50/30'; }
          else { ueEl.innerHTML = '+' + ueEok.toFixed(2); ueEl.className = '!py-1.5 text-right font-mono text-blue-600 bg-green-50/30'; }
        }
        if (prEl) {
          var prEok = profit * 1000 / 100000000;
          if (Math.abs(prEok) < 0.005) { prEl.textContent = '-'; prEl.className = '!py-1.5 text-right font-mono font-semibold text-gray-400 bg-green-50/30'; }
          else if (prEok < 0) { prEl.innerHTML = String.fromCharCode(9651) + Math.abs(prEok).toFixed(2); prEl.className = '!py-1.5 text-right font-mono font-semibold text-red-600 bg-green-50/30'; }
          else { prEl.innerHTML = '+' + prEok.toFixed(2); prEl.className = '!py-1.5 text-right font-mono font-semibold text-blue-600 bg-green-50/30'; }
        }
      });

      // Summary cards 업데이트
      var baseEl = document.getElementById('sim-base-total');
      var newEl = document.getElementById('sim-new-total');
      var profitEl = document.getElementById('sim-profit-total');
      var prodEl = document.getElementById('sim-prod-effect');
      var unitEl = document.getElementById('sim-unit-effect');

      if (baseEl) baseEl.textContent = (totalBaseMatCost / 100000000).toFixed(2) + ' 억원';
      if (newEl) newEl.textContent = (totalSimMatCost / 100000000).toFixed(2) + ' 억원';

      var formatCard = function(el, val) {
        var eokV = val * 1000 / 100000000;
        if (Math.abs(eokV) < 0.005) { el.textContent = '-'; el.className = 'text-lg font-bold mt-2 stat-value text-gray-400'; }
        else if (eokV > 0) { el.textContent = '+' + eokV.toFixed(2) + ' 억원'; el.className = 'text-lg font-bold mt-2 stat-value text-blue-600'; }
        else { el.textContent = String.fromCharCode(9651) + Math.abs(eokV).toFixed(2) + ' 억원'; el.className = 'text-lg font-bold mt-2 stat-value text-red-600'; }
      };
      if (profitEl) formatCard(profitEl, totalProfit);
      if (prodEl) formatCard(prodEl, -totalProdEffect);
      if (unitEl) formatCard(unitEl, totalUnitEffect);

      // Footer totals
      var tfoot = document.getElementById('sim-profit-foot');
      if (tfoot) {
        var totalBaseEok = (totalBaseMatCost / 100000000).toFixed(2);
        var totalSimEok = (totalSimMatCost / 100000000).toFixed(2);
        tfoot.innerHTML = '<tr class="bg-slate-100 font-semibold border-t-2 border-slate-300">'
          + '<td colspan="2" class="!py-2 text-center font-bold">합계</td>'
          + '<td class="!py-2 text-right font-mono">' + simRows.reduce(function(s,r){return s+r.base_prod;},0).toFixed(1) + '</td>'
          + '<td class="!py-2 text-right font-mono">-</td>'
          + '<td class="!py-2 text-right font-mono !border-r border-slate-200">' + totalBaseEok + '</td>'
          + '<td class="!py-2 text-right font-mono bg-blue-50/30">' + simRows.reduce(function(s,r){return s+r.sim_prod;},0).toFixed(1) + '</td>'
          + '<td class="!py-2 text-right font-mono bg-blue-50/30">-</td>'
          + '<td class="!py-2 text-right font-mono font-medium !border-r border-slate-200 bg-blue-50/30">' + totalSimEok + '</td>'
          + buildEffectCell(-totalProdEffect).replace('bg-green-50/30','bg-green-50/50')
          + buildEffectCell(totalUnitEffect).replace('bg-green-50/30','bg-green-50/50')
          + buildProfitCell(totalProfit).replace('bg-green-50/30','bg-green-50/50')
          + '<td class="!py-2"></td>'
          + '</tr>';
      }

      // Chart update
      renderSimProfitChart(chartLabels, chartProfits);
    }

    function renderSimProfitChart(labels, profits) {
      var ctx = document.getElementById('simProfitChart');
      if (!ctx) return;
      if (simProfitChart) simProfitChart.destroy();
      var colors = profits.map(function(v) { return v >= 0 ? 'rgba(59,130,246,0.7)' : 'rgba(220,38,38,0.7)'; });
      var borderColors = profits.map(function(v) { return v >= 0 ? 'rgb(59,130,246)' : 'rgb(220,38,38)'; });
      simProfitChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '손익(천원)',
            data: profits,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: function(ctx) { return ctx.parsed.y.toLocaleString() + ' 천원'; } } }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: function(v) { return v.toLocaleString(); } },
              grid: { color: '#f1f5f9' }
            },
            x: { ticks: { font: { size: 10 } }, grid: { display: false } }
          }
        }
      });
    }

    // ===== Data View (데이터 조회) - Raw Records 전체 컬럼 =====
    let dvCurrentPage = 0;
    let dvTotal = 0;
    let dvPageData = [];
    let dvSummary = null;

    async function initDataView() {
      await loadMatGroupOptions();
      await loadDataView();
    }

    async function loadMatGroupOptions() {
      try {
        const groups = await fetch('/api/raw-records/material-groups').then(r => r.json());
        const sel = document.getElementById('dv-mat-group');
        sel.innerHTML = '<option value="">전체 자재구분</option>';
        groups.forEach(function(g) {
          sel.innerHTML += '<option value="' + g + '">' + g + '</option>';
        });
      } catch(e) { console.warn('자재구분 목록 로드 실패:', e); }
    }

    async function loadDataView() {
      const machine = document.getElementById('dv-unit').value;
      const category = document.getElementById('dv-category').value;
      const matGroup = document.getElementById('dv-mat-group').value;
      const search = document.getElementById('dv-search').value;
      const limit = parseInt(document.getElementById('dv-page-size').value);
      const year = document.getElementById('dv-year').value;
      const month = document.getElementById('dv-month').value;
      const ym = year + month;

      let url = '/api/raw-records?ym=' + ym + '&page=' + dvCurrentPage + '&limit=' + limit;
      if (machine) url += '&machine=' + machine;
      if (category) url += '&category=' + category;
      if (matGroup) url += '&mat_group=' + encodeURIComponent(matGroup);
      if (search) url += '&search=' + encodeURIComponent(search);

      const resp = await fetch(url).then(r => r.json());
      dvTotal = resp.total;
      dvPageData = resp.data || [];
      dvSummary = resp.summary || null;

      renderDataViewTable();
    }

    function renderDataViewTable() {
      const limit = parseInt(document.getElementById('dv-page-size').value);
      const start = dvCurrentPage * limit;

      // Summary (전체 조회조건 기준 TOTAL)
      document.getElementById('dv-total-count').textContent = dvTotal.toLocaleString() + '건';
      if (dvSummary) {
        document.getElementById('dv-total-qty').textContent = Math.round(dvSummary.total_issue_qty).toLocaleString();
        document.getElementById('dv-total-cost').textContent = (dvSummary.total_issue_amount / 100000000).toFixed(1) + '억';
        document.getElementById('dv-mat-count').textContent = dvSummary.material_count + '종';
      } else {
        const totalQty = dvPageData.reduce((s, d) => s + (d.issue_qty || 0), 0);
        const totalAmt = dvPageData.reduce((s, d) => s + (d.issue_amount || 0), 0);
        const matSet = new Set(dvPageData.map(d => d.material_code));
        document.getElementById('dv-total-qty').textContent = Math.round(totalQty).toLocaleString();
        document.getElementById('dv-total-cost').textContent = (totalAmt / 100000000).toFixed(1) + '억';
        document.getElementById('dv-mat-count').textContent = matSet.size + '종';
      }

      // Table body
      const tbody = document.getElementById('dv-tbody');
      if (dvPageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="39" class="text-center text-gray-400 py-12"><i class="fas fa-inbox text-3xl mb-3 block text-gray-200"></i>데이터가 없습니다. SAP 파일을 업로드해주세요.</td></tr>';
      } else {
        const numFmt = (v) => v != null ? Number(v).toLocaleString(undefined, {maximumFractionDigits:2}) : '-';
        tbody.innerHTML = dvPageData.map((d, idx) => {
          const rowNum = start + idx + 1;
          const chipClass = getCC(d.machine_code||'');
          return '<tr class="hover:bg-sage-50/30">' +
            '<td class="!px-2 text-gray-400">' + rowNum + '</td>' +
            '<td class="!px-2">' + (d.calendar_ym||'') + '</td>' +
            '<td class="!px-2">' + (d.process_code||'') + '</td>' +
            '<td class="!px-2">' + (d.process_name||'') + '</td>' +
            '<td class="!px-2"><span class="unit-chip '+chipClass+'">' + (d.machine_code||'') + '</span></td>' +
            '<td class="!px-2">' + (d.machine_name||'') + '</td>' +
            '<td class="!px-2">' + (d.product_level1||'') + '</td>' +
            '<td class="!px-2">' + (d.product_level1_name||'') + '</td>' +
            '<td class="!px-2">' + (d.product_level2||'') + '</td>' +
            '<td class="!px-2">' + (d.product_level2_name||'') + '</td>' +
            '<td class="!px-2">' + (d.product_level3||'') + '</td>' +
            '<td class="!px-2 max-w-[120px] truncate" title="'+(d.product_level3_name||'')+'">' + (d.product_level3_name||'') + '</td>' +
            '<td class="!px-2">' + (d.product_level4||'') + '</td>' +
            '<td class="!px-2 max-w-[120px] truncate" title="'+(d.product_level4_name||'')+'">' + (d.product_level4_name||'') + '</td>' +
            '<td class="!px-2 font-mono text-[10px]">' + (d.material_code||'') + '</td>' +
            '<td class="!px-2 font-medium">' + (d.material_name||'') + '</td>' +
            '<td class="!px-2"><span class="' + (d.material_classification ? 'bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]' : 'text-gray-300') + '">' + (d.material_classification||'-') + '</span></td>' +
            '<td class="!px-2">' + (d.material_group||'') + '</td>' +
            '<td class="!px-2 max-w-[100px] truncate" title="'+(d.material_group_name||'')+'">' + (d.material_group_name||'') + '</td>' +
            '<td class="!px-2">' + (d.material_group_major||'') + '</td>' +
            '<td class="!px-2">' + (d.material_group_major_name||'') + '</td>' +
            '<td class="!px-2">' + (d.product_type_code||'') + '</td>' +
            '<td class="!px-2">' + (d.product_type_name||'') + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.plan_unit_consumption) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.component_qty) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.base_qty) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.plan_unit_consumption_waste) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.plan_unit_price) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.plan_alloc_qty) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.total_production) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.production_qty) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.waste_qty) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.actual_unit_consumption) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.actual_alloc_qty) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.actual_unit_price) + '</td>' +
            '<td class="!px-2 text-right font-mono font-semibold">' + numFmt(d.issue_qty) + '</td>' +
            '<td class="!px-2 text-right font-mono font-semibold">' + numFmt(d.issue_amount) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.plan_vs_usage_diff) + '</td>' +
            '<td class="!px-2 text-right font-mono">' + numFmt(d.plan_vs_price_diff) + '</td>' +
          '</tr>';
        }).join('');
      }

      // Pagination
      const totalPages = Math.ceil(dvTotal / limit) || 1;
      document.getElementById('dv-page-info').textContent = dvTotal > 0 ? (start+1) + '~' + Math.min(start+limit, dvTotal) + ' / 총 ' + dvTotal.toLocaleString() + '건' : '데이터 없음';
      document.getElementById('dv-page-num').textContent = (dvCurrentPage+1) + '/' + totalPages;
      document.getElementById('dv-prev-btn').disabled = dvCurrentPage === 0;
      document.getElementById('dv-next-btn').disabled = dvCurrentPage >= totalPages - 1;
    }

    function dvChangePage(dir) {
      const limit = parseInt(document.getElementById('dv-page-size').value);
      const totalPages = Math.ceil(dvTotal / limit);
      dvCurrentPage = Math.max(0, Math.min(totalPages - 1, dvCurrentPage + dir));
      loadDataView();
    }

    // ============ 대시보드 엑셀 다운로드 ============
    async function exportDashboardExcel() {
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value.padStart(2, '0');
      const ym = year + month;

      // 로딩 표시
      const btn = event.target.closest('button');
      const origText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>생성 중...';
      btn.disabled = true;

      try {
        // 1) 모든 API 데이터 병렬 fetch
        const [rawRecords, overview, overviewRaw, overviewSub, matCost, matGroup, prodSummary, prodAnalysis, mixEffect] = await Promise.all([
          fetch('/api/raw-records?ym=' + ym + '&page=0&limit=99999').then(r => r.json()),
          fetch('/api/dashboard/material-overview?ym=' + ym).then(r => r.json()),
          fetch('/api/dashboard/material-overview?ym=' + ym + '&category=RAW').then(r => r.json()),
          fetch('/api/dashboard/material-overview?ym=' + ym + '&category=SUB').then(r => r.json()),
          fetch('/api/dashboard/material-cost-summary?ym=' + ym).then(r => r.json()),
          fetch('/api/dashboard/material-by-group?ym=' + ym).then(r => r.json()),
          fetch('/api/dashboard/production-summary?ym=' + ym).then(r => r.json()),
          fetch('/api/dashboard/production-analysis?ym=' + ym).then(r => r.json()),
          fetch('/api/dashboard/mix-effect?ym=' + ym).then(r => r.json())
        ]);

        const wb = XLSX.utils.book_new();

        // 유틸: 열 너비 자동 조정
        function autoFitCols(ws) {
          var ref = ws['!ref'];
          if (!ref) return;
          var range = XLSX.utils.decode_range(ref);
          var colWidths = [];
          for (var C = range.s.c; C <= range.e.c; C++) {
            var maxLen = 8; // 최소 너비
            for (var R = range.s.r; R <= range.e.r; R++) {
              var addr = XLSX.utils.encode_cell({r:R, c:C});
              var cell = ws[addr];
              if (!cell) continue;
              var val = '';
              if (cell.t === 's') val = cell.v || '';
              else if (cell.t === 'n') val = cell.v != null ? Number(cell.v).toLocaleString() : '';
              else if (cell.f) val = '00000000000'; // 수식은 대략 11자
              var len = 0;
              for (var k = 0; k < val.length; k++) {
                len += val.charCodeAt(k) > 127 ? 2.2 : 1.1;
              }
              if (len > maxLen) maxLen = len;
            }
            colWidths.push({wch: Math.min(Math.ceil(maxLen) + 2, 30)});
          }
          ws['!cols'] = colWidths;
        }

        // 유틸: 숫자 셀에 천단위 쉼표 포맷 적용
        function applyNumberFormat(ws) {
          var ref = ws['!ref'];
          if (!ref) return;
          var range = XLSX.utils.decode_range(ref);
          for (var R = range.s.r; R <= range.e.r; R++) {
            for (var C = range.s.c; C <= range.e.c; C++) {
              var addr = XLSX.utils.encode_cell({r:R, c:C});
              var cell = ws[addr];
              if (!cell) continue;
              if (cell.t === 'n' || cell.f) {
                cell.z = '#,##0';
              }
            }
          }
        }

        // 유틸: 시트 마무리 (열너비 + 숫자포맷)
        function finalizeSheet(ws) {
          applyNumberFormat(ws);
          autoFitCols(ws);
          return ws;
        }

        // 재료비총괄 시트 생성 헬퍼 함수
        function buildOverviewSheet(ovData) {
          var ovHeaders = ['호기','지종','당월재료비(원)','당월생산량(톤)','당월호기비중(%)','당월원단위(원/kg)','당월재료비(억원)','당월전체비중(%)','전월재료비(원)','전월생산량(톤)','전월호기비중(%)','전월원단위(원/kg)','전월재료비(억원)','전월전체비중(%)','예상재료비(원)','예상생산량(톤)','예상호기비중(%)','예상원단위(원/kg)','예상재료비(억원)','예상전체비중(%)'];
          var data = ovData || [];
          var ovRows = [];
          var rs = 2;
          data.forEach(function(d) {
            ovRows.push([
              d.machine_code || '', d.product_level2_name || '',
              Number(d.cur_material_cost) || 0, Number(d.cur_production) || 0,
              null, null, null, null,
              Number(d.prev_material_cost) || 0, Number(d.prev_production) || 0,
              null, null, null, null,
              Number(d.est_material_cost) || 0, Number(d.est_production) || 0,
              null, null, null, null
            ]);
          });
          var ws = XLSX.utils.aoa_to_sheet([ovHeaders].concat(ovRows));
          var tr = rs + data.length;
          data.forEach(function(d, i) {
            var row = i + rs;
            ws['F' + row] = {t:'n', f:'IF(D'+row+'=0,0,C'+row+'/(D'+row+'*1000))'};
            ws['G' + row] = {t:'n', f:'C'+row+'/100000000'};
            ws['L' + row] = {t:'n', f:'IF(J'+row+'=0,0,I'+row+'/(J'+row+'*1000))'};
            ws['M' + row] = {t:'n', f:'I'+row+'/100000000'};
            ws['R' + row] = {t:'n', f:'IF(P'+row+'=0,0,O'+row+'/(P'+row+'*1000))'};
            ws['S' + row] = {t:'n', f:'O'+row+'/100000000'};
            ws['E' + row] = {t:'n', f:'IF(SUMIF(A$'+rs+':A$'+(tr-1)+',A'+row+',D$'+rs+':D$'+(tr-1)+')=0,0,D'+row+'/SUMIF(A$'+rs+':A$'+(tr-1)+',A'+row+',D$'+rs+':D$'+(tr-1)+')*100)'};
            ws['H' + row] = {t:'n', f:'IF(SUM(C$'+rs+':C$'+(tr-1)+')=0,0,C'+row+'/SUM(C$'+rs+':C$'+(tr-1)+')*100)'};
            ws['K' + row] = {t:'n', f:'IF(SUMIF(A$'+rs+':A$'+(tr-1)+',A'+row+',J$'+rs+':J$'+(tr-1)+')=0,0,J'+row+'/SUMIF(A$'+rs+':A$'+(tr-1)+',A'+row+',J$'+rs+':J$'+(tr-1)+')*100)'};
            ws['N' + row] = {t:'n', f:'IF(SUM(I$'+rs+':I$'+(tr-1)+')=0,0,I'+row+'/SUM(I$'+rs+':I$'+(tr-1)+')*100)'};
            ws['Q' + row] = {t:'n', f:'IF(SUMIF(A$'+rs+':A$'+(tr-1)+',A'+row+',P$'+rs+':P$'+(tr-1)+')=0,0,P'+row+'/SUMIF(A$'+rs+':A$'+(tr-1)+',A'+row+',P$'+rs+':P$'+(tr-1)+')*100)'};
            ws['T' + row] = {t:'n', f:'IF(SUM(O$'+rs+':O$'+(tr-1)+')=0,0,O'+row+'/SUM(O$'+rs+':O$'+(tr-1)+')*100)'};
          });
          ws['A' + tr] = {t:'s', v:'합계'};
          ws['B' + tr] = {t:'s', v:''};
          ws['C' + tr] = {t:'n', f:'SUM(C'+rs+':C'+(tr-1)+')'};
          ws['D' + tr] = {t:'n', f:'SUM(D'+rs+':D'+(tr-1)+')'};
          ws['E' + tr] = {t:'n', v:100};
          ws['F' + tr] = {t:'n', f:'IF(D'+tr+'=0,0,C'+tr+'/(D'+tr+'*1000))'};
          ws['G' + tr] = {t:'n', f:'C'+tr+'/100000000'};
          ws['H' + tr] = {t:'n', v:100};
          ws['I' + tr] = {t:'n', f:'SUM(I'+rs+':I'+(tr-1)+')'};
          ws['J' + tr] = {t:'n', f:'SUM(J'+rs+':J'+(tr-1)+')'};
          ws['K' + tr] = {t:'n', v:100};
          ws['L' + tr] = {t:'n', f:'IF(J'+tr+'=0,0,I'+tr+'/(J'+tr+'*1000))'};
          ws['M' + tr] = {t:'n', f:'I'+tr+'/100000000'};
          ws['N' + tr] = {t:'n', v:100};
          ws['O' + tr] = {t:'n', f:'SUM(O'+rs+':O'+(tr-1)+')'};
          ws['P' + tr] = {t:'n', f:'SUM(P'+rs+':P'+(tr-1)+')'};
          ws['Q' + tr] = {t:'n', v:100};
          ws['R' + tr] = {t:'n', f:'IF(P'+tr+'=0,0,O'+tr+'/(P'+tr+'*1000))'};
          ws['S' + tr] = {t:'n', f:'O'+tr+'/100000000'};
          ws['T' + tr] = {t:'n', v:100};
          ws['!ref'] = XLSX.utils.encode_range({s:{c:0,r:0},e:{c:19,r:tr}});
          return finalizeSheet(ws);
        }

        // ======== Sheet 1: Raw (원본 데이터) ========
        var rawHeaders = ['달력연도/월','공정','공정명','생산호기','생산호기명','제품레벨1','제품레벨1명','제품레벨2','제품레벨2명','제품레벨3','제품레벨3명','제품레벨4','제품레벨4명','자재코드','자재명','자재구분','자재그룹','자재그룹명','대분류','대분류명','지종구분','지종구분명','계획원단위','구성부품수량','기준수량','계획원단위(폐품)','계획단가','계획배부수량','총생산량','생산수량','폐품수량','실제원단위','실제배부수량','실제단가','출고수량','출고금액','사용량차이','단가차이'];
        var rawRows = (rawRecords.data || []).map(function(d) {
          return [d.calendar_ym, d.process_code, d.process_name, d.machine_code, d.machine_name,
            d.product_level1, d.product_level1_name, d.product_level2, d.product_level2_name,
            d.product_level3, d.product_level3_name, d.product_level4, d.product_level4_name,
            d.material_code, d.material_name, d.material_classification||'',
            d.material_group, d.material_group_name, d.material_group_major, d.material_group_major_name,
            d.product_type_code, d.product_type_name,
            d.plan_unit_consumption, d.component_qty, d.base_qty, d.plan_unit_consumption_waste,
            d.plan_unit_price, d.plan_alloc_qty, d.total_production, d.production_qty, d.waste_qty,
            d.actual_unit_consumption, d.actual_alloc_qty, d.actual_unit_price,
            d.issue_qty, d.issue_amount, d.plan_vs_usage_diff, d.plan_vs_price_diff];
        });
        var wsRaw = XLSX.utils.aoa_to_sheet([rawHeaders].concat(rawRows));
        XLSX.utils.book_append_sheet(wb, finalizeSheet(wsRaw), 'Raw');

        // ======== Sheet 2/3/4: 재료비총괄 (전체, 원재료, 부재료) ========
        XLSX.utils.book_append_sheet(wb, buildOverviewSheet(overview), '재료비총괄(전체)');
        XLSX.utils.book_append_sheet(wb, buildOverviewSheet(overviewRaw), '재료비총괄(원재료)');
        XLSX.utils.book_append_sheet(wb, buildOverviewSheet(overviewSub), '재료비총괄(부재료)');

        // ======== Sheet 5: 자재그룹별재료비 (Material Cost Summary) ========
        var mcHeaders = ['호기','제품구분(레벨2)','자재그룹명','재료비(당월)','재료비(전월)','전월대비차이','사용량차이','단가차이','건수'];
        var mcData = matCost || [];
        var mcRows = mcData.map(function(d, i) {
          var row = i + 2;
          return [
            d.machine_code || '', d.product_level2_name || '', d.material_group_name || '',
            Number(d.material_cost) || 0, Number(d.prev_material_cost) || 0,
            null, // 수식: 당월-전월
            Number(d.usage_diff) || 0, Number(d.price_diff) || 0,
            Number(d.record_count) || 0
          ];
        });
        var wsMc = XLSX.utils.aoa_to_sheet([mcHeaders].concat(mcRows));
        // 전월대비차이 수식
        mcData.forEach(function(d, i) {
          var row = i + 2;
          wsMc['F' + row] = {t:'n', f:'D'+row+'-E'+row};
        });
        // 합계행
        var mcTotalRow = mcData.length + 2;
        wsMc['A' + mcTotalRow] = {t:'s', v:'합계'};
        wsMc['D' + mcTotalRow] = {t:'n', f:'SUM(D2:D'+(mcTotalRow-1)+')'};
        wsMc['E' + mcTotalRow] = {t:'n', f:'SUM(E2:E'+(mcTotalRow-1)+')'};
        wsMc['F' + mcTotalRow] = {t:'n', f:'D'+mcTotalRow+'-E'+mcTotalRow};
        wsMc['G' + mcTotalRow] = {t:'n', f:'SUM(G2:G'+(mcTotalRow-1)+')'};
        wsMc['H' + mcTotalRow] = {t:'n', f:'SUM(H2:H'+(mcTotalRow-1)+')'};
        wsMc['I' + mcTotalRow] = {t:'n', f:'SUM(I2:I'+(mcTotalRow-1)+')'};
        wsMc['!ref'] = XLSX.utils.encode_range({s:{c:0,r:0},e:{c:8,r:mcTotalRow-1}});
        XLSX.utils.book_append_sheet(wb, finalizeSheet(wsMc), '자재그룹별재료비');

        // ======== Sheet 4: 대분류별재료비 (Material by Group) ========
        var mgHeaders = ['호기','자재그룹(대분류)명','제품구분(레벨2)','재료비(당월)','재료비(전월)','사용량차이','단가차이','배부수량(당월)','배부수량(전월)'];
        var mgData = matGroup || [];
        var mgRows = mgData.map(function(d) {
          return [
            d.machine_code || '', d.material_group_major_name || '', d.product_level2_name || '',
            Number(d.material_cost) || 0, Number(d.prev_material_cost) || 0,
            Number(d.usage_diff) || 0, Number(d.price_diff) || 0,
            Number(d.alloc_qty) || 0, Number(d.prev_alloc_qty) || 0
          ];
        });
        var wsMg = XLSX.utils.aoa_to_sheet([mgHeaders].concat(mgRows));
        // 합계행
        var mgTotalRow = mgData.length + 2;
        wsMg['A' + mgTotalRow] = {t:'s', v:'합계'};
        wsMg['D' + mgTotalRow] = {t:'n', f:'SUM(D2:D'+(mgTotalRow-1)+')'};
        wsMg['E' + mgTotalRow] = {t:'n', f:'SUM(E2:E'+(mgTotalRow-1)+')'};
        wsMg['F' + mgTotalRow] = {t:'n', f:'SUM(F2:F'+(mgTotalRow-1)+')'};
        wsMg['G' + mgTotalRow] = {t:'n', f:'SUM(G2:G'+(mgTotalRow-1)+')'};
        wsMg['H' + mgTotalRow] = {t:'n', f:'SUM(H2:H'+(mgTotalRow-1)+')'};
        wsMg['I' + mgTotalRow] = {t:'n', f:'SUM(I2:I'+(mgTotalRow-1)+')'};
        wsMg['!ref'] = XLSX.utils.encode_range({s:{c:0,r:0},e:{c:8,r:mgTotalRow-1}});
        XLSX.utils.book_append_sheet(wb, finalizeSheet(wsMg), '대분류별재료비');

        // ======== Sheet 5: 생산량합계 (Production Summary) ========
        var psHeaders = ['호기','호기명','제품구분(레벨2)','총생산량'];
        var psData = prodSummary || [];
        var psRows = psData.map(function(d) {
          return [d.machine_code||'', d.machine_name||'', d.product_level2_name||'', Number(d.total_production)||0];
        });
        var wsPs = XLSX.utils.aoa_to_sheet([psHeaders].concat(psRows));
        var psTotalRow = psData.length + 2;
        wsPs['A' + psTotalRow] = {t:'s', v:'합계'};
        wsPs['D' + psTotalRow] = {t:'n', f:'SUM(D2:D'+(psTotalRow-1)+')'};
        wsPs['!ref'] = XLSX.utils.encode_range({s:{c:0,r:0},e:{c:3,r:psTotalRow-1}});
        XLSX.utils.book_append_sheet(wb, finalizeSheet(wsPs), '생산량합계');

        // ======== Sheet 6: 생산량분석 (Production Analysis) ========
        var paHeaders = ['행레이블','당월_총생산량','당월_생산수량','당월_폐품수량','전월_총생산량','전월_생산수량','전월_폐품수량','증감_총생산량','증감_생산수량','증감_폐품수량'];
        var paData = (prodAnalysis && prodAnalysis.rows) ? prodAnalysis.rows : (Array.isArray(prodAnalysis) ? prodAnalysis : []);
        var paRows = paData.map(function(d, i) {
          var row = i + 2;
          return [
            d.label || (d.machine_code + ' > ' + (d.product_level2_name||'')),
            Number(d.cur_total_production)||0, Number(d.cur_production_qty)||0, Number(d.cur_waste_qty)||0,
            Number(d.prev_total_production)||0, Number(d.prev_production_qty)||0, Number(d.prev_waste_qty)||0,
            null, null, null  // 증감은 수식으로
          ];
        });
        var wsPa = XLSX.utils.aoa_to_sheet([paHeaders].concat(paRows));
        // 증감 수식: 당월 - 전월
        paData.forEach(function(d, i) {
          var row = i + 2;
          wsPa['H' + row] = {t:'n', f:'B'+row+'-E'+row};
          wsPa['I' + row] = {t:'n', f:'C'+row+'-F'+row};
          wsPa['J' + row] = {t:'n', f:'D'+row+'-G'+row};
        });
        // 합계행
        var paTotalRow = paData.length + 2;
        wsPa['A' + paTotalRow] = {t:'s', v:'합계'};
        ['B','C','D','E','F','G'].forEach(function(col) {
          wsPa[col + paTotalRow] = {t:'n', f:'SUM('+col+'2:'+col+(paTotalRow-1)+')'};
        });
        wsPa['H' + paTotalRow] = {t:'n', f:'B'+paTotalRow+'-E'+paTotalRow};
        wsPa['I' + paTotalRow] = {t:'n', f:'C'+paTotalRow+'-F'+paTotalRow};
        wsPa['J' + paTotalRow] = {t:'n', f:'D'+paTotalRow+'-G'+paTotalRow};
        wsPa['!ref'] = XLSX.utils.encode_range({s:{c:0,r:0},e:{c:9,r:paTotalRow-1}});
        XLSX.utils.book_append_sheet(wb, finalizeSheet(wsPa), '생산량분석');

        // ======== Sheet 7: 믹스효과 (Mix Effect) ========
        var mxHeaders = ['시나리오','구분','유형','원단위차이','수량차이','금액효과(천원)'];
        var mxRows = [];
        var scenarios = [
          {key: 'scenario1', label: mixEffect && mixEffect.scenario1 ? (mixEffect.scenario1.label || '시나리오1') : '시나리오1'},
          {key: 'scenario2', label: mixEffect && mixEffect.scenario2 ? (mixEffect.scenario2.label || '시나리오2') : '시나리오2'},
          {key: 'scenario3', label: mixEffect && mixEffect.scenario3 ? (mixEffect.scenario3.label || '시나리오3') : '시나리오3'}
        ];
        if (mixEffect) {
          scenarios.forEach(function(sc) {
            var s = mixEffect[sc.key];
            if (!s) return;
            // 호기 믹스
            (s.machineMix || []).forEach(function(m) {
              mxRows.push([sc.label, '호기믹스', m.machine||'', Number(m.col1)||0, Number(m.col2)||0, Number(m.col3)||0]);
            });
            // 지종 믹스 (PM2, PM3)
            var gm = s.gradeMix || {};
            Object.keys(gm).forEach(function(machineKey) {
              (gm[machineKey] || []).forEach(function(g) {
                mxRows.push([sc.label, '지종믹스(' + machineKey + ')', g.product_type||'', Number(g.col1)||0, Number(g.col2)||0, Number(g.col3)||0]);
              });
            });
          });
        }
        var wsMx = XLSX.utils.aoa_to_sheet([mxHeaders].concat(mxRows));
        XLSX.utils.book_append_sheet(wb, finalizeSheet(wsMx), '믹스효과');

        // ======== Sheet 8: 손익분석 (Profit Analysis from Overview) ========
        var profHeaders = ['호기','지종','전월원단위','당월원단위','원단위차이','생산량(당월)','손익(천원)'];
        var ovDataAll = overview || [];
        var profRows = ovDataAll.map(function(d, i) {
          var row = i + 2;
          return [
            d.machine_code || '', d.product_level2_name || '',
            null, null, null, // 수식으로
            Number(d.cur_production) || 0,
            null  // 손익 수식
          ];
        });
        var wsProf = XLSX.utils.aoa_to_sheet([profHeaders].concat(profRows));
        // 수식: 전월원단위, 당월원단위, 차이, 손익
        ovDataAll.forEach(function(d, i) {
          var row = i + 2;
          var prevCost = Number(d.prev_material_cost)||0;
          var prevProd = Number(d.prev_production)||1;
          var curCost = Number(d.cur_material_cost)||0;
          var curProd = Number(d.cur_production)||1;
          wsProf['C' + row] = {t:'n', v: prevProd > 0 ? prevCost/prevProd : 0};
          wsProf['D' + row] = {t:'n', v: curProd > 0 ? curCost/curProd : 0};
          wsProf['E' + row] = {t:'n', f:'C'+row+'-D'+row};
          // 손익(천원) = (전월원단위-당월원단위)*생산량/1000
          wsProf['G' + row] = {t:'n', f:'E'+row+'*F'+row+'/1000'};
        });
        var profTotalRow = ovDataAll.length + 2;
        wsProf['A' + profTotalRow] = {t:'s', v:'합계'};
        wsProf['F' + profTotalRow] = {t:'n', f:'SUM(F2:F'+(profTotalRow-1)+')'};
        wsProf['G' + profTotalRow] = {t:'n', f:'SUM(G2:G'+(profTotalRow-1)+')'};
        wsProf['!ref'] = XLSX.utils.encode_range({s:{c:0,r:0},e:{c:6,r:profTotalRow-1}});
        XLSX.utils.book_append_sheet(wb, finalizeSheet(wsProf), '손익분석');

        // 파일 다운로드
        XLSX.writeFile(wb, '원부자재_사전원가분석_' + ym + '.xlsx');

      } catch(e) {
        console.error('엑셀 생성 오류:', e);
        alert('엑셀 파일 생성 중 오류가 발생했습니다: ' + e.message);
      } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
      }
    }

    function exportDataViewCSV() {
      if (dvPageData.length === 0) { alert('내보낼 데이터가 없습니다.'); return; }
      const headers = ['달력연도/월','공정','공정명','생산호기','생산호기명','제품레벨1','제품레벨1명','제품레벨2','제품레벨2명','제품레벨3','제품레벨3명','제품레벨4','제품레벨4명','자재코드','자재명','자재그룹','자재그룹명','대분류','대분류명','지종구분','지종구분명','계획원단위','구성부품수량','기준수량','계획원단위(폐품)','계획단가','계획배부수량','총생산량','생산수량','폐품수량','실제원단위','실제배부수량','실제단가','출고수량','출고금액','사용량차이','단가차이'];
      const rows = dvPageData.map(d => [
        d.calendar_ym, d.process_code, d.process_name, d.machine_code, d.machine_name,
        d.product_level1, d.product_level1_name, d.product_level2, d.product_level2_name,
        d.product_level3, d.product_level3_name, d.product_level4, d.product_level4_name,
        d.material_code, d.material_name, d.material_group, d.material_group_name,
        d.material_group_major, d.material_group_major_name, d.product_type_code, d.product_type_name,
        d.plan_unit_consumption, d.component_qty, d.base_qty, d.plan_unit_consumption_waste,
        d.plan_unit_price, d.plan_alloc_qty, d.total_production, d.production_qty, d.waste_qty,
        d.actual_unit_consumption, d.actual_alloc_qty, d.actual_unit_price,
        d.issue_qty, d.issue_amount, d.plan_vs_usage_diff, d.plan_vs_price_diff
      ]);
      const dq = String.fromCharCode(34);
      const nl = String.fromCharCode(10);
      const bom = String.fromCharCode(0xFEFF);
      const csvStr = bom + [headers, ...rows].map(r => r.map(v => dq + String(v==null?'':v).replace(new RegExp(dq,'g'), dq+dq) + dq).join(',')).join(nl);
      const blob = new Blob([csvStr], {type: 'text/csv;charset=utf-8;'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const ym = document.getElementById('dv-year').value + document.getElementById('dv-month').value;
      link.download = 'raw_data_' + ym + '.csv';
      link.click();
    }

    // ============ MANUAL INPUT (부서 수기 입력) ============
    var mnMachine = (divisionMachines && divisionMachines.length) ? (divisionMachines[divisionMachines.length-1].code || divisionMachines[divisionMachines.length-1]) : 'PM3';
    var mnDeptType = 'production';  // 'production' | 'purchase'
    var mnMaterials = [];  // 자재 목록
    var mnProdTypes = [];  // 지종 목록
    var mnPrevProd = {};   // 전월 지종별 생산량(톤)
    var mnInputData = {};  // 사용자 입력 데이터
    var mnExclusionRules = [];  // 투입제외 규칙 (DB에서 로드)

    // 저장된 사용자 이름 복원
    (function() {
      var stored = localStorage.getItem('mn_user_name');
      if (stored) {
        var el = document.getElementById('mn-user-name');
        if (el) el.value = stored;
      }
    })();
    // 이름 변경 시 localStorage 저장
    (function() {
      var el = document.getElementById('mn-user-name');
      if (el) el.addEventListener('change', function() { localStorage.setItem('mn_user_name', el.value); });
    })();

    function setManualMachine(mc) {
      mnMachine = mc;
      var mnMachineList = (divisionMachines || []).map(function(m){ return m.code || m; });
      if (!mnMachineList.length) mnMachineList = Object.keys(CC.machineChipMap);
      mnMachineList.forEach(function(k) {
        var btn = document.getElementById('mn-mc-' + k.toLowerCase());
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(k === mc ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      loadManualData();
    }

    // 호기 → 플랜트 매핑
    function getMachinePlant(machine) {
      // 공통코드(CC) 객체에서 호기→플랜트 매핑 조회 — 하드코딩 제거
      return (CC.machinePlantMap && CC.machinePlantMap[machine]) || '';
    }

    function setManualDept(dept) {
      mnDeptType = dept;
      var prodBtn = document.getElementById('mn-dept-production');
      var purchBtn = document.getElementById('mn-dept-purchase');
      if (dept === 'production') {
        if (prodBtn) { prodBtn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold transition-all bg-blue-500 text-white shadow-sm'; }
        if (purchBtn) { purchBtn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold transition-all text-gray-500 hover:text-gray-700'; }
        var banner = document.getElementById('mn-dept-banner');
        if (banner) { banner.className = 'mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100'; }
        var desc = document.getElementById('mn-dept-desc');
        if (desc) desc.innerHTML = '<b>생산부서</b> — 사용량(kg)과 원단위(kg/톤)를 입력합니다.';
      } else {
        if (prodBtn) { prodBtn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold transition-all text-gray-500 hover:text-gray-700'; }
        if (purchBtn) { purchBtn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold transition-all bg-amber-500 text-white shadow-sm'; }
        var banner = document.getElementById('mn-dept-banner');
        if (banner) { banner.className = 'mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100'; }
        var desc = document.getElementById('mn-dept-desc');
        if (desc) desc.innerHTML = '<b>구매부서</b> — 입고수량(톤)과 입고단가(원/kg)를 입력합니다.';
      }
      renderManualDetail();
    }

    async function loadManualData() {
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;
      var curMonth = parseInt(month);
      var curYear = parseInt(year);
      var prevMonth = curMonth;  // 선택된 월이 '당월' 기준이므로, 전월은 -1
      var prevYear = curYear;
      // 선택된 분석월 = 당월 기준 → 전월 = 분석월-1
      prevMonth = curMonth - 1;
      if (prevMonth < 1) { prevMonth = 12; prevYear--; }
      var prevYm = String(prevYear) + String(prevMonth).padStart(2,'0');

      var prevLabel = String(prevYear).substring(2) + '.' + String(prevMonth).padStart(2,'0') + '월 (실적)';
      var curLabel = String(curYear).substring(2) + '.' + month + '월 (예상)';
      
      var el = document.getElementById('mn-period-label');
      if (el) el.textContent = mnMachine + ' | ' + prevLabel + ' → ' + curLabel;
      var h1 = document.getElementById('mn-prev-prod-header');
      var h2 = document.getElementById('mn-cur-prod-header');
      var h3 = document.getElementById('mn-prev-header');
      var h4 = document.getElementById('mn-cur-header');
      if (h1) h1.textContent = prevLabel;
      if (h2) h2.textContent = curLabel;
      if (h3) h3.textContent = prevLabel;
      if (h4) h4.textContent = curLabel;

      try {
        var results = await Promise.all([
          fetch('/api/manual-input/materials?ym=' + prevYm + '&machine=' + mnMachine).then(function(r){return r.json();}),
          fetch('/api/manual-input/production?ym=' + prevYm + '&machine=' + mnMachine).then(function(r){return r.json();}),
          fetch('/api/manual-input/saved?ym=' + ym + '&machine=' + mnMachine).then(function(r){return r.json();}),
          fetch('/api/exclusion-rules?machine=' + mnMachine).then(function(r){return r.json();}),
          fetch('/api/inventory-stock/closing-map?month=' + prevYm + '&plant=' + getMachinePlant(mnMachine)).then(function(r){return r.json();})
        ]);
        mnMaterials = results[0].materials || [];
        mnProdTypes = results[0].productTypes || [];
        mnPrevProd = results[1].production || {};
        var savedData = results[2] || {};
        mnInputData = savedData.data || {};
        mnExclusionRules = results[3] || [];
        // 전월 기말재고 맵 (material_id → { closing_qty, closing_price })
        // 이것이 당월 기초재고가 됨
        window.mnClosingMap = (results[4] && results[4].map) || {};
        // 저장된 신규 자재 복원
        if (mnInputData.new_materials && mnInputData.new_materials.length) {
          mnInputData.new_materials.forEach(function(nm) {
            // 이미 목록에 있는지 확인
            var exists = mnMaterials.some(function(m) {
              return m.code === nm.code || m.code.replace(/^0+/,'') === nm.code.replace(/^0+/,'');
            });
            if (!exists) {
              mnMaterials.push({ code: nm.code, name: nm.name, group_name: nm.group_name || '신규 추가', usage_qty: 0, unit_price: 0, is_new: true });
            }
          });
        }
        // 마지막 저장 정보 표시
        if (savedData.saved_by || savedData.updated_at) {
          var at = savedData.updated_at || '';
          if (at && at.length > 16) at = at.substring(0, 16).replace('T', ' ');
          updateLastSaveInfo(savedData.saved_by || '', at);
        } else {
          var infoEl = document.getElementById('mn-last-save-info');
          if (infoEl) infoEl.classList.add('hidden');
        }
        renderManualProduction();
        renderManualDetail();
      } catch(e) {
        console.error('Manual input load error:', e);
      }
    }

    function renderManualProduction() {
      var tbody = document.getElementById('mn-prod-body');
      if (!tbody) return;

      var types = mnProdTypes.length > 0 ? mnProdTypes : Object.keys(mnPrevProd);
      if (types.length === 0) {
        // 공통코드(CC)에서 호기별 기본 지종 조회 — 하드코딩 제거
        types = (CC.machineDefaultGrades && CC.machineDefaultGrades[mnMachine]) || ['기본'];
      }

      var html = '';
      var prevTotal = 0, curTotal = 0;

      types.forEach(function(t) {
        var prevVal = mnPrevProd[t] || 0;
        var prevTon = Math.round(prevVal / 1000);
        prevTotal += prevTon;
        var savedCur = (mnInputData.production && mnInputData.production[t]) || prevTon;
        curTotal += Number(savedCur) || 0;

        html += '<tr class="border-b border-slate-100 hover:bg-slate-50/30">';
        html += '<td class="px-2 py-1 text-xs font-medium text-gray-700">' + t + '</td>';
        html += '<td class="px-2 py-1 text-right font-mono text-xs border-l border-slate-200">' + (prevTon > 0 ? prevTon.toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1 text-right border-l border-slate-200">'
          + '<input type="number" class="w-20 text-right text-xs font-mono border border-slate-200 rounded px-1 py-0.5 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 mn-cur-prod" data-type="' + t + '" value="' + savedCur + '" onchange="onManualProdChange()">'
          + '</td>';
        html += '</tr>';
      });

      tbody.innerHTML = html;
      var ptEl = document.getElementById('mn-prev-prod-total');
      var ctEl = document.getElementById('mn-cur-prod-total');
      if (ptEl) ptEl.textContent = prevTotal > 0 ? prevTotal.toLocaleString() : '-';
      if (ctEl) ctEl.textContent = curTotal > 0 ? curTotal.toLocaleString() : '-';
    }

    function onManualProdChange() {
      var inputs = document.querySelectorAll('.mn-cur-prod');
      var total = 0;
      inputs.forEach(function(inp) { total += Number(inp.value) || 0; });
      var el = document.getElementById('mn-cur-prod-total');
      if (el) el.textContent = total > 0 ? Math.round(total).toLocaleString() : '-';
      // 생산량 변경 시 → 수동 원단위 설정된 행들의 사용량 재역산
      if (mnMaterials && mnMaterials.length) {
        mnMaterials.forEach(function(m, idx) {
          var cucEl = document.getElementById('mn-r-' + idx + '-cuc');
          if (cucEl && cucEl.getAttribute('data-manual') === '1') {
            onUnitCostInput(idx);
          }
        });
      }
      calcManualProfit();
    }

    function renderManualDetail() {
      var tbody = document.getElementById('mn-detail-body');
      var thead = document.getElementById('mn-detail-thead');
      if (!tbody || !thead) return;

      if (!mnMaterials.length) {
        thead.innerHTML = '';
        tbody.innerHTML = '<tr><td colspan="20" class="text-center py-8 text-gray-400">자재 데이터가 없습니다. 전월 데이터를 먼저 업로드해주세요.</td></tr>';
        return;
      }

      // 부서별 테이블 헤더 렌더링
      var prevHeaderLabel = document.getElementById('mn-prev-prod-header') ? document.getElementById('mn-prev-prod-header').textContent : '전월 (실적)';
      var curHeaderLabel = document.getElementById('mn-cur-prod-header') ? document.getElementById('mn-cur-prod-header').textContent : '당월 (예상)';

      var theadHtml = '';
      if (mnDeptType === 'production') {
        // 생산부서: 전월실적(사용량, 원단위, 단가) + 당월예상(사용량, 원단위) + 이슈
        theadHtml += '<tr class="bg-slate-100 border-b">';
        theadHtml += '<th colspan="2" class="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-slate-300" rowspan="2">자재코드 / 자재명</th>';
        theadHtml += '<th colspan="3" class="px-2 py-1.5 text-center font-semibold text-blue-700 border-r border-slate-300">' + prevHeaderLabel + '</th>';
        theadHtml += '<th colspan="2" class="px-2 py-1.5 text-center font-semibold text-emerald-700 border-r border-slate-300">' + curHeaderLabel + '</th>';
        theadHtml += '<th class="px-2 py-1.5 text-center font-semibold text-gray-500 border-l border-slate-300" rowspan="2">이슈사항</th>';
        theadHtml += '</tr>';
        theadHtml += '<tr class="bg-slate-50 border-b text-[10px] text-gray-500">';
        theadHtml += '<th class="px-1.5 py-1 text-right border-l border-slate-200">사용량(kg)</th>';
        theadHtml += '<th class="px-1.5 py-1 text-right">원단위(kg/톤)</th>';
        theadHtml += '<th class="px-1.5 py-1 text-right border-r border-slate-300">사용단가(원/kg)</th>';
        theadHtml += '<th class="px-1.5 py-1 text-right bg-emerald-50/50">사용량(kg)</th>';
        theadHtml += '<th class="px-1.5 py-1 text-right border-r border-slate-300 bg-emerald-50/50">원단위(kg/톤)</th>';
        theadHtml += '</tr>';
      } else {
        // 구매부서: 전월실적(사용량, 단가) + 당월예상(입고수량, 입고단가) + 이슈
        theadHtml += '<tr class="bg-slate-100 border-b">';
        theadHtml += '<th colspan="2" class="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-slate-300" rowspan="2">자재코드 / 자재명</th>';
        theadHtml += '<th colspan="3" class="px-2 py-1.5 text-center font-semibold text-blue-700 border-r border-slate-300">' + prevHeaderLabel + '</th>';
        theadHtml += '<th colspan="2" class="px-2 py-1.5 text-center font-semibold text-amber-700 border-r border-slate-300">' + curHeaderLabel + '</th>';
        theadHtml += '<th class="px-2 py-1.5 text-center font-semibold text-gray-500 border-l border-slate-300" rowspan="2">이슈사항</th>';
        theadHtml += '</tr>';
        theadHtml += '<tr class="bg-slate-50 border-b text-[10px] text-gray-500">';
        theadHtml += '<th class="px-1.5 py-1 text-right border-l border-slate-200">사용량(kg)</th>';
        theadHtml += '<th class="px-1.5 py-1 text-right">사용단가(원/kg)</th>';
        theadHtml += '<th class="px-1.5 py-1 text-right border-r border-slate-300">비용(백만원)</th>';
        theadHtml += '<th class="px-1.5 py-1 text-right bg-amber-50/50">입고수량(톤)</th>';
        theadHtml += '<th class="px-1.5 py-1 text-right border-r border-slate-300 bg-amber-50/50">입고단가(원/kg)</th>';
        theadHtml += '</tr>';
      }
      thead.innerHTML = theadHtml;

      // 전월 총 생산량(톤)
      var prevProdTon = 0;
      for (var k in mnPrevProd) { prevProdTon += (mnPrevProd[k] || 0) / 1000; }

      // 그룹별 정리
      var grouped = {};
      var groups = [];
      // mnMaterials를 한국어 자재그룹순으로 재정렬 (idx-DOM ID 동기화를 위해 원본 정렬)
      mnMaterials.sort(function(a, b) {
        var ga = a.group_name || '기타';
        var gb = b.group_name || '기타';
        var gCmp = ga.localeCompare(gb, 'ko');
        if (gCmp !== 0) return gCmp;
        return (a.code || '').localeCompare(b.code || '', 'ko');
      });
      mnMaterials.forEach(function(m) {
        var gk = m.group_name || '기타';
        if (!grouped[gk]) { grouped[gk] = []; groups.push(gk); }
        grouped[gk].push(m);
      });

      // 그룹필터 옵션
      var filterSel = document.getElementById('mn-mat-group-filter');
      if (filterSel && filterSel.options.length <= 1) {
        groups.forEach(function(g) {
          var opt = document.createElement('option');
          opt.value = g;
          opt.textContent = g;
          filterSel.appendChild(opt);
        });
      }

      var html = '';
      var rowIdx = 0;
      var colSpan = mnDeptType === 'production' ? 8 : 8;

      groups.forEach(function(gk) {
        var items = grouped[gk];
        // 그룹 헤더
        html += '<tr class="bg-slate-50 border-t border-slate-200 mn-group-row" data-group="' + gk + '">';
        html += '<td colspan="' + colSpan + '" class="px-2 py-1.5 text-xs font-semibold text-gray-700">' + gk + '</td>';
        html += '</tr>';

        items.forEach(function(m) {
          var saved = (mnInputData.materials && mnInputData.materials[m.code]) || {};
          var shortCode = m.code.replace(/^0+/, '') || m.code;
          var prevUsage = m.usage_qty || 0;
          var prevUC = prevProdTon > 0 ? prevUsage / prevProdTon : 0;
          var prevPrice = m.unit_price || 0;
          var prevCost = prevUsage * prevPrice;
          var prevCostMil = prevCost / 1000000;

          var rid = 'mn-r-' + rowIdx;
          var rowCls = m.is_new ? 'bg-amber-50/50 hover:bg-amber-100/40 border-b border-amber-100 mn-mat-row' : 'hover:bg-blue-50/30 border-b border-slate-50 mn-mat-row';
          html += '<tr class="' + rowCls + '" data-group="' + gk + '">';
          // 자재코드/명
          html += '<td class="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border-r border-slate-100">' + (m.is_new ? '<span class="text-amber-600 font-semibold">' + shortCode + '</span>' : shortCode) + '</td>';
          html += '<td class="px-1.5 py-0.5 text-xs border-r border-slate-300">' + m.name + (m.is_new ? ' <span class="text-[9px] px-1 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold">NEW</span>' : '') + '</td>';

          if (mnDeptType === 'production') {
            // ===== 생산부서 모드: 전월(사용량, 원단위, 단가) + 당월(사용량, 원단위) =====
            // 전월 실적 3열
            html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-l border-slate-200" id="' + rid + '-pu">' + (prevUsage > 0 ? Math.round(prevUsage).toLocaleString() : '-') + '</td>';
            html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs">' + (prevUC > 0 ? prevUC.toFixed(1) : '-') + '</td>';
            html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-r border-slate-300">' + (prevPrice > 0 ? Math.round(prevPrice).toLocaleString() : '-') + '</td>';
            // 당월 예상 2열: 사용량(kg) 입력, 원단위(kg/톤) 입력
            html += '<td class="px-1.5 py-0.5 text-right bg-emerald-50/20">'
              + '<input type="text" inputmode="numeric" class="w-20 text-right text-[10px] font-mono border border-emerald-300 rounded px-1 py-1 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 mn-inp comma-fmt" id="' + rid + '-cu" data-row="' + rowIdx + '" data-field="cur_usage" value="' + (saved.cur_usage ? Math.round(saved.cur_usage).toLocaleString() : '') + '" placeholder="사용량" onchange="calcManualRow(' + rowIdx + ')">'
              + '</td>';
            html += '<td class="px-1.5 py-0.5 text-right border-r border-slate-300 bg-emerald-50/20">'
              + '<input type="number" step="0.1" class="w-16 text-right text-[10px] font-mono border border-emerald-300 rounded px-1 py-1 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 mn-inp" id="' + rid + '-cuc" data-row="' + rowIdx + '" data-field="cur_uc" data-group="' + (m.group_name || '') + '" value="' + (saved.cur_uc || '') + '" placeholder="원단위" onchange="onUnitCostInput(' + rowIdx + ')">'
              + '</td>';
          } else {
            // ===== 구매부서 모드: 전월(사용량, 단가, 비용) + 당월(입고수량, 입고단가) =====
            // 전월 실적 3열
            html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-l border-slate-200">' + (prevUsage > 0 ? Math.round(prevUsage).toLocaleString() : '-') + '</td>';
            html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs">' + (prevPrice > 0 ? Math.round(prevPrice).toLocaleString() : '-') + '</td>';
            html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-r border-slate-300">' + (prevCostMil > 0 ? prevCostMil.toFixed(1) : '-') + '</td>';
            // 당월 예상 2열: 입고수량(톤) 입력, 입고단가(원/kg) 입력
            html += '<td class="px-1.5 py-0.5 text-right bg-amber-50/20">'
              + '<input type="text" inputmode="numeric" class="w-20 text-right text-[10px] font-mono border border-amber-300 rounded px-1 py-1 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-200 mn-inp comma-fmt" id="' + rid + '-iq" data-row="' + rowIdx + '" data-field="incoming_qty" value="' + (saved.incoming_qty ? Math.round(saved.incoming_qty).toLocaleString() : '') + '" placeholder="입고수량" onchange="calcManualRow(' + rowIdx + ')">'
              + '</td>';
            html += '<td class="px-1.5 py-0.5 text-right border-r border-slate-300 bg-amber-50/20">'
              + '<input type="text" inputmode="numeric" class="w-20 text-right text-[10px] font-mono border border-amber-300 rounded px-1 py-1 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-200 mn-inp comma-fmt" id="' + rid + '-ip" data-row="' + rowIdx + '" data-field="incoming_price" value="' + (saved.incoming_price ? Math.round(saved.incoming_price).toLocaleString() : '') + '" placeholder="입고단가" onchange="calcManualRow(' + rowIdx + ')">'
              + '</td>';
          }

          // 이슈사항 — 자기 부서 이슈만 편집 가능, 타 부서 이슈는 읽기전용 표시
          var rawIssue = (saved.issue || '');
          var myPrefix = mnDeptType === 'production' ? '[생산]' : '[구매]';
          var otherPrefix = mnDeptType === 'production' ? '[구매]' : '[생산]';
          var issueLines = rawIssue ? rawIssue.split(String.fromCharCode(10)) : [];
          if (issueLines.length <= 1) issueLines = rawIssue.split('\\n');
          var myIssue = '';
          var otherIssue = '';
          issueLines.forEach(function(line) {
            var trimmed = line.trim();
            if (trimmed.startsWith(myPrefix)) {
              myIssue = trimmed.substring(myPrefix.length).trim();
            } else if (trimmed.startsWith(otherPrefix)) {
              otherIssue = trimmed;
            } else if (trimmed) {
              // 접두사 없는 레거시 이슈 → 현재 부서 것으로 취급
              if (!myIssue) myIssue = trimmed;
            }
          });
          html += '<td class="px-1.5 py-0.5 border-l border-slate-300">';
          if (otherIssue) {
            html += '<div class="text-[9px] text-gray-400 mb-0.5 truncate" title="' + otherIssue.replace(/"/g,'&quot;') + '">' + otherIssue + '</div>';
          }
          html += '<input type="text" class="w-36 text-[10px] border border-slate-200 rounded px-1 py-0.5 focus:border-blue-300 mn-inp" id="' + rid + '-issue" data-row="' + rowIdx + '" data-field="issue" value="' + myIssue.replace(/"/g,'&quot;') + '" placeholder="이슈 입력">'
            + '</td>';
          html += '</tr>';
          rowIdx++;
        });
      });

      tbody.innerHTML = html;
    }

    function calcManualRow(idx) {
      // 사용량 변경 시 → 원단위 수동플래그 해제 (자동계산 모드로)
      var cucEl = document.getElementById('mn-r-' + idx + '-cuc');
      if (cucEl) cucEl.removeAttribute('data-manual');
      calcManualProfit();
    }

    // 전월 원단위 입력 → 전월 사용량 역산
    // 공식: 사용량(kg) = 원단위(kg/톤) × 전월 유효생산량(톤)
    function onPrevUnitCostInput(idx) {
      var rid = 'mn-r-' + idx;
      var pucEl = document.getElementById(rid + '-puc');
      var puEl = document.getElementById(rid + '-pu');
      if (!pucEl) return;

      var unitCost = Number(pucEl.value) || 0;
      if (unitCost <= 0) { calcManualProfit(); return; }

      // 전월 유효 생산량 계산 (톤 단위)
      var m = mnMaterials[idx];
      var groupName = m ? (m.group_name || '') : '';
      var prevProdByType = {};
      var prevTotalProd = 0;
      for (var k in mnPrevProd) {
        var tonVal = (mnPrevProd[k] || 0) / 1000;
        prevProdByType[k] = tonVal;
        prevTotalProd += tonVal;
      }

      // DB 규칙에서 제외 지종 확인
      var excludeProd = 0;
      if (mnExclusionRules && mnExclusionRules.length && groupName) {
        mnExclusionRules.forEach(function(rule) {
          if (groupName.indexOf(rule.material_group_keyword) >= 0) {
            excludeProd += prevProdByType[rule.excluded_product_type] || 0;
          }
        });
      }

      var effectiveProd = prevTotalProd - excludeProd;
      if (effectiveProd <= 0) effectiveProd = prevTotalProd > 0 ? prevTotalProd : 1;

      // 사용량 역산
      var usage = Math.round(unitCost * effectiveProd);
      if (puEl) puEl.textContent = usage > 0 ? usage.toLocaleString() : '-';

      calcManualProfit();
    }

    // 당월 원단위 입력 → 사용량 역산
    // 공식: 사용량(kg) = 원단위(kg/톤) × 유효생산량(톤)
    // 유효생산량 = 전체생산량 - 제외지종 생산량
    // PM2: 화이트레저 → KB 제외
    // PM3: 신문지·마닐라 → CB(CCKB)·IV 제외
    function onUnitCostInput(idx) {
      var rid = 'mn-r-' + idx;
      var cucEl = document.getElementById(rid + '-cuc');
      var cuEl = document.getElementById(rid + '-cu');
      if (!cucEl || !cuEl) return;

      var unitCost = Number(cucEl.value) || 0;
      if (unitCost <= 0) { cucEl.removeAttribute('data-manual'); calcManualProfit(); return; }

      // 수동입력 플래그 설정
      cucEl.setAttribute('data-manual', '1');

      // 유효 생산량 계산
      var effectiveProd = getEffectiveProduction(idx);
      // 사용량 역산
      var usage = Math.round(unitCost * effectiveProd);
      cuEl.value = usage > 0 ? usage.toLocaleString('ko-KR') : '';

      calcManualProfit();
    }

    // 호기·자재그룹에 따른 유효 생산량(톤) 계산 — DB 규칙 기반
    function getEffectiveProduction(idx) {
      var m = mnMaterials[idx];
      var groupName = m ? (m.group_name || '') : '';

      // 당월 지종별 생산량 수집 (톤 단위)
      var prodByType = {};
      var totalProd = 0;
      var inputs = document.querySelectorAll('.mn-cur-prod');
      inputs.forEach(function(inp) {
        var t = inp.getAttribute('data-type') || '';
        var v = Number(inp.value) || 0;
        prodByType[t] = v;
        totalProd += v;
      });

      // DB 규칙에서 제외 지종 확인
      var excludeProd = 0;
      if (mnExclusionRules && mnExclusionRules.length && groupName) {
        mnExclusionRules.forEach(function(rule) {
          // 자재그룹에 키워드가 포함되면 해당 지종 제외
          if (groupName.indexOf(rule.material_group_keyword) >= 0) {
            excludeProd += prodByType[rule.excluded_product_type] || 0;
          }
        });
      }

      var effectiveProd = totalProd - excludeProd;
      return effectiveProd > 0 ? effectiveProd : (totalProd > 0 ? totalProd : 1);
    }

    function calcManualProfit() {
      if (!mnMaterials || !mnMaterials.length) return;

      // 당월 총 생산량(톤)
      var curProdInputs = document.querySelectorAll('.mn-cur-prod');
      var curProdTon = 0;
      curProdInputs.forEach(function(inp) { curProdTon += Number(inp.value) || 0; });
      if (curProdTon === 0) curProdTon = 1;

      // 전월 총 생산량(톤)
      var prevProdTon = 0;
      for (var k in mnPrevProd) { prevProdTon += (mnPrevProd[k] || 0) / 1000; }
      if (prevProdTon === 0) prevProdTon = 1;

      mnMaterials.forEach(function(m, idx) {
        var rid = 'mn-r-' + idx;
        var prevUsage = m.usage_qty || 0;
        var prevPrice = m.unit_price || 0; // 전월 사용단가

        // 전월 원단위 (입력값 우선)
        var pucEl = document.getElementById(rid + '-puc');
        var prevUC = pucEl ? (Number(pucEl.value) || 0) : (prevProdTon > 0 ? prevUsage / prevProdTon : 0);

        // 당월 사용량(kg)
        var cuEl = document.getElementById(rid + '-cu');
        var curUsage = cuEl ? parseComma(cuEl.value) : 0;

        // 원단위(kg/톤) — 사용량 기반 자동계산 (사용자 수동입력값이 있으면 유지)
        var cucEl = document.getElementById(rid + '-cuc');
        var cucManualVal = cucEl ? Number(cucEl.getAttribute('data-manual')) : 0;
        if (!cucManualVal && curUsage > 0 && curProdTon > 0) {
          var autoUC = curUsage / curProdTon;
          if (cucEl) cucEl.value = autoUC.toFixed(1);
        }

        // === 핵심 로직: 사용단가 = 가중평균(기초재고 + 입고) ===
        var iqEl = document.getElementById(rid + '-iq');  // 입고수량(톤) → kg로 변환
        var ipEl = document.getElementById(rid + '-ip');  // 입고단가(원/kg)
        var sqEl = document.getElementById(rid + '-sq');  // 기초재고수량(톤) → kg로 변환
        var spEl = document.getElementById(rid + '-sp');  // 기초재고단가(원/kg)
        var upEl = document.getElementById(rid + '-up');  // 사용단가(원/kg) - 자동계산 or 수동

        var incomingQty = iqEl ? parseComma(iqEl.value) * 1000 : 0;  // 톤→kg
        var incomingPrice = ipEl ? parseComma(ipEl.value) : 0;
        var stockQty = sqEl ? parseComma(sqEl.value) * 1000 : 0;  // 톤→kg
        var stockPrice = spEl ? parseComma(spEl.value) : 0;

        // 가중평균 사용단가 자동계산
        var calcPrice = 0;
        var totalQty = stockQty + incomingQty;
        if (totalQty > 0 && (stockPrice > 0 || incomingPrice > 0)) {
          calcPrice = (stockQty * stockPrice + incomingQty * incomingPrice) / totalQty;
        }

        // 사용단가 필드: 가중평균으로 자동채움 (입고/재고 입력 시)
        var curPrice = 0;
        if (calcPrice > 0) {
          curPrice = calcPrice;
          if (upEl) upEl.value = Math.round(calcPrice).toLocaleString('ko-KR');
        } else {
          // 가중평균 계산 불가 시 수동입력값 또는 전월단가 사용
          curPrice = upEl ? (parseComma(upEl.value) || prevPrice) : prevPrice;
        }

        // 비용(백만원) = 사용량 × 사용단가
        var curCost = curUsage * curPrice;
        var curCostMil = curCost / 1000000;
        var ccEl = document.getElementById(rid + '-cc');
        if (ccEl) ccEl.textContent = curCostMil > 0 ? Math.round(curCostMil).toLocaleString() : '-';

        // 톤당비용 = 원단위 (원/톤) = 비용 / 생산량(톤)
        var curCostPerTon = curProdTon > 0 ? curCost / curProdTon : 0;
        var ctEl = document.getElementById(rid + '-ct');
        if (ctEl) ctEl.textContent = curCostPerTon > 0 ? Math.round(curCostPerTon).toLocaleString() : '-';

        // === 손익효과 ===
        // 사용량차이(원) = (전월사용량 - 당월사용량) × 전월사용단가 → 양수=절감
        var diffUsage = (prevUsage - curUsage) * prevPrice;
        // 단가차이(원) = (전월사용단가 - 당월사용단가) × 당월사용량 → 양수=절감, 음수=악화
        var diffPrice = (curUsage > 0 && curPrice > 0) ? (prevPrice - curPrice) * curUsage : 0;
        var diffTotal = diffUsage + diffPrice;

        var duEl = document.getElementById(rid + '-du');
        var dpEl = document.getElementById(rid + '-dp');
        var dtEl = document.getElementById(rid + '-dt');

        function fmtMnDiff(v) {
          if (!v || Math.abs(v) < 1) return '-';
          var formatted = Math.round(Math.abs(v)).toLocaleString();
          if (v > 0) return '<span class="text-blue-600">+' + formatted + '</span>';
          return '<span class="text-red-500">\u25B3' + formatted + '</span>';
        }
        if (duEl) duEl.innerHTML = fmtMnDiff(diffUsage);
        if (dpEl) dpEl.innerHTML = fmtMnDiff(diffPrice);
        if (dtEl) dtEl.innerHTML = fmtMnDiff(diffTotal);
      });
    }

    function filterManualTable() {
      var sel = document.getElementById('mn-mat-group-filter');
      var filterGroup = sel ? sel.value : '';
      var rows = document.querySelectorAll('#mn-detail-body tr');
      rows.forEach(function(tr) {
        if (!tr.hasAttribute('data-group')) { tr.style.display = ''; return; }
        var rowGroup = tr.getAttribute('data-group');
        if (!filterGroup || rowGroup === filterGroup) {
          tr.style.display = '';
        } else {
          tr.style.display = 'none';
        }
      });
    }

    // ====== 계산결과 탭 ======
    var crData = []; // 계산결과 배열

    async function loadCalcResultData() {
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;
      var machine = document.getElementById('cr-machine-select').value;

      var statusEl = document.getElementById('cr-load-status');
      if (statusEl) statusEl.textContent = '로딩 중...';

      try {
        // 1) 저장된 수기입력 최신 데이터 로드
        var histRes = await fetch('/api/manual-input/history?ym=' + ym + '&machine=' + machine);
        var histJson = await histRes.json();
        if (!histJson.history || !histJson.history.length) {
          if (statusEl) statusEl.textContent = '저장된 데이터 없음';
          document.getElementById('cr-empty-msg').classList.remove('hidden');
          document.getElementById('cr-dashboard').classList.add('hidden');
          return;
        }
        // 최신 버전 로드
        var latestId = histJson.history[0].id;
        var dataRes = await fetch('/api/manual-input/history/' + latestId);
        var dataJson = await dataRes.json();
        if (!dataJson.data) {
          if (statusEl) statusEl.textContent = '데이터 파싱 실패';
          return;
        }

        var savedData = dataJson.data; // { production: {...}, materials: {...} }
        var savedBy = dataJson.saved_by || '';
        var savedAt = dataJson.updated_at || '';

        // 2) 해당 호기 자재 목록 로드 (전월 실적 기반)
        var prevYm = getPrevYm(ym);
        var matRes = await fetch('/api/manual-input/materials?ym=' + prevYm + '&machine=' + encodeURIComponent(machine));
        var matJson = await matRes.json();
        var materials = matJson.materials || [];

        if (!materials.length) {
          if (statusEl) statusEl.textContent = '자재 목록 없음 (전월 데이터 필요)';
          document.getElementById('cr-empty-msg').classList.remove('hidden');
          document.getElementById('cr-dashboard').classList.add('hidden');
          return;
        }

        // 3) 생산량 로드
        var prodRes = await fetch('/api/manual-input/production?ym=' + prevYm + '&machine=' + encodeURIComponent(machine));
        var prodJson = await prodRes.json();
        var prevProd = prodJson.production || {};

        // 4) 계산결과 렌더링
        renderCalcResultFromSaved(machine, ym, materials, savedData, prevProd, savedBy, savedAt);
        if (statusEl) statusEl.textContent = '저장자: ' + (savedBy || '-') + ' | ' + (savedAt ? new Date(savedAt).toLocaleString('ko-KR') : '');
      } catch(e) {
        if (statusEl) statusEl.textContent = '오류: ' + e.message;
      }
    }

    function getPrevYm(ym) {
      var y = parseInt(ym.substring(0,4));
      var m = parseInt(ym.substring(4,6)) - 1;
      if (m < 1) { m = 12; y--; }
      return String(y) + String(m).padStart(2,'0');
    }

    function renderCalcResultFromSaved(machine, ym, materials, savedData, prevProd, savedBy, savedAt) {
      var emptyEl = document.getElementById('cr-empty-msg');
      var dashEl = document.getElementById('cr-dashboard');
      if (emptyEl) emptyEl.classList.add('hidden');
      if (dashEl) dashEl.classList.remove('hidden');

      // 기간/호기 표시
      var year = ym.substring(0,4);
      var month = ym.substring(4,6);
      var curLabel = year.substring(2) + '.' + month + '월 (예상)';
      var prevMonth = parseInt(month) - 1;
      var prevYear = parseInt(year);
      if (prevMonth < 1) { prevMonth = 12; prevYear--; }
      var prevLabel = String(prevYear).substring(2) + '.' + String(prevMonth).padStart(2,'0') + '월 (실적)';

      var plEl = document.getElementById('cr-period-label');
      if (plEl) plEl.textContent = prevLabel + ' vs ' + curLabel;
      var mlEl = document.getElementById('cr-machine-label');
      if (mlEl) mlEl.textContent = machine;

      // 당월 생산량(톤) - 저장된 생산량
      var curProdTon = 0;
      var savedProd = savedData.production || {};
      for (var pt in savedProd) { curProdTon += Number(savedProd[pt]) || 0; }
      if (curProdTon === 0) curProdTon = 1;

      // 전월 생산량(톤)
      var prevProdTon = 0;
      for (var k in prevProd) { prevProdTon += (prevProd[k] || 0) / 1000; }
      if (prevProdTon === 0) prevProdTon = 1;

      // 저장된 자재별 입력 데이터
      var savedMats = savedData.materials || {};

      // 자재별 계산
      crData = [];
      var totalCost = 0, totalSaving = 0, totalWorse = 0;

      materials.forEach(function(m) {
        var saved = savedMats[m.code] || {};
        var prevUsage = m.usage_qty || 0;
        var prevPrice = m.unit_price || 0;

        var stockQty = Number(saved.stock_qty) || 0;
        var stockPrice = Number(saved.stock_price) || 0;
        var incomingQty = Number(saved.incoming_qty) || 0;
        var incomingPrice = Number(saved.incoming_price) || 0;
        var curUsage = Number(saved.cur_usage) || 0;

        // 가중평균 사용단가
        var stockQtyKg = stockQty * 1000;
        var incomingQtyKg = incomingQty * 1000;
        var totalQtyKg = stockQtyKg + incomingQtyKg;
        var calcPrice = 0;
        if (totalQtyKg > 0 && (stockPrice > 0 || incomingPrice > 0)) {
          calcPrice = (stockQtyKg * stockPrice + incomingQtyKg * incomingPrice) / totalQtyKg;
        }
        var curPrice = calcPrice > 0 ? calcPrice : (Number(saved.use_price) || prevPrice);

        // 비용
        var curCost = curUsage * curPrice;
        var curCostMil = curCost / 1000000;
        totalCost += curCostMil;

        // 손익효과: (전월단가 - 당월가중평균단가) × 당월사용량
        var diffPrice = (curUsage > 0 && curPrice > 0 && prevPrice > 0) ? (prevPrice - curPrice) * curUsage : 0;
        if (diffPrice > 0) totalSaving += diffPrice;
        if (diffPrice < 0) totalWorse += diffPrice;

        crData.push({
          code: m.code,
          name: m.name,
          group: m.group_name || '기타',
          stockQty: stockQty,
          stockPrice: stockPrice,
          incomingQty: incomingQty,
          incomingPrice: incomingPrice,
          calcPrice: calcPrice,
          curPrice: curPrice,
          prevPrice: prevPrice,
          curUsage: curUsage,
          curCostMil: curCostMil,
          diffTotal: diffPrice
        });
      });

      // 요약 카드 업데이트
      var tcEl = document.getElementById('cr-total-cost');
      if (tcEl) tcEl.textContent = totalCost > 0 ? Math.round(totalCost).toLocaleString() : '-';
      var avgUC = curProdTon > 0 ? (totalCost * 1000000 / curProdTon) : 0;
      var auEl = document.getElementById('cr-avg-unitcost');
      if (auEl) auEl.textContent = avgUC > 0 ? Math.round(avgUC).toLocaleString() : '-';
      var seEl = document.getElementById('cr-saving-effect');
      if (seEl) seEl.textContent = totalSaving > 0 ? '+' + Math.round(totalSaving).toLocaleString() : '-';
      var weEl = document.getElementById('cr-worse-effect');
      if (weEl) weEl.textContent = totalWorse < 0 ? Math.round(totalWorse).toLocaleString() : '-';

      // 그룹 필터 옵션 업데이트
      var groups = {};
      crData.forEach(function(d) {
        if (!groups[d.group]) groups[d.group] = { count: 0 };
        groups[d.group].count++;
      });
      var filterEl = document.getElementById('cr-group-filter');
      if (filterEl) {
        var prevVal = filterEl.value;
        var optHtml = '<option value="">전체 그룹</option>';
        Object.keys(groups).sort().forEach(function(g) {
          optHtml += '<option value="' + g + '">' + g + ' (' + groups[g].count + ')</option>';
        });
        filterEl.innerHTML = optHtml;
        if (prevVal) filterEl.value = prevVal;
      }

      // 상세 테이블 렌더링
      renderCalcResultTable();
    }

    // 기존 renderCalcResult: 수기입력 탭에서 직접 호출 시 (하위 호환)
    function renderCalcResult() {
      // 수기입력 탭 데이터가 있으면 계산결과 탭도 갱신
      if (mnMaterials && mnMaterials.length && mnMachine) {
        var crMachineEl = document.getElementById('cr-machine-select');
        if (crMachineEl) crMachineEl.value = mnMachine;
      }
    }

    function renderCalcResultTable() {
      var sortSel = document.getElementById('cr-sort');
      var sortVal = sortSel ? sortSel.value : 'effect-desc';
      var filterSel = document.getElementById('cr-group-filter');
      var filterGroup = filterSel ? filterSel.value : '';

      var filtered = crData.filter(function(d) {
        if (!filterGroup) return true;
        return d.group === filterGroup;
      });

      // 정렬
      filtered.sort(function(a, b) {
        if (sortVal === 'group-asc') {
          var gCmp = (a.group || '').localeCompare(b.group || '', 'ko');
          if (gCmp !== 0) return gCmp;
          return (a.name || '').localeCompare(b.name || '', 'ko');
        }
        if (sortVal === 'effect-desc') return a.diffTotal - b.diffTotal;
        if (sortVal === 'effect-asc') return b.diffTotal - a.diffTotal;
        if (sortVal === 'cost-desc') return b.curCostMil - a.curCostMil;
        if (sortVal === 'name-asc') return (a.name || '').localeCompare(b.name || '', 'ko');
        return 0;
      });

      var tbody = document.getElementById('cr-detail-body');
      var tfoot = document.getElementById('cr-detail-foot');
      if (!tbody) return;

      var html = '';
      var sumCost = 0, sumSaving = 0, sumWorse = 0, sumDiffTotal = 0;

      filtered.forEach(function(d, idx) {
        // 전월대비 손익효과 = (전월단가 - 당월가중평균단가) × 당월사용량 → 양수=절감
        var profitEffect = 0;
        if (d.calcPrice > 0 && d.prevPrice > 0 && d.curUsage > 0) {
          profitEffect = (d.prevPrice - d.calcPrice) * d.curUsage;
        }
        var effectColor = profitEffect > 0 ? 'text-blue-600' : (profitEffect < 0 ? 'text-red-500' : 'text-gray-400');

        sumCost += d.curCostMil;
        sumDiffTotal += profitEffect;
        if (profitEffect > 0) sumSaving += profitEffect;
        if (profitEffect < 0) sumWorse += profitEffect;

        html += '<tr class="border-b border-slate-100 hover:bg-slate-50/30">';
        html += '<td class="px-2 py-1.5 text-gray-400">' + (idx + 1) + '</td>';
        html += '<td class="px-2 py-1.5 font-mono text-gray-500">' + (d.code || '') + '</td>';
        html += '<td class="px-2 py-1.5 font-medium text-gray-700 whitespace-nowrap max-w-[150px] truncate" title="' + (d.name || '') + '">' + (d.name || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-gray-500">' + (d.group || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono">' + (d.stockQty > 0 ? d.stockQty.toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono">' + (d.stockPrice > 0 ? Math.round(d.stockPrice).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono">' + (d.incomingQty > 0 ? d.incomingQty.toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono">' + (d.incomingPrice > 0 ? Math.round(d.incomingPrice).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono bg-amber-50 font-semibold">' + (d.calcPrice > 0 ? Math.round(d.calcPrice).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono">' + (d.prevPrice > 0 ? Math.round(d.prevPrice).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono bg-blue-50 font-semibold ' + effectColor + '">' + crFmtEffect(profitEffect) + '</td>';
        html += '</tr>';
      });
      tbody.innerHTML = html;

      // 합계 footer
      if (tfoot) {
        var fHtml = '<tr>';
        fHtml += '<td colspan="4" class="px-2 py-2 text-gray-700">합계 (' + filtered.length + '건)</td>';
        fHtml += '<td colspan="6"></td>';
        fHtml += '<td class="px-2 py-2 text-right font-mono bg-blue-50 font-bold ' + (sumDiffTotal >= 0 ? 'text-blue-600' : 'text-red-500') + '">' + crFmtEffect(sumDiffTotal) + '</td>';
        fHtml += '</tr>';
        tfoot.innerHTML = fHtml;
      }
    }

    function crFmtEffect(v) {
      if (!v || Math.abs(v) < 1) return '-';
      var abs = Math.round(Math.abs(v)).toLocaleString();
      if (v > 0) return '+' + abs;
      return '-' + abs;
    }

    function filterCalcResult() {
      renderCalcResultTable();
    }

    function exportCalcResultExcel() {
      if (!crData || !crData.length) { alert('계산결과 데이터가 없습니다.'); return; }
      var rows = [];
      crData.forEach(function(d, idx) {
        var profitEffect = 0;
        if (d.calcPrice > 0 && d.prevPrice > 0 && d.curUsage > 0) {
          profitEffect = (d.prevPrice - d.calcPrice) * d.curUsage;
        }
        rows.push({
          'No': idx + 1,
          '자재코드': d.code,
          '자재명': d.name,
          '그룹': d.group,
          '기초재고수량(톤)': d.stockQty || '',
          '기초재고단가(원/kg)': d.stockPrice > 0 ? Math.round(d.stockPrice) : '',
          '입고수량(톤)': d.incomingQty || '',
          '입고단가(원/kg)': d.incomingPrice > 0 ? Math.round(d.incomingPrice) : '',
          '사용단가_가중평균(원/kg)': d.calcPrice > 0 ? Math.round(d.calcPrice) : '',
          '전월단가(원/kg)': d.prevPrice > 0 ? Math.round(d.prevPrice) : '',
          '전월대비_손익효과(원)': Math.round(profitEffect)
        });
      });
      var ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{wch:5},{wch:14},{wch:25},{wch:14},{wch:16},{wch:18},{wch:14},{wch:16},{wch:20},{wch:16},{wch:20}];
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '계산결과');
      var filename = '계산결과_' + (mnMachine || 'machine') + '_' + document.getElementById('analysisYear').value + document.getElementById('analysisMonth').value.padStart(2,'0') + '.xlsx';
      XLSX.writeFile(wb, filename);
    }

    // ====== 통합 시뮬레이션 (Unified Simulation) ======
    var usimData = null; // 기준 데이터 { current, alternatives, master_raw, master_sub }
    var usimPrevProd = 0; // 전월 생산량 (톤)
    var usimMatChanges = []; // 적용할 자재 변경 목록
    var usimGradeMix = {}; // 지종별 비율
    var usimCurrentModalType = ''; // 현재 모달 타입

    function onUsimRatioSlide(val) {
      document.getElementById('usim-ratio-val').textContent = val + '%';
    }

    async function loadUnifiedSim() {
      var machine = document.getElementById('usim-machine').value;
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;

      try {
        var res = await fetch('/api/simulation/materials-for-mix?ym=' + ym + '&machine=' + machine);
        usimData = await res.json();

        // 전월 생산량 계산
        var prodRes = await fetch('/api/simulation/profit-base?ym=' + ym + '&machine=' + machine);
        var prodData = await prodRes.json();
        usimPrevProd = 0;
        if (prodData.rows) {
          prodData.rows.forEach(function(r) {
            if (r.machine_code === machine) usimPrevProd += (r.cur_production_ton || 0);
          });
        }

        // Step 1: 생산량 표시
        document.getElementById('usim-prev-prod').textContent = Math.round(usimPrevProd).toLocaleString() + ' 톤';
        document.getElementById('usim-prod-ton').value = Math.round(usimPrevProd).toLocaleString();

        // Step 2: 지종 믹스 로드
        usimGradeMix = {};
        if (prodData.rows) {
          prodData.rows.filter(function(r) { return r.machine_code === machine; }).forEach(function(r) {
            usimGradeMix[r.product_level2_name] = r.cur_production_ton || 0;
          });
        }
        renderUsimGradeMix();

        // 결과 초기화
        document.getElementById('usim-result-area').classList.add('hidden');
        usimMatChanges = [];
        renderUsimMatChanges();

      } catch(e) {
        console.error('Unified sim load error:', e);
      }
    }

    function renderUsimGradeMix() {
      var container = document.getElementById('usim-grade-mix');
      if (!container) return;
      var total = 0;
      Object.values(usimGradeMix).forEach(function(v) { total += v; });

      var html = '';
      Object.keys(usimGradeMix).sort().forEach(function(g) {
        var pct = total > 0 ? (usimGradeMix[g] / total * 100) : 0;
        html += '<div class="flex items-center gap-2">';
        html += '<span class="text-[11px] text-gray-600 w-16 truncate" title="' + g + '">' + g + '</span>';
        html += '<input type="number" data-grade="' + g + '" class="usim-grade-input flex-1 text-[11px] border border-slate-200 rounded px-1.5 py-1 text-right font-mono w-16" value="' + Math.round(usimGradeMix[g]) + '" oninput="onUsimGradeChange(this)" step="100">';
        html += '<span class="text-[10px] text-gray-400 w-8">톤</span>';
        html += '<span class="text-[10px] text-gray-400 w-10 text-right">' + pct.toFixed(1) + '%</span>';
        html += '</div>';
      });
      container.innerHTML = html;
      updateUsimGradeTotal();
    }

    function onUsimGradeChange(el) {
      var grade = el.getAttribute('data-grade');
      usimGradeMix[grade] = Number(el.value) || 0;
      updateUsimGradeTotal();
    }

    function updateUsimGradeTotal() {
      var total = 0;
      Object.values(usimGradeMix).forEach(function(v) { total += v; });
      var el = document.getElementById('usim-grade-total');
      if (el) el.textContent = Math.round(total).toLocaleString() + ' 톤';
      // 생산량도 연동
      var prodEl = document.getElementById('usim-prod-ton');
      if (prodEl) prodEl.value = Math.round(total).toLocaleString();
      onUsimProdChange();
    }

    function onUsimProdChange() {
      var val = parseComma(document.getElementById('usim-prod-ton').value);
      var pctEl = document.getElementById('usim-prod-pct');
      if (usimPrevProd > 0 && val > 0) {
        var pct = ((val - usimPrevProd) / usimPrevProd * 100);
        var color = pct > 0 ? 'text-emerald-600' : pct < 0 ? 'text-red-600' : 'text-gray-500';
        pctEl.className = 'text-[11px] font-semibold ' + color;
        pctEl.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
      } else {
        pctEl.textContent = '-';
      }
    }

    function openMatChangeModal(type) {
      usimCurrentModalType = type;
      var modal = document.getElementById('usim-mat-modal');
      var title = document.getElementById('usim-modal-title');
      var body = document.getElementById('usim-modal-body');
      modal.classList.remove('hidden');

      if (type === 'replace') {
        title.innerHTML = '<i class="fas fa-exchange-alt text-orange-500 mr-2"></i>자재 대체 (기존 → 새 자재)';
        body.innerHTML = renderReplaceForm();
      } else if (type === 'ratio') {
        title.innerHTML = '<i class="fas fa-percentage text-blue-500 mr-2"></i>자재 비율 변경';
        body.innerHTML = renderRatioForm();
      } else if (type === 'add') {
        title.innerHTML = '<i class="fas fa-plus text-green-500 mr-2"></i>신규 자재 추가';
        body.innerHTML = renderAddForm();
      }
    }

    function closeMatChangeModal() {
      document.getElementById('usim-mat-modal').classList.add('hidden');
    }

    function renderReplaceForm() {
      var options = '';
      if (usimData && usimData.current) {
        usimData.current.forEach(function(m) {
          options += '<option value="' + m.material_code + '" data-name="' + m.material_name + '" data-price="' + Math.round(m.unit_price) + '">' + m.material_name + ' (' + Math.round(m.unit_price) + '원/kg)</option>';
        });
      }
      var altOptions = '<option value="">-- 직접 입력 --</option>';
      if (usimData && usimData.alternatives) {
        usimData.alternatives.forEach(function(m) {
          altOptions += '<option value="' + m.material_code + '" data-name="' + m.material_name + '" data-price="' + Math.round(m.unit_price) + '">' + m.material_name + ' (' + Math.round(m.unit_price) + '원/kg)</option>';
        });
      }
      if (usimData && usimData.master_raw) {
        usimData.master_raw.forEach(function(m) {
          altOptions += '<option value="' + m.material_code + '" data-name="' + m.material_name + '" data-price="0">[마스터] ' + m.material_name + '</option>';
        });
      }

      return '<div class="space-y-4">' +
        '<div><label class="text-xs font-semibold text-gray-600 block mb-1">대체 대상 (기존 자재)</label>' +
        '<select id="usim-rep-source" class="w-full text-xs border border-slate-200 rounded-lg px-3 py-2" onchange="onRepSourceChange()">' + options + '</select></div>' +
        '<div class="text-center"><i class="fas fa-arrow-down text-orange-400 text-lg"></i></div>' +
        '<div><label class="text-xs font-semibold text-gray-600 block mb-1">대체 자재 (선택 또는 직접입력)</label>' +
        '<select id="usim-rep-target-sel" class="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 mb-2" onchange="onRepTargetSelect()">' + altOptions + '</select>' +
        '<div class="grid grid-cols-2 gap-2">' +
        '<div><label class="text-[10px] text-gray-500">자재코드</label><input id="usim-rep-target-code" class="w-full text-xs border rounded px-2 py-1.5" placeholder="코드"></div>' +
        '<div><label class="text-[10px] text-gray-500">자재명</label><input id="usim-rep-target-name" class="w-full text-xs border rounded px-2 py-1.5" placeholder="자재명"></div>' +
        '</div>' +
        '<div class="mt-2"><label class="text-[10px] text-gray-500">대체 자재 단가 (원/kg)</label><input id="usim-rep-target-price" type="number" class="w-full text-xs border rounded px-2 py-1.5 font-mono" placeholder="단가"></div>' +
        '</div></div>';
    }

    function renderRatioForm() {
      var options = '';
      if (usimData && usimData.current) {
        usimData.current.forEach(function(m) {
          options += '<option value="' + m.material_code + '" data-name="' + m.material_name + '" data-price="' + Math.round(m.unit_price) + '" data-qty="' + Math.round(m.usage_qty) + '">' + m.material_name + ' (현재 ' + Math.round(m.usage_qty).toLocaleString() + 'kg)</option>';
        });
      }
      var altOptions = '<option value="">-- 없음 (단순 축소) --</option>';
      if (usimData && usimData.current) {
        usimData.current.forEach(function(m) {
          altOptions += '<option value="' + m.material_code + '" data-name="' + m.material_name + '" data-price="' + Math.round(m.unit_price) + '">' + m.material_name + '</option>';
        });
      }
      if (usimData && usimData.alternatives) {
        usimData.alternatives.forEach(function(m) {
          altOptions += '<option value="' + m.material_code + '" data-name="' + m.material_name + '" data-price="' + Math.round(m.unit_price) + '">[타호기] ' + m.material_name + '</option>';
        });
      }

      return '<div class="space-y-4">' +
        '<div><label class="text-xs font-semibold text-gray-600 block mb-1">비율 변경 대상</label>' +
        '<select id="usim-ratio-source" class="w-full text-xs border border-slate-200 rounded-lg px-3 py-2">' + options + '</select></div>' +
        '<div><label class="text-xs font-semibold text-gray-600 block mb-1">유지 비율 (%)</label>' +
        '<div class="flex items-center gap-2"><input id="usim-ratio-pct" type="range" min="10" max="100" value="70" class="flex-1 h-2 accent-blue-500" oninput="onUsimRatioSlide(this.value)">' +
        '<span id="usim-ratio-val" class="text-xs font-bold text-blue-600 w-10">70%</span></div>' +
        '<p class="text-[10px] text-gray-400 mt-1">예: 70% = 현재 사용량의 70%만 유지, 나머지 30%를 아래 자재로 이동</p></div>' +
        '<div><label class="text-xs font-semibold text-gray-600 block mb-1">나머지 물량 배분 대상</label>' +
        '<select id="usim-ratio-target" class="w-full text-xs border border-slate-200 rounded-lg px-3 py-2">' + altOptions + '</select>' +
        '<div class="mt-2"><label class="text-[10px] text-gray-500">배분 대상 단가 (원/kg, 신규 시)</label><input id="usim-ratio-target-price" type="number" class="w-full text-xs border rounded px-2 py-1.5 font-mono" placeholder="기존 단가 자동 적용"></div>' +
        '</div></div>';
    }

    function renderAddForm() {
      var altOptions = '<option value="">-- 직접 입력 --</option>';
      if (usimData && usimData.master_raw) {
        usimData.master_raw.forEach(function(m) {
          altOptions += '<option value="' + m.material_code + '" data-name="' + m.material_name + '">[마스터 원재료] ' + m.material_name + '</option>';
        });
      }
      if (usimData && usimData.master_sub) {
        usimData.master_sub.forEach(function(m) {
          altOptions += '<option value="' + m.material_code + '" data-name="' + m.material_name + '">[마스터 부재료] ' + m.material_name + '</option>';
        });
      }
      if (usimData && usimData.alternatives) {
        usimData.alternatives.forEach(function(m) {
          altOptions += '<option value="' + m.material_code + '" data-name="' + m.material_name + '" data-price="' + Math.round(m.unit_price) + '">[타호기] ' + m.material_name + ' (' + Math.round(m.unit_price) + '원)</option>';
        });
      }

      return '<div class="space-y-4">' +
        '<div><label class="text-xs font-semibold text-gray-600 block mb-1">추가할 자재 선택</label>' +
        '<select id="usim-add-sel" class="w-full text-xs border border-slate-200 rounded-lg px-3 py-2" onchange="onAddSelect()">' + altOptions + '</select></div>' +
        '<div class="grid grid-cols-2 gap-2">' +
        '<div><label class="text-[10px] text-gray-500">자재코드</label><input id="usim-add-code" class="w-full text-xs border rounded px-2 py-1.5" placeholder="코드"></div>' +
        '<div><label class="text-[10px] text-gray-500">자재명</label><input id="usim-add-name" class="w-full text-xs border rounded px-2 py-1.5" placeholder="자재명"></div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
        '<div><label class="text-[10px] text-gray-500">사용량 (kg)</label><input id="usim-add-qty" type="number" class="w-full text-xs border rounded px-2 py-1.5 font-mono" placeholder="kg"></div>' +
        '<div><label class="text-[10px] text-gray-500">단가 (원/kg)</label><input id="usim-add-price" type="number" class="w-full text-xs border rounded px-2 py-1.5 font-mono" placeholder="단가"></div>' +
        '</div>' +
        '<div><label class="text-[10px] text-gray-500">자재그룹</label><input id="usim-add-group" class="w-full text-xs border rounded px-2 py-1.5" placeholder="그룹명 (선택)"></div>' +
        '</div>';
    }

    function onRepSourceChange() { /* placeholder */ }
    function onRepTargetSelect() {
      var sel = document.getElementById('usim-rep-target-sel');
      var opt = sel.options[sel.selectedIndex];
      if (opt.value) {
        document.getElementById('usim-rep-target-code').value = opt.value;
        document.getElementById('usim-rep-target-name').value = opt.getAttribute('data-name') || '';
        document.getElementById('usim-rep-target-price').value = opt.getAttribute('data-price') || '';
      }
    }
    function onAddSelect() {
      var sel = document.getElementById('usim-add-sel');
      var opt = sel.options[sel.selectedIndex];
      if (opt.value) {
        document.getElementById('usim-add-code').value = opt.value;
        document.getElementById('usim-add-name').value = opt.getAttribute('data-name') || '';
        var p = opt.getAttribute('data-price');
        if (p && p !== '0') document.getElementById('usim-add-price').value = p;
      }
    }

    function applyMatChange() {
      if (usimCurrentModalType === 'replace') {
        var srcSel = document.getElementById('usim-rep-source');
        var srcCode = srcSel.value;
        var srcName = srcSel.options[srcSel.selectedIndex].getAttribute('data-name');
        var tgtCode = document.getElementById('usim-rep-target-code').value;
        var tgtName = document.getElementById('usim-rep-target-name').value;
        var tgtPrice = Number(document.getElementById('usim-rep-target-price').value) || 0;
        if (!tgtName) { alert('대체 자재명을 입력하세요'); return; }
        usimMatChanges.push({ type: 'replace', source_code: srcCode, source_name: srcName, target_code: tgtCode, target_name: tgtName, target_price: tgtPrice });
      } else if (usimCurrentModalType === 'ratio') {
        var srcSel = document.getElementById('usim-ratio-source');
        var srcCode = srcSel.value;
        var srcName = srcSel.options[srcSel.selectedIndex].getAttribute('data-name');
        var ratio = Number(document.getElementById('usim-ratio-pct').value) || 100;
        var tgtSel = document.getElementById('usim-ratio-target');
        var tgtCode = tgtSel.value;
        var tgtName = tgtSel.value ? tgtSel.options[tgtSel.selectedIndex].getAttribute('data-name') : '';
        var tgtPrice = Number(document.getElementById('usim-ratio-target-price').value) || 0;
        usimMatChanges.push({ type: 'ratio', source_code: srcCode, source_name: srcName, ratio: ratio, target_code: tgtCode, target_name: tgtName, target_price: tgtPrice });
      } else if (usimCurrentModalType === 'add') {
        var tgtCode = document.getElementById('usim-add-code').value;
        var tgtName = document.getElementById('usim-add-name').value;
        var qty = Number(document.getElementById('usim-add-qty').value) || 0;
        var price = Number(document.getElementById('usim-add-price').value) || 0;
        var group = document.getElementById('usim-add-group').value;
        if (!tgtName || !qty) { alert('자재명과 사용량을 입력하세요'); return; }
        usimMatChanges.push({ type: 'add', target_code: tgtCode, target_name: tgtName, qty_kg: qty, target_price: price, target_group: group });
      }
      renderUsimMatChanges();
      closeMatChangeModal();
    }

    function renderUsimMatChanges() {
      var container = document.getElementById('usim-mat-changes');
      if (!usimMatChanges.length) {
        container.innerHTML = '<div class="text-[10px] text-gray-400 italic">아래 버튼으로 변경사항을 추가하세요</div>';
        return;
      }
      var html = '';
      usimMatChanges.forEach(function(ch, idx) {
        var label = '';
        var icon = '';
        var bgColor = '';
        if (ch.type === 'replace') {
          icon = 'fa-exchange-alt'; bgColor = 'bg-orange-50 border-orange-200 text-orange-700';
          label = ch.source_name + ' → ' + ch.target_name;
        } else if (ch.type === 'ratio') {
          icon = 'fa-percentage'; bgColor = 'bg-blue-50 border-blue-200 text-blue-700';
          label = ch.source_name + ' ' + ch.ratio + '% 유지';
          if (ch.target_name) label += ' → ' + ch.target_name;
        } else if (ch.type === 'add') {
          icon = 'fa-plus'; bgColor = 'bg-green-50 border-green-200 text-green-700';
          label = ch.target_name + ' ' + (ch.qty_kg || 0).toLocaleString() + 'kg 추가';
        }
        html += '<div class="flex items-center justify-between px-2 py-1 rounded border text-[10px] ' + bgColor + '">';
        html += '<span><i class="fas ' + icon + ' mr-1"></i>' + label + '</span>';
        html += '<button onclick="removeMatChange(' + idx + ')" class="text-red-400 hover:text-red-600 ml-2"><i class="fas fa-times"></i></button>';
        html += '</div>';
      });
      container.innerHTML = html;
    }

    function removeMatChange(idx) {
      usimMatChanges.splice(idx, 1);
      renderUsimMatChanges();
    }

    function resetUnifiedSim() {
      usimMatChanges = [];
      renderUsimMatChanges();
      document.getElementById('usim-result-area').classList.add('hidden');
      if (usimPrevProd > 0) {
        document.getElementById('usim-prod-ton').value = Math.round(usimPrevProd).toLocaleString();
      }
      // 지종 믹스 초기화 (재로드)
      loadUnifiedSim();
    }

    async function runUnifiedSim() {
      var machine = document.getElementById('usim-machine').value;
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;
      var prodTon = parseComma(document.getElementById('usim-prod-ton').value);

      try {
        var res = await fetch('/api/simulation/material-mix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ym: ym,
            machine: machine,
            production_ton: prodTon,
            changes: usimMatChanges
          })
        });
        var result = await res.json();
        renderUsimResult(result);
      } catch(e) {
        console.error('Unified sim run error:', e);
        alert('시뮬레이션 실행 중 오류가 발생했습니다.');
      }
    }

    function renderUsimResult(result) {
      var area = document.getElementById('usim-result-area');
      area.classList.remove('hidden');

      var s = result.summary;

      // 요약 카드
      document.getElementById('usim-r-base-uc').textContent = s.base_unit_cost_1000won.toLocaleString();
      document.getElementById('usim-r-sim-uc').textContent = s.sim_unit_cost_1000won.toLocaleString();

      var diffEl = document.getElementById('usim-r-uc-diff');
      var diffVal = s.unit_cost_diff;
      diffEl.textContent = (diffVal >= 0 ? '+' : '') + diffVal.toLocaleString();
      diffEl.className = 'text-lg font-bold mt-1 ' + (diffVal > 0 ? 'text-red-600' : diffVal < 0 ? 'text-emerald-600' : 'text-gray-500');

      var savEl = document.getElementById('usim-r-savings');
      var savVal = s.savings_million;
      savEl.textContent = (savVal >= 0 ? '+' : '') + savVal.toLocaleString();
      savEl.className = 'text-lg font-bold mt-1 ' + (savVal > 0 ? 'text-emerald-600' : savVal < 0 ? 'text-red-600' : 'text-gray-500');

      // 변경사항 요약
      var changesDiv = document.getElementById('usim-changes-summary');
      if (result.changes && result.changes.length) {
        var cHtml = '';
        result.changes.forEach(function(ch) {
          var color = ch.cost_diff > 0 ? 'text-red-600' : 'text-emerald-600';
          var diffStr = ch.cost_diff !== undefined ? ((ch.cost_diff >= 0 ? '+' : '') + Math.round(ch.cost_diff / 1000000).toLocaleString() + ' 백만원') : '';
          cHtml += '<div class="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-slate-50">';
          cHtml += '<span class="text-gray-600"><i class="fas fa-check text-indigo-400 mr-1.5"></i>' + ch.note + '</span>';
          cHtml += '<span class="font-semibold ' + color + '">' + diffStr + '</span>';
          cHtml += '</div>';
        });
        changesDiv.innerHTML = cHtml;
        document.getElementById('usim-changes-summary-card').classList.remove('hidden');
      } else {
        document.getElementById('usim-changes-summary-card').classList.add('hidden');
      }

      // 상세 테이블
      var tbody = document.getElementById('usim-detail-body');
      var tfoot = document.getElementById('usim-detail-foot');
      var html = '';
      var totBase = 0, totSim = 0, totDiff = 0;

      result.details.forEach(function(d) {
        var diffColor = d.cost_diff > 0 ? 'text-red-600' : d.cost_diff < 0 ? 'text-emerald-600' : 'text-gray-400';
        var status = d.is_new ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">신규</span>' :
                    d.is_removed ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">제거</span>' :
                    d.cost_diff !== 0 ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">변경</span>' :
                    '<span class="text-[9px] text-gray-300">-</span>';

        html += '<tr class="border-b border-slate-50 hover:bg-slate-50/50">';
        html += '<td class="px-2 py-1.5 text-left text-[11px] text-gray-700 font-medium">' + d.material_name + '</td>';
        html += '<td class="px-2 py-1.5 text-left text-[10px] text-gray-400">' + (d.material_group_name || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono text-gray-600">' + (d.base_usage_qty > 0 ? Math.round(d.base_usage_qty).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono text-gray-600">' + (d.base_unit_price > 0 ? Math.round(d.base_unit_price).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono text-gray-600">' + (d.base_cost > 0 ? Math.round(d.base_cost / 1000000).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono text-indigo-600">' + (d.sim_usage_qty > 0 ? Math.round(d.sim_usage_qty).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono text-indigo-600">' + (d.sim_unit_price > 0 ? Math.round(d.sim_unit_price).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono text-indigo-600">' + (d.sim_cost > 0 ? Math.round(d.sim_cost / 1000000).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono font-semibold ' + diffColor + '">' + (d.cost_diff !== 0 ? (d.cost_diff > 0 ? '+' : '') + Math.round(d.cost_diff / 1000000).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-center">' + status + '</td>';
        html += '</tr>';

        totBase += d.base_cost || 0;
        totSim += d.sim_cost || 0;
        totDiff += d.cost_diff || 0;
      });
      tbody.innerHTML = html;

      var footColor = totDiff > 0 ? 'text-red-600' : totDiff < 0 ? 'text-emerald-600' : 'text-gray-500';
      tfoot.innerHTML = '<tr class="border-t-2 border-slate-200"><td colspan="4" class="px-2 py-2 font-semibold text-gray-700">합계</td>' +
        '<td class="px-2 py-2 text-right font-mono font-bold text-gray-700">' + Math.round(totBase / 1000000).toLocaleString() + '</td>' +
        '<td colspan="2"></td>' +
        '<td class="px-2 py-2 text-right font-mono font-bold text-indigo-600">' + Math.round(totSim / 1000000).toLocaleString() + '</td>' +
        '<td class="px-2 py-2 text-right font-mono font-bold ' + footColor + '">' + (totDiff >= 0 ? '+' : '') + Math.round(totDiff / 1000000).toLocaleString() + '</td>' +
        '<td></td></tr>';
    }

    function downloadUsimExcel() {
      // 간단한 CSV 다운로드
      var rows = document.querySelectorAll('#usim-detail-body tr');
      if (!rows.length) return;
      var csv = '자재명,그룹,전월사용량(kg),전월단가(원/kg),전월비용(백만원),시뮬사용량(kg),시뮬단가(원/kg),시뮬비용(백만원),차이(백만원),상태' + String.fromCharCode(10);
      rows.forEach(function(tr) {
        var cells = tr.querySelectorAll('td');
        var row = [];
        cells.forEach(function(td) { row.push(td.textContent.replace(/,/g, '').trim()); });
        csv += row.join(',') + String.fromCharCode(10);
      });
      var blob = new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = '통합시뮬레이션_결과.csv'; a.click();
      URL.revokeObjectURL(url);
    }

    // ====== 시뮬레이션 플로우 (레거시 - 유지) ======
    var sfData = null; // 시뮬레이션 기준 데이터
    var sfProdChange = 0; // 생산량 변동 %

    async function initSimFlow() {
      var machine = document.getElementById('sf-machine').value;
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;

      try {
        var res = await fetch('/api/simulation/profit-base?ym=' + ym + '&machine=' + machine);
        var result = await res.json();
        sfData = result;
        renderSimFlow();
      } catch(e) {
        console.error('SimFlow load error:', e);
      }
    }

    function onSimFlowSliderChange() {
      var slider = document.getElementById('sf-prod-slider');
      sfProdChange = Number(slider.value);
      document.getElementById('sf-prod-pct').textContent = (sfProdChange >= 0 ? '+' : '') + sfProdChange + '%';
      renderSimFlow();
    }

    function resetSimFlow() {
      document.getElementById('sf-prod-slider').value = 0;
      sfProdChange = 0;
      document.getElementById('sf-prod-pct').textContent = '0%';
      renderSimFlow();
    }

    function renderSimFlow() {
      if (!sfData || !sfData.rows || !sfData.rows.length) {
        document.getElementById('sf-nodes').innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-sm pointer-events-auto">데이터를 불러오는 중...</div>';
        return;
      }

      var machine = document.getElementById('sf-machine').value;
      var rows = sfData.rows.filter(function(r) { return r.machine_code === machine; });
      if (!rows.length) {
        document.getElementById('sf-nodes').innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-sm pointer-events-auto">선택된 호기의 데이터가 없습니다.</div>';
        return;
      }

      // 기준값 계산
      var baseProdTon = 0;
      rows.forEach(function(r) { baseProdTon += (Number(r.cur_production_ton) || 0); });

      var baseCost = 0;
      rows.forEach(function(r) { baseCost += (Number(r.cur_material_cost) || 0); });

      var baseUnitCost = baseProdTon > 0 ? baseCost / baseProdTon : 0;

      // 변동 후 값
      var newProdTon = baseProdTon * (1 + sfProdChange / 100);
      // 비용은 변동비(재료비) 부분은 생산량에 비례, 고정비 부분은 불변 가정
      // 간이 모델: 재료비의 70%는 변동비, 30%는 고정비로 가정
      var variableRatio = 0.7;
      var fixedCost = baseCost * (1 - variableRatio);
      var variableCost = baseCost * variableRatio * (1 + sfProdChange / 100);
      var newCost = fixedCost + variableCost;
      var newUnitCost = newProdTon > 0 ? newCost / newProdTon : 0;

      // 주요 지종별 원단위 변화
      var groupMap = {};
      rows.forEach(function(r) {
        var g = r.product_level2_name || '기타';
        if (!groupMap[g]) groupMap[g] = { cost: 0, prod: 0 };
        groupMap[g].cost += Number(r.cur_material_cost) || 0;
        groupMap[g].prod += Number(r.cur_production_ton) || 0;
      });

      var groups = Object.keys(groupMap);
      var topGroups = groups.slice(0, 6);

      // 손익 효과
      var profitEffect = (baseUnitCost - newUnitCost) * newProdTon;
      var profitEffectMil = profitEffect / 1000000;

      // 색상 결정
      var pctColor = sfProdChange > 0 ? '#059669' : sfProdChange < 0 ? '#dc2626' : '#6366f1';
      var unitDiff = newUnitCost - baseUnitCost;
      var unitColor = unitDiff < 0 ? '#059669' : unitDiff > 0 ? '#dc2626' : '#6b7280';
      var profitColor = profitEffect > 0 ? '#059669' : profitEffect < 0 ? '#dc2626' : '#6b7280';

      // 노드 렌더링
      var nodesHtml = '';
      var svgHtml = '';

      // 정의: 노드 위치
      var nodes = [
        { id: 'prod', x: 80, y: 60, w: 260, h: 120, title: '생산량', icon: 'fa-industry', color: '#6366f1' },
        { id: 'cost', x: 540, y: 60, w: 260, h: 120, title: '총 재료비', icon: 'fa-coins', color: '#f59e0b' },
        { id: 'unit', x: 1000, y: 60, w: 260, h: 120, title: '원단위 (원/톤)', icon: 'fa-balance-scale', color: '#8b5cf6' },
        { id: 'profit', x: 1000, y: 320, w: 260, h: 120, title: '예상 손익 효과', icon: 'fa-chart-line', color: '#059669' },
        { id: 'variable', x: 320, y: 320, w: 220, h: 100, title: '변동비 (70%)', icon: 'fa-arrows-alt-v', color: '#3b82f6' },
        { id: 'fixed', x: 320, y: 480, w: 220, h: 100, title: '고정비 (30%)', icon: 'fa-lock', color: '#6b7280' }
      ];

      // 그룹 노드 추가
      topGroups.forEach(function(g, i) {
        var y = 500 + i * 60;
        nodes.push({ id: 'grp-' + i, x: 700, y: 250 + i * 75, w: 200, h: 55, title: g, icon: 'fa-cube', color: '#64748b' });
      });

      // 엣지 정의
      var edges = [
        { from: 'prod', to: 'cost', fromSide: 'right', toSide: 'left', label: '생산량 증가 → 변동비 증가' },
        { from: 'cost', to: 'unit', fromSide: 'right', toSide: 'left', label: '비용 ÷ 생산량' },
        { from: 'prod', to: 'variable', fromSide: 'bottom', toSide: 'left', label: '비례' },
        { from: 'variable', to: 'cost', fromSide: 'top', toSide: 'bottom', label: '' },
        { from: 'fixed', to: 'cost', fromSide: 'top', toSide: 'bottom', label: '' },
        { from: 'unit', to: 'profit', fromSide: 'bottom', toSide: 'top', label: '원단위 절감 → 손익 개선' }
      ];

      // SVG 엣지 렌더
      svgHtml += '<defs>';
      svgHtml += '<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8"/></marker>';
      svgHtml += '<marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#059669"/></marker>';
      svgHtml += '<marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626"/></marker>';
      svgHtml += '</defs>';

      edges.forEach(function(edge) {
        var fromNode = nodes.find(function(n) { return n.id === edge.from; });
        var toNode = nodes.find(function(n) { return n.id === edge.to; });
        if (!fromNode || !toNode) return;

        var x1, y1, x2, y2;
        if (edge.fromSide === 'right') { x1 = fromNode.x + fromNode.w; y1 = fromNode.y + fromNode.h / 2; }
        else if (edge.fromSide === 'bottom') { x1 = fromNode.x + fromNode.w / 2; y1 = fromNode.y + fromNode.h; }
        else { x1 = fromNode.x + fromNode.w / 2; y1 = fromNode.y + fromNode.h; }

        if (edge.toSide === 'left') { x2 = toNode.x; y2 = toNode.y + toNode.h / 2; }
        else if (edge.toSide === 'top') { x2 = toNode.x + toNode.w / 2; y2 = toNode.y; }
        else { x2 = toNode.x; y2 = toNode.y + toNode.h / 2; }

        // 베지어 커브
        var midX = (x1 + x2) / 2;
        var midY = (y1 + y2) / 2;
        var cx1 = edge.fromSide === 'right' || edge.fromSide === 'left' ? midX : x1;
        var cy1 = edge.fromSide === 'bottom' || edge.fromSide === 'top' ? midY : y1;
        var cx2 = edge.toSide === 'right' || edge.toSide === 'left' ? midX : x2;
        var cy2 = edge.toSide === 'bottom' || edge.toSide === 'top' ? midY : y2;

        var markerEnd = sfProdChange > 0 ? 'url(#arrow-green)' : sfProdChange < 0 ? 'url(#arrow-red)' : 'url(#arrow)';
        var strokeColor = sfProdChange !== 0 ? (sfProdChange > 0 ? '#059669' : '#dc2626') : '#94a3b8';
        var strokeWidth = sfProdChange !== 0 ? '2.5' : '1.5';
        var animated = sfProdChange !== 0 ? ' stroke-dasharray="8,4" class="sf-edge-animated"' : '';

        svgHtml += '<path d="M' + x1 + ',' + y1 + ' C' + cx1 + ',' + cy1 + ' ' + cx2 + ',' + cy2 + ' ' + x2 + ',' + y2 + '" fill="none" stroke="' + strokeColor + '" stroke-width="' + strokeWidth + '" marker-end="' + markerEnd + '"' + animated + '/>';

        // 엣지 라벨
        if (edge.label && sfProdChange !== 0) {
          svgHtml += '<text x="' + midX + '" y="' + (midY - 8) + '" text-anchor="middle" font-size="10" fill="' + strokeColor + '" font-weight="500">' + edge.label + '</text>';
        }
      });

      // 그룹 연결선
      topGroups.forEach(function(g, i) {
        var grpNode = nodes.find(function(n) { return n.id === 'grp-' + i; });
        var unitNode = nodes.find(function(n) { return n.id === 'unit'; });
        if (grpNode && unitNode) {
          var x1 = grpNode.x + grpNode.w;
          var y1 = grpNode.y + grpNode.h / 2;
          var x2 = unitNode.x;
          var y2 = unitNode.y + unitNode.h;
          svgHtml += '<path d="M' + x1 + ',' + y1 + ' C' + (x1+40) + ',' + y1 + ' ' + (x2-40) + ',' + y2 + ' ' + x2 + ',' + y2 + '" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,3"/>';
        }
      });

      document.getElementById('sf-svg').innerHTML = svgHtml;

      // 노드 HTML
      nodesHtml += renderFlowNode(nodes[0], sfFmtTon(baseProdTon), sfFmtTon(newProdTon), sfProdChange !== 0 ? ((sfProdChange > 0 ? '+' : '') + sfProdChange + '%') : null, pctColor);
      nodesHtml += renderFlowNode(nodes[1], sfFmtBil(baseCost), sfFmtBil(newCost), sfProdChange !== 0 ? ((newCost - baseCost > 0 ? '+' : '') + sfFmtBil(newCost - baseCost)) : null, newCost > baseCost ? '#dc2626' : '#059669');
      nodesHtml += renderFlowNode(nodes[2], sfFmtUnit(baseUnitCost), sfFmtUnit(newUnitCost), sfProdChange !== 0 ? ((unitDiff > 0 ? '+' : '') + sfFmtUnit(unitDiff)) : null, unitColor);
      nodesHtml += renderFlowNode(nodes[3], '-', sfProdChange !== 0 ? ((profitEffectMil >= 0 ? '+' : '') + Math.round(profitEffectMil).toLocaleString() + ' 백만원') : '-', sfProdChange !== 0 ? (profitEffect >= 0 ? '개선' : '악화') : null, profitColor);
      nodesHtml += renderFlowNode(nodes[4], sfFmtBil(baseCost * variableRatio), sfFmtBil(variableCost), sfProdChange !== 0 ? ((variableCost - baseCost * variableRatio > 0 ? '+' : '') + sfFmtBil(variableCost - baseCost * variableRatio)) : null, '#3b82f6');
      nodesHtml += renderFlowNode(nodes[5], sfFmtBil(fixedCost), sfFmtBil(fixedCost), '불변', '#6b7280');

      // 그룹별 노드
      topGroups.forEach(function(g, i) {
        var grpNode = nodes.find(function(n) { return n.id === 'grp-' + i; });
        var gData = groupMap[g];
        var gProdTon = gData.prod;
        var gUnit = gProdTon > 0 ? gData.cost / gProdTon : 0;
        var gNewProd = gProdTon * (1 + sfProdChange / 100);
        var gNewUnit = gNewProd > 0 ? (gData.cost * variableRatio * (1 + sfProdChange / 100) + gData.cost * (1 - variableRatio)) / gNewProd : 0;
        nodesHtml += renderFlowNodeSmall(grpNode, g, sfFmtUnit(gUnit), sfProdChange !== 0 ? sfFmtUnit(gNewUnit) : null);
      });

      document.getElementById('sf-nodes').innerHTML = nodesHtml;
    }

    function renderFlowNode(node, baseVal, newVal, changeLabel, changeColor) {
      var borderColor = node.color || '#6366f1';
      var html = '';
      html += '<div class="absolute pointer-events-auto" style="left:' + node.x + 'px;top:' + node.y + 'px;width:' + node.w + 'px;">';
      html += '<div class="bg-white rounded-xl shadow-lg border-2 p-4 transition-all hover:shadow-xl" style="border-color:' + borderColor + ';">';
      html += '<div class="flex items-center gap-2 mb-2">';
      html += '<div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:' + borderColor + '20;"><i class="fas ' + node.icon + ' text-xs" style="color:' + borderColor + ';"></i></div>';
      html += '<span class="text-xs font-semibold text-gray-700">' + node.title + '</span>';
      html += '</div>';
      html += '<div class="flex items-end justify-between">';
      html += '<div>';
      html += '<div class="text-[10px] text-gray-400">기준</div>';
      html += '<div class="text-sm font-bold text-gray-700">' + baseVal + '</div>';
      html += '</div>';
      if (sfProdChange !== 0) {
        html += '<div class="text-right">';
        html += '<div class="text-[10px] text-gray-400">변동 후</div>';
        html += '<div class="text-sm font-bold" style="color:' + (changeColor || '#6366f1') + ';">' + newVal + '</div>';
        if (changeLabel) html += '<div class="text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded" style="background:' + (changeColor || '#6366f1') + '15;color:' + (changeColor || '#6366f1') + ';">' + changeLabel + '</div>';
        html += '</div>';
      }
      html += '</div>';
      html += '</div></div>';
      return html;
    }

    function renderFlowNodeSmall(node, title, baseVal, newVal) {
      var html = '';
      html += '<div class="absolute pointer-events-auto" style="left:' + node.x + 'px;top:' + node.y + 'px;width:' + node.w + 'px;">';
      html += '<div class="bg-white rounded-lg shadow-sm border border-slate-200 px-3 py-2 hover:shadow-md transition-all">';
      html += '<div class="flex items-center justify-between">';
      html += '<span class="text-[10px] font-medium text-gray-600 truncate max-w-[80px]">' + title + '</span>';
      html += '<div class="text-right">';
      html += '<span class="text-[10px] font-mono text-gray-500">' + baseVal + '</span>';
      if (newVal) html += '<span class="text-[10px] font-mono text-indigo-600 ml-1">→ ' + newVal + '</span>';
      html += '</div></div></div></div>';
      return html;
    }

    function sfFmtTon(v) { return Math.round(v).toLocaleString() + ' 톤'; }
    function sfFmtBil(v) { return (v / 100000000).toFixed(1) + ' 억원'; }
    function sfFmtUnit(v) { return Math.round(v).toLocaleString() + ' 원/톤'; }

    // 엣지 애니메이션 CSS 추가
    (function() {
      var style = document.createElement('style');
      style.textContent = '@keyframes sf-dash { to { stroke-dashoffset: -24; } } .sf-edge-animated { animation: sf-dash 1s linear infinite; }';
      document.head.appendChild(style);
    })();

    // ====== 엑셀 업로드 / 미리보기 / 히스토리 ======
    var mnPreviewData = null; // 엑셀 파싱 결과 임시 저장

    function downloadManualTemplate() {
      // 부서별 다른 양식 컬럼 생성
      var rows = [];
      if (mnMaterials && mnMaterials.length) {
        mnMaterials.forEach(function(m) {
          var row = {
            '자재코드': m.code || '',
            '자재명': m.name || '',
            '자재그룹': m.group_name || ''
          };
          if (mnDeptType === 'production') {
            row['사용량(kg)'] = '';
            row['원단위(kg/톤)'] = '';
          } else {
            row['입고수량(톤)'] = '';
            row['입고단가(원/kg)'] = '';
          }
          row['이슈사항'] = '';
          rows.push(row);
        });
      } else {
        // 빈 샘플 행 3개
        for (var i = 0; i < 3; i++) {
          var row = { '자재코드': '', '자재명': '', '자재그룹': '' };
          if (mnDeptType === 'production') {
            row['사용량(kg)'] = '';
            row['원단위(kg/톤)'] = '';
          } else {
            row['입고수량(톤)'] = '';
            row['입고단가(원/kg)'] = '';
          }
          row['이슈사항'] = '';
          rows.push(row);
        }
      }
      var ws = XLSX.utils.json_to_sheet(rows);
      // 컬럼 너비 설정
      ws['!cols'] = [
        {wch: 14}, {wch: 25}, {wch: 14}, {wch: 16}, {wch: 16}, {wch: 20}
      ];
      var wb = XLSX.utils.book_new();
      var sheetName = mnDeptType === 'production' ? '생산_수기입력' : '구매_수기입력';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      var today = new Date(); var td = today.getFullYear() + String(today.getMonth()+1).padStart(2,'0') + String(today.getDate()).padStart(2,'0');
      var deptLabel = mnDeptType === 'production' ? '생산' : '구매';
      var filename = '수기입력_' + deptLabel + '_' + (mnMachine || 'machine') + '_' + document.getElementById('analysisYear').value + document.getElementById('analysisMonth').value.padStart(2,'0') + '_' + td + '.xlsx';
      XLSX.writeFile(wb, filename);
    }

    function uploadManualExcel(event) {
      var file = event.target.files[0];
      if (!file) return;
      event.target.value = '';

      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var wb = XLSX.read(e.target.result, {type: 'array'});
          var ws = wb.Sheets[wb.SheetNames[0]];
          var data = XLSX.utils.sheet_to_json(ws);

          if (!data || !data.length) {
            alert('엑셀에 데이터가 없습니다.');
            return;
          }

          mnPreviewData = data;
          showManualPreview(data);
        } catch(ex) {
          alert('엑셀 파일 읽기 오류: ' + ex.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function showManualPreview(data) {
      var modal = document.getElementById('mn-preview-modal');
      if (!modal) return;
      modal.classList.remove('hidden');

      // 모든 행에서 유니크 컬럼명 수집 (첫 행에 빈 셀이 있으면 키가 누락되므로)
      var colSet = {};
      var cols = [];
      data.forEach(function(row) {
        Object.keys(row).forEach(function(k) {
          if (!colSet[k]) { colSet[k] = true; cols.push(k); }
        });
      });
      // 컬럼 헤더 강조 (입고/사용량 관련 컬럼은 파란색으로)
      var dataColNames = ['입고수량(톤)', '입고단가(원/kg)', '사용량(kg)', '입고수량', '입고단가', '사용량', 'incoming_qty', 'incoming_price', 'cur_usage'];
      var theadHtml = '<th class="px-2 py-1.5 text-center font-semibold text-gray-600 border-b border-slate-200 w-10">상태</th>';
      cols.forEach(function(col) {
        var isDataCol = dataColNames.indexOf(col) >= 0;
        var colCls = isDataCol ? 'px-2 py-1.5 text-left font-semibold text-blue-700 border-b border-blue-200 whitespace-nowrap bg-blue-50/50' : 'px-2 py-1.5 text-left font-semibold text-gray-600 border-b border-slate-200 whitespace-nowrap';
        theadHtml += '<th class="' + colCls + '">' + col + '</th>';
      });
      document.getElementById('mn-preview-thead').innerHTML = theadHtml;

      var tbodyHtml = '';
      var maxRows = Math.min(data.length, 100);
      var matchCount = 0;
      var newCount = 0;
      for (var i = 0; i < maxRows; i++) {
        var row = data[i];
        var code = String(row['자재코드'] || row['material_code'] || '').trim();
        var isNew = false;
        var isMatch = false;
        if (code && mnMaterials && mnMaterials.length) {
          var found = mnMaterials.some(function(m) {
            return m.code === code || m.code.replace(/^0+/,'') === code.replace(/^0+/,'');
          });
          if (found) { isMatch = true; matchCount++; }
          else { isNew = true; newCount++; }
        } else if (code) {
          isNew = true; newCount++;
        }

        var rowClass = isNew ? 'bg-amber-50/60 border-b border-amber-100' : 'border-b border-slate-50 hover:bg-blue-50/30';
        tbodyHtml += '<tr class="' + rowClass + '">';
        // 상태 칼럼
        if (isNew) {
          tbodyHtml += '<td class="px-2 py-1 text-center"><span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">신규</span></td>';
        } else if (isMatch) {
          tbodyHtml += '<td class="px-2 py-1 text-center"><span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">매칭</span></td>';
        } else {
          tbodyHtml += '<td class="px-2 py-1 text-center"><span class="text-[10px] text-gray-300">-</span></td>';
        }
        cols.forEach(function(col) {
          var val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
          tbodyHtml += '<td class="px-2 py-1 text-xs font-mono whitespace-nowrap">' + val + '</td>';
        });
        tbodyHtml += '</tr>';
      }
      document.getElementById('mn-preview-tbody').innerHTML = tbodyHtml;

      // 요약 정보
      var dataRowCount = 0;
      data.forEach(function(r) {
        if ((r['입고수량(톤)'] !== undefined && r['입고수량(톤)'] !== null && r['입고수량(톤)'] !== '') ||
            (r['사용량(kg)'] !== undefined && r['사용량(kg)'] !== null && r['사용량(kg)'] !== '') ||
            (r['입고수량'] !== undefined && r['입고수량'] !== null && r['입고수량'] !== '')) dataRowCount++;
      });
      var summaryParts = ['<span class="font-medium text-gray-700">시트: ' + data.length + '행</span>'];
      if (matchCount > 0) summaryParts.push('<span class="text-emerald-600 font-medium">기존 매칭: ' + matchCount + '건</span>');
      if (newCount > 0) summaryParts.push('<span class="text-amber-600 font-semibold"><i class="fas fa-plus-circle mr-0.5"></i>신규 자재: ' + newCount + '건</span>');
      if (dataRowCount > 0) summaryParts.push('<span class="text-blue-600 font-medium">입고/사용량 데이터: ' + dataRowCount + '건</span>');
      if (matchCount === 0 && newCount === 0) summaryParts.push('<span class="text-red-500">자재코드 매칭 확인 필요</span>');
      document.getElementById('mn-preview-summary').innerHTML = summaryParts.join(' | ');
      document.getElementById('mn-preview-count').textContent = '총 ' + data.length + '행 중 ' + maxRows + '행 표시' + (newCount > 0 ? ' (신규 ' + newCount + '건 포함)' : '');
    }

    function closeManualPreview() {
      var modal = document.getElementById('mn-preview-modal');
      if (modal) modal.classList.add('hidden');
    }

    function applyManualPreview() {
      if (!mnPreviewData || !mnPreviewData.length) { alert('적용할 데이터가 없습니다.'); return; }
      if (!mnMaterials || !mnMaterials.length) { alert('먼저 호기를 선택하고 불러오기를 실행해주세요.'); return; }

      var appliedUsage = 0, appliedIq = 0, appliedIp = 0, appliedSq = 0, appliedSp = 0;
      var matchCount = 0;
      var newMaterials = [];
      // 엑셀 데이터 매핑 (자재코드 기준)
      var uploadMap = {};
      mnPreviewData.forEach(function(row) {
        var code = String(row['자재코드'] || row['material_code'] || '').trim();
        if (code) uploadMap[code] = row;
      });

      // 1) 기존 자재 매핑
      var matchedCodes = {};
      mnMaterials.forEach(function(m, idx) {
        var code = m.code;
        var uploaded = uploadMap[code] || uploadMap[code.replace(/^0+/,'')] || null;
        if (!uploaded) {
          var shortCode = code.replace(/^0+/,'');
          for (var k in uploadMap) {
            if (k.replace(/^0+/,'') === shortCode) { uploaded = uploadMap[k]; break; }
          }
        }
        if (!uploaded) return;

        // 매칭된 코드 기록
        matchedCodes[code] = true;
        matchedCodes[code.replace(/^0+/,'')] = true;
        matchCount++;

        var rid = 'mn-r-' + idx;
        // 사용량(kg)
        var cuEl = document.getElementById(rid + '-cu');
        var usageVal = uploaded['사용량(kg)'] !== undefined && uploaded['사용량(kg)'] !== null ? uploaded['사용량(kg)'] : (uploaded['당월_사용량(kg)'] !== undefined && uploaded['당월_사용량(kg)'] !== null ? uploaded['당월_사용량(kg)'] : (uploaded['cur_usage'] !== undefined && uploaded['cur_usage'] !== null ? uploaded['cur_usage'] : (uploaded['사용량'] !== undefined && uploaded['사용량'] !== null ? uploaded['사용량'] : undefined)));
        if (cuEl && usageVal !== undefined && usageVal !== null && usageVal !== '') { cuEl.value = Math.round(Number(usageVal)).toLocaleString(); appliedUsage++; }
        // 입고수량(톤)
        var iqEl = document.getElementById(rid + '-iq');
        var iqVal = uploaded['입고수량(톤)'] !== undefined && uploaded['입고수량(톤)'] !== null ? uploaded['입고수량(톤)'] : (uploaded['incoming_qty'] !== undefined && uploaded['incoming_qty'] !== null ? uploaded['incoming_qty'] : (uploaded['입고수량'] !== undefined && uploaded['입고수량'] !== null ? uploaded['입고수량'] : undefined));
        if (iqEl && iqVal !== undefined && iqVal !== null && iqVal !== '') { iqEl.value = Number(iqVal).toLocaleString(); appliedIq++; }
        // 입고단가(원/kg)
        var ipEl = document.getElementById(rid + '-ip');
        var ipVal = uploaded['입고단가(원/kg)'] !== undefined && uploaded['입고단가(원/kg)'] !== null ? uploaded['입고단가(원/kg)'] : (uploaded['incoming_price'] !== undefined && uploaded['incoming_price'] !== null ? uploaded['incoming_price'] : (uploaded['입고단가'] !== undefined && uploaded['입고단가'] !== null ? uploaded['입고단가'] : undefined));
        if (ipEl && ipVal !== undefined && ipVal !== null && ipVal !== '') { ipEl.value = Math.round(Number(ipVal)).toLocaleString(); appliedIp++; }
        // 기초재고수량(톤)
        var sqEl = document.getElementById(rid + '-sq');
        var sqVal = uploaded['기초재고수량(톤)'] !== undefined && uploaded['기초재고수량(톤)'] !== null ? uploaded['기초재고수량(톤)'] : (uploaded['stock_qty'] !== undefined && uploaded['stock_qty'] !== null ? uploaded['stock_qty'] : (uploaded['기초재고수량'] !== undefined && uploaded['기초재고수량'] !== null ? uploaded['기초재고수량'] : undefined));
        if (sqEl && sqVal !== undefined && sqVal !== null && sqVal !== '') { sqEl.value = Number(sqVal).toLocaleString(); appliedSq++; }
        // 기초재고단가(원/kg)
        var spEl = document.getElementById(rid + '-sp');
        var spVal = uploaded['기초재고단가(원/kg)'] !== undefined && uploaded['기초재고단가(원/kg)'] !== null ? uploaded['기초재고단가(원/kg)'] : (uploaded['stock_price'] !== undefined && uploaded['stock_price'] !== null ? uploaded['stock_price'] : (uploaded['기초재고단가'] !== undefined && uploaded['기초재고단가'] !== null ? uploaded['기초재고단가'] : undefined));
        if (spEl && spVal !== undefined && spVal !== null && spVal !== '') { spEl.value = Math.round(Number(spVal)).toLocaleString(); appliedSp++; }
        // 원단위(kg/톤) — 당월 예상: 값이 있으면 사용량 역산
        var cucEl = document.getElementById(rid + '-cuc');
        var ucVal = uploaded['원단위(kg/톤)'] !== undefined && uploaded['원단위(kg/톤)'] !== null ? uploaded['원단위(kg/톤)'] : (uploaded['원단위'] !== undefined && uploaded['원단위'] !== null ? uploaded['원단위'] : (uploaded['cur_uc'] !== undefined && uploaded['cur_uc'] !== null ? uploaded['cur_uc'] : undefined));
        if (cucEl && ucVal !== undefined && ucVal !== null && ucVal !== '') {
          cucEl.value = Number(ucVal);
          cucEl.setAttribute('data-manual', '1');
          // 역산은 모든 매핑 완료 후 일괄 처리
        }
        // 사용단가(원/kg)
        var upEl = document.getElementById(rid + '-up');
        var upVal = uploaded['사용단가(원/kg)'] !== undefined && uploaded['사용단가(원/kg)'] !== null ? uploaded['사용단가(원/kg)'] : (uploaded['use_price'] !== undefined && uploaded['use_price'] !== null ? uploaded['use_price'] : (uploaded['사용단가'] !== undefined && uploaded['사용단가'] !== null ? uploaded['사용단가'] : undefined));
        if (upEl && upVal !== undefined && upVal !== null && upVal !== '') upEl.value = Math.round(Number(upVal)).toLocaleString();
        // 이슈사항
        var issueEl = document.getElementById(rid + '-issue');
        var issueVal = uploaded['이슈사항'] || uploaded['issue'] || uploaded['비고'];
        if (issueEl && issueVal !== undefined) issueEl.value = String(issueVal);
      });

      // 2) 신규 자재 감지 및 추가
      for (var excelCode in uploadMap) {
        var shortExcel = excelCode.replace(/^0+/,'');
        if (matchedCodes[excelCode] || matchedCodes[shortExcel]) continue;
        // 이 코드는 기존 목록에 없음 → 신규 자재
        var row = uploadMap[excelCode];
        var matName = row['자재명'] || row['material_name'] || row['자재 명'] || '신규자재_' + excelCode;
        var groupName = row['자재그룹'] || row['group_name'] || row['그룹'] || '신규 추가';
        newMaterials.push({
          code: excelCode,
          name: matName,
          group_name: groupName,
          usage_qty: 0,
          unit_price: 0,
          is_new: true,
          excel_data: row
        });
      }

      // 3) 신규 자재가 있으면 mnMaterials에 추가하고 재렌더링
      if (newMaterials.length > 0) {
        newMaterials.forEach(function(nm) { mnMaterials.push(nm); });
        // mnInputData.materials에 신규 자재 데이터 반영
        if (!mnInputData.materials) mnInputData.materials = {};
        newMaterials.forEach(function(nm) {
          var row = nm.excel_data;
          var saved = {};
          var usageVal = row['사용량(kg)'] || row['당월_사용량(kg)'] || row['cur_usage'] || row['사용량'];
          if (usageVal !== undefined) saved.cur_usage = String(Math.round(Number(usageVal)));
          var iqVal = row['입고수량(톤)'] || row['incoming_qty'] || row['입고수량'];
          if (iqVal !== undefined) saved.incoming_qty = String(Number(iqVal));
          var ipVal = row['입고단가(원/kg)'] || row['incoming_price'] || row['입고단가'];
          if (ipVal !== undefined) saved.incoming_price = String(Math.round(Number(ipVal)));
          var sqVal = row['기초재고수량(톤)'] || row['stock_qty'] || row['기초재고수량'];
          if (sqVal !== undefined) saved.stock_qty = String(Number(sqVal));
          var spVal = row['기초재고단가(원/kg)'] || row['stock_price'] || row['기초재고단가'];
          if (spVal !== undefined) saved.stock_price = String(Math.round(Number(spVal)));
          var upVal = row['사용단가(원/kg)'] || row['use_price'] || row['사용단가'];
          if (upVal !== undefined) saved.use_price = String(Math.round(Number(upVal)));
          var ucVal = row['원단위(kg/톤)'] || row['원단위'] || row['cur_uc'];
          if (ucVal !== undefined && ucVal !== null && ucVal !== '') saved.cur_uc = String(Number(ucVal));
          var issueVal = row['이슈사항'] || row['issue'] || row['비고'];
          if (issueVal !== undefined) saved.issue = String(issueVal);
          mnInputData.materials[nm.code] = saved;
        });
        // 테이블 재렌더링 (신규 포함)
        renderManualDetail();
        matchCount += newMaterials.length;
      }

      // 4) 생산량 매핑 (엑셀에 '지종' 컬럼 있으면)
      mnPreviewData.forEach(function(row) {
        var type = row['지종'] || row['product_type'] || '';
        var curProd = row['당월생산량(톤)'] || row['production'] || row['생산량(톤)'];
        if (type && curProd !== undefined) {
          var prodInputs = document.querySelectorAll('.mn-cur-prod');
          prodInputs.forEach(function(inp) {
            if (inp.getAttribute('data-type') === type) {
              inp.value = Math.round(Number(curProd));
            }
          });
        }
      });

      // 원단위 입력된 행들 → 사용량 역산 (생산량 정보가 필요하므로 매핑 완료 후 일괄 처리)
      mnMaterials.forEach(function(m, idx) {
        var cucEl = document.getElementById('mn-r-' + idx + '-cuc');
        if (cucEl && cucEl.getAttribute('data-manual') === '1' && Number(cucEl.value) > 0) {
          onUnitCostInput(idx);
        }
      });

      closeManualPreview();
      calcManualProfit();
      onManualProdChange();
      var details = [];
      details.push('자재 매칭: ' + matchCount + '건');
      if (appliedIq > 0) details.push('입고수량: ' + appliedIq + '건');
      if (appliedIp > 0) details.push('입고단가: ' + appliedIp + '건');
      if (appliedUsage > 0) details.push('사용량: ' + appliedUsage + '건');
      if (appliedSq > 0) details.push('기초재고수량: ' + appliedSq + '건');
      if (appliedSp > 0) details.push('기초재고단가: ' + appliedSp + '건');
      if (newMaterials.length > 0) details.push('신규 추가: ' + newMaterials.length + '건');
      var msg = '엑셀 데이터 적용 완료!' + String.fromCharCode(10) + details.join(', ') + String.fromCharCode(10) + '확인 후 [저장] 버튼을 눌러주세요.';
      alert(msg);
    }

    // ====== 히스토리 관리 ======
    function toggleManualHistory() {
      var panel = document.getElementById('mn-history-panel');
      if (!panel) return;
      if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        loadManualHistory();
      } else {
        panel.classList.add('hidden');
      }
    }

    async function loadManualHistory() {
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;

      try {
        var res = await fetch('/api/manual-input/history?ym=' + ym + '&machine=' + mnMachine);
        var result = await res.json();
        var history = result.history || [];

        var tbody = document.getElementById('mn-history-body');
        if (!tbody) return;

        if (history.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-400">히스토리가 없습니다.</td></tr>';
          return;
        }

        var html = '';
        history.forEach(function(h, idx) {
          var savedBy = h.saved_by || '(미입력)';
          var savedAt = h.updated_at || h.created_at || '';
          // 시간 포맷 (간략)
          if (savedAt && savedAt.length > 16) savedAt = savedAt.substring(0, 16).replace('T', ' ');
          html += '<tr class="border-b border-slate-100 hover:bg-amber-50/30">';
          html += '<td class="px-3 py-1.5 text-xs text-gray-400">' + (idx + 1) + '</td>';
          html += '<td class="px-3 py-1.5 text-xs font-medium">' + savedBy + '</td>';
          html += '<td class="px-3 py-1.5 text-xs text-gray-500">' + savedAt + '</td>';
          html += '<td class="px-3 py-1.5 text-center"><button onclick="restoreManualHistory(' + h.id + ')" class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200">복원</button></td>';
          html += '</tr>';
        });
        tbody.innerHTML = html;
      } catch(e) {
        console.error('History load error:', e);
      }
    }

    async function restoreManualHistory(id) {
      if (!confirm('선택한 버전으로 복원하시겠습니까? 현재 입력값이 덮어씌워집니다.')) return;

      try {
        var res = await fetch('/api/manual-input/history/' + id);
        var result = await res.json();
        if (result.data) {
          mnInputData = result.data;
          renderManualProduction();
          renderManualDetail();
          alert('복원 완료! (저장자: ' + (result.saved_by || '-') + ', 시각: ' + (result.updated_at || '-') + ')');
        } else {
          alert('복원 실패: 데이터를 찾을 수 없습니다.');
        }
      } catch(e) {
        alert('복원 오류: ' + e.message);
      }
    }

    // ====== 저장 (계정 추적 포함) ======
    async function saveManualData() {
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;

      var userNameEl = document.getElementById('mn-user-name');
      var savedBy = userNameEl ? userNameEl.value.trim() : '';
      if (!savedBy) {
        var inputName = prompt('저장자 이름을 입력하세요:');
        if (inputName === null) return; // 취소
        savedBy = inputName.trim();
        if (userNameEl && savedBy) userNameEl.value = savedBy;
      }

      // 생산량 수집
      var production = {};
      document.querySelectorAll('.mn-cur-prod').forEach(function(inp) {
        var t = inp.getAttribute('data-type');
        if (t) production[t] = Number(inp.value) || 0;
      });

      // 자재별 데이터 수집 (부서별로 다른 필드)
      var materials = {};
      var fieldsToCollect, suffixMap;
      if (mnDeptType === 'production') {
        fieldsToCollect = ['cur_usage','cur_uc','issue'];
        suffixMap = {cur_usage:'-cu',cur_uc:'-cuc',issue:'-issue'};
      } else {
        fieldsToCollect = ['incoming_qty','incoming_price','issue'];
        suffixMap = {incoming_qty:'-iq',incoming_price:'-ip',issue:'-issue'};
      }
      mnMaterials.forEach(function(m, idx) {
        var rid = 'mn-r-' + idx;
        var row = {};
        fieldsToCollect.forEach(function(field) {
          var suffix = suffixMap[field];
          var el = document.getElementById(rid + suffix);
          if (el) {
            var v = el.value;
            if (field !== 'issue') v = String(v).replace(/,/g, '');
            row[field] = v;
          }
        });
        if (Object.values(row).some(function(v){return v !== '';})) {
          materials[m.code] = row;
        }
      });

      // 신규 자재 메타정보 수집
      var newMaterialsMeta = [];
      mnMaterials.forEach(function(m) {
        if (m.is_new) {
          newMaterialsMeta.push({ code: m.code, name: m.name, group_name: m.group_name });
        }
      });

      var payload = { ym: ym, machine: mnMachine, dept_type: mnDeptType, data: { production: production, materials: materials, new_materials: newMaterialsMeta }, saved_by: savedBy };

      try {
        var res = await fetch('/api/manual-input/save', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        var result = await res.json();
        if (result.success) {
          alert('저장되었습니다. (' + savedBy + ')');
          // 마지막 저장 정보 업데이트
          updateLastSaveInfo(savedBy, new Date().toLocaleString('ko-KR'));
          // 히스토리 패널 열려있으면 갱신
          var panel = document.getElementById('mn-history-panel');
          if (panel && !panel.classList.contains('hidden')) loadManualHistory();
        } else {
          alert('저장 실패: ' + (result.error || ''));
        }
      } catch(e) {
        alert('저장 오류: ' + e.message);
      }
    }

    function updateLastSaveInfo(savedBy, savedAt) {
      var infoEl = document.getElementById('mn-last-save-info');
      var byEl = document.getElementById('mn-last-saved-by');
      var atEl = document.getElementById('mn-last-saved-at');
      if (infoEl) infoEl.classList.remove('hidden');
      if (byEl) byEl.textContent = savedBy || '(미입력)';
      if (atEl) atEl.textContent = savedAt || '';
    }

    // ============ 기초재고 입력 ============
    var invData = []; // 기초재고 데이터 배열

    async function loadInventoryData() {
      var monthFilter = document.getElementById('inv-month-filter') ? document.getElementById('inv-month-filter').value : '';
      var plantFilter = document.getElementById('inv-plant-filter') ? document.getElementById('inv-plant-filter').value : '';
      var groupFilter = document.getElementById('inv-group-filter') ? document.getElementById('inv-group-filter').value : '';
      var typeFilter = document.getElementById('inv-type-filter') ? document.getElementById('inv-type-filter').value : '';

      var params = [];
      if (monthFilter) params.push('month=' + encodeURIComponent(monthFilter));
      if (plantFilter) params.push('plant=' + encodeURIComponent(plantFilter));
      if (groupFilter) params.push('material_group=' + encodeURIComponent(groupFilter));
      if (typeFilter) params.push('material_type=' + encodeURIComponent(typeFilter));
      var qs = params.length ? '?' + params.join('&') : '';

      try {
        var res = await fetch('/api/inventory-stock' + qs);
        var result = await res.json();
        invData = result.rows || [];
        renderInventoryTable();
        updateInvFilters();
      } catch(e) {
        console.error('Inventory load error:', e);
      }
    }

    function updateInvFilters() {
      var monthSel = document.getElementById('inv-month-filter');
      var groupSel = document.getElementById('inv-group-filter');
      var typeSel = document.getElementById('inv-type-filter');
      if (!monthSel || !typeSel) return;

      var months = {};
      var groups = {};
      var types = {};
      invData.forEach(function(d) {
        if (d.month) months[d.month] = true;
        if (d.material_group) groups[d.material_group] = true;
        if (d.material_type) types[d.material_type] = true;
      });

      var curMonth = monthSel.value;
      var curGroup = groupSel ? groupSel.value : '';
      var curType = typeSel.value;

      var mHtml = '<option value="">전체</option>';
      Object.keys(months).sort().forEach(function(m) { mHtml += '<option value="' + m + '"' + (m === curMonth ? ' selected' : '') + '>' + m + '</option>'; });
      monthSel.innerHTML = mHtml;

      if (groupSel) {
        var gHtml = '<option value="">전체</option>';
        Object.keys(groups).sort().forEach(function(g) { gHtml += '<option value="' + g + '"' + (g === curGroup ? ' selected' : '') + '>' + g + '</option>'; });
        groupSel.innerHTML = gHtml;
      }

      var tHtml = '<option value="">전체</option>';
      Object.keys(types).sort().forEach(function(t) { tHtml += '<option value="' + t + '"' + (t === curType ? ' selected' : '') + '>' + t + '</option>'; });
      typeSel.innerHTML = tHtml;
    }

    function renderInventoryTable() {
      var tbody = document.getElementById('inv-table-body');
      if (!tbody) return;

      var countEl = document.getElementById('inv-count');
      if (countEl) countEl.textContent = invData.length + '건';

      if (!invData.length) {
        tbody.innerHTML = '<tr><td colspan="18" class="text-center text-gray-400 py-8">데이터를 업로드하거나 수동 추가해주세요.</td></tr>';
        return;
      }

      var fmtN = function(v) { return v != null && v !== 0 ? Number(v).toLocaleString(undefined, {maximumFractionDigits:2}) : '-'; };
      var html = '';
      invData.forEach(function(d) {
        html += '<tr class="border-b border-slate-50 hover:bg-slate-50/50">';
        html += '<td class="px-2 py-1.5 text-xs whitespace-nowrap">' + (d.month || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs whitespace-nowrap">' + (d.plant || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs font-mono whitespace-nowrap">' + (d.material_group || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs font-mono whitespace-nowrap">' + (d.material_type || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs whitespace-nowrap">' + (d.material_type_name || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs font-mono whitespace-nowrap">' + (d.material_id || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs whitespace-nowrap">' + (d.material_name || '') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-center">' + (d.currency || 'KRW') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-center">' + (d.unit || 'KG') + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-right font-mono border-l border-slate-100">' + fmtN(d.stock_qty) + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-right font-mono">' + fmtN(d.stock_price) + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-right font-mono border-l border-slate-100">' + fmtN(d.incoming_qty) + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-right font-mono">' + fmtN(d.incoming_price) + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-right font-mono border-l border-slate-100">' + fmtN(d.outgoing_qty) + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-right font-mono">' + fmtN(d.outgoing_price) + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-right font-mono border-l border-slate-100">' + fmtN(d.closing_qty) + '</td>';
        html += '<td class="px-2 py-1.5 text-xs text-right font-mono">' + fmtN(d.closing_price) + '</td>';
        html += '<td class="px-2 py-1.5 text-center"><button onclick="deleteInventoryRow(' + d.id + ')" class="text-red-400 hover:text-red-600 text-[10px]"><i class="fas fa-trash"></i></button></td>';
        html += '</tr>';
      });
      tbody.innerHTML = html;
    }

    function downloadInventoryTemplate() {
      var headers = ['월', '플랜트', '자재그룹', '자재유형', '자재유형명', '자재', '자재내역', '통화', '기본단위', '기초재고_수량', '기초재고_단가', '입고_수량', '입고_단가', '출고_수량', '출고_단가', '기말재고_수량', '기말재고_단가'];
      var sample = [
        ['26년 4월', 'P100', '1100', 'ROH1', '펄프원자재(깨끗한나라)', '1100011', 'LBKP GUAIBA', 'KRW', 'KG', 9073, 781.59, 32293, 784.39, 41366, 783.78, 0, 0],
        ['26년 4월', 'P100', '1200', 'ROH2', '고지원자재(깨끗한나라)', '1200000', '화이트레저(B)', 'KRW', 'KG', 3735921, 335.13, 2340964, 325.65, 3090491, 331.48, 2986394, 331.48]
      ];
      var wsData = [headers].concat(sample);
      var ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{wch:10},{wch:8},{wch:8},{wch:8},{wch:25},{wch:10},{wch:18},{wch:6},{wch:6},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12}];
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '재고현황');
      XLSX.writeFile(wb, '재고현황_양식.xlsx');
    }

    async function uploadInventoryFile(event) {
      var file = event.target.files[0];
      if (!file) return;
      event.target.value = '';

      var reader = new FileReader();
      reader.onload = async function(e) {
        try {
          var data = new Uint8Array(e.target.result);
          var workbook = XLSX.read(data, {type: 'array'});
          var sheet = workbook.Sheets[workbook.SheetNames[0]];
          var rows = XLSX.utils.sheet_to_json(sheet, {defval: ''});

          if (!rows.length) { alert('데이터가 없습니다.'); return; }

          var mapped = rows.map(function(r) {
            return {
              month: r['월'] || r['month'] || '',
              plant: r['플랜트'] || r['plant'] || '',
              material_group: String(r['자재그룹'] || r['material_group'] || ''),
              material_type: r['자재유형'] || r['material_type'] || '',
              material_type_name: r['자재유형명'] || r['material_type_name'] || '',
              material_id: String(r['자재'] || r['material_id'] || ''),
              material_name: r['자재내역'] || r['material_name'] || r['자재명'] || '',
              currency: r['통화'] || r['currency'] || 'KRW',
              unit: r['기본단위'] || r['unit'] || 'KG',
              stock_qty: Number(String(r['기초재고_수량'] || r['기초재고-수량'] || r['stock_qty'] || 0).replace(/,/g, '')) || 0,
              stock_price: Number(String(r['기초재고_단가'] || r['기초재고-가격'] || r['stock_price'] || 0).replace(/,/g, '')) || 0,
              incoming_qty: Number(String(r['입고_수량'] || r['incoming_qty'] || 0).replace(/,/g, '')) || 0,
              incoming_price: Number(String(r['입고_단가'] || r['incoming_price'] || 0).replace(/,/g, '')) || 0,
              outgoing_qty: Number(String(r['출고_수량'] || r['outgoing_qty'] || 0).replace(/,/g, '')) || 0,
              outgoing_price: Number(String(r['출고_단가'] || r['outgoing_price'] || 0).replace(/,/g, '')) || 0,
              closing_qty: Number(String(r['기말재고_수량'] || r['closing_qty'] || 0).replace(/,/g, '')) || 0,
              closing_price: Number(String(r['기말재고_단가'] || r['closing_price'] || 0).replace(/,/g, '')) || 0
            };
          });

          var res = await fetch('/api/inventory-stock/bulk', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ rows: mapped })
          });
          var result = await res.json();
          if (result.success) {
            alert(result.count + '건 업로드 완료');
            loadInventoryData();
          } else {
            alert('업로드 실패: ' + (result.error || ''));
          }
        } catch(err) {
          alert('파일 파싱 오류: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    async function addInventoryRow() {
      var month = document.getElementById('inv-add-month').value.trim();
      var plant = document.getElementById('inv-add-plant').value.trim();
      var matGroup = document.getElementById('inv-add-mat-group').value.trim();
      var matType = document.getElementById('inv-add-mat-type').value.trim();
      var matTypeName = document.getElementById('inv-add-mat-type-name').value.trim();
      var matId = document.getElementById('inv-add-mat-id').value.trim();
      var matName = document.getElementById('inv-add-mat-name').value.trim();
      var qty = parseComma(document.getElementById('inv-add-qty').value);
      var price = parseComma(document.getElementById('inv-add-price').value);

      if (!month || !matId) { alert('월과 자재(ID)는 필수입니다.'); return; }

      try {
        var res = await fetch('/api/inventory-stock', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            month: month, plant: plant, material_group: matGroup,
            material_type: matType, material_type_name: matTypeName,
            material_id: matId, material_name: matName,
            currency: 'KRW', unit: 'KG',
            stock_qty: qty, stock_price: price
          })
        });
        var result = await res.json();
        if (result.success) {
          ['inv-add-month','inv-add-plant','inv-add-mat-group','inv-add-mat-type','inv-add-mat-type-name','inv-add-mat-id','inv-add-mat-name','inv-add-qty','inv-add-price'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
          });
          loadInventoryData();
        } else {
          alert('추가 실패: ' + (result.error || ''));
        }
      } catch(e) { alert('오류: ' + e.message); }
    }

    async function deleteInventoryRow(id) {
      if (!confirm('삭제하시겠습니까?')) return;
      try {
        var res = await fetch('/api/inventory-stock/' + id, { method: 'DELETE' });
        var result = await res.json();
        if (result.success) { loadInventoryData(); }
        else { alert('삭제 실패'); }
      } catch(e) { alert('오류: ' + e.message); }
    }

    function exportInventoryExcel() {
      if (!invData || !invData.length) { alert('내보낼 데이터가 없습니다.'); return; }
      var headers = ['월', '플랜트', '자재그룹', '자재유형', '자재유형명', '자재', '자재내역', '통화', '기본단위', '기초재고_수량', '기초재고_단가', '입고_수량', '입고_단가', '출고_수량', '출고_단가', '기말재고_수량', '기말재고_단가'];
      var rows = invData.map(function(d) {
        return [
          d.month || '', d.plant || '', d.material_group || '',
          d.material_type || '', d.material_type_name || '',
          d.material_id || '', d.material_name || '',
          d.currency || 'KRW', d.unit || 'KG',
          d.stock_qty || 0, d.stock_price || 0,
          d.incoming_qty || 0, d.incoming_price || 0,
          d.outgoing_qty || 0, d.outgoing_price || 0,
          d.closing_qty || 0, d.closing_price || 0
        ];
      });
      var wsData = [headers].concat(rows);
      var ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{wch:10},{wch:8},{wch:8},{wch:8},{wch:25},{wch:10},{wch:18},{wch:6},{wch:6},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12}];
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '재고현황');
      var monthFilter = document.getElementById('inv-month-filter') ? document.getElementById('inv-month-filter').value : '';
      var fileName = '재고현황' + (monthFilter ? '_' + monthFilter : '') + '.xlsx';
      XLSX.writeFile(wb, fileName);
    }

    // ============ 가동시간 (Operating Time) 모듈 — 재설계 ============
    var otData = [];  // 현재 월의 가동시간 데이터
    var otCapacity = [];  // 호기별 시간당 생산능력

    function getOtYm() {
      var y = document.getElementById('ot-year')?.value || '2026';
      var m = document.getElementById('ot-month')?.value || '06';
      return y + m;
    }

    function getDaysInMonth(ym) {
      var year = parseInt(ym.substring(0, 4));
      var month = parseInt(ym.substring(4, 6));
      return new Date(year, month, 0).getDate();
    }

    async function loadOperatingTime() {
      var ym = getOtYm();
      var div = currentDivision || 'PS';
      try {
        var [timeRes, capRes] = await Promise.all([
          fetch('/api/operating-time?division=' + div + '&ym=' + ym).then(r => r.json()),
          fetch('/api/machine-capacity?division=' + div).then(r => r.json())
        ]);
        otData = timeRes || [];
        otCapacity = capRes || [];
        renderOperatingTimeTable(ym);
      } catch(e) { console.error('가동시간 로드 오류:', e); }
    }

    function renderOperatingTimeTable(ym) {
      var tbody = document.getElementById('ot-table-body');
      var tfoot = document.getElementById('ot-table-foot');
      if (!tbody) return;

      var machines = (divisionMachines || CC.machines || []).map(function(m) { return m.code || m; });
      var daysInMonth = getDaysInMonth(ym);

      var dataMap = {};
      otData.forEach(function(d) { dataMap[d.machine_code] = d; });
      var capMap = {};
      otCapacity.forEach(function(c) { capMap[c.machine_code] = c.hourly_capacity || 0; });

      var html = '';
      var totals = { total: 0, shutdown: 0, opNormal: 0, opWaste: 0, opUnplanned: 0, opStartup: 0, opCutting: 0, opSub: 0, dtMaint: 0, dtClean: 0, dtAccident: 0, dtSub: 0, maxProd: 0 };

      machines.forEach(function(mc) {
        var d = dataMap[mc] || {};
        var total = d.total_days || daysInMonth;
        var shutdown = d.planned_shutdown_days || 0;
        var opNormal = d.operation_normal_days || 0;
        var opWaste = d.operation_waste_days || 0;
        var opUnplanned = d.operation_unplanned_days || 0;
        var opStartup = d.operation_startup_days || 0;
        var opCutting = d.operation_cutting_days || 0;
        var opSub = d.operation_subtotal || (opNormal + opWaste + opUnplanned + opStartup + opCutting);
        var dtMaint = d.downtime_maintenance_days || 0;
        var dtClean = d.downtime_cleaning_days || 0;
        var dtAccident = d.downtime_accident_days || 0;
        var dtSub = d.downtime_subtotal || (dtMaint + dtClean + dtAccident);
        var cap = capMap[mc] || 0;
        var maxProd = opSub * 24 * cap;

        totals.total += total; totals.shutdown += shutdown;
        totals.opNormal += opNormal; totals.opWaste += opWaste; totals.opUnplanned += opUnplanned;
        totals.opStartup += opStartup; totals.opCutting += opCutting; totals.opSub += opSub;
        totals.dtMaint += dtMaint; totals.dtClean += dtClean; totals.dtAccident += dtAccident; totals.dtSub += dtSub;
        totals.maxProd += maxProd;

        var chipClass = getCC(mc);
        var toM = function(v) { return Math.round(v * 24 * 60).toLocaleString('ko-KR'); };
        html += '<tr class="border-b border-slate-100 hover:bg-amber-50/30" data-mc="' + mc + '">' +
          '<td class="px-2 py-1.5" rowspan="2"><span class="unit-chip ' + chipClass + '">' + mc + '</span></td>' +
          '<td class="px-1 py-1 text-center"><input type="number" step="1" data-field="total_days" value="' + total + '" class="w-12 text-center text-xs border border-gray-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center bg-orange-50/30"><input type="number" step="0.5" data-field="planned_shutdown_days" value="' + shutdown + '" class="w-12 text-center text-xs border border-orange-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center bg-emerald-50/20"><input type="number" step="0.5" data-field="operation_normal_days" value="' + opNormal + '" class="w-12 text-center text-xs border border-emerald-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center bg-emerald-50/20"><input type="number" step="0.1" data-field="operation_waste_days" value="' + opWaste + '" class="w-12 text-center text-xs border border-emerald-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center bg-emerald-50/20"><input type="number" step="0.5" data-field="operation_unplanned_days" value="' + opUnplanned + '" class="w-12 text-center text-xs border border-emerald-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center bg-emerald-50/20"><input type="number" step="0.1" data-field="operation_startup_days" value="' + opStartup + '" class="w-12 text-center text-xs border border-emerald-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center bg-emerald-50/20"><input type="number" step="0.1" data-field="operation_cutting_days" value="' + opCutting + '" class="w-12 text-center text-xs border border-emerald-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center font-semibold text-emerald-700 bg-emerald-100/50 ot-op-sub">' + opSub.toFixed(1) + '</td>' +
          '<td class="px-1 py-1 text-center bg-red-50/20"><input type="number" step="0.5" data-field="downtime_maintenance_days" value="' + dtMaint + '" class="w-12 text-center text-xs border border-red-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center bg-red-50/20"><input type="number" step="0.1" data-field="downtime_cleaning_days" value="' + dtClean + '" class="w-12 text-center text-xs border border-red-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center bg-red-50/20"><input type="number" step="0.1" data-field="downtime_accident_days" value="' + dtAccident + '" class="w-12 text-center text-xs border border-red-200 rounded px-1 py-0.5 ot-input" onchange="recalcOtRow(this)"></td>' +
          '<td class="px-1 py-1 text-center font-semibold text-red-600 bg-red-100/50 ot-dt-sub">' + dtSub.toFixed(1) + '</td>' +
          '<td class="px-2 py-1 text-center font-mono text-blue-700 ot-maxprod">' + Math.round(maxProd).toLocaleString('ko-KR') + '</td>' +
          '<td class="px-1 py-1" rowspan="2"><input type="text" data-field="note" value="' + (d.note || '') + '" class="w-16 text-[10px] border border-gray-200 rounded px-1 py-0.5 ot-input" placeholder="메모"></td>' +
          '</tr>' +
          '<tr class="border-b border-slate-200 bg-slate-50/60 ot-min-row" data-mc-min="' + mc + '">' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-gray-400 ot-min-total">' + toM(total) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-orange-400 ot-min-shutdown">' + toM(shutdown) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-emerald-400 ot-min-opNormal">' + toM(opNormal) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-emerald-400 ot-min-opWaste">' + toM(opWaste) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-emerald-400 ot-min-opUnplanned">' + toM(opUnplanned) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-emerald-400 ot-min-opStartup">' + toM(opStartup) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-emerald-400 ot-min-opCutting">' + toM(opCutting) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] font-semibold text-emerald-600 bg-emerald-100/30 ot-min-opSub">' + toM(opSub) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-red-400 ot-min-dtMaint">' + toM(dtMaint) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-red-400 ot-min-dtClean">' + toM(dtClean) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-red-400 ot-min-dtAccident">' + toM(dtAccident) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] font-semibold text-red-500 bg-red-100/30 ot-min-dtSub">' + toM(dtSub) + '</td>' +
          '<td class="px-1 py-0.5 text-center text-[9px] text-gray-400">분</td>' +
          '</tr>';
      });
      tbody.innerHTML = html;

      var utilRate = totals.total > 0 ? (totals.opSub / totals.total * 100).toFixed(1) : '0.0';
      // 분 변환 (일수 × 24 × 60)
      var toMin = function(d) { return Math.round(d * 24 * 60); };
      tfoot.innerHTML = '<tr class="border-b border-slate-200">' +
        '<td class="px-2 py-2 font-bold">합계(일)</td>' +
        '<td class="px-1 py-2 text-center">' + totals.total.toFixed(0) + '</td>' +
        '<td class="px-1 py-2 text-center text-orange-600">' + totals.shutdown.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center text-emerald-600">' + totals.opNormal.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center text-emerald-600">' + totals.opWaste.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center text-emerald-600">' + totals.opUnplanned.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center text-emerald-600">' + totals.opStartup.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center text-emerald-600">' + totals.opCutting.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center font-bold text-emerald-700 bg-emerald-100/50">' + totals.opSub.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center text-red-500">' + totals.dtMaint.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center text-red-500">' + totals.dtClean.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center text-red-500">' + totals.dtAccident.toFixed(1) + '</td>' +
        '<td class="px-1 py-2 text-center font-bold text-red-600 bg-red-100/50">' + totals.dtSub.toFixed(1) + '</td>' +
        '<td class="px-2 py-2 text-center font-bold text-blue-700">' + Math.round(totals.maxProd).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-2 text-xs text-gray-500">가동률 ' + utilRate + '%</td>' +
        '</tr>' +
        '<tr class="bg-slate-50/80 text-[10px] text-slate-500">' +
        '<td class="px-2 py-1.5 font-semibold text-slate-600">환산(분)</td>' +
        '<td class="px-1 py-1.5 text-center">' + toMin(totals.total).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-orange-500">' + toMin(totals.shutdown).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-emerald-500">' + toMin(totals.opNormal).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-emerald-500">' + toMin(totals.opWaste).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-emerald-500">' + toMin(totals.opUnplanned).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-emerald-500">' + toMin(totals.opStartup).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-emerald-500">' + toMin(totals.opCutting).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center font-bold text-emerald-600 bg-emerald-100/30">' + toMin(totals.opSub).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-red-400">' + toMin(totals.dtMaint).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-red-400">' + toMin(totals.dtClean).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-red-400">' + toMin(totals.dtAccident).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center font-bold text-red-500 bg-red-100/30">' + toMin(totals.dtSub).toLocaleString('ko-KR') + '</td>' +
        '<td class="px-1 py-1.5 text-center text-slate-400">-</td>' +
        '<td class="px-1 py-1.5 text-center text-slate-400">1일=1,440분</td>' +
        '</tr>';

      var elOp = document.getElementById('ot-total-operating');
      var elUtil = document.getElementById('ot-utilization');
      var elMax = document.getElementById('ot-max-production');
      var elStop = document.getElementById('ot-total-stop');
      var elShutdown = document.getElementById('ot-shutdown');
      if (elOp) elOp.textContent = totals.opSub.toFixed(1) + '일';
      if (elUtil) elUtil.textContent = utilRate + '%';
      if (elMax) elMax.textContent = Math.round(totals.maxProd).toLocaleString('ko-KR') + ' 톤';
      if (elStop) elStop.textContent = totals.dtSub.toFixed(1) + '일';
      if (elShutdown) elShutdown.textContent = totals.shutdown.toFixed(1) + '일';

      renderCapacityInputs(machines, capMap);
    }

    function recalcOtRow(el) {
      var tr = el.closest('tr');
      if (!tr) return;
      var opNormal = parseFloat(tr.querySelector('[data-field="operation_normal_days"]').value) || 0;
      var opWaste = parseFloat(tr.querySelector('[data-field="operation_waste_days"]').value) || 0;
      var opUnplanned = parseFloat(tr.querySelector('[data-field="operation_unplanned_days"]').value) || 0;
      var opStartup = parseFloat(tr.querySelector('[data-field="operation_startup_days"]').value) || 0;
      var opCutting = parseFloat(tr.querySelector('[data-field="operation_cutting_days"]').value) || 0;
      var opSub = opNormal + opWaste + opUnplanned + opStartup + opCutting;
      var dtMaint = parseFloat(tr.querySelector('[data-field="downtime_maintenance_days"]').value) || 0;
      var dtClean = parseFloat(tr.querySelector('[data-field="downtime_cleaning_days"]').value) || 0;
      var dtAccident = parseFloat(tr.querySelector('[data-field="downtime_accident_days"]').value) || 0;
      var dtSub = dtMaint + dtClean + dtAccident;
      var totalDays = parseFloat(tr.querySelector('[data-field="total_days"]').value) || 0;
      var shutdown = parseFloat(tr.querySelector('[data-field="planned_shutdown_days"]').value) || 0;
      var mc = tr.dataset.mc;
      var capMap = {};
      otCapacity.forEach(function(c) { capMap[c.machine_code] = c.hourly_capacity || 0; });
      var cap = capMap[mc] || 0;
      var maxProd = opSub * 24 * cap;
      tr.querySelector('.ot-op-sub').textContent = opSub.toFixed(1);
      tr.querySelector('.ot-dt-sub').textContent = dtSub.toFixed(1);
      tr.querySelector('.ot-maxprod').textContent = Math.round(maxProd).toLocaleString('ko-KR');
      // 분 환산 행 업데이트
      var minRow = tr.nextElementSibling;
      if (minRow && minRow.classList.contains('ot-min-row')) {
        var toM = function(v) { return Math.round(v * 24 * 60).toLocaleString('ko-KR'); };
        minRow.querySelector('.ot-min-total').textContent = toM(totalDays);
        minRow.querySelector('.ot-min-shutdown').textContent = toM(shutdown);
        minRow.querySelector('.ot-min-opNormal').textContent = toM(opNormal);
        minRow.querySelector('.ot-min-opWaste').textContent = toM(opWaste);
        minRow.querySelector('.ot-min-opUnplanned').textContent = toM(opUnplanned);
        minRow.querySelector('.ot-min-opStartup').textContent = toM(opStartup);
        minRow.querySelector('.ot-min-opCutting').textContent = toM(opCutting);
        minRow.querySelector('.ot-min-opSub').textContent = toM(opSub);
        minRow.querySelector('.ot-min-dtMaint').textContent = toM(dtMaint);
        minRow.querySelector('.ot-min-dtClean').textContent = toM(dtClean);
        minRow.querySelector('.ot-min-dtAccident').textContent = toM(dtAccident);
        minRow.querySelector('.ot-min-dtSub').textContent = toM(dtSub);
      }
    }

    async function saveOperatingTime() {
      var ym = getOtYm();
      var div = currentDivision || 'PS';
      var rows = document.querySelectorAll('#ot-table-body tr[data-mc]');
      var entries = [];
      rows.forEach(function(tr) {
        entries.push({
          machine_code: tr.dataset.mc,
          total_days: parseFloat(tr.querySelector('[data-field="total_days"]').value) || 0,
          planned_shutdown_days: parseFloat(tr.querySelector('[data-field="planned_shutdown_days"]').value) || 0,
          operation_normal_days: parseFloat(tr.querySelector('[data-field="operation_normal_days"]').value) || 0,
          operation_waste_days: parseFloat(tr.querySelector('[data-field="operation_waste_days"]').value) || 0,
          operation_unplanned_days: parseFloat(tr.querySelector('[data-field="operation_unplanned_days"]').value) || 0,
          operation_startup_days: parseFloat(tr.querySelector('[data-field="operation_startup_days"]').value) || 0,
          operation_cutting_days: parseFloat(tr.querySelector('[data-field="operation_cutting_days"]').value) || 0,
          downtime_maintenance_days: parseFloat(tr.querySelector('[data-field="downtime_maintenance_days"]').value) || 0,
          downtime_cleaning_days: parseFloat(tr.querySelector('[data-field="downtime_cleaning_days"]').value) || 0,
          downtime_accident_days: parseFloat(tr.querySelector('[data-field="downtime_accident_days"]').value) || 0,
          note: tr.querySelector('[data-field="note"]')?.value || ''
        });
      });
      try {
        var res = await fetch('/api/operating-time/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ division: div, ym: ym, entries: entries, saved_by: document.getElementById('mn-user-name')?.value || '' })
        });
        var result = await res.json();
        if (result.success) {
          alert('가동시간 저장 완료! (' + result.count + '건)');
          loadOperatingTime();
        } else {
          alert('저장 실패: ' + (result.error || ''));
        }
      } catch(e) { alert('저장 오류: ' + e.message); }
    }

    function renderCapacityInputs(machines, capMap) {
      var container = document.getElementById('ot-capacity-container');
      if (!container) return;
      var html = '';
      machines.forEach(function(mc) {
        var cap = capMap[mc] || 0;
        var chipClass = getCC(mc);
        html += '<div class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">' +
          '<span class="unit-chip ' + chipClass + ' text-[9px]">' + mc + '</span>' +
          '<input type="number" step="0.1" id="cap-' + mc + '" value="' + cap + '" class="w-14 text-center text-xs border border-blue-200 rounded px-1 py-0.5">' +
          '<span class="text-[9px] text-gray-400">톤/h</span>' +
          '</div>';
      });
      container.innerHTML = html;
    }

    async function saveCapacity() {
      var div = currentDivision || 'PS';
      var machines = (divisionMachines || CC.machines || []).map(function(m) { return m.code || m; });
      try {
        for (var i = 0; i < machines.length; i++) {
          var mc = machines[i];
          var val = parseFloat(document.getElementById('cap-' + mc)?.value) || 0;
          await fetch('/api/machine-capacity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ division: div, machine_code: mc, hourly_capacity: val })
          });
        }
        alert('시간당 생산능력 저장 완료!');
        loadOperatingTime(); // 재계산
      } catch(e) { alert('저장 오류: ' + e.message); }
    }

    // ============ 지종별 생산성 마스터 (Grade Production) ============
    var gpData = [];  // 현재 호기의 지종별 생산성 데이터

    function initGpMachineSelect() {
      var sel = document.getElementById('gp-machine-select');
      if (!sel) return;
      var machines = (divisionMachines || CC.machines || []).map(function(m) { return m.code || m; });
      sel.innerHTML = machines.map(function(mc) {
        return '<option value="' + mc + '">' + mc + '</option>';
      }).join('');
      if (machines.length > 0) loadGradeProduction();
    }

    async function loadGradeProduction() {
      var sel = document.getElementById('gp-machine-select');
      var mc = sel ? sel.value : '';
      if (!mc) return;
      var div = currentDivision || 'PS';
      try {
        var res = await fetch('/api/grade-production?division=' + div + '&machine_code=' + mc);
        gpData = await res.json();
        renderGradeProductionTable();
      } catch(e) { console.error('지종 마스터 로드 오류:', e); }
    }

    function renderGradeProductionTable() {
      var tbody = document.getElementById('gp-table-body');
      var tfoot = document.getElementById('gp-table-foot');
      if (!tbody) return;

      if (!gpData || gpData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-6 text-gray-400">등록된 지종이 없습니다. [행 추가]로 등록하세요</td></tr>';
        if (tfoot) tfoot.innerHTML = '';
        updateGpSummary();
        return;
      }

      var html = '';
      var totalTheor = 0, totalGood = 0, count = 0;
      gpData.forEach(function(g, idx) {
        var theor = g.theoretical_daily_ton || 0;
        var good = g.good_daily_ton || 0;
        var wr = ((g.waste_rate || 0) * 100).toFixed(2);
        totalTheor += theor;
        totalGood += good;
        count++;

        html += '<tr class="border-b border-slate-100 hover:bg-blue-50/30 gp-row" data-id="' + (g.id || '') + '">' +
          '<td class="px-2 py-1.5 text-gray-400 text-center">' + (idx + 1) + '</td>' +
          '<td class="px-2 py-1.5"><input type="text" data-field="grade_name" value="' + (g.grade_name || '') + '" class="w-20 text-xs border border-gray-200 rounded px-1.5 py-0.5 gp-input font-medium"></td>' +
          '<td class="px-2 py-1.5 text-center"><input type="number" data-field="basis_weight" value="' + (g.basis_weight || '') + '" class="w-16 text-center text-xs border border-gray-200 rounded px-1 py-0.5 gp-input" onchange="recalcGpRow(this)"></td>' +
          '<td class="px-2 py-1.5 text-center"><input type="number" data-field="line_speed" value="' + (g.line_speed || '') + '" class="w-16 text-center text-xs border border-gray-200 rounded px-1 py-0.5 gp-input" onchange="recalcGpRow(this)"></td>' +
          '<td class="px-2 py-1.5 text-center"><input type="number" data-field="paper_width" value="' + (g.paper_width || 3510) + '" class="w-16 text-center text-xs border border-gray-200 rounded px-1 py-0.5 gp-input" onchange="recalcGpRow(this)"></td>' +
          '<td class="px-2 py-1.5 text-center font-semibold text-blue-700 gp-theor">' + theor.toFixed(1) + '</td>' +
          '<td class="px-2 py-1.5 text-center font-semibold text-emerald-700 gp-good">' + good.toFixed(1) + '</td>' +
          '<td class="px-2 py-1.5 text-center"><input type="number" step="0.01" data-field="waste_rate" value="' + wr + '" class="w-14 text-center text-xs border border-red-200 rounded px-1 py-0.5 bg-red-50/30 gp-input" onchange="recalcGpRow(this)"></td>' +
          '<td class="px-2 py-1.5"><input type="text" data-field="note" value="' + (g.note || '') + '" class="w-24 text-[10px] border border-gray-200 rounded px-1 py-0.5 gp-input" placeholder="메모"></td>' +
          '<td class="px-2 py-1.5 text-center"><button onclick="removeGpRow(this)" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-alt"></i></button></td>' +
          '</tr>';
      });
      tbody.innerHTML = html;

      // 합계
      if (tfoot) {
        tfoot.innerHTML = '<tr>' +
          '<td class="px-2 py-2" colspan="5"><strong>합계 (' + count + '건)</strong></td>' +
          '<td class="px-2 py-2 text-center text-blue-700">' + totalTheor.toFixed(1) + '</td>' +
          '<td class="px-2 py-2 text-center text-emerald-700">' + totalGood.toFixed(1) + '</td>' +
          '<td colspan="3"></td></tr>';
      }

      updateGpSummary();
    }

    function updateGpSummary() {
      var count = gpData ? gpData.length : 0;
      var avgProd = 0, avgWaste = 0;
      if (count > 0) {
        var sumTheor = 0, sumWaste = 0;
        gpData.forEach(function(g) { sumTheor += (g.theoretical_daily_ton || 0); sumWaste += (g.waste_rate || 0); });
        avgProd = sumTheor / count;
        avgWaste = (sumWaste / count) * 100;
      }
      var el1 = document.getElementById('gp-count');
      var el2 = document.getElementById('gp-avg-prod');
      var el3 = document.getElementById('gp-waste-rate');
      if (el1) el1.textContent = count;
      if (el2) el2.textContent = avgProd.toFixed(1);
      if (el3) el3.textContent = avgWaste.toFixed(2) + '%';
    }

    function recalcGpRow(el) {
      var tr = el.closest('tr');
      if (!tr) return;
      var bw = parseFloat(tr.querySelector('[data-field="basis_weight"]').value) || 0;
      var ls = parseFloat(tr.querySelector('[data-field="line_speed"]').value) || 0;
      var pw = parseFloat(tr.querySelector('[data-field="paper_width"]').value) || 3510;
      var wr = parseFloat(tr.querySelector('[data-field="waste_rate"]').value) / 100 || 0.0122;
      // 이론생산성 = 평량 × 지폭 × 선속 × 1440 × 10⁻⁹
      var theor = bw * pw * ls * 1440 * 0.000000001;
      var good = theor * (1 - wr);
      tr.querySelector('.gp-theor').textContent = theor.toFixed(1);
      tr.querySelector('.gp-good').textContent = good.toFixed(1);
    }

    function addGradeRow() {
      var tbody = document.getElementById('gp-table-body');
      if (!tbody) return;
      // 빈 행이면 클리어
      if (tbody.querySelector('td[colspan]')) tbody.innerHTML = '';
      var idx = tbody.querySelectorAll('.gp-row').length + 1;
      var tr = document.createElement('tr');
      tr.className = 'border-b border-slate-100 hover:bg-blue-50/30 gp-row';
      tr.dataset.id = '';
      tr.innerHTML = 
        '<td class="px-2 py-1.5 text-gray-400 text-center">' + idx + '</td>' +
        '<td class="px-2 py-1.5"><input type="text" data-field="grade_name" value="" class="w-20 text-xs border border-gray-200 rounded px-1.5 py-0.5 gp-input font-medium" placeholder="지종명"></td>' +
        '<td class="px-2 py-1.5 text-center"><input type="number" data-field="basis_weight" value="" class="w-16 text-center text-xs border border-gray-200 rounded px-1 py-0.5 gp-input" onchange="recalcGpRow(this)" placeholder="300"></td>' +
        '<td class="px-2 py-1.5 text-center"><input type="number" data-field="line_speed" value="" class="w-16 text-center text-xs border border-gray-200 rounded px-1 py-0.5 gp-input" onchange="recalcGpRow(this)" placeholder="300"></td>' +
        '<td class="px-2 py-1.5 text-center"><input type="number" data-field="paper_width" value="3510" class="w-16 text-center text-xs border border-gray-200 rounded px-1 py-0.5 gp-input" onchange="recalcGpRow(this)"></td>' +
        '<td class="px-2 py-1.5 text-center font-semibold text-blue-700 gp-theor">0.0</td>' +
        '<td class="px-2 py-1.5 text-center font-semibold text-emerald-700 gp-good">0.0</td>' +
        '<td class="px-2 py-1.5 text-center"><input type="number" step="0.01" data-field="waste_rate" value="1.22" class="w-14 text-center text-xs border border-red-200 rounded px-1 py-0.5 bg-red-50/30 gp-input" onchange="recalcGpRow(this)"></td>' +
        '<td class="px-2 py-1.5"><input type="text" data-field="note" value="" class="w-24 text-[10px] border border-gray-200 rounded px-1 py-0.5 gp-input" placeholder="메모"></td>' +
        '<td class="px-2 py-1.5 text-center"><button onclick="removeGpRow(this)" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-alt"></i></button></td>';
      tbody.appendChild(tr);
    }

    function removeGpRow(btn) {
      var tr = btn.closest('tr');
      if (tr) tr.remove();
    }

    async function saveGradeProduction() {
      var sel = document.getElementById('gp-machine-select');
      var mc = sel ? sel.value : '';
      if (!mc) { alert('호기를 선택하세요'); return; }
      var div = currentDivision || 'PS';
      var rows = document.querySelectorAll('#gp-table-body .gp-row');
      var entries = [];
      rows.forEach(function(tr, idx) {
        var gn = tr.querySelector('[data-field="grade_name"]').value.trim();
        var bw = parseFloat(tr.querySelector('[data-field="basis_weight"]').value) || 0;
        var ls = parseFloat(tr.querySelector('[data-field="line_speed"]').value) || 0;
        if (!gn || !bw || !ls) return;  // 필수값 없으면 스킵
        entries.push({
          grade_name: gn,
          basis_weight: bw,
          line_speed: ls,
          paper_width: parseFloat(tr.querySelector('[data-field="paper_width"]').value) || 3510,
          waste_rate: (parseFloat(tr.querySelector('[data-field="waste_rate"]').value) || 1.22) / 100,
          sort_order: idx,
          note: tr.querySelector('[data-field="note"]')?.value || ''
        });
      });

      if (entries.length === 0) { alert('저장할 데이터가 없습니다'); return; }

      try {
        var res = await fetch('/api/grade-production/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ division: div, machine_code: mc, entries: entries })
        });
        var result = await res.json();
        if (result.success) {
          alert('지종별 생산성 저장 완료! (' + result.count + '건)');
          loadGradeProduction();
        } else {
          alert('저장 실패: ' + (result.error || ''));
        }
      } catch(e) { alert('저장 오류: ' + e.message); }
    }
  </script>
</body>
</html>`;
}
