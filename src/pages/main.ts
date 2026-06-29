export function mainPage(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>원부자재 사전원가 분석</title>
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
            <i class="fas fa-project-diagram mr-1.5"></i>시뮬레이션
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
          <div class="flex items-center gap-3">
            <div>
              <span class="text-[10px] text-gray-400">PM2</span>
              <p id="s-pm2-uc" class="text-base font-bold text-gray-900">-</p>
            </div>
            <div class="text-gray-300">|</div>
            <div>
              <span class="text-[10px] text-gray-400">PM3</span>
              <p id="s-pm3-uc" class="text-base font-bold text-gray-900">-</p>
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
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-steel-50 text-steel-400 text-xs font-bold">기본 형식</span>
              <span class="text-xs text-steel-400 font-medium">'양식 다운로드' 참고</span>
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
            <div class="flex items-center gap-1">
              <button onclick="setManualMachine('PM2')" id="mn-mc-pm2" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">PM2</button>
              <button onclick="setManualMachine('PM3')" id="mn-mc-pm3" class="pill-tab pill-tab-active text-xs !px-3 !py-1">PM3</button>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-400" id="mn-period-label"></span>
            <div class="flex items-center gap-1.5 border-r border-slate-200 pr-2">
              <input type="text" id="mn-user-name" placeholder="이름/계정" class="w-20 text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400" value="">
            </div>
            <label class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer font-medium">
              <i class="fas fa-file-excel mr-1"></i>엑셀 업로드
              <input type="file" accept=".xlsx,.xls" class="hidden" onchange="uploadManualExcel(event)">
            </label>
            <button onclick="downloadManualTemplate()" class="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition font-medium"><i class="fas fa-file-download mr-1"></i>양식 다운로드</button>
            <button onclick="saveManualData()" class="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition font-medium"><i class="fas fa-save mr-1"></i>저장</button>
            <button onclick="loadManualData()" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-gray-600 hover:bg-slate-200 transition font-medium"><i class="fas fa-sync-alt mr-1"></i>불러오기</button>
            <button onclick="toggleManualHistory()" class="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition font-medium"><i class="fas fa-history mr-1"></i>히스토리</button>
          </div>
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
            <thead class="sticky top-0 z-10">
              <tr class="bg-slate-100 border-b">
                <th colspan="2" class="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-slate-300" rowspan="2">자재코드 / 자재명</th>
                <th colspan="5" class="px-2 py-1.5 text-center font-semibold text-blue-700 border-r border-slate-300" id="mn-prev-header">04월 (실적)</th>
                <th colspan="9" class="px-2 py-1.5 text-center font-semibold text-emerald-700 border-r border-slate-300" id="mn-cur-header">05월 (예상)</th>
                <th colspan="3" class="px-2 py-1.5 text-center font-semibold text-amber-700 border-r border-slate-300">전월대비 손익 효과</th>
                <th class="px-2 py-1.5 text-center font-semibold text-gray-500 border-l border-slate-300" rowspan="2">이슈사항</th>
              </tr>
              <tr class="bg-slate-50 border-b text-[10px] text-gray-500">
                <th class="px-1.5 py-1 text-right border-l border-slate-200">사용량(kg)</th>
                <th class="px-1.5 py-1 text-right">원단위(kg/톤)</th>
                <th class="px-1.5 py-1 text-right">사용단가(원/kg)</th>
                <th class="px-1.5 py-1 text-right">비용(백만원)</th>
                <th class="px-1.5 py-1 text-right border-r border-slate-300">톤당비용(원/톤)</th>
                <th class="px-1.5 py-1 text-right">사용량(kg)</th>
                <th class="px-1.5 py-1 text-right">원단위(kg/톤)</th>
                <th class="px-1.5 py-1 text-right">입고수량(톤)</th>
                <th class="px-1.5 py-1 text-right">입고단가(원/kg)</th>
                <th class="px-1.5 py-1 text-right">기초재고수량(톤)</th>
                <th class="px-1.5 py-1 text-right">기초재고단가(원/kg)</th>
                <th class="px-1.5 py-1 text-right">사용단가(원/kg)</th>
                <th class="px-1.5 py-1 text-right">비용(백만원)</th>
                <th class="px-1.5 py-1 text-right border-r border-slate-300">톤당비용(원/톤)</th>
                <th class="px-1.5 py-1 text-right">사용량차이(원)</th>
                <th class="px-1.5 py-1 text-right">단가차이(원)</th>
                <th class="px-1.5 py-1 text-right border-r border-slate-300">재료비종합(원)</th>
              </tr>
            </thead>
            <tbody id="mn-detail-body">
              <tr><td colspan="20" class="text-center py-8 text-gray-400"><i class="fas fa-arrow-up mr-2"></i>호기 선택 후 불러오기를 클릭하세요</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 서브: 계산결과 -->
    <div id="content-calcresult" class="hidden fade-in space-y-4">
      <!-- 안내 메시지 (데이터 미로드 시) -->
      <div id="cr-empty-msg" class="card p-8 text-center">
        <i class="fas fa-info-circle text-3xl text-slate-300 mb-3"></i>
        <p class="text-sm text-gray-500">수기 입력 데이터를 먼저 불러온 후 확인할 수 있습니다.</p>
        <p class="text-xs text-gray-400 mt-1">데이터 입력 &gt; 부서 수기 입력 탭에서 호기 선택 후 불러오기를 실행해주세요.</p>
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

        <!-- 그룹별 요약 -->
        <div class="card p-4 mb-4">
          <h4 class="text-xs font-semibold text-gray-600 mb-3"><i class="fas fa-layer-group mr-1.5"></i>자재그룹별 요약</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50 text-gray-600 border-b border-slate-200">
                  <th class="px-2 py-2 text-left font-semibold">그룹명</th>
                  <th class="px-2 py-2 text-right font-semibold">자재수</th>
                  <th class="px-2 py-2 text-right font-semibold">당월 재료비(백만원)</th>
                  <th class="px-2 py-2 text-right font-semibold">원단위(원/톤)</th>
                  <th class="px-2 py-2 text-right font-semibold">단가 절감</th>
                  <th class="px-2 py-2 text-right font-semibold">단가 악화</th>
                  <th class="px-2 py-2 text-right font-semibold">순 손익효과</th>
                </tr>
              </thead>
              <tbody id="cr-group-body"></tbody>
            </table>
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
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">기초재고(톤)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">기초단가</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">입고(톤)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">입고단가</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap bg-amber-50">가중평균단가</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">전월단가</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap bg-orange-50">단가차이</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">당월사용량(kg)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">재료비(백만원)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">원단위(원/톤)</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap bg-blue-50">사용량 효과</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap bg-blue-50">단가 효과</th>
                  <th class="px-2 py-2 text-right font-semibold whitespace-nowrap bg-blue-50">총 손익효과</th>
                </tr>
              </thead>
              <tbody id="cr-detail-body"></tbody>
              <tfoot id="cr-detail-foot" class="bg-slate-50 font-semibold border-t-2 border-slate-300"></tfoot>
            </table>
          </div>
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

        <!-- 데이터 소스 선택 -->
        <div class="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl p-4 mb-5" id="sim-source-panel">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-database text-slate-500"></i>
            <span class="text-xs font-semibold text-gray-700">시뮬레이션 기준 데이터 소스</span>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer group" id="sim-source-manual-label">
              <input type="radio" name="sim-source" value="manual" id="sim-source-manual" onchange="onSimSourceChange()" disabled class="accent-emerald-500">
              <span class="text-xs text-gray-600 group-hover:text-gray-800">
                <i class="fas fa-pen-to-square text-emerald-500 mr-0.5"></i>수기입력 데이터
                <span id="sim-source-manual-info" class="text-[10px] text-gray-400 ml-1">(미저장)</span>
              </span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="sim-source" value="actual" id="sim-source-actual" onchange="onSimSourceChange()" checked class="accent-blue-500">
              <span class="text-xs text-gray-600 group-hover:text-gray-800">
                <i class="fas fa-chart-bar text-blue-500 mr-0.5"></i>전월 실적 데이터
                <span class="text-[10px] text-gray-400 ml-1">(raw_records 기반)</span>
              </span>
            </label>
          </div>
          <p id="sim-source-notice" class="text-[10px] text-amber-600 mt-2 hidden"><i class="fas fa-exclamation-triangle mr-0.5"></i>수기입력 데이터가 미저장 상태입니다. 저장 후 사용 가능합니다.</p>
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
      <div class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm py-2 -mx-1 px-1 border-b border-slate-100 shadow-sm">
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
          <div class="flex items-center gap-1">
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
      <div class="card px-5 py-4 mb-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-700"><i class="fas fa-project-diagram text-indigo-500 mr-1.5"></i>생산량 변동 시뮬레이션 플로우</h3>
            <p class="text-[11px] text-gray-400 mt-1">생산량 증감에 따른 원단위·비용·손익 변수들의 연쇄 변화를 시각화합니다.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-500">호기:</label>
              <select id="sf-machine" class="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-200" onchange="initSimFlow()">
                <option value="PM2">PM2</option>
                <option value="PM3" selected>PM3</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-500">생산량 변동:</label>
              <input type="range" id="sf-prod-slider" min="-30" max="30" value="0" step="1" class="w-40 h-2 accent-indigo-500" oninput="onSimFlowSliderChange()">
              <span id="sf-prod-pct" class="text-xs font-bold text-indigo-600 w-12 text-center">0%</span>
            </div>
            <button onclick="resetSimFlow()" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-gray-600 hover:bg-slate-200 transition font-medium"><i class="fas fa-undo mr-1"></i>초기화</button>
          </div>
        </div>
      </div>

      <!-- Flow Canvas -->
      <div class="card overflow-hidden" style="height: calc(100vh - 200px); min-height: 600px;">
        <div id="sf-canvas" class="w-full h-full relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" style="overflow:auto;">
          <svg id="sf-svg" width="1400" height="800" class="absolute top-0 left-0"></svg>
          <div id="sf-nodes" class="absolute top-0 left-0 w-full h-full pointer-events-none"></div>
        </div>
      </div>
    </div><!-- /content-simflow -->

  </main>

  <script>
    let analysisData = null, unitSummaryData = null, unitsCache = [], materialsCache = [];
    let productsCache = [], simResultData = null;
    let unitChartInstance = null, effectChartInstance = null, currentUnitFilter = '', uploadData = [];

    document.addEventListener('DOMContentLoaded', async () => {
      // 가용 월 목록에서 최신 데이터 월을 기본값으로 설정
      try {
        var months = await fetch('/api/available-months').then(function(r){return r.json();});
        if (months && months.length > 0) {
          var latestYm = months[0]; // 내림차순이므로 첫 번째가 최신
          var latestYear = latestYm.substring(0, 4);
          var latestMonth = String(parseInt(latestYm.substring(4, 6)));
          var yearSel = document.getElementById('analysisYear');
          var monthSel = document.getElementById('analysisMonth');
          if (yearSel) yearSel.value = latestYear;
          if (monthSel) monthSel.value = latestMonth;
        }
      } catch(e) { console.warn('가용월 로드 실패:', e); }
      await loadMasterData();
      await loadAnalysis();
    });

    function switchTab(tab) {
      ['dashboard','detail','upload','dataview','master','simulation','forecast','datainput','manual','calcresult','profitanalysis','simflow'].forEach(t => {
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
        initSimFlow();
      } else {
        document.getElementById('content-' + tab)?.classList.remove('hidden');
      }
      const a = document.getElementById('tab-' + tab);
      if (a) { a.classList.add('pill-tab-active'); a.classList.remove('pill-tab-inactive'); }
      if (tab === 'master') { loadUnitsList(); loadMaterialsList(); loadMasterIdx(currentMidxTab); }
    }

    function switchDataInputSub(sub) {
      ['upload','dataview','manual','calcresult'].forEach(function(s) {
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
      if (sub === 'forecast') { loadForecast(); }
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
        '<td class="px-3 py-1.5"><select data-field="machine_code" class="text-xs border border-blue-300 rounded px-1.5 py-0.5"><option value="PM2"' + (rule.machine_code === 'PM2' ? ' selected' : '') + '>PM2</option><option value="PM3"' + (rule.machine_code === 'PM3' ? ' selected' : '') + '>PM3</option></select></td>' +
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
      var periodEl = document.getElementById('period-label');
      if (periodEl) periodEl.textContent = comp.summary?.period ? comp.summary.period.previous + ' vs ' + comp.summary.period.current : '';
      renderDashboard(); renderDetailTable();
      loadDashboardSummary(ym);
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
      const [matCost, prodSummary, matGroup, overview, prodAnalysis, mixEffect] = await Promise.all([
        fetch('/api/dashboard/material-cost-summary?ym=' + ym + (matCostCategoryFilter !== 'ALL' ? '&category=' + matCostCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/production-summary?ym=' + ym).then(r => r.json()),
        fetch('/api/dashboard/material-by-group?ym=' + ym + (matGroupCategoryFilter !== 'ALL' ? '&category=' + matGroupCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/material-overview?ym=' + ym + (overviewCategoryFilter !== 'ALL' ? '&category=' + overviewCategoryFilter : '')).then(r => r.json()),
        fetch('/api/dashboard/production-analysis?ym=' + ym).then(r => r.json()),
        fetch('/api/dashboard/mix-effect?ym=' + ym + (mixEffectCategoryFilter !== 'ALL' ? '&category=' + mixEffectCategoryFilter : '')).then(r => r.json())
      ]);

      // 원단위 카드 계산 (overview 데이터 기반 - 이미 톤 단위)
      var pm2Cost = 0, pm2Prod = 0, pm3Cost = 0, pm3Prod = 0;
      if (overview && overview.length) {
        overview.forEach(function(item) {
          var cost = Number(item.cur_material_cost) || 0;
          var prod = Number(item.cur_production) || 0;
          if (item.machine_code === 'PM2') { pm2Cost += cost; pm2Prod += prod; }
          else if (item.machine_code === 'PM3') { pm3Cost += cost; pm3Prod += prod; }
        });
      }
      var totalCost = pm2Cost + pm3Cost;
      var totalProd = pm2Prod + pm3Prod;
      var totalUC = totalProd > 0 ? totalCost / totalProd / 1000 : 0;
      var pm2UC = pm2Prod > 0 ? pm2Cost / pm2Prod / 1000 : 0;
      var pm3UC = pm3Prod > 0 ? pm3Cost / pm3Prod / 1000 : 0;
      document.getElementById('s-total-uc').textContent = totalUC > 0 ? totalUC.toFixed(1) : '-';
      document.getElementById('s-pm2-uc').textContent = pm2UC > 0 ? pm2UC.toFixed(1) : '-';
      document.getElementById('s-pm3-uc').textContent = pm3UC > 0 ? pm3UC.toFixed(1) : '-';

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
        const chipClass = mc === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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
        const chipClass = mc === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';

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
        const chipClass = mc === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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

      // PM2 지종 믹스
      var s2pm2 = s2.gradeMix.PM2 || [];
      var s3pm2 = (s3 && s3.gradeMix.PM2) || [];
      var pm2Types = data.pm2Types || [];
      pm2Types.forEach(function(pt, i) {
        var r2 = s2pm2[i] || { col1:0, col2:0, col3:0 };
        var r3 = s3pm2[i] || { col1:0, col2:0, col3:0 };
        html += '<tr class="hover:bg-sage-50/30">' +
          '<td class="!py-1.5 pl-4 text-[11px]"><span class="text-gray-400 mr-1">PM2</span>' + pt + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(r2.col3) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r3.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r3.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold">' + fmtV(r3.col3) + '</td>' +
          '</tr>';
      });

      // PM2 소계
      var s2pm2Sum = s2pm2.reduce(function(a,b){ return a + (b.col3||0); }, 0);
      var s3pm2Sum = s3pm2.reduce(function(a,b){ return a + (b.col3||0); }, 0);
      html += '<tr class="bg-slate-50 font-semibold border-t border-slate-200">' +
        '<td class="!py-1.5 pl-4 text-[11px] text-gray-600">PM2 \uc18c\uacc4</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmtV(s2pm2Sum) + '</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono">' + fmtV(s3pm2Sum) + '</td>' +
        '</tr>';

      // PM3 지종 믹스
      var s2pm3 = s2.gradeMix.PM3 || [];
      var s3pm3 = (s3 && s3.gradeMix.PM3) || [];
      var pm3Types = data.pm3Types || [];
      pm3Types.forEach(function(pt, i) {
        var r2 = s2pm3[i] || { col1:0, col2:0, col3:0 };
        var r3 = s3pm3[i] || { col1:0, col2:0, col3:0 };
        html += '<tr class="hover:bg-sage-50/30">' +
          '<td class="!py-1.5 pl-4 text-[11px]"><span class="text-gray-400 mr-1">PM3</span>' + pt + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r2.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold border-r border-slate-200">' + fmtV(r2.col3) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r3.col1) + '</td>' +
          '<td class="!py-1.5 text-right font-mono">' + fmtV(r3.col2) + '</td>' +
          '<td class="!py-1.5 text-right font-mono font-semibold">' + fmtV(r3.col3) + '</td>' +
          '</tr>';
      });

      // PM3 소계
      var s2pm3Sum = s2pm3.reduce(function(a,b){ return a + (b.col3||0); }, 0);
      var s3pm3Sum = s3pm3.reduce(function(a,b){ return a + (b.col3||0); }, 0);
      html += '<tr class="bg-slate-50 font-semibold border-t border-slate-200">' +
        '<td class="!py-1.5 pl-4 text-[11px] text-gray-600">PM3 \uc18c\uacc4</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono border-r border-slate-200">' + fmtV(s2pm3Sum) + '</td>' +
        '<td class="!py-1.5"></td><td class="!py-1.5"></td>' +
        '<td class="!py-1.5 text-right font-mono">' + fmtV(s3pm3Sum) + '</td>' +
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

    function setMixEffectFilter(filter) {
      mixEffectCategoryFilter = filter;
      ['all','raw','sub'].forEach(f => {
        var btn = document.getElementById('mix-filter-' + f);
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(f === filter.toLowerCase() ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;
      fetch('/api/dashboard/mix-effect?ym=' + ym + (filter !== 'ALL' ? '&category=' + filter : ''))
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
        const chipClass = d.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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
            return '<tr><td>'+r.calendar_ym+'</td><td><span class="unit-chip '+(r.machine_code==='PM2'?'unit-chip-pm2':'unit-chip-pm3')+'">'+r.machine_code+'</span></td><td class="font-mono text-xs">'+r.material_code+'</td><td>'+r.material_name+'</td><td>'+r.material_group_major_name+'</td><td class="text-xs">'+r.product_level2_name+'</td><td class="text-right">'+Math.round(r.total_production).toLocaleString()+'</td><td class="text-right">'+Math.round(r.actual_alloc_qty).toLocaleString()+'</td><td class="text-right">'+Math.round(r.actual_unit_price).toLocaleString()+'</td></tr>';
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
            '<tr><td>'+r.period+'</td><td><span class="unit-chip '+(r.machine==='PM2'?'unit-chip-pm2':'unit-chip-pm3')+'">'+r.machine+'</span></td><td class="font-mono text-xs">'+r.mat_code+'</td><td>'+r.mat_name+'</td><td>'+r.mat_group_desc+'</td><td class="text-xs text-gray-400">'+r.product_type+'</td><td class="text-right">'+fmt(r.issue_qty)+'</td><td class="text-right">'+fmt(Math.round(r.actual_unit_price))+'</td><td class="text-right">'+fmt(r.issue_amount)+'</td><td class="text-right">'+fmt(Math.round(r.production_qty))+'</td></tr>'
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
          // 업로드한 데이터 기준월로 드롭다운 자동 변경
          if (rawData.length > 0 && rawData[0].calendar_ym) {
            var uploadedYm = rawData[0].calendar_ym;
            var uploadedYear = uploadedYm.substring(0, 4);
            var uploadedMonth = String(parseInt(uploadedYm.substring(4, 6)));
            var yearSel = document.getElementById('analysisYear');
            var monthSel = document.getElementById('analysisMonth');
            if (yearSel) yearSel.value = uploadedYear;
            if (monthSel) monthSel.value = uploadedMonth;
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
    function getCC(c) { return c==='PM2'?'unit-chip-pm2':c==='PM3'?'unit-chip-pm3':c==='CHEM'?'unit-chip-chem':c==='TISSUE'?'unit-chip-tissue':'bg-gray-100 text-gray-600'; }
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
    let fcMachineFilter = 'PM2';
    let fcCurData = null;  // 당월 자재 상세
    let fcCurProd = null;  // 당월 생산량
    let fcUnitByProduct = null;  // 자재코드 × 지종별 원단위
    let fcNextInputs = {}; // 차월 사용자 입력값 저장
    let fcSavedManual = null;  // 수기입력 저장 데이터 (연동)
    let fcManualFlags = {}; // { idx: { usage: true, uc: true } } - 사용자가 직접 수정한 행 추적

    function setFcMachineFilter(mc) {
      fcMachineFilter = mc;
      ['PM2','PM3'].forEach(function(k) {
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
      var nextMonth = curMonth + 1;
      var nextYear = parseInt(year);
      if (nextMonth > 12) { nextMonth = 1; nextYear++; }

      // 헤더 레이블
      var labelEl = document.getElementById('fc-period-label');
      if (labelEl) labelEl.textContent = fcMachineFilter + ' | ' + year + '.' + month + ' 실적 vs ' + nextYear + '.' + String(nextMonth).padStart(2,'0') + ' 예상';

      var curH = document.getElementById('fc-cur-header');
      var nextH = document.getElementById('fc-next-header');
      var detCurH = document.getElementById('fc-detail-cur-header');
      var detNextH = document.getElementById('fc-detail-next-header');
      if (curH) curH.textContent = year + '.' + month + '월 (실적)';
      if (nextH) nextH.textContent = nextYear + '.' + String(nextMonth).padStart(2,'0') + '월 (예상)';
      if (detCurH) detCurH.textContent = year + '.' + month + '월 (실적)';
      if (detNextH) detNextH.textContent = nextYear + '.' + String(nextMonth).padStart(2,'0') + '월 (예상)';

      var mcParam = '&machine=' + fcMachineFilter;
      // 차월 YM 계산 (수기입력 저장 데이터 조회용)
      var nextYm = String(nextYear) + String(nextMonth).padStart(2, '0');
      try {
        var results = await Promise.all([
          fetch('/api/forecast/production?ym=' + ym).then(function(r){return r.json();}),
          fetch('/api/forecast/material-detail?ym=' + ym + mcParam).then(function(r){return r.json();}),
          fetch('/api/forecast/unit-by-product?ym=' + ym + mcParam).then(function(r){return r.json();}),
          fetch('/api/manual-input/saved?ym=' + nextYm + '&machine=' + fcMachineFilter).then(function(r){return r.json();})
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
        typeMap[key] += (Number(d.production_qty) || 0) / 1000;
      });

      // 수기입력 저장 생산량 조회 (차월 예상 기본값)
      var mnProdMap = null;
      if (fcSavedManual && fcSavedManual.production) {
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
          if (ptMap[filterType]) {
            allowedCodes[mc] = true;
          }
        }
      }

      // 테이블 행 순회하면서 보이기/숨기기
      var tbody = document.getElementById('fc-detail-body');
      if (!tbody) return;
      var trs = tbody.querySelectorAll('tr');
      var rows = fcCurData.rows;
      var rowIdx = 0;
      var groupKeys = {};
      rows.forEach(function(r) {
        var gk = r.material_group_name || r.material_group_major_name;
        if (!groupKeys[gk]) groupKeys[gk] = [];
        groupKeys[gk].push(r.material_code);
      });

      // 그룹 헤더/소계 포함하여 순회
      var currentGroupVisible = false;
      var trIdx = 0;
      var gkList = Object.keys(groupKeys);
      var gkIdx = 0;
      var itemIdx = 0;

      trs.forEach(function(tr) {
        if (tr.classList.contains('bg-slate-50') && tr.querySelector('td[colspan]')) {
          // 그룹 헤더행
          if (allowedCodes === null) {
            tr.style.display = '';
          } else {
            // 이 그룹에 보여줄 자재가 있는지 확인
            var gk = gkList[gkIdx] || '';
            var groupCodes = groupKeys[gk] || [];
            currentGroupVisible = groupCodes.some(function(c) { return allowedCodes[c]; });
            tr.style.display = currentGroupVisible ? '' : 'none';
          }
        } else if (tr.classList.contains('bg-slate-100/70')) {
          // 그룹 소계행
          tr.style.display = (allowedCodes === null || currentGroupVisible) ? '' : 'none';
          gkIdx++;
        } else {
          // 자재 데이터행
          if (allowedCodes === null) {
            tr.style.display = '';
          } else {
            var r = rows[rowIdx];
            tr.style.display = (r && allowedCodes[r.material_code]) ? '' : 'none';
          }
          rowIdx++;
        }
      });
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

          // 수기입력 저장 데이터에서 차월값 조회
          var mnSaved = null;
          if (fcSavedManual && fcSavedManual.materials) {
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
          html += '<tr class="hover:bg-blue-50/30 border-b border-slate-50">';
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
            + '<input type="number" class="w-16 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 focus:border-emerald-400 fc-inp" id="' + rid + '-nu" data-row="' + rowIdx + '" data-field="next_usage" value="' + defUsage + '" onchange="onFcUsageChange(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" step="0.1" class="w-14 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 focus:border-emerald-400 fc-inp" id="' + rid + '-nuc" data-row="' + rowIdx + '" data-field="next_uc" value="' + defUc + '" onchange="onFcUcChange(' + rowIdx + ')">'
            + '</td>';
          // 입고단가 (수기입력 저장값 연동)
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-14 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 focus:border-emerald-400 fc-inp" data-row="' + rowIdx + '" data-field="incoming_price" value="' + mnIp + '" placeholder="-" onchange="calcFcRow(' + rowIdx + ')">'
            + '</td>';
          // 기초재고단가 (수기입력 저장값 연동)
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-14 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 focus:border-emerald-400 fc-inp" data-row="' + rowIdx + '" data-field="stock_price" value="' + mnSp + '" placeholder="-" onchange="calcFcRow(' + rowIdx + ')">'
            + '</td>';
          // 사용단가 (수기입력 가중평균값 연동)
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-14 text-right text-[10px] font-mono border border-emerald-200 rounded px-0.5 py-0.5 bg-emerald-50/50 focus:border-emerald-400 fc-inp" data-row="' + rowIdx + '" data-field="next_unit_price" value="' + defUp + '" placeholder="-" onchange="calcFcRow(' + rowIdx + ')">'
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
        var usage = Number(nuEl.value) || 0;
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
        nuEl.value = Math.round(uc * nextProdTon);
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
          nextUsage = nuEl ? (Number(nuEl.value) || 0) : 0;
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
          if (nuEl) nuEl.value = Math.round(nextUsage);
          if (nucEl) nucEl.value = nextUC > 0 ? nextUC.toFixed(1) : '';
        }

        // 차월 사용단가 (사용자 입력값 우선)
        var priceInput = document.querySelector('[data-row="' + idx + '"][data-field="next_unit_price"]');
        var nextPrice = priceInput ? (Number(priceInput.value) || curPrice) : curPrice;

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
      loadSimProfitBase();
    }

    async function loadSimProfitBase() {
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var ym = year + month;
      // 시뮬레이션 대상월(차월) 계산
      var simMonth = parseInt(month) + 1;
      var simYear = parseInt(year);
      if (simMonth > 12) { simMonth = 1; simYear++; }
      var simYmLabel = simYear + '년 ' + simMonth + '월';
      var nextYm = String(simYear) + String(simMonth).padStart(2, '0');
      var simLabelEl = document.getElementById('sim-target-label');
      if (simLabelEl) simLabelEl.textContent = simYmLabel + ' 예상';
      var baseLabelEl = document.getElementById('sim-base-label');
      if (baseLabelEl) baseLabelEl.textContent = year + '년 ' + parseInt(month) + '월 실적';

      var catParam = simCatFilter !== 'ALL' ? '&category=' + simCatFilter : '';

      try {
        // 기준 데이터 + 수기입력 데이터 동시 로드
        var results = await Promise.all([
          fetch('/api/simulation/profit-base?ym=' + ym + catParam).then(function(r){return r.json();}),
          fetch('/api/manual-input/saved?ym=' + nextYm + '&machine=PM2').then(function(r){return r.json();}),
          fetch('/api/manual-input/saved?ym=' + nextYm + '&machine=PM3').then(function(r){return r.json();})
        ]);

        simBaseData = results[0].rows || [];

        // 수기입력 데이터 병합 (PM2+PM3)
        var pm2Data = (results[1] && results[1].data) ? results[1].data : null;
        var pm3Data = (results[2] && results[2].data) ? results[2].data : null;
        simManualData = null;

        if (pm2Data || pm3Data) {
          simManualData = { production: {}, materials: {}, saved_by: '' };
          if (pm2Data) {
            simManualData.production.PM2 = pm2Data.production || {};
            simManualData.saved_by = results[1].saved_by || '';
          }
          if (pm3Data) {
            simManualData.production.PM3 = pm3Data.production || {};
            if (!simManualData.saved_by) simManualData.saved_by = results[2].saved_by || '';
          }
        }

        // 소스 선택 UI 상태 업데이트
        updateSimSourcePanel(simManualData, results[1].saved_by, results[1].updated_at);

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
        // 수기입력 데이터 있으면 기본 선택을 manual로
        if (manualRadio && simSource === 'actual') {
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
        ['PM2','PM3'].forEach(function(mc) {
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
        var chipClass = row.machine_code === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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
        tbody.innerHTML = '<tr><td colspan="39" class="text-center text-gray-400 py-12"><i class="fas fa-inbox text-3xl mb-3 block text-gray-200"></i>데이터가 없습니다. SAP 파일을 업로드해주세요.</td></tr>';
      } else {
        const numFmt = (v) => v != null ? Number(v).toLocaleString(undefined, {maximumFractionDigits:2}) : '-';
        tbody.innerHTML = dvPageData.map((d, idx) => {
          const rowNum = start + idx + 1;
          const chipClass = (d.machine_code||'') === 'PM2' ? 'unit-chip-pm2' : 'unit-chip-pm3';
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
    var mnMachine = 'PM3';
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
      ['PM2','PM3'].forEach(function(k) {
        var btn = document.getElementById('mn-mc-' + k.toLowerCase());
        if (btn) { btn.classList.remove('pill-tab-active','pill-tab-inactive'); btn.classList.add(k === mc ? 'pill-tab-active' : 'pill-tab-inactive'); }
      });
      loadManualData();
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
          fetch('/api/exclusion-rules?machine=' + mnMachine).then(function(r){return r.json();})
        ]);
        mnMaterials = results[0].materials || [];
        mnProdTypes = results[0].productTypes || [];
        mnPrevProd = results[1].production || {};
        var savedData = results[2] || {};
        mnInputData = savedData.data || {};
        mnExclusionRules = results[3] || [];
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
      if (types.length === 0) types = ['RT-고지','RT-펄프','FT','KT','PCMC','기타 펄프'];

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
      if (!tbody || !mnMaterials.length) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="20" class="text-center py-8 text-gray-400">자재 데이터가 없습니다. 전월 데이터를 먼저 업로드해주세요.</td></tr>';
        return;
      }

      // 전월 총 생산량(톤)
      var prevProdTon = 0;
      for (var k in mnPrevProd) { prevProdTon += (mnPrevProd[k] || 0) / 1000; }

      // 그룹별 정리
      var grouped = {};
      var groups = [];
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

      groups.forEach(function(gk) {
        var items = grouped[gk];
        // 그룹 헤더
        html += '<tr class="bg-slate-50 border-t border-slate-200 mn-group-row" data-group="' + gk + '">';
        html += '<td colspan="2" class="px-2 py-1.5 text-xs font-semibold text-gray-700 border-r border-slate-300">' + gk + '</td>';
        html += '<td colspan="5" class="border-r border-slate-300"></td>';
        html += '<td colspan="9" class="border-r border-slate-300"></td>';
        html += '<td colspan="3" class="border-r border-slate-300"></td>';
        html += '<td></td>';
        html += '</tr>';

        items.forEach(function(m) {
          var saved = (mnInputData.materials && mnInputData.materials[m.code]) || {};
          var shortCode = m.code.replace(/^0+/, '') || m.code;
          var prevUsage = m.usage_qty || 0;
          var prevUC = prevProdTon > 0 ? prevUsage / prevProdTon : 0;
          var prevPrice = m.unit_price || 0;
          var prevCost = prevUsage * prevPrice;
          var prevCostMil = prevCost / 1000000;
          var prevCostPerTon = prevProdTon > 0 ? prevCost / prevProdTon : 0;

          // 전월 원단위: 사용자 수정 가능 (실적 보정용)
          var inputPrevUC = saved.prev_uc !== undefined ? saved.prev_uc : (prevUC > 0 ? prevUC.toFixed(1) : '');

          var rid = 'mn-r-' + rowIdx;
          var rowCls = m.is_new ? 'bg-amber-50/50 hover:bg-amber-100/40 border-b border-amber-100 mn-mat-row' : 'hover:bg-blue-50/30 border-b border-slate-50 mn-mat-row';
          html += '<tr class="' + rowCls + '" data-group="' + gk + '">';
          // 자재코드/명
          html += '<td class="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border-r border-slate-100">' + (m.is_new ? '<span class="text-amber-600 font-semibold">' + shortCode + '</span>' : shortCode) + '</td>';
          html += '<td class="px-1.5 py-0.5 text-xs border-r border-slate-300">' + m.name + (m.is_new ? ' <span class="text-[9px] px-1 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold">NEW</span>' : '') + '</td>';
          // 전월 실적 5열 (사용량은 표시, 원단위는 자동계산 readonly)
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-l border-slate-200">' + (prevUsage > 0 ? Math.round(prevUsage).toLocaleString() : '-') + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" step="0.1" class="w-14 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 bg-gray-100 text-gray-600 mn-inp" id="' + rid + '-puc" data-row="' + rowIdx + '" data-field="prev_uc" value="' + inputPrevUC + '" readonly title="실적 원단위 (자동계산)">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs">' + (prevPrice > 0 ? Math.round(prevPrice).toLocaleString() : '-') + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs">' + (prevCostMil > 0 ? Math.round(prevCostMil).toLocaleString() : '-') + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-r border-slate-300">' + (prevCostPerTon > 0 ? Math.round(prevCostPerTon).toLocaleString() : '-') + '</td>';
          // 당월 예상 9열 (사용량/원단위/입고수량/입고단가/기초재고수량/기초재고단가/사용단가/비용/톤당비용)
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-16 text-right text-[10px] font-mono border border-emerald-200 rounded px-0.5 py-0.5 bg-emerald-50/30 focus:border-emerald-400 mn-inp" id="' + rid + '-cu" data-row="' + rowIdx + '" data-field="cur_usage" value="' + (saved.cur_usage || '') + '" placeholder="-" onchange="calcManualRow(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" step="0.1" class="w-14 text-right text-[10px] font-mono border border-indigo-200 rounded px-0.5 py-0.5 bg-indigo-50/30 focus:border-indigo-400 mn-inp" id="' + rid + '-cuc" data-row="' + rowIdx + '" data-field="cur_uc" data-group="' + (m.group_name || '') + '" value="' + (saved.cur_uc || '') + '" placeholder="-" onchange="onUnitCostInput(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-14 text-right text-[10px] font-mono border border-emerald-200 rounded px-0.5 py-0.5 focus:border-emerald-400 mn-inp" id="' + rid + '-iq" data-row="' + rowIdx + '" data-field="incoming_qty" value="' + (saved.incoming_qty || '') + '" placeholder="-" onchange="calcManualRow(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-14 text-right text-[10px] font-mono border border-emerald-200 rounded px-0.5 py-0.5 focus:border-emerald-400 mn-inp" id="' + rid + '-ip" data-row="' + rowIdx + '" data-field="incoming_price" value="' + (saved.incoming_price || '') + '" placeholder="-" onchange="calcManualRow(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-14 text-right text-[10px] font-mono border border-emerald-200 rounded px-0.5 py-0.5 focus:border-emerald-400 mn-inp" id="' + rid + '-sq" data-row="' + rowIdx + '" data-field="stock_qty" value="' + (saved.stock_qty || '') + '" placeholder="-" onchange="calcManualRow(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-14 text-right text-[10px] font-mono border border-emerald-200 rounded px-0.5 py-0.5 focus:border-emerald-400 mn-inp" id="' + rid + '-sp" data-row="' + rowIdx + '" data-field="stock_price" value="' + (saved.stock_price || '') + '" placeholder="-" onchange="calcManualRow(' + rowIdx + ')">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right">'
            + '<input type="number" class="w-14 text-right text-[10px] font-mono border border-slate-200 rounded px-0.5 py-0.5 bg-gray-100 text-gray-600 mn-inp" id="' + rid + '-up" data-row="' + rowIdx + '" data-field="use_price" value="' + (saved.use_price || (prevPrice > 0 ? Math.round(prevPrice) : '')) + '" placeholder="-" readonly title="자동계산 (가중평균)">'
            + '</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs" id="' + rid + '-cc">-</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs border-r border-slate-300" id="' + rid + '-ct">-</td>';
          // 손익 효과 3열
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs" id="' + rid + '-du">-</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs" id="' + rid + '-dp">-</td>';
          html += '<td class="px-1.5 py-0.5 text-right font-mono text-xs font-semibold border-r border-slate-300" id="' + rid + '-dt">-</td>';
          // 이슈사항
          html += '<td class="px-1.5 py-0.5 border-l border-slate-300">'
            + '<input type="text" class="w-32 text-[10px] border border-slate-200 rounded px-1 py-0.5 focus:border-blue-300 mn-inp" id="' + rid + '-issue" data-row="' + rowIdx + '" data-field="issue" value="' + (saved.issue || '') + '" placeholder="">'
            + '</td>';
          html += '</tr>';
          rowIdx++;
        });
      });

      tbody.innerHTML = html;
      // 초기 계산
      calcManualProfit();
    }

    function calcManualRow(idx) {
      // 사용량 변경 시 → 원단위 수동플래그 해제 (자동계산 모드로)
      var cucEl = document.getElementById('mn-r-' + idx + '-cuc');
      if (cucEl) cucEl.removeAttribute('data-manual');
      calcManualProfit();
    }

    // 원단위 입력 → 사용량 역산
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
      cuEl.value = usage > 0 ? usage : '';

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
        var curUsage = cuEl ? (Number(cuEl.value) || 0) : 0;

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

        var incomingQty = iqEl ? (Number(iqEl.value) || 0) * 1000 : 0;  // 톤→kg
        var incomingPrice = ipEl ? (Number(ipEl.value) || 0) : 0;
        var stockQty = sqEl ? (Number(sqEl.value) || 0) * 1000 : 0;  // 톤→kg
        var stockPrice = spEl ? (Number(spEl.value) || 0) : 0;

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
          if (upEl) upEl.value = Math.round(calcPrice);
        } else {
          // 가중평균 계산 불가 시 수동입력값 또는 전월단가 사용
          curPrice = upEl ? (Number(upEl.value) || prevPrice) : prevPrice;
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

    function renderCalcResult() {
      var emptyEl = document.getElementById('cr-empty-msg');
      var dashEl = document.getElementById('cr-dashboard');
      if (!mnMaterials || !mnMaterials.length) {
        if (emptyEl) emptyEl.classList.remove('hidden');
        if (dashEl) dashEl.classList.add('hidden');
        return;
      }
      if (emptyEl) emptyEl.classList.add('hidden');
      if (dashEl) dashEl.classList.remove('hidden');

      // 기간/호기 표시
      var year = document.getElementById('analysisYear').value;
      var month = document.getElementById('analysisMonth').value.padStart(2, '0');
      var curLabel = year.substring(2) + '.' + month + '월 (예상)';
      var prevMonth = parseInt(month) - 1;
      var prevYear = parseInt(year);
      if (prevMonth < 1) { prevMonth = 12; prevYear--; }
      var prevLabel = String(prevYear).substring(2) + '.' + String(prevMonth).padStart(2,'0') + '월 (실적)';

      var plEl = document.getElementById('cr-period-label');
      if (plEl) plEl.textContent = prevLabel + ' vs ' + curLabel;
      var mlEl = document.getElementById('cr-machine-label');
      if (mlEl) mlEl.textContent = mnMachine || 'PM2';

      // 당월 총 생산량(톤)
      var curProdInputs = document.querySelectorAll('.mn-cur-prod');
      var curProdTon = 0;
      curProdInputs.forEach(function(inp) { curProdTon += Number(inp.value) || 0; });
      if (curProdTon === 0) curProdTon = 1;

      // 전월 총 생산량(톤)
      var prevProdTon = 0;
      for (var k in mnPrevProd) { prevProdTon += (mnPrevProd[k] || 0) / 1000; }
      if (prevProdTon === 0) prevProdTon = 1;

      // 자재별 계산
      crData = [];
      var groups = {};
      var totalCost = 0;
      var totalSaving = 0;
      var totalWorse = 0;

      mnMaterials.forEach(function(m, idx) {
        var rid = 'mn-r-' + idx;
        var prevUsage = m.usage_qty || 0;
        var prevPrice = m.unit_price || 0;

        // DOM에서 입력값 읽기
        var sqEl = document.getElementById(rid + '-sq');
        var spEl = document.getElementById(rid + '-sp');
        var iqEl = document.getElementById(rid + '-iq');
        var ipEl = document.getElementById(rid + '-ip');
        var upEl = document.getElementById(rid + '-up');
        var cuEl = document.getElementById(rid + '-cu');

        var stockQty = sqEl ? (Number(sqEl.value) || 0) : 0;
        var stockPrice = spEl ? (Number(spEl.value) || 0) : 0;
        var incomingQty = iqEl ? (Number(iqEl.value) || 0) : 0;
        var incomingPrice = ipEl ? (Number(ipEl.value) || 0) : 0;
        var curUsage = cuEl ? (Number(cuEl.value) || 0) : 0;

        // 가중평균 사용단가
        var stockQtyKg = stockQty * 1000;
        var incomingQtyKg = incomingQty * 1000;
        var totalQtyKg = stockQtyKg + incomingQtyKg;
        var calcPrice = 0;
        if (totalQtyKg > 0 && (stockPrice > 0 || incomingPrice > 0)) {
          calcPrice = (stockQtyKg * stockPrice + incomingQtyKg * incomingPrice) / totalQtyKg;
        }
        var curPrice = calcPrice > 0 ? calcPrice : (upEl ? (Number(upEl.value) || prevPrice) : prevPrice);

        // 비용
        var curCost = curUsage * curPrice;
        var curCostMil = curCost / 1000000;
        totalCost += curCostMil;

        // 원단위
        var unitCost = curProdTon > 0 ? curCost / curProdTon : 0;

        // 손익효과
        var diffUsage = (prevUsage - curUsage) * prevPrice;
        var diffPrice = (curUsage > 0 && curPrice > 0) ? (prevPrice - curPrice) * curUsage : 0;
        var diffTotal = diffUsage + diffPrice;

        if (diffPrice > 0) totalSaving += diffPrice;
        if (diffPrice < 0) totalWorse += diffPrice;

        var groupName = m.group_name || '기타';
        if (!groups[groupName]) {
          groups[groupName] = { count: 0, cost: 0, saving: 0, worse: 0, unitCostSum: 0 };
        }
        groups[groupName].count++;
        groups[groupName].cost += curCostMil;
        groups[groupName].unitCostSum += unitCost;
        if (diffPrice > 0) groups[groupName].saving += diffPrice;
        if (diffPrice < 0) groups[groupName].worse += diffPrice;

        crData.push({
          code: m.code,
          name: m.name,
          group: groupName,
          stockQty: stockQty,
          stockPrice: stockPrice,
          incomingQty: incomingQty,
          incomingPrice: incomingPrice,
          calcPrice: calcPrice,
          curPrice: curPrice,
          prevPrice: prevPrice,
          priceDiff: curPrice - prevPrice,
          curUsage: curUsage,
          curCostMil: curCostMil,
          unitCost: unitCost,
          diffUsage: diffUsage,
          diffPrice: diffPrice,
          diffTotal: diffTotal
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

      // 그룹 요약 테이블
      var gbBody = document.getElementById('cr-group-body');
      if (gbBody) {
        var gHtml = '';
        var gKeys = Object.keys(groups).sort();
        gKeys.forEach(function(g) {
          var gi = groups[g];
          var gUnitCost = gi.count > 0 ? gi.unitCostSum / gi.count : 0;
          var gNetEffect = gi.saving + gi.worse;
          gHtml += '<tr class="border-b border-slate-100 hover:bg-slate-50/50">';
          gHtml += '<td class="px-2 py-1.5 font-medium text-gray-700">' + g + '</td>';
          gHtml += '<td class="px-2 py-1.5 text-right text-gray-600">' + gi.count + '</td>';
          gHtml += '<td class="px-2 py-1.5 text-right font-mono">' + (gi.cost > 0 ? Math.round(gi.cost).toLocaleString() : '-') + '</td>';
          gHtml += '<td class="px-2 py-1.5 text-right font-mono">' + (gUnitCost > 0 ? Math.round(gUnitCost).toLocaleString() : '-') + '</td>';
          gHtml += '<td class="px-2 py-1.5 text-right font-mono text-blue-600">' + (gi.saving > 0 ? '+' + Math.round(gi.saving).toLocaleString() : '-') + '</td>';
          gHtml += '<td class="px-2 py-1.5 text-right font-mono text-red-500">' + (gi.worse < 0 ? Math.round(gi.worse).toLocaleString() : '-') + '</td>';
          gHtml += '<td class="px-2 py-1.5 text-right font-mono ' + (gNetEffect >= 0 ? 'text-blue-600' : 'text-red-500') + '">' + (gNetEffect !== 0 ? (gNetEffect > 0 ? '+' : '') + Math.round(gNetEffect).toLocaleString() : '-') + '</td>';
          gHtml += '</tr>';
        });
        // 합계 행
        var netTotal = totalSaving + totalWorse;
        gHtml += '<tr class="bg-slate-50 font-semibold border-t border-slate-300">';
        gHtml += '<td class="px-2 py-2 text-gray-800">합계</td>';
        gHtml += '<td class="px-2 py-2 text-right text-gray-800">' + crData.length + '</td>';
        gHtml += '<td class="px-2 py-2 text-right font-mono text-gray-800">' + Math.round(totalCost).toLocaleString() + '</td>';
        gHtml += '<td class="px-2 py-2 text-right font-mono text-gray-800">' + Math.round(avgUC).toLocaleString() + '</td>';
        gHtml += '<td class="px-2 py-2 text-right font-mono text-blue-600">' + (totalSaving > 0 ? '+' + Math.round(totalSaving).toLocaleString() : '-') + '</td>';
        gHtml += '<td class="px-2 py-2 text-right font-mono text-red-500">' + (totalWorse < 0 ? Math.round(totalWorse).toLocaleString() : '-') + '</td>';
        gHtml += '<td class="px-2 py-2 text-right font-mono ' + (netTotal >= 0 ? 'text-blue-600' : 'text-red-500') + '">' + (netTotal !== 0 ? (netTotal > 0 ? '+' : '') + Math.round(netTotal).toLocaleString() : '-') + '</td>';
        gHtml += '</tr>';
        gbBody.innerHTML = gHtml;
      }

      // 상세 테이블 렌더링
      renderCalcResultTable();
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
        if (sortVal === 'effect-desc') return a.diffTotal - b.diffTotal;
        if (sortVal === 'effect-asc') return b.diffTotal - a.diffTotal;
        if (sortVal === 'cost-desc') return b.curCostMil - a.curCostMil;
        if (sortVal === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });

      var tbody = document.getElementById('cr-detail-body');
      var tfoot = document.getElementById('cr-detail-foot');
      if (!tbody) return;

      var html = '';
      var sumCost = 0, sumSaving = 0, sumWorse = 0, sumDiffUsage = 0;

      filtered.forEach(function(d, idx) {
        var priceDiffColor = d.priceDiff > 0 ? 'text-red-500' : (d.priceDiff < 0 ? 'text-blue-600' : 'text-gray-500');
        var effectColor = d.diffTotal > 0 ? 'text-blue-600' : (d.diffTotal < 0 ? 'text-red-500' : 'text-gray-400');

        sumCost += d.curCostMil;
        sumDiffUsage += d.diffUsage;
        if (d.diffPrice > 0) sumSaving += d.diffPrice;
        if (d.diffPrice < 0) sumWorse += d.diffPrice;

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
        html += '<td class="px-2 py-1.5 text-right font-mono bg-orange-50 ' + priceDiffColor + '">' + (d.priceDiff !== 0 ? (d.priceDiff > 0 ? '+' : '') + Math.round(d.priceDiff).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono">' + (d.curUsage > 0 ? Math.round(d.curUsage).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono">' + (d.curCostMil > 0 ? Math.round(d.curCostMil).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono">' + (d.unitCost > 0 ? Math.round(d.unitCost).toLocaleString() : '-') + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono bg-blue-50 ' + (d.diffUsage > 0 ? 'text-blue-600' : (d.diffUsage < 0 ? 'text-red-500' : 'text-gray-400')) + '">' + crFmtEffect(d.diffUsage) + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono bg-blue-50 ' + (d.diffPrice > 0 ? 'text-blue-600' : (d.diffPrice < 0 ? 'text-red-500' : 'text-gray-400')) + '">' + crFmtEffect(d.diffPrice) + '</td>';
        html += '<td class="px-2 py-1.5 text-right font-mono bg-blue-50 font-semibold ' + effectColor + '">' + crFmtEffect(d.diffTotal) + '</td>';
        html += '</tr>';
      });
      tbody.innerHTML = html;

      // 합계 footer
      if (tfoot) {
        var sumNet = sumSaving + sumWorse;
        var fHtml = '<tr>';
        fHtml += '<td colspan="4" class="px-2 py-2 text-gray-700">합계 (' + filtered.length + '건)</td>';
        fHtml += '<td colspan="8"></td>';
        fHtml += '<td class="px-2 py-2 text-right font-mono">' + Math.round(sumCost).toLocaleString() + '</td>';
        fHtml += '<td class="px-2 py-2 text-right font-mono">-</td>';
        fHtml += '<td class="px-2 py-2 text-right font-mono bg-blue-50 ' + (sumDiffUsage >= 0 ? 'text-blue-600' : 'text-red-500') + '">' + crFmtEffect(sumDiffUsage) + '</td>';
        fHtml += '<td class="px-2 py-2 text-right font-mono bg-blue-50 ' + (sumNet >= 0 ? 'text-blue-600' : 'text-red-500') + '">' + crFmtEffect(sumSaving + sumWorse) + '</td>';
        fHtml += '<td class="px-2 py-2 text-right font-mono bg-blue-50 font-bold ' + (sumNet + sumDiffUsage >= 0 ? 'text-blue-600' : 'text-red-500') + '">' + crFmtEffect(sumDiffUsage + sumNet) + '</td>';
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
      // CSV export
      var csvRows = [];
      csvRows.push('No,자재코드,자재명,그룹,기초재고(톤),기초단가,입고(톤),입고단가,가중평균단가,전월단가,단가차이,당월사용량(kg),재료비(백만원),원단위(원/톤),사용량효과,단가효과,총손익효과');
      crData.forEach(function(d, idx) {
        csvRows.push([idx + 1, d.code, d.name, d.group, d.stockQty, Math.round(d.stockPrice), d.incomingQty, Math.round(d.incomingPrice), Math.round(d.calcPrice), Math.round(d.prevPrice), Math.round(d.priceDiff), Math.round(d.curUsage), Math.round(d.curCostMil), Math.round(d.unitCost), Math.round(d.diffUsage), Math.round(d.diffPrice), Math.round(d.diffTotal)].join(','));
      });
      var csvContent = csvRows.join(String.fromCharCode(10));
      var BOM = String.fromCharCode(0xFEFF);
      var blob = new Blob([BOM + csvContent], {type: 'text/csv;charset=utf-8;'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'calc_result_' + (mnMachine || 'PM2') + '_' + document.getElementById('analysisYear').value + document.getElementById('analysisMonth').value.padStart(2,'0') + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    // ====== 시뮬레이션 플로우 (React Flow 스타일) ======
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
      // 자재 목록이 있으면 자재코드/자재명 포함, 없으면 빈 양식
      var rows = [];
      if (mnMaterials && mnMaterials.length) {
        mnMaterials.forEach(function(m) {
          rows.push({
            '자재코드': m.code || '',
            '자재명': m.name || '',
            '자재그룹': m.group_name || '',
            '기초재고수량(톤)': '',
            '기초재고단가(원/kg)': '',
            '입고수량(톤)': '',
            '입고단가(원/kg)': '',
            '사용량(kg)': '',
            '이슈사항': ''
          });
        });
      } else {
        // 빈 샘플 행 3개
        for (var i = 0; i < 3; i++) {
          rows.push({
            '자재코드': '',
            '자재명': '',
            '자재그룹': '',
            '기초재고수량(톤)': '',
            '기초재고단가(원/kg)': '',
            '입고수량(톤)': '',
            '입고단가(원/kg)': '',
            '사용량(kg)': '',
            '이슈사항': ''
          });
        }
      }
      var ws = XLSX.utils.json_to_sheet(rows);
      // 컬럼 너비 설정
      ws['!cols'] = [
        {wch: 14}, {wch: 25}, {wch: 14},
        {wch: 16}, {wch: 18},
        {wch: 14}, {wch: 18},
        {wch: 14}, {wch: 20}
      ];
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '수기입력양식');
      var filename = '수기입력_양식_' + (mnMachine || 'PM2') + '_' + document.getElementById('analysisYear').value + document.getElementById('analysisMonth').value.padStart(2,'0') + '.xlsx';
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

      var cols = Object.keys(data[0]);
      var theadHtml = '<th class="px-2 py-1.5 text-center font-semibold text-gray-600 border-b border-slate-200 w-10">상태</th>';
      cols.forEach(function(col) {
        theadHtml += '<th class="px-2 py-1.5 text-left font-semibold text-gray-600 border-b border-slate-200 whitespace-nowrap">' + col + '</th>';
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
      var summaryParts = ['<span class="font-medium text-gray-700">시트: ' + data.length + '행</span>'];
      if (matchCount > 0) summaryParts.push('<span class="text-emerald-600 font-medium">기존 매칭: ' + matchCount + '건</span>');
      if (newCount > 0) summaryParts.push('<span class="text-amber-600 font-semibold"><i class="fas fa-plus-circle mr-0.5"></i>신규 자재: ' + newCount + '건</span>');
      if (matchCount === 0 && newCount === 0) summaryParts.push('<span class="text-red-500">자재코드 매칭 확인 필요</span>');
      summaryParts.push('<span class="text-gray-400 text-[10px]">컬럼: ' + cols.join(', ').substring(0, 100) + '</span>');
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

      var applied = 0;
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

        var rid = 'mn-r-' + idx;
        var cuEl = document.getElementById(rid + '-cu');
        var usageVal = uploaded['사용량(kg)'] || uploaded['당월_사용량(kg)'] || uploaded['cur_usage'] || uploaded['사용량'];
        if (cuEl && usageVal !== undefined) { cuEl.value = Math.round(Number(usageVal)); applied++; }
        var iqEl = document.getElementById(rid + '-iq');
        var iqVal = uploaded['입고수량(톤)'] || uploaded['incoming_qty'] || uploaded['입고수량'];
        if (iqEl && iqVal !== undefined) iqEl.value = Number(iqVal);
        var ipEl = document.getElementById(rid + '-ip');
        var ipVal = uploaded['입고단가(원/kg)'] || uploaded['incoming_price'] || uploaded['입고단가'];
        if (ipEl && ipVal !== undefined) ipEl.value = Math.round(Number(ipVal));
        var sqEl = document.getElementById(rid + '-sq');
        var sqVal = uploaded['기초재고수량(톤)'] || uploaded['stock_qty'] || uploaded['기초재고수량'];
        if (sqEl && sqVal !== undefined) sqEl.value = Number(sqVal);
        var spEl = document.getElementById(rid + '-sp');
        var spVal = uploaded['기초재고단가(원/kg)'] || uploaded['stock_price'] || uploaded['기초재고단가'];
        if (spEl && spVal !== undefined) spEl.value = Math.round(Number(spVal));
        var upEl = document.getElementById(rid + '-up');
        var upVal = uploaded['사용단가(원/kg)'] || uploaded['use_price'] || uploaded['사용단가'];
        if (upEl && upVal !== undefined) upEl.value = Math.round(Number(upVal));
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
          var issueVal = row['이슈사항'] || row['issue'] || row['비고'];
          if (issueVal !== undefined) saved.issue = String(issueVal);
          mnInputData.materials[nm.code] = saved;
        });
        // 테이블 재렌더링 (신규 포함)
        renderManualDetail();
        applied += newMaterials.length;
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

      closeManualPreview();
      calcManualProfit();
      onManualProdChange();
      var msg = '엑셀 데이터 적용 완료! (기존 매칭: ' + applied + '건';
      if (newMaterials.length > 0) msg += ', 신규 추가: ' + newMaterials.length + '건';
      msg += ')' + String.fromCharCode(10) + '확인 후 [저장] 버튼을 눌러주세요.';
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

      // 자재별 데이터 수집
      var materials = {};
      mnMaterials.forEach(function(m, idx) {
        var rid = 'mn-r-' + idx;
        var row = {};
        ['prev_uc','cur_uc','cur_usage','incoming_qty','incoming_price','stock_qty','stock_price','use_price','issue'].forEach(function(field) {
          var suffix = {prev_uc:'-puc',cur_uc:'-cuc',cur_usage:'-cu',incoming_qty:'-iq',incoming_price:'-ip',stock_qty:'-sq',stock_price:'-sp',use_price:'-up',issue:'-issue'}[field];
          var el = document.getElementById(rid + suffix);
          if (el) row[field] = el.value;
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

      var payload = { ym: ym, machine: mnMachine, data: { production: production, materials: materials, new_materials: newMaterialsMeta }, saved_by: savedBy };

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
  </script>
</body>
</html>`;
}
