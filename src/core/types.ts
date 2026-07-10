/**
 * Core Types & Interfaces for Multi-Division Cost Analysis System
 * 
 * 각 사업부(Division)는 이 인터페이스들을 구현하여 플러그인 방식으로 시스템에 등록됩니다.
 * PS사업부(제지), HL사업부(생활용품) 등 서로 다른 생산 체계를 동일한 프레임워크로 분석합니다.
 */

// ============ Division Configuration ============

/**
 * 사업부 설정 (Division Configuration)
 * 각 사업부의 기본 정보와 특성을 정의합니다.
 */
export interface DivisionConfig {
  /** 사업부 코드 (예: 'PS', 'HL') */
  code: string
  /** 사업부 표시명 */
  name: string
  /** 설명 */
  description: string
  /** 호기(Machine) 목록 */
  machines: MachineConfig[]
  /** 제품 분류 체계 */
  productClassification: ProductClassification
  /** 자재 그룹 체계 */
  materialGroups: MaterialGroupConfig[]
  /** 공장 정보 */
  factories: FactoryConfig[]
  /** 원단위 단위 표기 */
  unitCostLabel: string  // 예: '천원/톤', '원/케이스'
  /** 생산량 단위 */
  productionUnit: string  // 예: '톤', '케이스', 'roll'
  /** 사용량 단위 */
  usageUnit: string  // 예: 'kg', 'kg', 'EA'
}

export interface MachineConfig {
  /** 호기 코드 (예: 'PM2', 'TM5') */
  code: string
  /** 호기 표시명 (예: '제지 2호기', '초지 5호기') */
  name: string
  /** 호기 유형 (예: 'paper_machine', 'tissue_machine', 'converting') */
  type: string
  /** 주요 생산 제품 카테고리 */
  mainProducts: string[]
}

export interface FactoryConfig {
  code: string
  name: string
  location: string
  machines: string[]  // machine codes
}

// ============ Product Classification ============

/**
 * 제품 분류 체계
 * PS: 평량 기반 (SC고평량/저평량, ACB, KB 등)
 * HL: 카테고리 기반 (두루마리, 미용티슈, 물티슈, 패드류 등)
 */
export interface ProductClassification {
  /** 분류 방법 */
  method: 'basis_weight' | 'category' | 'custom'
  /** 분류 레벨 수 (PS: 4 levels, HL: 3 levels 등) */
  levels: number
  /** 레벨별 명칭 */
  levelNames: string[]
  /** 분류 함수명 (각 Division에서 구현) */
  classifyFn?: string
}

export interface MaterialGroupConfig {
  /** 대분류 코드 */
  majorCode: string
  /** 대분류명 (예: '펄프', '고지', '약품', '부직포') */
  majorName: string
  /** 소분류 목록 */
  subGroups: { code: string; name: string }[]
}

// ============ Data Models (공통) ============

/**
 * 원본 실적 레코드 (raw_records와 매핑)
 * 사업부에 따라 일부 필드의 의미가 달라질 수 있음
 */
export interface RawRecord {
  id: number
  division: string  // 'PS' | 'HL'
  calendar_ym: string
  machine_code: string
  product_level1?: string
  product_level2?: string
  product_level3?: string
  product_level4?: string
  material_code: string
  material_name: string
  material_group?: string
  material_group_name?: string
  material_group_major?: string
  material_group_major_name?: string
  production_qty?: number
  actual_alloc_qty?: number
  actual_unit_price?: number
  issue_qty?: number
  issue_amount?: number
  total_production?: number
  [key: string]: any  // 사업부별 확장 필드
}

/**
 * 자재 사용 요약 (시뮬레이션용)
 */
export interface MaterialUsageSummary {
  material_code: string
  material_name: string
  material_group_name: string
  material_group_major_name: string
  usage_qty: number      // 사용량 (usageUnit)
  unit_price: number     // 단가 (원/usageUnit)
  total_cost: number     // 총비용 (원)
}

