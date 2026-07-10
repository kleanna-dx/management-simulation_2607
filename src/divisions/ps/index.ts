/**
 * PS사업부 (Paper Solution / 제지) Division Plugin
 * 
 * 백판지(산업용/식품용/특수용) 생산
 * 호기: PM2, PM3 (청주공장)
 * 지종 분류: 평량(g/m²) 기반 — SC고평량(>=300), SC저평량(<300), ACB, KB 등
 * 원단위: 천원/톤
 * 핵심 자재: 펄프(L-BKP, N-BKP), 고지(하판지, 접지, 레저), 약품(LATEX 등)
 */

import type { 
  DivisionPlugin, DivisionConfig, RawRecord, 
  MaterialUsageSummary, SimulationRequest, ColumnMapping 
} from '../../core/types'

const PS_CONFIG: DivisionConfig = {
  code: 'PS',
  name: 'PS사업부',
  description: '백판지 및 산업·특수·식품용지 제조 (Paper Solution)',
  machines: [
    { code: 'PM2', name: '제지 2호기', type: 'paper_machine', mainProducts: ['SC저평량', 'SC고평량', 'ACB', 'KB'] },
    { code: 'PM3', name: '제지 3호기', type: 'paper_machine', mainProducts: ['SC고평량', 'SC저평량', 'IV', 'CCP', 'NCR'] },
  ],
  productClassification: {
    method: 'basis_weight',
    levels: 4,
    levelNames: ['사업부문', '지종', '평량그룹', '세부품목'],
  },
  materialGroups: [
    { majorCode: 'PULP', majorName: '펄프', subGroups: [
      { code: 'LBKP', name: 'L-BKP' },
      { code: 'NBKP', name: 'N-BKP' },
    ]},
    { majorCode: 'WASTE', majorName: '고지', subGroups: [
      { code: 'BOTTOM', name: '하판지' },
      { code: 'FOLD', name: '접지' },
      { code: 'LEISURE', name: '레저' },
      { code: 'WHITE', name: '화이트레저' },
    ]},
    { majorCode: 'CHEM', majorName: '약품', subGroups: [
      { code: 'LATEX', name: '라텍스' },
      { code: 'STARCH', name: '전분' },
      { code: 'DYE', name: '염료' },
    ]},
    { majorCode: 'ETC', majorName: '기타', subGroups: [
      { code: 'WOOD', name: '목분' },
      { code: 'FILLER', name: '충전제' },
    ]},
  ],
  factories: [
    { code: 'CJ', name: '청주공장', location: '충북 청주', machines: ['PM2', 'PM3'] },
  ],
  unitCostLabel: '천원/톤',
  productionUnit: '톤',
  usageUnit: 'kg',
}

export class PsDivision implements DivisionPlugin {
  config = PS_CONFIG

  /**
   * PS 지종 분류
   * product_level4의 뒷 3자리(평량)를 기준으로:
   * - >= 300 → SC고평량
   * - < 300 → SC저평량
   * - product_level2_name이 ACB/KB/IV/CCP/NCR 등 → 그대로 사용
   */
  classifyProduct(record: RawRecord): string {
    const level2Name = record.product_level2 || ''
    const level4 = record.product_level4 || ''
    
    // 이미 명확한 지종인 경우
    const directCategories = ['ACB', 'KB', 'IV', 'CCP', 'NCR', 'CB']
    if (directCategories.includes(level2Name)) {
      return level2Name
    }

    // SC류: 평량 기준 분류
    if (level2Name.includes('SC') || level2Name.includes('백판지')) {
      const basisWeight = parseInt(level4.slice(-3)) || 0
      return basisWeight >= 300 ? 'SC고평량' : 'SC저평량'
    }

    return level2Name || '기타'
  }

  /**
   * 원단위 계산: 천원/톤
   */
  calculateUnitCost(totalCost: number, productionQty: number): number {
    if (productionQty <= 0) return 0
    // totalCost: 원, productionQty: 톤
    return totalCost / productionQty / 1000  // → 천원/톤
  }

  /**
   * 엑셀 업로드 컬럼 매핑 (SAP 추출)
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
      },
      required: ['calendar_ym', 'machine_code', 'material_code', 'actual_alloc_qty'],
      headerRow: 0,
    }
  }
}
