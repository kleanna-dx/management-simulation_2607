/**
 * HL사업부 (Home & Life / 생활용품) Division Plugin
 * 
 * 화장지, 물티슈, 여성용품(생리대), 기저귀 등 생활용품 제조
 * 호기: 초지 5호기/6호기 (원지 생산) + 가공 1~6호기 (제품 가공)
 * 공장: 청주공장 (초지+가공), 음성공장 (팬티형 기저귀)
 * 지종 분류: 제품 카테고리 기반 (두루마리, 미용티슈, 물티슈, 패드류)
 * 원단위: 천원/톤
 * 핵심 자재: 펄프(Virgin), 부직포, SAP(고흡수체), 약품, PE필름, 포장재
 */

import type { 
  DivisionPlugin, DivisionConfig, RawRecord, 
  MaterialUsageSummary, SimulationRequest, ColumnMapping 
} from '../../core/types'

const HL_CONFIG: DivisionConfig = {
  code: 'HL',
  name: 'HL사업부',
  description: '화장지, 물티슈, 여성용품 등 생활용품 제조 (Home & Life)',
  machines: [
    // 초지기 (원지 생산)
    { code: 'TM5', name: '초지 5호기', type: 'tissue_machine', mainProducts: ['두루마리원지', '미용티슈원지'] },
    { code: 'TM6', name: '초지 6호기', type: 'tissue_machine', mainProducts: ['두루마리원지', '미용티슈원지', '프리미엄원지'] },
    // 가공기 (제품 가공)
    { code: 'CV1', name: '가공 1호기', type: 'converting', mainProducts: ['두루마리'] },
    { code: 'CV2', name: '가공 2호기', type: 'converting', mainProducts: ['두루마리'] },
    { code: 'CV3', name: '가공 3호기', type: 'converting', mainProducts: ['두루마리', '키친타올'] },
    { code: 'CV4', name: '가공 4호기', type: 'converting', mainProducts: ['미용티슈'] },
    { code: 'CV5', name: '가공 5호기', type: 'converting', mainProducts: ['두루마리'] },
    { code: 'CV6', name: '가공 6호기', type: 'converting', mainProducts: ['두루마리', '프리미엄'] },
    // 물티슈/패드
    { code: 'WT1', name: '물티슈 1라인', type: 'wet_tissue', mainProducts: ['물티슈'] },
    { code: 'PD1', name: '패드 1라인', type: 'pad', mainProducts: ['생리대', '기저귀'] },
  ],
  productClassification: {
    method: 'category',
    levels: 3,
    levelNames: ['제품군', '브랜드', '세부제품'],
  },
  materialGroups: [
    { majorCode: 'PULP', majorName: '펄프', subGroups: [
      { code: 'VIRGIN', name: '버진펄프' },
      { code: 'RECYCLED', name: '재생펄프' },
    ]},
    { majorCode: 'NONWOVEN', majorName: '부직포', subGroups: [
      { code: 'SPUNLACE', name: '스펀레이스' },
      { code: 'AIRLAID', name: '에어레이드' },
      { code: 'SMS', name: 'SMS부직포' },
    ]},
    { majorCode: 'CHEM', majorName: '약품', subGroups: [
      { code: 'WET_STR', name: '습강제' },
      { code: 'SOFT', name: '유연제' },
      { code: 'LOTION', name: '로션' },
      { code: 'SAP', name: 'SAP(고흡수체)' },
    ]},
    { majorCode: 'FILM', majorName: '필름/포장', subGroups: [
      { code: 'PE', name: 'PE필름' },
      { code: 'WRAP', name: '포장재' },
      { code: 'CARTON', name: '카톤박스' },
    ]},
    { majorCode: 'ETC', majorName: '기타', subGroups: [
      { code: 'ADHESIVE', name: '접착제' },
      { code: 'ELASTIC', name: '탄성체' },
      { code: 'FRAGRANCE', name: '향료' },
    ]},
  ],
  factories: [
    { code: 'CJ', name: '청주공장', location: '충북 청주', machines: ['TM5', 'TM6', 'CV1', 'CV2', 'CV3', 'CV4', 'CV5', 'CV6', 'WT1', 'PD1'] },
    { code: 'ES', name: '음성공장', location: '충북 음성', machines: ['PD2'] },
  ],
  unitCostLabel: '천원/톤',
  productionUnit: '톤',
  usageUnit: 'kg',
}