/**
 * 제품(지종)별 생산량 요약
 */
export interface ProductionSummary {
  machine_code: string
  product_category: string  // 지종명/제품카테고리명
  production_ton: number
  material_cost: number
  unit_cost: number  // 원단위 (비용/생산량)
}

// ============ Simulation Models ============

/**
 * 시뮬레이션 변경사항
 */
export interface SimulationChange {
  type: 'replace' | 'ratio' | 'add'
  source_code?: string
  source_name?: string
  target_code?: string
  target_name?: string
  target_price?: number
  target_group?: string
  ratio?: number      // ratio type: 유지 비율 (%)
  qty_kg?: number     // add type: 추가 수량
}

/**
 * 시뮬레이션 요청
 */
export interface SimulationRequest {
  division: string
  ym: string
  machine: string
  production_ton?: number
  grade_mix?: Record<string, number>  // 지종별 생산량
  changes: SimulationChange[]
}

/**
 * 시뮬레이션 결과 요약
 */
export interface SimulationResultSummary {
  base_production_ton: number
  sim_production_ton: number
  base_total_cost: number
  sim_total_cost: number
  base_unit_cost_1000won: number
  sim_unit_cost_1000won: number
  unit_cost_diff: number
  savings_million: number
}

/**
 * 시뮬레이션 결과 상세 (자재별)
 */
export interface SimulationDetail {
  material_code: string
  material_name: string
  material_group_name: string
  base_usage_qty: number
  base_unit_price: number
  base_cost: number
  sim_usage_qty: number
  sim_unit_price: number
  sim_cost: number
  cost_diff: number
  is_new: boolean
  is_removed: boolean
}

/**
 * 시뮬레이션 전체 결과
 */
export interface SimulationResult {
  summary: SimulationResultSummary
  changes: any[]
  details: SimulationDetail[]
  base_ym: string
  machine: string
  division: string
}

// ============ Division Plugin Interface ============

/**
 * 사업부 플러그인 인터페이스
 * 각 사업부(PS, HL)는 이 인터페이스를 구현합니다.
 */
export interface DivisionPlugin {
  /** 사업부 설정 */
  config: DivisionConfig

  /**
   * 제품 분류 함수
   * raw_records의 제품 정보를 기반으로 분석용 카테고리로 분류
   */
  classifyProduct(record: RawRecord): string

  /**
   * 원단위 계산 (사업부별 산식)
   * @returns 천원/톤 (또는 사업부별 단위)
   */
  calculateUnitCost(totalCost: number, productionQty: number): number

  /**
   * 시뮬레이션 전처리
   * 사업부별 특수 로직을 적용 (예: PS의 평량 기반 원단위 보정)
   */
  preprocessSimulation?(request: SimulationRequest, baseData: MaterialUsageSummary[]): MaterialUsageSummary[]

  /**
   * 대시보드 커스텀 차트 설정
   */
  getDashboardCharts?(): ChartConfig[]

  /**
   * 엑셀 업로드 시 컬럼 매핑 규칙
   */
  getUploadColumnMapping(): ColumnMapping

  /**
   * 사업부별 프론트엔드 HTML 커스텀 (탭별)
   */
  getCustomUI?(): DivisionUI
}

// ============ Supporting Types ============

export interface ChartConfig {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'doughnut'
  dataFn: string  // data fetching function name
}

export interface ColumnMapping {
  /** SAP 엑셀 컬럼 → DB 컬럼 매핑 */
  mappings: Record<string, string>
  /** 필수 컬럼 */
  required: string[]
  /** 헤더 행 번호 (0-indexed) */
  headerRow: number
}

export interface DivisionUI {
  /** 사업부 전용 CSS 클래스/테마 */
  themeClass?: string
  /** 탭 커스텀 (추가/제거/이름변경) */
  tabOverrides?: { id: string; label: string; visible: boolean }[]
  /** 대시보드 레이아웃 커스텀 */
  dashboardLayout?: string
}
