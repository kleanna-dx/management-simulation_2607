export function mainPage(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>원부자재 사전원가 분석</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: { 50:'#eff6ff', 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 800:'#1e40af', 900:'#1e3a8a' },
          }
        }
      }
    }
  </script>
  <style>
    * { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .pill-tab { @apply px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border; }
    .pill-tab-active { @apply bg-primary-600 text-white border-primary-600 shadow-sm; }
    .pill-tab-inactive { @apply bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300; }
    .card { @apply bg-white rounded-xl border border-gray-200 shadow-sm; }
    .positive { color: #dc2626; }
    .negative { color: #2563eb; }
    .btn-primary { @apply bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors; }
    .btn-edit { @apply bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-100 transition-colors; }
    .btn-delete { @apply bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-100 transition-colors; }
    .data-table { @apply w-full text-sm; }
    .data-table thead { @apply bg-gray-50 border-b border-gray-200; }
    .data-table th { @apply px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap; }
    .data-table td { @apply px-4 py-3 text-gray-700 border-b border-gray-100; }
    .data-table tbody tr:hover { @apply bg-gray-50; }
    .fade-in { animation: fadeIn 0.2s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .unit-chip { @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium; }
    .unit-chip-pm2 { @apply bg-blue-100 text-blue-700; }
    .unit-chip-pm3 { @apply bg-purple-100 text-purple-700; }
    .unit-chip-chem { @apply bg-amber-100 text-amber-700; }
    .unit-chip-tissue { @apply bg-green-100 text-green-700; }
    .modal-overlay { @apply fixed inset-0 bg-black/50 z-50 flex items-center justify-center; }
    .modal-content { @apply bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden; }
    .summary-card { @apply p-5 rounded-xl border transition-all hover:shadow-md; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-[1400px] mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">원부자재 사전원가 분석</h1>
          <p class="text-sm text-gray-500 mt-0.5">호기별 원부자재 사용량·단가 차이 분석 및 손익 효과 예측</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500"><strong class="text-gray-700">관리자</strong> 님 환영합니다</span>
          <button class="text-sm text-gray-400 hover:text-gray-600 ml-2">로그아웃</button>
        </div>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <nav class="bg-white border-b border-gray-100">
    <div class="max-w-[1400px] mx-auto px-6 py-3">
      <div class="flex items-center gap-2 flex-wrap">
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
          <i class="fas fa-edit mr-1.5"></i>수동 입력
        </button>
        <button onclick="switchTab('master')" id="tab-master" class="pill-tab pill-tab-inactive">
          <i class="fas fa-database mr-1.5"></i>기준정보 관리
        </button>
      </div>
    </div>
  </nav>

  <!-- Filter Bar -->
  <div class="bg-white border-b border-gray-100">
    <div class="max-w-[1400px] mx-auto px-6 py-3">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-500">분석기간</span>
          <select id="analysisYear" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" onchange="loadAnalysis()">
            <option value="2026">2026년</option>
            <option value="2025">2025년</option>
          </select>
          <select id="analysisMonth" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" onchange="loadAnalysis()">
            <option value="6">6월</option>
            <option value="5">5월</option>
            <option value="4">4월</option>
            <option value="3">3월</option>
            <option value="2">2월</option>
            <option value="1">1월</option>
          </select>
        </div>
        <div class="h-5 w-px bg-gray-300"></div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-500">호기</span>
          <div class="flex gap-1.5">
            <button onclick="setUnitFilter('')" id="unit-btn-all" class="pill-tab pill-tab-active text-xs !px-3 !py-1">전체</button>
            <button onclick="setUnitFilter('1')" id="unit-btn-1" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">PM2</button>
            <button onclick="setUnitFilter('2')" id="unit-btn-2" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">PM3</button>
            <button onclick="setUnitFilter('3')" id="unit-btn-3" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">제지약품</button>
            <button onclick="setUnitFilter('4')" id="unit-btn-4" class="pill-tab pill-tab-inactive text-xs !px-3 !py-1">화장지</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <main class="max-w-[1400px] mx-auto px-6 py-6">
    <!-- Dashboard Tab -->
    <div id="content-dashboard" class="fade-in space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="summary-card border-gray-200 bg-white">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">전월 총원가</p>
          <p id="s-prev" class="text-xl font-bold text-gray-900 mt-2">-</p>
        </div>
        <div class="summary-card border-gray-200 bg-white">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">당월 총원가</p>
          <p id="s-cur" class="text-xl font-bold text-gray-900 mt-2">-</p>
        </div>
        <div class="summary-card border-blue-200 bg-blue-50">
          <p class="text-xs font-medium text-blue-500 uppercase tracking-wide">수량차이 효과</p>
          <p id="s-qty" class="text-xl font-bold mt-2">-</p>
          <p class="text-xs text-gray-400 mt-1">사용량 변동 영향</p>
        </div>
        <div class="summary-card border-amber-200 bg-amber-50">
          <p class="text-xs font-medium text-amber-500 uppercase tracking-wide">단가차이 효과</p>
          <p id="s-price" class="text-xl font-bold mt-2">-</p>
          <p class="text-xs text-gray-400 mt-1">단가 변동 영향</p>
        </div>
        <div class="summary-card border-red-200 bg-red-50">
          <p class="text-xs font-medium text-red-500 uppercase tracking-wide">총 원가차이</p>
          <p id="s-total" class="text-xl font-bold mt-2">-</p>
          <p class="text-xs text-gray-400 mt-1">전월 대비 증감</p>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">호기별 원가 비교 (전월 vs 당월)</h3>
          <canvas id="unitChart" height="220"></canvas>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">손익효과 분해 (수량효과 vs 단가효과)</h3>
          <canvas id="effectChart" height="220"></canvas>
        </div>
      </div>

      <!-- Unit Summary Table -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-semibold text-gray-700">호기별 요약</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>호기</th>
                <th class="text-right">전월 원가</th>
                <th class="text-right">당월 원가</th>
                <th class="text-right">수량효과</th>
                <th class="text-right">단가효과</th>
                <th class="text-right">총 차이</th>
                <th class="text-right">증감률</th>
                <th class="text-right">자재수</th>
              </tr>
            </thead>
            <tbody id="unit-summary-body"></tbody>
          </table>
        </div>
      </div>

      <!-- Top Impact -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200">
          <h3 class="font-semibold text-gray-700">원가 영향 TOP 10 자재</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
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
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-semibold text-gray-700">전월 대비 상세 분석표</h3>
          <button onclick="exportCSV()" class="btn-primary">
            <i class="fas fa-file-csv mr-1.5"></i>CSV 내보내기
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
            <h3 class="font-semibold text-gray-700 text-lg">엑셀 데이터 업로드</h3>
            <p class="text-sm text-gray-500 mt-1">엑셀 파일로 원부자재 실적 데이터를 일괄 등록합니다.</p>
          </div>
          <button onclick="downloadTemplate()" class="btn-primary">
            <i class="fas fa-download mr-1.5"></i>양식 다운로드
          </button>
        </div>

        <!-- Upload Area -->
        <div id="upload-area" class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary-400 transition-colors cursor-pointer"
             ondragover="event.preventDefault(); this.classList.add('border-primary-400','bg-primary-50')"
             ondragleave="this.classList.remove('border-primary-400','bg-primary-50')"
             ondrop="handleDrop(event)"
             onclick="document.getElementById('file-input').click()">
          <input type="file" id="file-input" accept=".xlsx,.xls,.csv" class="hidden" onchange="handleFileSelect(event)">
          <i class="fas fa-cloud-upload-alt text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-600 font-medium">엑셀 파일을 드래그하거나 클릭하여 업로드</p>
          <p class="text-sm text-gray-400 mt-2">지원 형식: .xlsx, .xls, .csv</p>
        </div>

        <!-- Preview -->
        <div id="upload-preview" class="hidden mt-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <i class="fas fa-file-excel text-green-600 text-xl"></i>
              <div>
                <p id="upload-filename" class="font-medium text-gray-700"></p>
                <p id="upload-info" class="text-sm text-gray-400"></p>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="resetUpload()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">취소</button>
              <button onclick="submitUpload()" class="btn-primary">
                <i class="fas fa-check mr-1.5"></i>업로드 확정 (<span id="upload-count">0</span>건)
              </button>
            </div>
          </div>
          <div class="overflow-x-auto border border-gray-200 rounded-lg max-h-96">
            <table class="data-table">
              <thead id="preview-head"></thead>
              <tbody id="preview-body"></tbody>
            </table>
          </div>
        </div>

        <!-- Upload Format Guide -->
        <div class="mt-8 bg-gray-50 rounded-xl p-5">
          <h4 class="font-semibold text-gray-700 mb-3"><i class="fas fa-info-circle text-primary-500 mr-2"></i>업로드 양식 안내</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-2">필수 컬럼</p>
              <table class="text-xs w-full">
                <tr class="border-b border-gray-200"><td class="py-1.5 font-medium text-gray-700">호기코드</td><td class="text-gray-500">PM2, PM3, CHEM, TISSUE</td></tr>
                <tr class="border-b border-gray-200"><td class="py-1.5 font-medium text-gray-700">자재코드</td><td class="text-gray-500">RM-001, SM-001 등</td></tr>
                <tr class="border-b border-gray-200"><td class="py-1.5 font-medium text-gray-700">년도</td><td class="text-gray-500">2026</td></tr>
                <tr class="border-b border-gray-200"><td class="py-1.5 font-medium text-gray-700">월</td><td class="text-gray-500">1~12</td></tr>
                <tr class="border-b border-gray-200"><td class="py-1.5 font-medium text-gray-700">사용량</td><td class="text-gray-500">숫자</td></tr>
                <tr class="border-b border-gray-200"><td class="py-1.5 font-medium text-gray-700">단가</td><td class="text-gray-500">원 단위</td></tr>
              </table>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600 mb-2">선택 컬럼</p>
              <table class="text-xs w-full">
                <tr class="border-b border-gray-200"><td class="py-1.5 font-medium text-gray-700">생산량</td><td class="text-gray-500">숫자 (기본: 0)</td></tr>
                <tr class="border-b border-gray-200"><td class="py-1.5 font-medium text-gray-700">비고</td><td class="text-gray-500">텍스트</td></tr>
              </table>
              <div class="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="text-xs text-yellow-700"><i class="fas fa-exclamation-triangle mr-1"></i>동일 호기/자재/기간 데이터는 자동으로 덮어씁니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Tab -->
    <div id="content-input" class="hidden fade-in">
      <div class="card p-6">
        <h3 class="font-semibold text-gray-700 text-lg mb-4">실적 데이터 수동 입력</h3>
        <form id="record-form" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">호기</label>
            <select id="input-unit" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" required></select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">원부자재</label>
            <select id="input-material" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" required></select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">년도</label>
            <input type="number" id="input-year" value="2026" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">월</label>
            <input type="number" id="input-month" min="1" max="12" value="6" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">사용량</label>
            <input type="number" id="input-qty" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">단가 (원)</label>
            <input type="number" id="input-price" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">생산량</label>
            <input type="number" id="input-production" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          </div>
          <div class="flex items-end">
            <button type="submit" class="btn-primary w-full py-2.5">
              <i class="fas fa-save mr-1.5"></i>저장
            </button>
          </div>
        </form>
      </div>

      <!-- Recent Records -->
      <div class="card overflow-hidden mt-6">
        <div class="px-5 py-4 border-b border-gray-200">
          <h3 class="font-semibold text-gray-700">등록된 실적 데이터</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>호기</th>
                <th>자재</th>
                <th>기간</th>
                <th class="text-right">사용량</th>
                <th class="text-right">단가</th>
                <th class="text-right">총원가</th>
                <th class="text-center">관리</th>
              </tr>
            </thead>
            <tbody id="recent-records"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Master Tab -->
    <div id="content-master" class="hidden fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Units Master -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-700">호기 관리</h3>
            <button onclick="document.getElementById('unit-form-area').classList.toggle('hidden')" class="btn-primary text-xs">
              <i class="fas fa-plus mr-1"></i>신규 등록
            </button>
          </div>
          <form id="unit-form" class="hidden mb-4 p-4 bg-gray-50 rounded-lg" id="unit-form-area">
            <div class="flex gap-2">
              <input type="text" id="new-unit-code" placeholder="호기코드" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
              <input type="text" id="new-unit-name" placeholder="호기명" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
              <button type="submit" class="btn-primary">등록</button>
            </div>
          </form>
          <div id="units-list" class="space-y-2"></div>
        </div>
        <!-- Materials Master -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-700">원부자재 관리</h3>
            <button onclick="document.getElementById('material-form').classList.toggle('hidden')" class="btn-primary text-xs">
              <i class="fas fa-plus mr-1"></i>신규 등록
            </button>
          </div>
          <form id="material-form" class="hidden mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
            <div class="flex gap-2">
              <input type="text" id="new-mat-code" placeholder="자재코드" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
              <input type="text" id="new-mat-name" placeholder="자재명" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
            </div>
            <div class="flex gap-2">
              <select id="new-mat-category" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="RAW">원자재</option>
                <option value="SUB">부자재</option>
              </select>
              <input type="text" id="new-mat-uom" placeholder="단위" value="kg" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
              <button type="submit" class="btn-primary">등록</button>
            </div>
          </form>
          <div id="materials-list" class="space-y-2 max-h-[500px] overflow-y-auto"></div>
        </div>
      </div>
    </div>
  </main>

  <script>
    // ============ Global State ============
    let analysisData = null;
    let unitSummaryData = null;
    let unitsCache = [];
    let materialsCache = [];
    let unitChartInstance = null;
    let effectChartInstance = null;
    let currentUnitFilter = '';
    let uploadData = [];

    // ============ Initialization ============
    document.addEventListener('DOMContentLoaded', async () => {
      await loadMasterData();
      await loadAnalysis();
    });

    // ============ Tab Navigation ============
    function switchTab(tab) {
      ['dashboard','detail','upload','input','master'].forEach(t => {
        document.getElementById('content-' + t)?.classList.add('hidden');
        const tabEl = document.getElementById('tab-' + t);
        if (tabEl) { tabEl.classList.remove('pill-tab-active'); tabEl.classList.add('pill-tab-inactive'); }
      });
      document.getElementById('content-' + tab)?.classList.remove('hidden');
      const activeTab = document.getElementById('tab-' + tab);
      if (activeTab) { activeTab.classList.add('pill-tab-active'); activeTab.classList.remove('pill-tab-inactive'); }

      if (tab === 'input') loadRecentRecords();
      if (tab === 'master') { loadUnitsList(); loadMaterialsList(); }
    }

    // ============ Unit Filter ============
    function setUnitFilter(id) {
      currentUnitFilter = id;
      document.querySelectorAll('[id^="unit-btn-"]').forEach(btn => {
        btn.classList.remove('pill-tab-active');
        btn.classList.add('pill-tab-inactive');
      });
      const activeBtn = id ? document.getElementById('unit-btn-' + id) : document.getElementById('unit-btn-all');
      activeBtn?.classList.add('pill-tab-active');
      activeBtn?.classList.remove('pill-tab-inactive');
      loadAnalysis();
    }

    // ============ Data Loading ============
    async function loadMasterData() {
      const [unitsRes, matsRes] = await Promise.all([
        fetch('/api/units').then(r => r.json()),
        fetch('/api/materials').then(r => r.json())
      ]);
      unitsCache = unitsRes;
      materialsCache = matsRes;
      
      document.getElementById('input-unit').innerHTML = 
        unitsCache.map(u => '<option value="'+u.id+'">'+u.unit_name+' ('+u.unit_code+')</option>').join('');
      document.getElementById('input-material').innerHTML = 
        materialsCache.map(m => '<option value="'+m.id+'">[' + (m.category==='RAW'?'원':'부') + '] '+m.material_name+'</option>').join('');
    }

    async function loadAnalysis() {
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value;
      
      const params = new URLSearchParams({ year, month });
      if (currentUnitFilter) params.set('unit_id', currentUnitFilter);
      
      const [comparison, unitSummary] = await Promise.all([
        fetch('/api/analysis/comparison?' + params).then(r => r.json()),
        fetch('/api/analysis/unit-summary?' + new URLSearchParams({ year, month })).then(r => r.json())
      ]);
      
      analysisData = comparison;
      unitSummaryData = unitSummary;
      
      renderDashboard();
      renderDetailTable();
    }

    // ============ Dashboard Rendering ============
    function renderDashboard() {
      if (!analysisData) return;
      const s = analysisData.summary;
      
      document.getElementById('s-prev').textContent = formatWon(s.total_prev_cost);
      document.getElementById('s-cur').textContent = formatWon(s.total_cur_cost);
      
      setValueWithColor('s-qty', s.total_qty_effect);
      setValueWithColor('s-price', s.total_price_effect);
      setValueWithColor('s-total', s.total_cost_diff);
      
      renderUnitChart();
      renderEffectChart();
      renderUnitSummaryTable();
      renderTopImpact();
    }

    function setValueWithColor(id, value) {
      const el = document.getElementById(id);
      el.textContent = formatSignedWon(value);
      el.className = 'text-xl font-bold mt-2 ' + (value > 0 ? 'positive' : value < 0 ? 'negative' : 'text-gray-900');
    }

    function renderUnitChart() {
      if (!unitSummaryData || unitSummaryData.length === 0) return;
      const ctx = document.getElementById('unitChart').getContext('2d');
      if (unitChartInstance) unitChartInstance.destroy();
      
      unitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: unitSummaryData.map(u => u.unit_name),
          datasets: [
            { label: '전월', data: unitSummaryData.map(u => u.prev_total_cost), backgroundColor: '#93c5fd', borderRadius: 4 },
            { label: '당월', data: unitSummaryData.map(u => u.cur_total_cost), backgroundColor: '#2563eb', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
          scales: { y: { beginAtZero: true, ticks: { callback: v => (v/1000000).toFixed(0)+'백만' } } }
        }
      });
    }

    function renderEffectChart() {
      if (!unitSummaryData || unitSummaryData.length === 0) return;
      const ctx = document.getElementById('effectChart').getContext('2d');
      if (effectChartInstance) effectChartInstance.destroy();
      
      effectChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: unitSummaryData.map(u => u.unit_name),
          datasets: [
            { label: '수량효과', data: unitSummaryData.map(u => u.total_qty_effect), backgroundColor: '#3b82f6', borderRadius: 4 },
            { label: '단가효과', data: unitSummaryData.map(u => u.total_price_effect), backgroundColor: '#f59e0b', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
          scales: { y: { ticks: { callback: v => (v/1000000).toFixed(0)+'백만' } } }
        }
      });
    }

    function renderUnitSummaryTable() {
      const tbody = document.getElementById('unit-summary-body');
      if (!unitSummaryData?.length) { tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-400">데이터 없음</td></tr>'; return; }
      
      tbody.innerHTML = unitSummaryData.map(u => {
        const pct = u.prev_total_cost > 0 ? ((u.cost_diff / u.prev_total_cost) * 100).toFixed(1) : '-';
        return \`<tr>
          <td><span class="unit-chip \${getUnitChipClass(u.unit_code)}">\${u.unit_name}</span></td>
          <td class="text-right">\${formatWon(u.prev_total_cost)}</td>
          <td class="text-right">\${formatWon(u.cur_total_cost)}</td>
          <td class="text-right \${u.total_qty_effect>0?'positive':'negative'}">\${formatSignedWon(u.total_qty_effect)}</td>
          <td class="text-right \${u.total_price_effect>0?'positive':'negative'}">\${formatSignedWon(u.total_price_effect)}</td>
          <td class="text-right font-semibold \${u.cost_diff>0?'positive':'negative'}">\${formatSignedWon(u.cost_diff)}</td>
          <td class="text-right"><span class="\${u.cost_diff>0?'text-red-500':'text-blue-500'}">\${pct !== '-' ? (u.cost_diff>0?'+':'')+pct+'%' : '-'}</span></td>
          <td class="text-right text-gray-500">\${u.material_count}건</td>
        </tr>\`;
      }).join('');
    }

    function renderTopImpact() {
      const tbody = document.getElementById('top-impact-body');
      if (!analysisData?.items?.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center py-8 text-gray-400">데이터 없음</td></tr>'; return; }
      
      const sorted = [...analysisData.items].sort((a,b) => Math.abs(b.cost_diff) - Math.abs(a.cost_diff)).slice(0,10);
      tbody.innerHTML = sorted.map((item, idx) => \`<tr>
        <td class="font-bold text-gray-400">\${idx+1}</td>
        <td><span class="unit-chip \${getUnitChipClass(item.unit_code)}">\${item.unit_name}</span></td>
        <td><span class="px-2 py-0.5 rounded text-xs font-medium \${item.category==='RAW'?'bg-blue-50 text-blue-600':'bg-green-50 text-green-600'}">\${item.category==='RAW'?'원자재':'부자재'}</span></td>
        <td class="font-medium">\${item.material_name}</td>
        <td class="text-right">\${formatWon(item.prev_total_cost)}</td>
        <td class="text-right">\${formatWon(item.cur_total_cost)}</td>
        <td class="text-right \${item.qty_effect>0?'positive':'negative'}">\${formatSignedWon(item.qty_effect)}</td>
        <td class="text-right \${item.price_effect>0?'positive':'negative'}">\${formatSignedWon(item.price_effect)}</td>
        <td class="text-right font-semibold \${item.cost_diff>0?'positive':'negative'}">\${formatSignedWon(item.cost_diff)}</td>
        <td class="text-right"><span class="\${item.cost_diff>0?'text-red-500':'text-blue-500'}">\${item.cost_change_pct != null ? (item.cost_diff>0?'+':'')+item.cost_change_pct+'%' : '-'}</span></td>
      </tr>\`).join('');
    }

    // ============ Detail Table ============
    function renderDetailTable() {
      const tbody = document.getElementById('detail-table-body');
      if (!analysisData?.items?.length) { tbody.innerHTML = '<tr><td colspan="16" class="text-center py-8 text-gray-400">데이터 없음</td></tr>'; return; }
      
      tbody.innerHTML = analysisData.items.map(item => \`<tr>
        <td><span class="unit-chip \${getUnitChipClass(item.unit_code)}">\${item.unit_name}</span></td>
        <td><span class="px-2 py-0.5 rounded text-xs \${item.category==='RAW'?'bg-blue-50 text-blue-600':'bg-green-50 text-green-600'}">\${item.category==='RAW'?'원':'부'}</span></td>
        <td class="text-gray-400 text-xs">\${item.material_code}</td>
        <td class="font-medium">\${item.material_name}</td>
        <td class="text-gray-400 text-xs">\${item.unit_of_measure}</td>
        <td class="text-right">\${fmt(item.prev_usage_qty)}</td>
        <td class="text-right">\${fmt(item.cur_usage_qty)}</td>
        <td class="text-right \${item.qty_diff>0?'positive':'negative'}">\${fmtSigned(item.qty_diff)}</td>
        <td class="text-right">\${fmt(item.prev_unit_price)}</td>
        <td class="text-right">\${fmt(item.cur_unit_price)}</td>
        <td class="text-right \${item.price_diff>0?'positive':'negative'}">\${fmtSigned(item.price_diff)}</td>
        <td class="text-right">\${formatWon(item.prev_total_cost)}</td>
        <td class="text-right">\${formatWon(item.cur_total_cost)}</td>
        <td class="text-right font-medium \${item.qty_effect>0?'positive':'negative'}">\${formatSignedWon(item.qty_effect)}</td>
        <td class="text-right font-medium \${item.price_effect>0?'positive':'negative'}">\${formatSignedWon(item.price_effect)}</td>
        <td class="text-right font-bold \${item.cost_diff>0?'positive':'negative'}">\${formatSignedWon(item.cost_diff)}</td>
      </tr>\`).join('');
    }

    // ============ Excel Upload ============
    function handleDrop(e) {
      e.preventDefault();
      e.currentTarget.classList.remove('border-primary-400','bg-primary-50');
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    }

    function handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) processFile(file);
    }

    function processFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        if (json.length === 0) { alert('데이터가 없습니다.'); return; }
        
        uploadData = json;
        document.getElementById('upload-area').classList.add('hidden');
        document.getElementById('upload-preview').classList.remove('hidden');
        document.getElementById('upload-filename').textContent = file.name;
        document.getElementById('upload-info').textContent = json.length + '행 감지됨';
        document.getElementById('upload-count').textContent = json.length;
        
        // Render preview
        const headers = Object.keys(json[0]);
        document.getElementById('preview-head').innerHTML = '<tr>' + headers.map(h => '<th>'+h+'</th>').join('') + '</tr>';
        document.getElementById('preview-body').innerHTML = json.slice(0, 20).map(row => 
          '<tr>' + headers.map(h => '<td>'+(row[h]??'')+'</td>').join('') + '</tr>'
        ).join('') + (json.length > 20 ? '<tr><td colspan="'+headers.length+'" class="text-center text-gray-400 py-3">... 외 '+(json.length-20)+'건</td></tr>' : '');
      };
      reader.readAsArrayBuffer(file);
    }

    async function submitUpload() {
      if (!uploadData.length) return;
      
      // Map Excel columns to API format
      const records = uploadData.map(row => {
        const unitCode = row['호기코드'] || row['unit_code'] || row['호기'];
        const matCode = row['자재코드'] || row['material_code'] || row['자재'];
        
        const unit = unitsCache.find(u => u.unit_code === unitCode || u.unit_name === unitCode);
        const mat = materialsCache.find(m => m.material_code === matCode || m.material_name === matCode);
        
        if (!unit || !mat) return null;
        
        return {
          unit_id: unit.id,
          material_id: mat.id,
          year: parseInt(row['년도'] || row['year'] || new Date().getFullYear()),
          month: parseInt(row['월'] || row['month'] || new Date().getMonth() + 1),
          usage_qty: parseFloat(row['사용량'] || row['usage_qty'] || 0),
          unit_price: parseFloat(row['단가'] || row['unit_price'] || 0),
          production_qty: parseFloat(row['생산량'] || row['production_qty'] || 0),
          notes: row['비고'] || row['notes'] || ''
        };
      }).filter(r => r !== null);
      
      if (records.length === 0) {
        alert('매핑 가능한 데이터가 없습니다. 컬럼명을 확인해주세요.');
        return;
      }

      try {
        const res = await fetch('/api/records/bulk', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ records })
        });
        
        if (res.ok) {
          const result = await res.json();
          alert(result.count + '건이 성공적으로 업로드되었습니다!');
          resetUpload();
          loadAnalysis();
        } else {
          alert('업로드 실패: ' + (await res.text()));
        }
      } catch (err) {
        alert('오류: ' + err.message);
      }
    }

    function resetUpload() {
      uploadData = [];
      document.getElementById('upload-area').classList.remove('hidden');
      document.getElementById('upload-preview').classList.add('hidden');
      document.getElementById('file-input').value = '';
    }

    function downloadTemplate() {
      const template = [
        { '호기코드': 'PM2', '자재코드': 'RM-001', '년도': 2026, '월': 6, '사용량': 3200, '단가': 880000, '생산량': 12500, '비고': '' },
        { '호기코드': 'PM3', '자재코드': 'SM-001', '년도': 2026, '월': 6, '사용량': 45000, '단가': 1250, '생산량': 11000, '비고': '' },
      ];
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '실적데이터');
      XLSX.writeFile(wb, '원부자재_실적_업로드양식.xlsx');
    }

    // ============ CSV Export ============
    function exportCSV() {
      if (!analysisData?.items?.length) return alert('데이터가 없습니다');
      const headers = '호기,구분,자재코드,자재명,단위,전월수량,당월수량,수량차이,전월단가,당월단가,단가차이,전월원가,당월원가,수량효과,단가효과,총차이\\n';
      const rows = analysisData.items.map(i => 
        [i.unit_name, i.category==='RAW'?'원자재':'부자재', i.material_code, i.material_name, i.unit_of_measure,
         i.prev_usage_qty, i.cur_usage_qty, i.qty_diff,
         i.prev_unit_price, i.cur_unit_price, i.price_diff,
         i.prev_total_cost, i.cur_total_cost, i.qty_effect, i.price_effect, i.cost_diff].join(',')
      ).join('\\n');
      
      const blob = new Blob(['\\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = \`원가분석_\${document.getElementById('analysisYear').value}_\${document.getElementById('analysisMonth').value}월.csv\`;
      link.click();
    }

    // ============ Data Input ============
    document.getElementById('record-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        unit_id: parseInt(document.getElementById('input-unit').value),
        material_id: parseInt(document.getElementById('input-material').value),
        year: parseInt(document.getElementById('input-year').value),
        month: parseInt(document.getElementById('input-month').value),
        usage_qty: parseFloat(document.getElementById('input-qty').value),
        unit_price: parseFloat(document.getElementById('input-price').value),
        production_qty: parseFloat(document.getElementById('input-production').value || '0')
      };
      
      const res = await fetch('/api/records', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
      if (res.ok) {
        alert('저장되었습니다!');
        document.getElementById('input-qty').value = '';
        document.getElementById('input-price').value = '';
        document.getElementById('input-production').value = '';
        loadRecentRecords();
        loadAnalysis();
      }
    });

    async function loadRecentRecords() {
      const year = document.getElementById('analysisYear').value;
      const month = document.getElementById('analysisMonth').value;
      const res = await fetch('/api/records?year='+year+'&month='+month);
      const records = await res.json();
      const tbody = document.getElementById('recent-records');
      tbody.innerHTML = records.map(r => \`<tr>
        <td><span class="unit-chip \${getUnitChipClass(r.unit_code)}">\${r.unit_name}</span></td>
        <td>\${r.material_name}</td>
        <td class="text-gray-500">\${r.year}-\${String(r.month).padStart(2,'0')}</td>
        <td class="text-right">\${fmt(r.usage_qty)} \${r.unit_of_measure}</td>
        <td class="text-right">\${fmt(r.unit_price)}원</td>
        <td class="text-right font-medium">\${formatWon(r.total_cost)}</td>
        <td class="text-center">
          <button onclick="deleteRecord(\${r.id})" class="btn-delete"><i class="fas fa-trash-alt mr-1"></i>삭제</button>
        </td>
      </tr>\`).join('');
    }

    async function deleteRecord(id) {
      if (!confirm('삭제하시겠습니까?')) return;
      await fetch('/api/records/' + id, { method: 'DELETE' });
      loadRecentRecords();
      loadAnalysis();
    }

    // ============ Master Data ============
    document.getElementById('unit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetch('/api/units', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ unit_code: document.getElementById('new-unit-code').value, unit_name: document.getElementById('new-unit-name').value })
      });
      loadUnitsList(); loadMasterData();
      document.getElementById('new-unit-code').value = ''; document.getElementById('new-unit-name').value = '';
    });

    document.getElementById('material-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetch('/api/materials', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          material_code: document.getElementById('new-mat-code').value,
          material_name: document.getElementById('new-mat-name').value,
          category: document.getElementById('new-mat-category').value,
          unit_of_measure: document.getElementById('new-mat-uom').value
        })
      });
      loadMaterialsList(); loadMasterData();
    });

    async function loadUnitsList() {
      const units = await fetch('/api/units').then(r => r.json());
      document.getElementById('units-list').innerHTML = units.map(u => \`
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <span class="unit-chip \${getUnitChipClass(u.unit_code)}">\${u.unit_name}</span>
            <span class="text-xs text-gray-400">\${u.unit_code}</span>
            <span class="text-xs text-gray-400">\${u.description||''}</span>
          </div>
          <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">활성</span>
        </div>
      \`).join('');
    }

    async function loadMaterialsList() {
      const mats = await fetch('/api/materials').then(r => r.json());
      document.getElementById('materials-list').innerHTML = mats.map(m => \`
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <span class="text-xs px-2 py-1 rounded-full font-medium \${m.category==='RAW'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}">\${m.category==='RAW'?'원자재':'부자재'}</span>
            <span class="font-medium text-gray-700 text-sm">\${m.material_name}</span>
            <span class="text-xs text-gray-400">\${m.material_code}</span>
          </div>
          <span class="text-xs text-gray-500">\${m.unit_of_measure}</span>
        </div>
      \`).join('');
    }

    // ============ Utilities ============
    function getUnitChipClass(code) {
      if (code === 'PM2') return 'unit-chip-pm2';
      if (code === 'PM3') return 'unit-chip-pm3';
      if (code === 'CHEM') return 'unit-chip-chem';
      if (code === 'TISSUE') return 'unit-chip-tissue';
      return 'bg-gray-100 text-gray-700';
    }

    function fmt(n) { return n == null ? '-' : Math.round(n).toLocaleString('ko-KR'); }
    function fmtSigned(n) { if (n == null) return '-'; const v = Math.round(n); return (v>0?'+':'')+v.toLocaleString('ko-KR'); }
    
    function formatWon(n) {
      if (n == null) return '-';
      const abs = Math.abs(n);
      if (abs >= 100000000) return (n/100000000).toFixed(1) + '억';
      if (abs >= 10000000) return (n/10000).toFixed(0).toLocaleString() + '만';
      return Math.round(n).toLocaleString('ko-KR') + '원';
    }

    function formatSignedWon(n) {
      if (n == null) return '-';
      const sign = n > 0 ? '+' : '';
      const abs = Math.abs(n);
      if (abs >= 100000000) return sign + (n/100000000).toFixed(1) + '억';
      if (abs >= 10000000) return sign + (n/10000).toFixed(0) + '만';
      if (abs >= 1000000) return sign + (n/10000).toFixed(0) + '만';
      return sign + Math.round(n).toLocaleString('ko-KR') + '원';
    }
  </script>
</body>
</html>`;
}