export class HlDivision implements DivisionPlugin {
  config = HL_CONFIG

  /**
   * HL 제품 분류
   * 제품 카테고리 기반:
   * - 두루마리 화장지 (깨끗한나라, 보솜이)
   * - 미용티슈 (각티슈, 팝업티슈)
   * - 키친타올
   * - 물티슈
   * - 패드류 (생리대: 순수한면, 기저귀: 보솜이)
   */
  classifyProduct(record: RawRecord): string {
    const level1 = (record.product_level1 || '').toUpperCase()
    const level2 = record.product_level2 || ''
    const productName = (record.product_level3 || record.product_level2 || '').toLowerCase()

    // 제품군 키워드 매칭
    if (productName.includes('두루마리') || productName.includes('롤') || productName.includes('roll')) {
      return '두루마리'
    }
    if (productName.includes('미용') || productName.includes('각티슈') || productName.includes('팝업')) {
      return '미용티슈'
    }
    if (productName.includes('키친') || productName.includes('키탈') || productName.includes('kitchen')) {
      return '키친타올'
    }
    if (productName.includes('물티슈') || productName.includes('wet')) {
      return '물티슈'
    }
    if (productName.includes('생리대') || productName.includes('순수한면')) {
      return '생리대'
    }
    if (productName.includes('기저귀') || productName.includes('보솜이') || productName.includes('팬티')) {
      return '기저귀'
    }
    if (productName.includes('마스크')) {
      return '마스크'
    }

    return level2 || '기타'
  }

  /**
   * 원단위 계산: 천원/톤
   * HL사업부도 기본은 톤 기준이나, 
   * 향후 패드류는 케이스/매 기준으로 전환 가능
   */
  calculateUnitCost(totalCost: number, productionQty: number): number {
    if (productionQty <= 0) return 0
    return totalCost / productionQty / 1000  // → 천원/톤
  }

  /**
   * HL사업부 엑셀 업로드 컬럼 매핑
   * PS와 동일한 SAP 추출 형식 기본, 추가 컬럼 가능
   */
  getUploadColumnMapping(): ColumnMapping {
    return {
      mappings: {
        'CALMONTH': 'calendar_ym',
        '공정': 'process_code',
        '공정명': 'process_name',
        '호기': 'machine_code',
        '호기명': 'machine_name',
        '제품레벨1': 'product_level1',
        '제품레벨1명': 'product_level1_name',
        '제품레벨2': 'product_level2',
        '제품레벨2명': 'product_level2_name',
        '제품레벨3': 'product_level3',
        '제품레벨3명': 'product_level3_name',
        '제품레벨4': 'product_level4',
        '제품레벨4명': 'product_level4_name',
        '자재코드': 'material_code',
        '자재명': 'material_name',
        '자재그룹': 'material_group',
        '자재그룹명': 'material_group_name',
        '자재대분류': 'material_group_major',
        '자재대분류명': 'material_group_major_name',
        '생산수량': 'production_qty',
        '배부수량': 'actual_alloc_qty',
        '실적단가': 'actual_unit_price',
        '출고수량': 'issue_qty',
        '출고금액': 'issue_amount',
        '총생산량': 'total_production',
        // HL 추가 컬럼 (있을 경우)
        '브랜드': 'brand',
        '완제품코드': 'finished_product_code',
      },
      required: ['calendar_ym', 'machine_code', 'material_code', 'actual_alloc_qty'],
      headerRow: 0,
    }
  }
}
