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
    .card-header-toggle { cursor: pointer; user-select: none; transition: background 0.15s; }
    .card-header-toggle:hover { background: #f8fafc; }
    .card-body-collapsible { transition: max-height 0.3s ease, opacity 0.2s ease; overflow: hidden; }
    .card-body-collapsed { max-height: 0 !important; opacity: 0; overflow: hidden; }
    .card-chevron { transition: transform 0.3s ease; display: inline-block; }
    .card-chevron-collapsed { transform: rotate(-90deg); }
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
          <button onclick="switchTab('dataview')" id="tab-dataview" class="pill-tab pill-tab-inactive">
            <i class="fas fa-database mr-1.5"></i>데이터 조회
          </button>
          <button onclick="switchTab('input')" id="tab-input" class="pill-tab pill-tab-inactive">
            <i class="fas fa-keyboard mr-1.5"></i>수동 입력
          </button>
          <button onclick="switchTab('simulation')" id="tab-simulation" class="pill-tab pill-tab-inactive">
            <i class="fas fa-flask mr-1.5"></i>시뮬레이션
          </button>
          <button onclick="switchTab('bom')" id="tab-bom" class="pill-tab pill-tab-inactive">
            <i class="fas fa-project-diagram mr-1.5"></i>제품-자재 매핑
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
              <option value="5" selected>5월</option>
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

      <!-- 재료비 총괄 (호기별 지종별) + 원재료 손익 통합 카드 -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between card-header-toggle" onclick="toggleCard('card-overview')">
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-chart-bar text-blue-600 mr-1.5"></i>재료비 총괄 (호기별 지종별)</h3>
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation();setOverviewFilter('ALL')" id="ov-filter-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="event.stopPropagation();setOverviewFilter('RAW')" id="ov-filter-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">원재료</button>
            <button onclick="event.stopPropagation();setOverviewFilter('SUB')" id="ov-filter-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">부재료</button>
            <i class="fas fa-chevron-down card-chevron text-gray-400 ml-2" id="card-overview-chevron"></i>
          </div>
        </div>
        <div id="card-overview" class="card-body-collapsible">
        <div class="px-5 py-3 bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <i class="fas fa-coins text-indigo-600 text-xs"></i>
              </div>
              <div>
                <div class="text-[10px] text-gray-500 leading-tight">원재료 손익 <span class="text-gray-400">(전월원단위-당월원단위)×생산량÷1,000</span></div>
                <div class="flex items-center gap-1.5">
                  <span id="overview-profit-value" class="text-lg font-bold text-gray-800">-</span>
                  <span class="text-[10px] text-gray-500">천원</span>
                </div>
              </div>
            </div>
          </div>
          <button onclick="toggleProfitDetail()" class="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium border border-indigo-200">
            <i class="fas fa-search-plus mr-1"></i>상세보기
          </button>
        </div>

        <!-- 원재료 손익 상세 테이블 (숨김 상태) -->
        <div id="profit-detail-section" class="hidden border-b border-slate-100">
          <div class="px-5 py-2.5 bg-slate-50 flex items-center justify-between">
            <h4 class="text-xs font-semibold text-gray-600"><i class="fas fa-list-alt text-indigo-400 mr-1"></i>호기별 지종별 원재료 손익 상세</h4>
            <span class="text-xs text-gray-400">단위: 천원</span>
          </div>
          <div class="overflow-x-auto max-h-[360px] overflow-y-auto">
            <table class="data-table text-xs">
              <thead class="sticky top-0 bg-white z-10">
                <tr>
                  <th class="!py-2">호기</th>
                  <th class="!py-2">지종</th>
                  <th class="!py-2 text-right">전월 원단위</th>
                  <th class="!py-2 text-right">당월 원단위</th>
                  <th class="!py-2 text-right">원단위 차이</th>
                  <th class="!py-2 text-right">생산량(당월)</th>
                  <th class="!py-2 text-right">원재료 손익(천원)</th>
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
                <th colspan="6" class="!py-1 text-center bg-blue-50 border-b border-slate-200">당월</th>
                <th colspan="6" class="!py-1 text-center bg-amber-50 border-b border-slate-200">전월</th>
                <th colspan="6" class="!py-1 text-center bg-green-50 border-b border-slate-200">예상</th>
              </tr>
              <tr>
                <th class="!py-1.5 text-right bg-blue-50">재료비(원)</th>
                <th class="!py-1.5 text-right bg-blue-50">생산량(톤)</th>
                <th class="!py-1.5 text-right bg-blue-50">호기비중(%)</th>
                <th class="!py-1.5 text-right bg-blue-50">원단위</th>
                <th class="!py-1.5 text-right bg-blue-50">재료비(억원)</th>
                <th class="!py-1.5 text-right bg-blue-50 border-r border-slate-200">전체비중(%)</th>
                <th class="!py-1.5 text-right bg-amber-50">재료비(원)</th>
                <th class="!py-1.5 text-right bg-amber-50">생산량(톤)</th>
                <th class="!py-1.5 text-right bg-amber-50">호기비중(%)</th>
                <th class="!py-1.5 text-right bg-amber-50">원단위</th>
                <th class="!py-1.5 text-right bg-amber-50">재료비(억원)</th>
                <th class="!py-1.5 text-right bg-amber-50 border-r border-slate-200">전체비중(%)</th>
                <th class="!py-1.5 text-right bg-green-50">재료비(원)</th>
                <th class="!py-1.5 text-right bg-green-50">생산량(톤)</th>
                <th class="!py-1.5 text-right bg-green-50">호기비중(%)</th>
                <th class="!py-1.5 text-right bg-green-50">원단위</th>
                <th class="!py-1.5 text-right bg-green-50">재료비(억원)</th>
                <th class="!py-1.5 text-right bg-green-50">전체비중(%)</th>
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
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-layer-group text-indigo-500 mr-1.5"></i>호기별 제품구분별 자재그룹 재료비 요약</h3>
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation();setMatCostFilter('ALL')" id="mc-filter-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="event.stopPropagation();setMatCostFilter('RAW')" id="mc-filter-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">원재료</button>
            <button onclick="event.stopPropagation();setMatCostFilter('SUB')" id="mc-filter-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">부재료</button>
            <span class="text-xs text-gray-400 ml-2">실적배부수량 x 실적단가</span>
            <i class="fas fa-chevron-down card-chevron text-gray-400 ml-2" id="card-matcost-chevron"></i>
          </div>
        </div>
        <div id="card-matcost" class="card-body-collapsible">
        <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th class="!py-2">호기</th>
                <th class="!py-2">제품구분(레벨2)</th>
                <th class="!py-2">자재그룹명</th>
                <th class="!py-2 text-right">재료비(당월)</th>
                <th class="!py-2 text-right">재료비(전월)</th>
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
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-cubes text-violet-500 mr-1.5"></i>호기별 자재그룹(대분류)별 제품구분 재료비</h3>
          <div class="flex items-center gap-2">
            <button onclick="event.stopPropagation();setMatGroupFilter('ALL')" id="mg-filter-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="event.stopPropagation();setMatGroupFilter('RAW')" id="mg-filter-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">원재료</button>
            <button onclick="event.stopPropagation();setMatGroupFilter('SUB')" id="mg-filter-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">부재료</button>
            <i class="fas fa-chevron-down card-chevron text-gray-400 ml-2" id="card-matgroup-chevron"></i>
          </div>
        </div>
        <div id="card-matgroup" class="card-body-collapsible">
        <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th class="!py-2">호기</th>
                <th class="!py-2">자재그룹(대분류)명</th>
                <th class="!py-2">제품구분(레벨2)</th>
                <th class="!py-2 text-right">재료비(당월)</th>
                <th class="!py-2 text-right">재료비(전월)</th>
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
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-industry text-emerald-500 mr-1.5"></i>호기별 제품구분별 총생산량 합계</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">제품 레벨4 기준 중복제거 합산</span>
            <i class="fas fa-chevron-down card-chevron text-gray-400 ml-2" id="card-production-chevron"></i>
          </div>
        </div>
        <div id="card-production" class="card-body-collapsible">
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
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-chart-line text-teal-500 mr-1.5"></i>생산량 분석 (호기별 지종별)</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">당월 / 전월 비교 · 총생산량, 생산수량, 폐품수량</span>
            <i class="fas fa-chevron-down card-chevron text-gray-400 ml-2" id="card-prodanalysis-chevron"></i>
          </div>
        </div>
        <div id="card-prodanalysis" class="card-body-collapsible">
        <div class="overflow-x-auto">
          <table class="data-table text-xs" id="prod-analysis-table">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th rowspan="2" class="!py-2 text-center border-r border-slate-200">행 레이블</th>
                <th colspan="3" class="!py-1 text-center bg-blue-50 border-b border-slate-200">당월</th>
                <th colspan="3" class="!py-1 text-center bg-amber-50 border-b border-slate-200">전월</th>
                <th colspan="3" class="!py-1 text-center bg-green-50 border-b border-slate-200">증감</th>
              </tr>
              <tr>
                <th class="!py-1.5 text-right bg-blue-50">총생산량</th>
                <th class="!py-1.5 text-right bg-blue-50">생산수량</th>
                <th class="!py-1.5 text-right bg-blue-50 border-r border-slate-200">폐품수량</th>
                <th class="!py-1.5 text-right bg-amber-50">총생산량</th>
                <th class="!py-1.5 text-right bg-amber-50">생산수량</th>
                <th class="!py-1.5 text-right bg-amber-50 border-r border-slate-200">폐품수량</th>
                <th class="!py-1.5 text-right bg-green-50">총생산량</th>
                <th class="!py-1.5 text-right bg-green-50">생산수량</th>
                <th class="!py-1.5 text-right bg-green-50">폐품수량</th>
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
          <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-random text-purple-500 mr-1.5"></i>믹스 효과 분석 (호기 믹스 + 지종 믹스)</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">단위: 원단위차이(원/톤), 수량차이(톤), 금액효과(천원)</span>
            <i class="fas fa-chevron-down card-chevron text-gray-400 ml-2" id="card-mixeffect-chevron"></i>
          </div>
        </div>
        <div id="card-mixeffect" class="card-body-collapsible">
        <div class="overflow-x-auto">
          <table class="data-table text-xs" id="mix-effect-table">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th rowspan="2" class="!py-2 text-center border-r border-slate-200 w-24">구분</th>
                <th colspan="3" class="!py-1 text-center bg-indigo-50 border-b border-slate-200">당월(전월 2호기 미생산)</th>
                <th colspan="3" class="!py-1 text-center bg-blue-50 border-b border-slate-200">당월</th>
                <th colspan="3" class="!py-1 text-center bg-green-50 border-b border-slate-200">예상</th>
              </tr>
              <tr>
                <th class="!py-1.5 text-right bg-indigo-50 w-20">원단위차이</th>
                <th class="!py-1.5 text-right bg-indigo-50 w-20">수량차이</th>
                <th class="!py-1.5 text-right bg-indigo-50 w-20 border-r border-slate-200">금액효과</th>
                <th class="!py-1.5 text-right bg-blue-50 w-20">원단위차이</th>
                <th class="!py-1.5 text-right bg-blue-50 w-20">수량차이</th>
                <th class="!py-1.5 text-right bg-blue-50 w-20 border-r border-slate-200">금액효과</th>
                <th class="!py-1.5 text-right bg-green-50 w-20">원단위차이</th>
                <th class="!py-1.5 text-right bg-green-50 w-20">수량차이</th>
                <th class="!py-1.5 text-right bg-green-50 w-20">금액효과</th>
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
          <p class="text-xs text-gray-400 mt-2">.xlsx, .xls, .csv 파일 지원 | SAP 형식 자동 감지</p>
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
          <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">지원 형식</h4>
          
          <div class="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-bold">SAP 형식</span>
              <span class="text-xs text-purple-600 font-medium">자동 감지</span>
            </div>
            <p class="text-xs text-gray-600 mb-2">SAP에서 추출한 원재료 DB 파일을 그대로 업로드하면 자동으로 인식합니다.</p>
            <div class="text-xs text-gray-500 space-y-1">
              <p><b>필수 컬럼:</b> 달력연도/월, 생산호기, 자재, 출고수량, 실제단가, 출고금액</p>
              <p><b>자동 처리:</b> 신규 자재 자동 등록 | 동일 호기/자재/월 데이터 합산 | 단가 재계산</p>
            </div>
          </div>
          
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">기본 형식</span>
              <span class="text-xs text-blue-600 font-medium">'양식 다운로드' 참고</span>
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
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">호기코드</td><td class="text-gray-500">호기 코드</td><td class="text-gray-400">PM2, PM3</td><td><span class="text-red-500">*</span></td></tr>
                  <tr class="border-b border-gray-100"><td class="py-2 font-mono text-primary-600">자재코드</td><td class="text-gray-500">자재 코드</td><td class="text-gray-400">RM-001</td><td><span class="text-red-500">*</span></td></tr>
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
    </div>

    <!-- Data View Tab (업로드된 데이터 조회) -->
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
            <input type="text" id="dv-search" placeholder="자재명 검색..." class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-32" onkeyup="if(event.key==='Enter')loadDataView()">
            <button onclick="loadDataView()" class="btn-primary text-xs !py-1.5 !px-3"><i class="fas fa-search mr-1"></i>조회</button>
            <button onclick="exportDataViewCSV()" class="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-green-100 transition">
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
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <p class="text-[10px] text-gray-400 mb-0.5">총 출고수량</p>
            <p class="text-lg font-bold text-blue-700 stat-value" id="dv-total-qty">-</p>
          </div>
          <div class="bg-purple-50 rounded-xl p-3 text-center">
            <p class="text-[10px] text-gray-400 mb-0.5">총 출고금액</p>
            <p class="text-lg font-bold text-purple-700 stat-value" id="dv-total-cost">-</p>
          </div>
          <div class="bg-emerald-50 rounded-xl p-3 text-center">
            <p class="text-[10px] text-gray-400 mb-0.5">자재 종류</p>
            <p class="text-lg font-bold text-emerald-700 stat-value" id="dv-mat-count">-</p>
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

      <!-- 매핑 INDEX 기준정보 -->
      <div class="card p-6 mt-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-database text-indigo-500 mr-1.5"></i>매핑 INDEX 기준정보</h3>
            <p class="text-xs text-gray-400 mt-0.5">제지/화장지 제품분류 및 원부재료 분류 매핑 기준을 관리합니다.</p>
          </div>
        </div>
        <!-- Sub tabs for master index -->
        <div class="flex flex-wrap gap-1 mb-4 border-b border-slate-200 pb-3">
          <button onclick="switchMasterIdx('material-mapping')" id="midx-tab-material-mapping" class="pill-tab pill-tab-active text-xs !px-3 !py-1.5"><i class="fas fa-link mr-1"></i>자재구분 매핑</button>
          <button onclick="switchMasterIdx('paper-products')" id="midx-tab-paper-products" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">제지 제품분류</button>
          <button onclick="switchMasterIdx('paper-raw')" id="midx-tab-paper-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">제지 원재료</button>
          <button onclick="switchMasterIdx('paper-sub')" id="midx-tab-paper-sub" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">제지 부재료</button>
          <button onclick="switchMasterIdx('tissue-products')" id="midx-tab-tissue-products" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">화장지 제품</button>
          <button onclick="switchMasterIdx('tissue-raw')" id="midx-tab-tissue-raw" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1.5">화장지 원재료</button>
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
              <button onclick="addMasterRow('paper-products')" class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
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
              <button onclick="addMasterRow('paper-raw')" class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
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
              <button onclick="addMasterRow('paper-sub')" class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
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
              <button onclick="addMasterRow('tissue-products')" class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
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
              <button onclick="addMasterRow('tissue-raw')" class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100"><i class="fas fa-plus mr-1"></i>행 추가</button>
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
      <div class="card p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-sm font-semibold text-gray-700">생산량 기반 원가 시뮬레이션</h3>
            <p class="text-xs text-gray-400 mt-1">제품별 생산량을 입력하면 BOM 기반으로 원부자재 소요량과 예상 원가를 자동 산출합니다.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">단가 기준월:</span>
            <select id="sim-base-year" class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
              <option value="2026">2026</option>
            </select>
            <select id="sim-base-month" class="border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
              <option value="6">6월</option>
              <option value="5">5월</option>
            </select>
          </div>
        </div>

        <!-- Product Plans Input -->
        <div class="bg-slate-50 rounded-xl p-5 mb-5">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide">제품별 계획 생산량 (ton)</h4>
            <button onclick="addSimProduct()" class="text-xs text-primary-600 hover:text-primary-700 font-medium"><i class="fas fa-plus mr-1"></i>제품 추가</button>
          </div>
          <div id="sim-plans" class="space-y-2"></div>
          <div class="mt-4 flex gap-2">
            <button onclick="runSimulation()" class="btn-primary"><i class="fas fa-play mr-1.5"></i>시뮬레이션 실행</button>
            <button onclick="saveSimulation()" id="btn-save-sim" class="hidden px-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"><i class="fas fa-save mr-1"></i>결과 저장</button>
          </div>
        </div>
      </div>

      <!-- Simulation Results -->
      <div id="sim-results" class="hidden space-y-5">
        <!-- Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="summary-card" style="border-color:#c7d2fe; background:linear-gradient(135deg,#eef2ff,#e0e7ff)">
            <p class="text-[10px] font-medium text-primary-500 uppercase">예상 총원가</p>
            <p id="sim-total-cost" class="text-lg font-bold text-gray-900 mt-2 stat-value">-</p>
          </div>
          <div class="summary-card" style="border-color:#e2e8f0">
            <p class="text-[10px] font-medium text-gray-400 uppercase">전월 대비</p>
            <p id="sim-cost-diff" class="text-lg font-bold mt-2 stat-value">-</p>
          </div>
          <div class="summary-card" style="border-color:#bfdbfe; background:linear-gradient(135deg,#eff6ff,#dbeafe)">
            <p class="text-[10px] font-medium text-blue-500 uppercase">수량효과</p>
            <p id="sim-qty-effect" class="text-lg font-bold mt-2 stat-value">-</p>
          </div>
          <div class="summary-card" style="border-color:#fde68a; background:linear-gradient(135deg,#fffbeb,#fef3c7)">
            <p class="text-[10px] font-medium text-amber-600 uppercase">단가효과</p>
            <p id="sim-price-effect" class="text-lg font-bold mt-2 stat-value">-</p>
          </div>
        </div>

        <!-- Product-level results -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h3 class="text-sm font-semibold text-gray-700">제품별 시뮬레이션 결과</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table">
              <thead><tr>
                <th>호기</th><th>제품</th><th class="text-right">계획생산량</th>
                <th class="text-right">예상원가</th><th class="text-right">전월원가</th>
                <th class="text-right">차이</th><th class="text-right">증감률</th>
              </tr></thead>
              <tbody id="sim-product-body"></tbody>
            </table>
          </div>
        </div>

        <!-- Material-level detail -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h3 class="text-sm font-semibold text-gray-700">자재별 상세 (시뮬레이션 vs 전월)</h3>
          </div>
          <div class="overflow-x-auto max-h-[400px]">
            <table class="data-table">
              <thead><tr>
                <th>제품</th><th>구분</th><th>자재명</th><th class="text-right">원단위</th>
                <th class="text-right">예상소요량</th><th class="text-right">적용단가</th><th class="text-right">예상원가</th>
                <th class="text-right">전월소요량</th><th class="text-right">전월원가</th>
                <th class="text-right">수량효과</th><th class="text-right">단가효과</th><th class="text-right">차이</th>
              </tr></thead>
              <tbody id="sim-detail-body"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Simulation History -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h3 class="text-sm font-semibold text-gray-700">시뮬레이션 이력</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>이름</th><th>기준월</th><th>생성자</th><th>생성일시</th><th class="text-center">작업</th></tr></thead>
            <tbody id="sim-history-body"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- BOM Tab (제품-자재 매핑) -->
    <div id="content-bom" class="hidden fade-in space-y-5">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-sm font-semibold text-gray-700">제품-자재 매핑 (BOM)</h3>
            <p class="text-xs text-gray-400 mt-1">제품 1ton 생산에 필요한 원부자재 원단위를 관리합니다.</p>
          </div>
          <button onclick="document.getElementById('product-form').classList.toggle('hidden')" class="btn-primary text-xs !py-1.5 !px-3">
            <i class="fas fa-plus mr-1"></i>제품 등록
          </button>
        </div>

        <!-- Product Registration -->
        <form id="product-form" class="hidden mb-5 p-4 bg-slate-50 rounded-xl">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input type="text" id="new-prd-code" placeholder="제품코드" class="border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
            <input type="text" id="new-prd-name" placeholder="제품명" class="border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
            <select id="new-prd-unit" class="border border-gray-200 rounded-lg px-3 py-2 text-sm"></select>
            <input type="text" id="new-prd-uom" placeholder="단위" value="ton" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <button type="submit" class="btn-primary">등록</button>
          </div>
        </form>

        <!-- Product List with BOM -->
        <div id="products-bom-container" class="space-y-4"></div>
      </div>
    </div>
  </main>

  <script>
    let analysisData = null, unitSummaryData = null, unitsCache = [], materialsCache = [];
    let productsCache = [], simResultData = null;
    let unitChartInstance = null, effectChartInstance = null, currentUnitFilter = '', uploadData = [];

    document.addEventListener('DOMContentLoaded', async () => {
      await loadMasterData();
      await loadAnalysis();
    });

    function switchTab(tab) {
      ['dashboard','detail','upload','dataview','input','master','simulation','bom'].forEach(t => {
        document.getElementById('content-' + t)?.classList.add('hidden');
        const el = document.getElementById('tab-' + t);
        if (el) { el.classList.remove('pill-tab-active'); el.classList.add('pill-tab-inactive'); }
      });
      document.getElementById('content-' + tab)?.classList.remove('hidden');
      const a = document.getElementById('tab-' + tab);
      if (a) { a.classList.add('pill-tab-active'); a.classList.remove('pill-tab-inactive'); }
      if (tab === 'input') loadRecentRecords();
      if (tab === 'master') { loadUnitsList(); loadMaterialsList(); loadProductionList(); loadMasterIdx(currentMidxTab); }
      if (tab === 'simulation') { loadSimProducts(); loadSimHistory(); }
      if (tab === 'bom') { loadProductsBom(); }
      if (tab === 'dataview') { initDataView(); }
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
      document.getElementById('input-unit').innerHTML = u.map(x=>'<option value="'+x.id+'">'+x.unit_name+' ('+x.unit_code+')</option>').join('');
      document.getElementById('input-material').innerHTML = m.map(x=>'<option value="'+x.id+'">'+(x.category==='RAW'?'[원]':'[부]')+' '+x.material_name+'</option>').join('');
      document.getElementById('prod-unit').innerHTML = u.map(x=>'<option value="'+x.id+'">'+x.unit_name+'</option>').join('');
      document.getElementById('new-prd-unit').innerHTML = u.map(x=>'<option value="'+x.id+'">'+x.unit_name+'</option>').join('');
    }

    // ============ 매핑 INDEX 기준정보 ============
    let currentMidxTab = 'material-mapping';

    function switchMasterIdx(tab) {
      currentMidxTab = tab;
      document.querySelectorAll('.midx-section').forEach(el => el.classList.add('hidden'));
      document.getElementById('midx-' + tab).classList.remove('hidden');
      ['material-mapping','paper-products','paper-raw','paper-sub','tissue-products','tissue-raw'].forEach(t => {
        const btn = document.getElementById('midx-tab-' + t);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(t === tab ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      if (tab === 'material-mapping') {
        loadMaterialMapping('all');
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
          ? '<span class="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">\uc6d0\uc7ac\ub8cc</span>'
          : '<span class="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">\ubd80\uc7ac\ub8cc</span>';
        var groupCell = d.mapped_group
          ? '<span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium">' + d.mapped_group + '</span>'
          : '<button onclick="assignMaterialGroup(' + i + ')" class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] hover:bg-indigo-50 hover:text-indigo-600 transition"><i class="fas fa-plus mr-0.5"></i>\ud560\ub2f9</button>';
        var sourceCell = d.mapping_source || '<span class="text-gray-300">-</span>';
        return '<tr class="hover:bg-blue-50/30' + (d.mapped_group ? '' : ' bg-red-50/20') + '">' +
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
          '<tr class="hover:bg-blue-50/30">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5">'+d.product_hierarchy_level3+'</td>' +
          '<td class="!py-1.5 font-mono">'+d.grade_code+'</td>' +
          '<td class="!py-1.5 font-semibold">'+d.grade_name+'</td>' +
          '<td class="!py-1.5 text-gray-600">'+(d.grade_detail||'-')+'</td>' +
          '<td class="!py-1.5"><button onclick="deleteMasterRow(&quot;paper-products&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      } else if (tab === 'paper-raw') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-blue-50/30">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5">'+(d.category1||'-')+'</td>' +
          '<td class="!py-1.5">'+d.material_class+'</td>' +
          '<td class="!py-1.5">'+d.material_subclass+'</td>' +
          '<td class="!py-1.5 font-mono">'+d.material_code+'</td>' +
          '<td class="!py-1.5">'+d.material_name+'</td>' +
          '<td class="!py-1.5"><span class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">'+d.material_group+'</span></td>' +
          '<td class="!py-1.5"><button onclick="deleteMasterRow(&quot;paper-raw&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      } else if (tab === 'paper-sub') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-blue-50/30">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5 font-mono">'+d.material_code+'</td>' +
          '<td class="!py-1.5">'+d.material_name+'</td>' +
          '<td class="!py-1.5"><span class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">'+d.material_group+'</span></td>' +
          '<td class="!py-1.5"><button onclick="deleteMasterRow(&quot;paper-sub&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      } else if (tab === 'tissue-products') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-blue-50/30">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5"><span class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px]">'+d.category+'</span></td>' +
          '<td class="!py-1.5">'+d.product_name+'</td>' +
          '<td class="!py-1.5"><button onclick="deleteMasterRow(&quot;tissue-products&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      } else if (tab === 'tissue-raw') {
        tbody.innerHTML = data.map((d, i) =>
          '<tr class="hover:bg-blue-50/30">' +
          '<td class="!py-1.5 text-gray-400">'+(i+1)+'</td>' +
          '<td class="!py-1.5"><span class="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">'+d.category+'</span></td>' +
          '<td class="!py-1.5 font-mono">'+d.material_code+'</td>' +
          '<td class="!py-1.5">'+d.material_name+'</td>' +
          '<td class="!py-1.5"><button onclick="deleteMasterRow(&quot;tissue-raw&quot;,'+d.id+')" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button></td>' +
          '</tr>'
        ).join('');
      }
    }

    async function deleteMasterRow(tab, id) {
      if (!confirm('\uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?')) return;
      await fetch('/api/master/' + tab + '/' + id, { method: 'DELETE' });
      loadMasterIdx(tab);
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

    async function loadAnalysis() {
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value;
      const ym = year + month.padStart(2, '0');
      const params = new URLSearchParams({ year, month });
      if (currentUnitFilter) params.set('unit_id', currentUnitFilter);
      const [comp, summary] = await Promise.all([
        fetch('/api/analysis/comparison?'+params).then(r=>r.json()),
        fetch('/api/analysis/unit-summary?'+new URLSearchParams({year,month})).then(r=>r.json())
      ]);
      analysisData = comp; unitSummaryData = summary;
      document.getElementById('period-label').textContent = comp.summary?.period ? comp.summary.period.previous + ' vs ' + comp.summary.period.current : '';
      renderDashboard(); renderDetailTable();
      loadDashboardSummary(ym);
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

    let matCostCategoryFilter = 'ALL';
    let matGroupCategoryFilter = 'ALL';
    let overviewCategoryFilter = 'ALL';

    async function loadDashboardSummary(ym) {
      const [matCost, prodSummary, matGroup, overview, prodAnalysis, mixEffect] = await Promise.all([
        fetch('/api/dashboard/material-cost-summary?ym=' + ym + (matCostCategoryFilter !== 'ALL' ? '&category=' + matCostCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/production-summary?ym=' + ym).then(r => r.json()),
        fetch('/api/dashboard/material-by-group?ym=' + ym + (matGroupCategoryFilter !== 'ALL' ? '&category=' + matGroupCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/material-overview?ym=' + ym + (overviewCategoryFilter !== 'ALL' ? '&category=' + overviewCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/production-analysis?ym=' + ym).then(r => r.json()),
        fetch('/api/dashboard/mix-effect?ym=' + ym).then(r => r.json())
      ]);
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
      fetch('/api/dashboard/material-overview?ym=' + ym + (filter !== 'ALL' ? '&category=' + filter : ''))
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
        const chipClass = mc === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
        const mCurUnit = mCurProd > 0 ? Math.round(mCurCost / mCurProd) : 0;
        const mPrevUnit = mPrevProd > 0 ? Math.round(mPrevCost / mPrevProd) : 0;
        const mEstUnit = mEstProd > 0 ? Math.round(mEstCost / mEstProd) : 0;
        return '<tr class="bg-slate-100 font-semibold border-b-2 border-slate-300">' +
          '<td class="!py-1.5 border-r border-slate-200"><span class="unit-chip '+chipClass+'">'+mc+'</span></td>' +
          '<td class="!py-1.5 border-r border-slate-200">\uc694\uc57d</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mCurCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mCurProd)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">100.0</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mCurUnit)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+eok(mCurCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">'+(grandCurCost>0?pct(mCurCost/grandCurCost*100):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mPrevCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mPrevProd)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">100.0</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(mPrevUnit)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+eok(mPrevCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">'+(grandPrevCost>0?pct(mPrevCost/grandPrevCost*100):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
        const mc = d.machine_code;

        // 호기비중: 해당 지종 생산량 / 호기 총생산량 * 100
        const curMachWeight = machineProd[mc] > 0 ? (curProd / machineProd[mc] * 100) : 0;
        const prevMachWeight = machinePrevProd[mc] > 0 ? (prevProd / machinePrevProd[mc] * 100) : 0;
        // 원단위: 재료비 / 생산량
        const curUnit = curProd > 0 ? Math.round(curCost / curProd) : 0;
        const prevUnit = prevProd > 0 ? Math.round(prevCost / prevProd) : 0;
        // 전체비중: 해당 지종 재료비 / 전체 재료비 * 100
        const curTotalWeight = grandCurCost > 0 ? (curCost / grandCurCost * 100) : 0;
        const prevTotalWeight = grandPrevCost > 0 ? (prevCost / grandPrevCost * 100) : 0;

        rows.push('<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-blue-50/30">' +
          '<td class="!py-1.5 border-r border-slate-200"><span class="unit-chip '+chipClass+'">'+(d.machine_code||'')+'</span></td>' +
          '<td class="!py-1.5 border-r border-slate-200">'+(d.product_level2_name||'-')+'</td>' +
          // 당월
          '<td class="!py-1.5 text-right font-mono">'+fmt(curCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(curProd)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+pct(curMachWeight)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(curUnit)+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+eok(curCost)+'</td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">'+pct(curTotalWeight)+'</td>' +
          // 전월
          '<td class="!py-1.5 text-right font-mono">'+(prevCost?fmt(prevCost):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevProd?fmt(prevProd):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevMachWeight?pct(prevMachWeight):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevUnit?fmt(prevUnit):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevCost?eok(prevCost):'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200">'+(prevTotalWeight?pct(prevTotalWeight):'-')+'</td>' +
          // 예상 (공란)
          '<td class="!py-1.5 text-right font-mono text-gray-300">-</td>' +
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
      const grandCurUnit = grandCurProd > 0 ? Math.round(grandCurCost / grandCurProd) : 0;
      const grandPrevUnit = grandPrevProd > 0 ? Math.round(grandPrevCost / grandPrevProd) : 0;
      tfoot.innerHTML = '<tr>' +
        '<td colspan="2" class="!py-2 text-center border-r border-slate-200 font-bold">\ucd1d\ud569\uacc4</td>' +
        '<td class="!py-2 text-right font-mono">'+fmt(grandCurCost)+'</td>' +
        '<td class="!py-2 text-right font-mono">'+fmt(grandCurProd)+'</td>' +
        '<td class="!py-2 text-right font-mono">100.0</td>' +
        '<td class="!py-2 text-right font-mono">'+fmt(grandCurUnit)+'</td>' +
        '<td class="!py-2 text-right font-mono">'+eok(grandCurCost)+'</td>' +
        '<td class="!py-2 text-right font-mono border-r border-slate-200">100.0</td>' +
        '<td class="!py-2 text-right font-mono">'+fmt(grandPrevCost)+'</td>' +
        '<td class="!py-2 text-right font-mono">'+fmt(grandPrevProd)+'</td>' +
        '<td class="!py-2 text-right font-mono">100.0</td>' +
        '<td class="!py-2 text-right font-mono">'+fmt(grandPrevUnit)+'</td>' +
        '<td class="!py-2 text-right font-mono">'+eok(grandPrevCost)+'</td>' +
        '<td class="!py-2 text-right font-mono border-r border-slate-200">100.0</td>' +
        '<td class="!py-2 text-right font-mono text-gray-300">-</td>' +
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
      // 원재료 손익 = (전월원단위 - 당월원단위) * 생산량(당월) / 1000
      // 원단위 = 재료비 / 생산량
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
        const n = Math.round(Number(v) || 0);
        if (n === 0) return '<td class="!py-1.5 text-right font-mono text-gray-400">-</td>';
        if (n < 0) return '<td class="!py-1.5 text-right font-mono text-red-600">' + String.fromCharCode(9651) + Math.abs(n).toLocaleString() + '</td>';
        return '<td class="!py-1.5 text-right font-mono text-blue-700">' + n.toLocaleString() + '</td>';
      };
      const profitCell = (v) => {
        const n = Math.round(Number(v) || 0);
        if (n === 0) return '<td class="!py-1.5 text-right font-mono text-gray-400 font-semibold">-</td>';
        if (n < 0) return '<td class="!py-1.5 text-right font-mono text-red-600 font-semibold">' + String.fromCharCode(9651) + Math.abs(n).toLocaleString() + '</td>';
        return '<td class="!py-1.5 text-right font-mono text-blue-700 font-semibold">' + n.toLocaleString() + '</td>';
      };

      let grandProfit = 0;
      let prevMachine = '';
      let mProfit = 0, mPrevUnit = 0, mCurUnit = 0, mProd = 0, mCost = 0, mPrevCost = 0;
      const rows = [];

      const subtotalRow = (mc) => {
        const chipClass = mc === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
        const n = Math.round(mProfit);
        const cls = n < 0 ? 'text-red-600' : (n > 0 ? 'text-blue-700' : 'text-gray-400');
        const val = n === 0 ? '-' : (n < 0 ? String.fromCharCode(9651) + Math.abs(n).toLocaleString() : n.toLocaleString());
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

        const curUnit = curProd > 0 ? curCost / curProd : 0;
        const prevUnit = prevProd > 0 ? prevCost / prevProd : 0;
        // 원재료 손익 = (전월원단위 - 당월원단위) * 생산량(당월) / 1000
        const profit = (prevUnit - curUnit) * curProd / 1000;

        if (prevMachine && d.machine_code !== prevMachine) {
          rows.push(subtotalRow(prevMachine));
          mProfit = 0; mProd = 0;
        }
        mProfit += profit;
        mProd += curProd;
        grandProfit += profit;

        const machineChanged = d.machine_code !== prevMachine;
        prevMachine = d.machine_code;
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';

        rows.push('<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-blue-50/30">' +
          '<td class="!py-1.5"><span class="unit-chip '+chipClass+'">'+(d.machine_code||'')+'</span></td>' +
          '<td class="!py-1.5">'+(d.product_level2_name||'-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+(prevUnit ? fmt(Math.round(prevUnit)) : '-')+'</td>' +
          '<td class="!py-1.5 text-right font-mono">'+fmt(Math.round(curUnit))+'</td>' +
          diffCell(Math.round(prevUnit - curUnit)) +
          '<td class="!py-1.5 text-right font-mono">'+fmt(curProd)+'</td>' +
          profitCell(profit) +
          '</tr>');
      });
      if (prevMachine) rows.push(subtotalRow(prevMachine));
      tbody.innerHTML = rows.join('');

      // 총합계 tfoot
      const gn = Math.round(grandProfit);
      const gCls = gn < 0 ? 'text-red-600' : (gn > 0 ? 'text-blue-700' : 'text-gray-400');
      const gVal = gn === 0 ? '-' : (gn < 0 ? String.fromCharCode(9651) + Math.abs(gn).toLocaleString() : gn.toLocaleString());
      tfoot.innerHTML = '<tr>' +
        '<td colspan="5" class="!py-2 text-center font-bold">\ucd1d\ud569\uacc4</td>' +
        '<td class="!py-2 text-right font-mono">-</td>' +
        '<td class="!py-2 text-right font-mono '+gCls+' font-bold">'+gVal+'</td>' +
        '</tr>';

      // 상단 카드 값 업데이트
      profitEl.textContent = gn === 0 ? '-' : (gn < 0 ? String.fromCharCode(9651) + Math.abs(gn).toLocaleString() : gn.toLocaleString());
      profitEl.className = 'text-2xl font-bold ' + (gn < 0 ? 'text-red-600' : (gn > 0 ? 'text-blue-700' : 'text-gray-800'));
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
      fetch('/api/dashboard/material-cost-summary?ym=' + ym + (filter !== 'ALL' ? '&category=' + filter : ''))
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
      // #,##0 ;[빨강]△#,##0 ; -
      const diffFmt = (v) => {
        const n = Math.round(Number(v) || 0);
        if (n === 0) return '-';
        if (n < 0) return String.fromCharCode(9651) + Math.abs(n).toLocaleString();
        return n.toLocaleString();
      };
      const diffCell = (v) => {
        const n = Math.round(Number(v) || 0);
        if (n === 0) return '<td class="!py-1.5 text-right font-mono text-gray-400">-</td>';
        if (n < 0) return '<td class="!py-1.5 text-right font-mono text-red-600">' + String.fromCharCode(9651) + Math.abs(n).toLocaleString() + '</td>';
        return '<td class="!py-1.5 text-right font-mono">' + n.toLocaleString() + '</td>';
      };
      let totalCur = 0, totalPrev = 0, totalUsage = 0, totalPrice = 0, totalRows = 0;
      let prevMachine = '';
      let mCur = 0, mPrev = 0, mUsage = 0, mPrice = 0, mRows = 0;
      const rows = [];
      const subtotalRow = (mc) => {
        const chipClass = mc === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
        const dEl = (v) => { const n=Math.round(v); if(n===0) return '<td class="!py-1.5 text-right font-mono text-gray-400">-</td>'; if(n<0) return '<td class="!py-1.5 text-right font-mono text-red-600">'+String.fromCharCode(9651)+Math.abs(n).toLocaleString()+'</td>'; return '<td class="!py-1.5 text-right font-mono">'+n.toLocaleString()+'</td>'; };
        return '<tr class="bg-slate-100 font-semibold">' +
          '<td class="!py-1.5"><span class="unit-chip '+chipClass+'">'+mc+'</span></td>' +
          '<td class="!py-1.5" colspan="2">소계</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmt(mCur) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + (mPrev ? fmt(mPrev) : '-') + '</td>' +
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
        rows.push('<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-blue-50/30">' +
          '<td class="!py-1.5"><span class="unit-chip ' + chipClass + '">' + (d.machine_code||'') + '</span></td>' +
          '<td class="!py-1.5">' + (d.product_level2_name||'-') + '</td>' +
          '<td class="!py-1.5">' + (d.material_group_name||'-') + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold">' + fmt(curCost) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-500">' + (prevCost ? fmt(prevCost) : '-') + '</td>' +
          diffCell(diff) +
          diffCell(usageDiff) +
          diffCell(priceDiff) +
          '<td class="!py-1.5 text-right text-gray-400">' + (d.row_count||'') + '</td>' +
          '</tr>');
      });
      if (prevMachine) rows.push(subtotalRow(prevMachine));
      tbody.innerHTML = rows.join('');
      document.getElementById('dash-matcost-total-cur').textContent = fmt(totalCur);
      document.getElementById('dash-matcost-total-prev').textContent = fmt(totalPrev);
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
        return '<tr class="' + (machineChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-blue-50/30">' +
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
        if (n > 0) return '<span class="text-blue-600">+' + Math.round(n).toLocaleString() + '</span>';
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
          '<td class="!py-2"><span class="unit-chip ' + (mc === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3') + '">' + mc + '</span></td>' +
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
          html += '<tr class="hover:bg-blue-50/30">' +
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
      if (!data || !data.scenario1) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-400 py-8">\ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</td></tr>';
        return;
      }
      var delta = String.fromCharCode(9651);
      var fmtV = function(v) {
        var n = Number(v) || 0;
        if (Math.abs(n) < 0.05) return '<span class="text-gray-400"> - </span>';
        if (n < 0) return '<span class="text-red-600">' + delta + Math.abs(n).toFixed(1) + '</span>';
        return '<span class="text-blue-700">' + n.toFixed(1) + '</span>';
      };

      var s1 = data.scenario1;
      var s2 = data.scenario2;
      var s3 = data.scenario3;
      var html = '';

      // 호기 믹스 헤더행
      html += '<tr class="bg-purple-50/50 border-t-2 border-purple-200">' +
        '<td class="!py-2 font-bold text-purple-800"><i class="fas fa-exchange-alt mr-1 text-purple-500"></i>\ud638\uae30 \ubbf9\uc2a4</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtV(s1.machineMix[0]?.col1) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtV(s1.machineMix[0]?.col2) + '</td>' +
        '<td class="!py-2 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(s1.machineMix[0]?.col3) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtV(s2.machineMix[0]?.col1) + '</td>' +
        '<td class="!py-2 text-right font-mono">' + fmtV(s2.machineMix[0]?.col2) + '</td>' +
        '<td class="!py-2 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(s2.machineMix[0]?.col3) + '</td>' +
        '<td class="!py-2 text-right font-mono text-gray-400"> - </td>' +
        '<td class="!py-2 text-right font-mono text-gray-400"> - </td>' +
        '<td class="!py-2 text-right font-mono text-gray-400"> - </td>' +
        '</tr>';

      // 호기 믹스 PM3행 (시나리오2에만)
      if (s2.machineMix.length > 1) {
        html += '<tr class="bg-purple-50/30">' +
          '<td class="!py-1.5 pl-6 text-gray-500 text-[11px]"></td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono border-r border-slate-200 text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(s2.machineMix[1]?.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(s2.machineMix[1]?.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(s2.machineMix[1]?.col3) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '</tr>';
      }

      // 지종 믹스 헤더행
      html += '<tr class="bg-teal-50/50 border-t-2 border-teal-200">' +
        '<td class="!py-2 font-bold text-teal-800"><i class="fas fa-sitemap mr-1 text-teal-500"></i>\uc9c0\uc885 \ubbf9\uc2a4</td>' +
        '<td colspan="3" class="!py-2 border-r border-slate-200"></td>' +
        '<td colspan="3" class="!py-2 border-r border-slate-200"></td>' +
        '<td colspan="3" class="!py-2"></td>' +
        '</tr>';

      // PM2 지종 믹스
      var s1pm2 = s1.gradeMix.PM2 || [];
      var s2pm2 = s2.gradeMix.PM2 || [];
      var pm2Types = data.pm2Types || [];
      pm2Types.forEach(function(pt, i) {
        var r1 = s1pm2[i] || { col1:0, col2:0, col3:0 };
        var r2 = s2pm2[i] || { col1:0, col2:0, col3:0 };
        html += '<tr class="hover:bg-blue-50/30">' +
          '<td class="!py-1.5 pl-4 text-[11px]"><span class="text-gray-400 mr-1">PM2</span>' + pt + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r1.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r1.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(r1.col3) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(r2.col3) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '</tr>';
      });

      // PM2 소계
      var s1pm2Sum = s1pm2.reduce(function(a,b){ return a + (b.col3||0); }, 0);
      var s2pm2Sum = s2pm2.reduce(function(a,b){ return a + (b.col3||0); }, 0);
      html += '<tr class="bg-slate-50 font-semibold border-t border-slate-200">' +
        '<td class="!py-1.5 pl-4 text-[11px] text-gray-600">PM2 \uc18c\uacc4</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmtV(s1pm2Sum) + '</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmtV(s2pm2Sum) + '</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
        '</tr>';

      // PM3 지종 믹스
      var s1pm3 = s1.gradeMix.PM3 || [];
      var s2pm3 = s2.gradeMix.PM3 || [];
      var pm3Types = data.pm3Types || [];
      pm3Types.forEach(function(pt, i) {
        var r1 = s1pm3[i] || { col1:0, col2:0, col3:0 };
        var r2 = s2pm3[i] || { col1:0, col2:0, col3:0 };
        html += '<tr class="hover:bg-blue-50/30">' +
          '<td class="!py-1.5 pl-4 text-[11px]"><span class="text-gray-400 mr-1">PM3</span>' + pt + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r1.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r1.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(r1.col3) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(r2.col3) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
          '</tr>';
      });

      // PM3 소계
      var s1pm3Sum = s1pm3.reduce(function(a,b){ return a + (b.col3||0); }, 0);
      var s2pm3Sum = s2pm3.reduce(function(a,b){ return a + (b.col3||0); }, 0);
      html += '<tr class="bg-slate-50 font-semibold border-t border-slate-200">' +
        '<td class="!py-1.5 pl-4 text-[11px] text-gray-600">PM3 \uc18c\uacc4</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmtV(s1pm3Sum) + '</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmtV(s2pm3Sum) + '</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono text-gray-400"> - </td>' +
        '</tr>';

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
      fetch('/api/dashboard/material-by-group?ym=' + ym + (filter !== 'ALL' ? '&category=' + filter : ''))
        .then(r => r.json())
        .then(data => renderMatGroupSummary(data));
    }

    function renderMatGroupSummary(data) {
      const tbody = document.getElementById('dash-matgroup-body');
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-400 py-8">데이터가 없습니다.</td></tr>';
        return;
      }
      const fmt = (v) => v != null ? Math.round(Number(v)).toLocaleString() : '-';
      const diffFmt2 = (v) => {
        const n = Math.round(Number(v) || 0);
        if (n === 0) return '-';
        if (n < 0) return String.fromCharCode(9651) + Math.abs(n).toLocaleString();
        return n.toLocaleString();
      };
      const diffCell2 = (v) => {
        const n = Math.round(Number(v) || 0);
        if (n === 0) return '<td class="!py-1.5 text-right font-mono text-gray-400">-</td>';
        if (n < 0) return '<td class="!py-1.5 text-right font-mono text-red-600">' + String.fromCharCode(9651) + Math.abs(n).toLocaleString() + '</td>';
        return '<td class="!py-1.5 text-right font-mono">' + n.toLocaleString() + '</td>';
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
        return '<tr class="' + (groupChanged ? 'border-t-2 border-slate-200' : '') + ' hover:bg-blue-50/30">' +
          '<td class="!py-1.5"><span class="unit-chip ' + chipClass + '">' + (d.machine_code||'') + '</span></td>' +
          '<td class="!py-1.5">' + (d.material_group_major_name||'-') + '</td>' +
          '<td class="!py-1.5">' + (d.product_level2_name||'-') + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold">' + fmt(curCost) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-500">' + (prevCost ? fmt(prevCost) : '-') + '</td>' +
          diffCell2(usageDiff) +
          diffCell2(priceDiff) +
          '<td class="!py-1.5 text-right font-mono">' + fmt(qtyCur) + '</td>' +
          '<td class="!py-1.5 text-right font-mono text-gray-500">' + (qtyPrev ? fmt(qtyPrev) : '-') + '</td>' +
          '</tr>';
      }).join('');
      document.getElementById('mg-total-cur').textContent = fmt(tCur);
      document.getElementById('mg-total-prev').textContent = fmt(tPrev);
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
    let uploadMode = 'simple'; // 'simple' or 'sap'
    let uploadRawData = []; // SAP 원본 37컬럼 전체 데이터
    function handleDrop(e) { e.preventDefault(); e.currentTarget.classList.remove('border-primary-400','bg-primary-50/50'); processFile(e.dataTransfer.files[0]); }
    function handleFileSelect(e) { processFile(e.target.files[0]); }
    
    // SAP 형식 자동 감지
    function detectSAPFormat(headers) {
      const sapIndicators = ['달력연도/월', '생산호기', '자재 그룹', '출고수량', '출고금액', '실제단가', '실제 원단위', '자재그룹(대분류)', '생산호기명'];
      const matchCount = sapIndicators.filter(ind => headers.some(h => (h||'').includes(ind))).length;
      return matchCount >= 3;
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
        
        if (isSAP) {
          uploadMode = 'sap';
          const parsed = parseSAPData(json, headers);
          uploadData = parsed.rows;
          uploadRawData = parsed.rawRows;
          
          document.getElementById('upload-area').classList.add('hidden');
          document.getElementById('upload-preview').classList.remove('hidden');
          document.getElementById('upload-filename').textContent = file.name;
          document.getElementById('upload-info').innerHTML = '<span class="inline-flex items-center px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium mr-2">SAP 형식 감지</span>' + parsed.rows.length + '행 (유효 데이터) | 원본 ' + parsed.rawRows.length + '행 전체 저장';
          document.getElementById('upload-count').textContent = parsed.rows.length;
          
          // SAP preview table
          const previewHeaders = ['기간','호기','자재코드','자재명','자재그룹','제품구분','출고수량','실제단가','출고금액','생산수량'];
          document.getElementById('preview-head').innerHTML = '<tr>'+previewHeaders.map(x=>'<th class="text-xs">'+x+'</th>').join('')+'</tr>';
          document.getElementById('preview-body').innerHTML = parsed.slice(0,20).map(r => 
            '<tr><td>'+r.period+'</td><td><span class="unit-chip '+(r.machine==='PM2'?'unit-chip-pm2':'unit-chip-pm3')+'">'+r.machine+'</span></td><td class="font-mono text-xs">'+r.mat_code+'</td><td>'+r.mat_name+'</td><td>'+r.mat_group_desc+'</td><td class="text-xs text-gray-400">'+r.product_type+'</td><td class="text-right">'+fmt(r.issue_qty)+'</td><td class="text-right">'+fmt(Math.round(r.actual_unit_price))+'</td><td class="text-right">'+fmt(r.issue_amount)+'</td><td class="text-right">'+fmt(Math.round(r.production_qty))+'</td></tr>'
          ).join('');
        } else {
          uploadMode = 'simple';
          uploadData = json;
          document.getElementById('upload-area').classList.add('hidden');
          document.getElementById('upload-preview').classList.remove('hidden');
          document.getElementById('upload-filename').textContent = file.name;
          document.getElementById('upload-info').innerHTML = '<span class="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium mr-2">기본 형식</span>' + json.length + '행';
          document.getElementById('upload-count').textContent = json.length;
          const h = Object.keys(json[0]);
          document.getElementById('preview-head').innerHTML = '<tr>'+h.map(x=>'<th class="text-xs">'+x+'</th>').join('')+'</tr>';
          document.getElementById('preview-body').innerHTML = json.slice(0,15).map(r=>'<tr>'+h.map(x=>'<td class="text-xs">'+(r[x]??'')+'</td>').join('')+'</tr>').join('');
        }
      };
      reader.readAsArrayBuffer(file);
    }
    
    async function submitUpload() {
      if (!uploadData.length) return;
      
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
              fileName: document.getElementById('upload-filename')?.textContent || ''
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
          loadAnalysis();
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

    // ============ SIMULATION ============
    let simPlanIndex = 0;

    function loadSimProducts() {
      if (!productsCache.length) return;
      const container = document.getElementById('sim-plans');
      if (container.children.length === 0) addSimProduct();
      loadSimHistory();
    }

    function addSimProduct() {
      const container = document.getElementById('sim-plans');
      const idx = simPlanIndex++;
      const opts = productsCache.map(p=>'<option value="'+p.id+'">'+p.unit_name+' / '+p.product_name+'</option>').join('');
      const div = document.createElement('div');
      div.className = 'flex items-center gap-3';
      div.id = 'sim-plan-'+idx;
      div.innerHTML = '<select class="sim-product flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">'+opts+'</select>'
        + '<input type="number" class="sim-qty w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="생산량(ton)" step="0.1">'
        + '<button onclick="document.getElementById(\\'sim-plan-'+idx+'\\').remove()" class="text-gray-400 hover:text-red-500 text-sm"><i class="fas fa-times"></i></button>';
      container.appendChild(div);
    }

    async function runSimulation() {
      const rows = document.querySelectorAll('#sim-plans > div');
      const plans = [];
      rows.forEach(row => {
        const productId = row.querySelector('.sim-product')?.value;
        const qty = parseFloat(row.querySelector('.sim-qty')?.value || '0');
        if (productId && qty > 0) plans.push({ product_id: parseInt(productId), planned_qty: qty });
      });
      if (!plans.length) { alert('제품과 생산량을 입력하세요.'); return; }

      const baseYear = parseInt(document.getElementById('sim-base-year').value);
      const baseMonth = parseInt(document.getElementById('sim-base-month').value);

      const res = await fetch('/api/simulation/run', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ plans, base_year: baseYear, base_month: baseMonth })
      });
      if (!res.ok) { alert('시뮬레이션 실패'); return; }
      simResultData = await res.json();
      renderSimResults();
    }

    function renderSimResults() {
      if (!simResultData) return;
      document.getElementById('sim-results').classList.remove('hidden');
      document.getElementById('btn-save-sim').classList.remove('hidden');
      const s = simResultData.summary;

      document.getElementById('sim-total-cost').textContent = formatWon(s.total_sim_cost);
      const diffEl = document.getElementById('sim-cost-diff');
      diffEl.textContent = formatSignedWon(s.total_cost_diff);
      diffEl.className = 'text-lg font-bold mt-2 stat-value ' + (s.total_cost_diff>0?'positive':'negative');
      const qEl = document.getElementById('sim-qty-effect');
      qEl.textContent = formatSignedWon(s.total_qty_effect);
      qEl.className = 'text-lg font-bold mt-2 stat-value ' + (s.total_qty_effect>0?'positive':'negative');
      const pEl = document.getElementById('sim-price-effect');
      pEl.textContent = formatSignedWon(s.total_price_effect);
      pEl.className = 'text-lg font-bold mt-2 stat-value ' + (s.total_price_effect>0?'positive':'negative');

      // Product table
      document.getElementById('sim-product-body').innerHTML = simResultData.products.map(p => {
        const pct = p.total_prev_cost>0 ? ((p.cost_diff/p.total_prev_cost)*100).toFixed(1) : '-';
        return \`<tr>
          <td><span class="unit-chip \${getCC(p.unit_code)}">\${p.unit_name}</span></td>
          <td class="font-medium">\${p.product_name}</td>
          <td class="text-right">\${fmt(p.planned_qty)} ton</td>
          <td class="text-right font-medium">\${formatWon(p.total_sim_cost)}</td>
          <td class="text-right text-gray-500">\${formatWon(p.total_prev_cost)}</td>
          <td class="text-right font-semibold \${p.cost_diff>0?'positive':'negative'}">\${formatSignedWon(p.cost_diff)}</td>
          <td class="text-right"><span class="text-xs px-2 py-0.5 rounded-full \${p.cost_diff>0?'bg-red-50 text-red-600':'bg-blue-50 text-blue-600'}">\${pct!=='-'?(p.cost_diff>0?'+':'')+pct+'%':'-'}</span></td>
        </tr>\`;
      }).join('');

      // Detail table
      document.getElementById('sim-detail-body').innerHTML = simResultData.details.map(d => \`<tr>
        <td class="text-xs text-gray-500">\${d.product_name}</td>
        <td><span class="text-[10px] px-1.5 py-0.5 rounded \${d.category==='RAW'?'bg-blue-50 text-blue-600':'bg-emerald-50 text-emerald-600'}">\${d.category==='RAW'?'원':'부'}</span></td>
        <td class="font-medium text-xs">\${d.material_name}</td>
        <td class="text-right text-gray-500 text-xs">\${d.unit_consumption}</td>
        <td class="text-right">\${fmt(d.sim_usage_qty)}</td>
        <td class="text-right">\${fmt(d.unit_price)}</td>
        <td class="text-right font-medium">\${formatWon(d.sim_cost)}</td>
        <td class="text-right text-gray-400">\${fmt(d.prev_usage_qty)}</td>
        <td class="text-right text-gray-400">\${formatWon(d.prev_cost)}</td>
        <td class="text-right \${d.qty_effect>0?'positive':'negative'}">\${formatSignedWon(d.qty_effect)}</td>
        <td class="text-right \${d.price_effect>0?'positive':'negative'}">\${formatSignedWon(d.price_effect)}</td>
        <td class="text-right font-semibold \${d.cost_diff>0?'positive':'negative'}">\${formatSignedWon(d.cost_diff)}</td>
      </tr>\`).join('');
    }

    async function saveSimulation() {
      if (!simResultData) return;
      const name = prompt('시뮬레이션 이름을 입력하세요:', '시뮬레이션 ' + new Date().toLocaleDateString('ko-KR'));
      if (!name) return;
      const rows = document.querySelectorAll('#sim-plans > div');
      const plans = [];
      rows.forEach(row => {
        const pid = row.querySelector('.sim-product')?.value;
        const qty = parseFloat(row.querySelector('.sim-qty')?.value||'0');
        if (pid && qty>0) plans.push({product_id:+pid, planned_qty:qty});
      });
      await fetch('/api/simulation/save', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ sim_name:name, base_year:+document.getElementById('sim-base-year').value, base_month:+document.getElementById('sim-base-month').value, sim_data:plans, result_data:simResultData })
      });
      alert('저장되었습니다!');
      loadSimHistory();
    }

    async function loadSimHistory() {
      const data = await fetch('/api/simulations').then(r=>r.json());
      document.getElementById('sim-history-body').innerHTML = data.length ? data.map(s=>\`<tr>
        <td class="font-medium">\${s.sim_name}</td>
        <td class="text-gray-500">\${s.base_year}-\${String(s.base_month).padStart(2,'0')}</td>
        <td class="text-gray-500">\${s.created_by}</td>
        <td class="text-gray-400 text-xs">\${s.created_at}</td>
        <td class="text-center"><button onclick="loadSavedSim(\${s.id})" class="text-xs text-primary-600 hover:underline">불러오기</button></td>
      </tr>\`).join('') : '<tr><td colspan="5" class="text-center py-6 text-gray-400">저장된 시뮬레이션이 없습니다</td></tr>';
    }

    async function loadSavedSim(id) {
      const data = await fetch('/api/simulations/'+id).then(r=>r.json());
      if (data.result_data) { simResultData = data.result_data; renderSimResults(); }
    }

    // ============ BOM (제품-자재 매핑) ============
    document.getElementById('product-form').addEventListener('submit', async(e)=>{
      e.preventDefault();
      await fetch('/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        product_code:document.getElementById('new-prd-code').value,
        product_name:document.getElementById('new-prd-name').value,
        unit_id:+document.getElementById('new-prd-unit').value,
        unit_of_measure:document.getElementById('new-prd-uom').value||'ton'
      })});
      alert('등록되었습니다!');
      await loadMasterData();
      loadProductsBom();
    });

    async function loadProductsBom() {
      const [products, bom] = await Promise.all([fetch('/api/products').then(r=>r.json()), fetch('/api/bom').then(r=>r.json())]);
      productsCache = products;
      const container = document.getElementById('products-bom-container');

      if (!products.length) {
        container.innerHTML = '<div class="text-center py-12 text-gray-400"><i class="fas fa-box-open text-3xl mb-3"></i><p>등록된 제품이 없습니다.</p></div>';
        return;
      }

      container.innerHTML = products.map(p => {
        const pBom = bom.filter(b=>b.product_id===p.id);
        return \`
        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <div class="px-5 py-3 bg-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="unit-chip \${getCC(p.unit_code)}">\${p.unit_name}</span>
              <span class="font-semibold text-gray-700 text-sm">\${p.product_name}</span>
              <span class="text-xs text-gray-400 font-mono">\${p.product_code}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">\${pBom.length}개 자재</span>
              <button onclick="toggleBomAdd(\${p.id})" class="text-xs text-primary-600 hover:text-primary-700 font-medium"><i class="fas fa-plus mr-1"></i>자재추가</button>
            </div>
          </div>
          <div id="bom-add-\${p.id}" class="hidden px-5 py-3 bg-primary-50/50 border-b border-gray-200">
            <div class="flex gap-2 items-center">
              <select id="bom-mat-\${p.id}" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                \${materialsCache.map(m=>'<option value="'+m.id+'">'+(m.category==='RAW'?'[원]':'[부]')+' '+m.material_name+' ('+m.unit_of_measure+')</option>').join('')}
              </select>
              <input type="number" id="bom-uc-\${p.id}" step="0.001" placeholder="원단위" class="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <input type="text" id="bom-note-\${p.id}" placeholder="비고" class="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <button onclick="addBomItem(\${p.id})" class="btn-primary text-xs !py-2">등록</button>
            </div>
          </div>
          \${pBom.length ? '<table class="data-table"><thead><tr><th>구분</th><th>자재코드</th><th>자재명</th><th class="text-right">원단위</th><th>단위</th><th>비고</th><th class="text-center w-16">삭제</th></tr></thead><tbody>' + pBom.map(b=>\`<tr>
            <td><span class="text-[10px] px-1.5 py-0.5 rounded \${b.category==='RAW'?'bg-blue-50 text-blue-600':'bg-emerald-50 text-emerald-600'}">\${b.category==='RAW'?'원자재':'부자재'}</span></td>
            <td class="font-mono text-xs text-gray-400">\${b.material_code}</td>
            <td class="font-medium">\${b.material_name}</td>
            <td class="text-right font-semibold text-primary-600">\${b.unit_consumption}</td>
            <td class="text-gray-400 text-xs">\${b.unit_of_measure}/ton</td>
            <td class="text-gray-400 text-xs">\${b.notes||''}</td>
            <td class="text-center"><button onclick="deleteBom(\${b.id})" class="btn-delete text-[10px]">삭제</button></td>
          </tr>\`).join('') + '</tbody></table>' : '<div class="p-6 text-center text-gray-400 text-sm">BOM이 등록되지 않았습니다.</div>'}
        </div>\`;
      }).join('');
    }

    function toggleBomAdd(productId) {
      document.getElementById('bom-add-'+productId)?.classList.toggle('hidden');
    }

    async function addBomItem(productId) {
      const matId = document.getElementById('bom-mat-'+productId).value;
      const uc = parseFloat(document.getElementById('bom-uc-'+productId).value);
      const note = document.getElementById('bom-note-'+productId).value;
      if (!uc) { alert('원단위를 입력하세요.'); return; }
      await fetch('/api/bom',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_id:productId,material_id:+matId,unit_consumption:uc,notes:note})});
      loadProductsBom();
    }

    async function deleteBom(id) {
      if (!confirm('삭제하시겠습니까?')) return;
      await fetch('/api/bom/'+id,{method:'DELETE'});
      loadProductsBom();
    }

    // ===== Data View (데이터 조회) - Raw Records 전체 컬럼 =====
    let dvCurrentPage = 0;
    let dvTotal = 0;
    let dvPageData = [];

    async function initDataView() {
      await loadDataView();
    }

    async function loadDataView() {
      const machine = document.getElementById('dv-unit').value;
      const category = document.getElementById('dv-category').value;
      const search = document.getElementById('dv-search').value;
      const limit = parseInt(document.getElementById('dv-page-size').value);
      const year = document.getElementById('dv-year').value;
      const month = document.getElementById('dv-month').value;
      const ym = year + month;

      let url = '/api/raw-records?ym=' + ym + '&page=' + dvCurrentPage + '&limit=' + limit;
      if (machine) url += '&machine=' + machine;
      if (category) url += '&category=' + category;
      if (search) url += '&search=' + encodeURIComponent(search);

      const resp = await fetch(url).then(r => r.json());
      dvTotal = resp.total;
      dvPageData = resp.data || [];

      renderDataViewTable();
    }

    function renderDataViewTable() {
      const limit = parseInt(document.getElementById('dv-page-size').value);
      const start = dvCurrentPage * limit;

      // Summary
      document.getElementById('dv-total-count').textContent = dvTotal.toLocaleString() + '건';
      const totalQty = dvPageData.reduce((s, d) => s + (d.issue_qty || 0), 0);
      const totalAmt = dvPageData.reduce((s, d) => s + (d.issue_amount || 0), 0);
      const matSet = new Set(dvPageData.map(d => d.material_code));
      document.getElementById('dv-total-qty').textContent = Math.round(totalQty).toLocaleString();
      document.getElementById('dv-total-cost').textContent = (totalAmt / 100000000).toFixed(1) + '억';
      document.getElementById('dv-mat-count').textContent = matSet.size + '종';

      // Table body
      const tbody = document.getElementById('dv-tbody');
      if (dvPageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="38" class="text-center text-gray-400 py-12"><i class="fas fa-inbox text-3xl mb-3 block text-gray-200"></i>데이터가 없습니다. SAP 파일을 업로드해주세요.</td></tr>';
      } else {
        const numFmt = (v) => v != null ? Number(v).toLocaleString(undefined, {maximumFractionDigits:2}) : '-';
        tbody.innerHTML = dvPageData.map((d, idx) => {
          const rowNum = start + idx + 1;
          const chipClass = (d.machine_code||'') === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
          return '<tr class="hover:bg-blue-50/30">' +
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
  </script>
</body>
</html>`;
}
