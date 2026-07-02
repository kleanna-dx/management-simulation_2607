-- =====================================================
-- module-materialcost: 원부자재 사전원가 분석 시스템 DDL
-- MariaDB 10.11+, ENGINE=InnoDB, utf8mb4
-- =====================================================

-- 1. 원부자재 원시 실적 데이터 (SAP BW 기준)
CREATE TABLE IF NOT EXISTS mc_raw_records (
    RAW_RECORD_ID                  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '실적 레코드 ID (PK)',
    CALENDAR_YM                    VARCHAR(6)   NULL                    COMMENT '실적 년월 (YYYYMM)',
    PROCESS_CODE                   VARCHAR(20)  NULL                    COMMENT '공정 코드',
    PROCESS_NAME                   VARCHAR(100) NULL                    COMMENT '공정명',
    MACHINE_CODE                   VARCHAR(20)  NULL                    COMMENT '호기 코드 (PM2, PM3, TM 등)',
    MACHINE_NAME                   VARCHAR(100) NULL                    COMMENT '호기명',
    PRODUCT_LEVEL1                 VARCHAR(20)  NULL                    COMMENT '제품계층 레벨1 코드',
    PRODUCT_LEVEL1_NAME            VARCHAR(100) NULL                    COMMENT '제품계층 레벨1명',
    PRODUCT_LEVEL2                 VARCHAR(20)  NULL                    COMMENT '제품계층 레벨2 코드',
    PRODUCT_LEVEL2_NAME            VARCHAR(100) NULL                    COMMENT '제품계층 레벨2명',
    PRODUCT_LEVEL3                 VARCHAR(20)  NULL                    COMMENT '제품계층 레벨3 코드',
    PRODUCT_LEVEL3_NAME            VARCHAR(100) NULL                    COMMENT '제품계층 레벨3명',
    PRODUCT_LEVEL4                 VARCHAR(20)  NULL                    COMMENT '제품계층 레벨4 코드',
    PRODUCT_LEVEL4_NAME            VARCHAR(100) NULL                    COMMENT '제품계층 레벨4명',
    MATERIAL_CODE                  VARCHAR(30)  NULL                    COMMENT '자재 코드',
    MATERIAL_NAME                  VARCHAR(200) NULL                    COMMENT '자재명',
    MATERIAL_GROUP                 VARCHAR(50)  NULL                    COMMENT '자재그룹 코드',
    MATERIAL_GROUP_NAME            VARCHAR(200) NULL                    COMMENT '자재그룹명',
    MATERIAL_GROUP_MAJOR           VARCHAR(20)  NULL                    COMMENT '대분류 코드 (1100=원자재, 1200=부자재)',
    MATERIAL_GROUP_MAJOR_NAME      VARCHAR(100) NULL                    COMMENT '대분류명',
    PRODUCT_TYPE_CODE              VARCHAR(20)  NULL                    COMMENT '지종 코드',
    PRODUCT_TYPE_NAME              VARCHAR(100) NULL                    COMMENT '지종명',
    PLAN_UNIT_CONSUMPTION          DOUBLE       NULL                    COMMENT '계획 원단위',
    COMPONENT_QTY                  DOUBLE       NULL                    COMMENT '구성수량',
    BASE_QTY                       DOUBLE       NULL                    COMMENT '기준수량',
    PLAN_UNIT_CONSUMPTION_WASTE    DOUBLE       NULL                    COMMENT '계획 원단위(손지포함)',
    PLAN_UNIT_PRICE                DOUBLE       NULL                    COMMENT '계획 단가',
    PLAN_ALLOC_QTY                 DOUBLE       NULL                    COMMENT '계획 배부량',
    TOTAL_PRODUCTION               DOUBLE       NULL                    COMMENT '총 생산량 (kg)',
    PRODUCTION_QTY                 DOUBLE       NULL                    COMMENT '생산량 (kg)',
    WASTE_QTY                      DOUBLE       NULL                    COMMENT '손지량 (kg)',
    ACTUAL_UNIT_CONSUMPTION        DOUBLE       NULL                    COMMENT '실적 원단위',
    ACTUAL_ALLOC_QTY               DOUBLE       NULL                    COMMENT '실적 배부량',
    ACTUAL_UNIT_PRICE              DOUBLE       NULL                    COMMENT '실적 단가',
    ISSUE_QTY                      DOUBLE       NULL                    COMMENT '출고량 (kg)',
    ISSUE_AMOUNT                   DOUBLE       NULL                    COMMENT '출고금액 (원)',
    PLAN_VS_USAGE_DIFF             DOUBLE       NULL                    COMMENT '계획대비 사용량 차이',
    PLAN_VS_PRICE_DIFF             DOUBLE       NULL                    COMMENT '계획대비 단가 차이',
    DATA_SOURCE                    VARCHAR(20)  NULL DEFAULT 'SAP_BW'   COMMENT '데이터 소스',
    FILE_NAME                      VARCHAR(300) NULL                    COMMENT '업로드 파일명',
    CREATED_AT                     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',

    PRIMARY KEY (RAW_RECORD_ID),
    INDEX IDX_MC_RAW_CALENDAR_YM (CALENDAR_YM),
    INDEX IDX_MC_RAW_MACHINE (MACHINE_CODE),
    INDEX IDX_MC_RAW_MATERIAL (MATERIAL_CODE),
    INDEX IDX_MC_RAW_YM_MACHINE (CALENDAR_YM, MACHINE_CODE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='원부자재 원시 실적 데이터';


-- 2. 부서별 수기입력 데이터
CREATE TABLE IF NOT EXISTS mc_manual_inputs (
    MANUAL_INPUT_ID  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '수기입력 ID (PK)',
    YM               VARCHAR(6)   NOT NULL                COMMENT '대상 년월 (YYYYMM)',
    MACHINE_CODE     VARCHAR(20)  NOT NULL                COMMENT '호기 코드',
    DEPT_TYPE        VARCHAR(20)  NULL DEFAULT 'all'      COMMENT '부서 유형 (production/purchase/all)',
    DATA             LONGTEXT     NOT NULL                COMMENT '수기입력 데이터 (JSON)',
    SAVED_BY         VARCHAR(100) NULL                    COMMENT '저장자',
    CREATED_AT       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT       DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (MANUAL_INPUT_ID),
    INDEX IDX_MC_MANUAL_YM_MACHINE (YM, MACHINE_CODE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='부서별 수기입력 데이터 (생산/구매 merge 방식)';


-- 3. 재고 입출고 데이터
CREATE TABLE IF NOT EXISTS mc_inventory_stock (
    INVENTORY_STOCK_ID  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '재고 ID (PK)',
    MONTH               VARCHAR(6)   NOT NULL                COMMENT '대상 년월 (YYYYMM)',
    PLANT               VARCHAR(20)  NULL DEFAULT ''         COMMENT '플랜트 코드',
    MATERIAL_GROUP      VARCHAR(50)  NULL DEFAULT ''         COMMENT '자재그룹',
    MATERIAL_TYPE       VARCHAR(20)  NULL DEFAULT ''         COMMENT '자재유형 코드',
    MATERIAL_TYPE_NAME  VARCHAR(100) NULL DEFAULT ''         COMMENT '자재유형명',
    MATERIAL_ID         VARCHAR(30)  NULL DEFAULT ''         COMMENT '자재 코드',
    MATERIAL_NAME       VARCHAR(200) NULL DEFAULT ''         COMMENT '자재명',
    CURRENCY            VARCHAR(10)  NULL DEFAULT 'KRW'      COMMENT '통화',
    UNIT                VARCHAR(10)  NULL DEFAULT 'KG'       COMMENT '단위',
    STOCK_QTY           DOUBLE       NULL DEFAULT 0          COMMENT '기초 재고수량',
    STOCK_PRICE         DOUBLE       NULL DEFAULT 0          COMMENT '기초 재고금액',
    INCOMING_QTY        DOUBLE       NULL DEFAULT 0          COMMENT '입고 수량',
    INCOMING_PRICE      DOUBLE       NULL DEFAULT 0          COMMENT '입고 금액',
    OUTGOING_QTY        DOUBLE       NULL DEFAULT 0          COMMENT '출고 수량',
    OUTGOING_PRICE      DOUBLE       NULL DEFAULT 0          COMMENT '출고 금액',
    CLOSING_QTY         DOUBLE       NULL DEFAULT 0          COMMENT '기말 재고수량',
    CLOSING_PRICE       DOUBLE       NULL DEFAULT 0          COMMENT '기말 재고금액',
    CREATED_AT          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',

    PRIMARY KEY (INVENTORY_STOCK_ID),
    INDEX IDX_MC_INV_MONTH (MONTH),
    INDEX IDX_MC_INV_MONTH_PLANT (MONTH, PLANT),
    INDEX IDX_MC_INV_MATERIAL (MATERIAL_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='재고 입출고 데이터';


-- 4. 제지 제품 마스터
CREATE TABLE IF NOT EXISTS mc_master_paper_products (
    PAPER_PRODUCT_ID          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '제지제품 ID (PK)',
    PRODUCT_HIERARCHY_LEVEL3  VARCHAR(20)  NOT NULL                COMMENT '제품계층 레벨3 코드',
    GRADE_CODE                VARCHAR(30)  NOT NULL                COMMENT '지종 코드',
    GRADE_NAME                VARCHAR(100) NOT NULL                COMMENT '지종명',
    GRADE_DETAIL              VARCHAR(200) NULL                    COMMENT '지종 상세',
    CREATED_AT                DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT                DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (PAPER_PRODUCT_ID),
    INDEX IDX_MC_PP_GRADE (GRADE_CODE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='제지 제품 마스터';


-- 5. 제지 원자재 마스터
CREATE TABLE IF NOT EXISTS mc_master_paper_raw_materials (
    PAPER_RAW_MATERIAL_ID  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '제지원자재 ID (PK)',
    CATEGORY1              VARCHAR(50)  NULL                    COMMENT '분류1',
    MATERIAL_CLASS         VARCHAR(50)  NOT NULL                COMMENT '자재분류',
    MATERIAL_SUBCLASS      VARCHAR(50)  NOT NULL                COMMENT '자재소분류',
    MATERIAL_CODE          VARCHAR(30)  NOT NULL                COMMENT '자재 코드',
    MATERIAL_NAME          VARCHAR(200) NOT NULL                COMMENT '자재명',
    MATERIAL_GROUP         VARCHAR(50)  NOT NULL                COMMENT '자재그룹',
    CREATED_AT             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT             DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (PAPER_RAW_MATERIAL_ID),
    INDEX IDX_MC_PRM_CODE (MATERIAL_CODE),
    INDEX IDX_MC_PRM_GROUP (MATERIAL_GROUP)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='제지 원자재 마스터';


-- 6. 제지 부자재 마스터
CREATE TABLE IF NOT EXISTS mc_master_paper_sub_materials (
    PAPER_SUB_MATERIAL_ID  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '제지부자재 ID (PK)',
    MATERIAL_CODE          VARCHAR(30)  NOT NULL                COMMENT '자재 코드',
    MATERIAL_NAME          VARCHAR(200) NOT NULL                COMMENT '자재명',
    MATERIAL_GROUP         VARCHAR(50)  NOT NULL                COMMENT '자재그룹',
    CREATED_AT             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT             DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (PAPER_SUB_MATERIAL_ID),
    INDEX IDX_MC_PSM_CODE (MATERIAL_CODE),
    INDEX IDX_MC_PSM_GROUP (MATERIAL_GROUP)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='제지 부자재 마스터';


-- 7. 화장지 제품 마스터
CREATE TABLE IF NOT EXISTS mc_master_tissue_products (
    TISSUE_PRODUCT_ID  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '화장지제품 ID (PK)',
    CATEGORY           VARCHAR(50)  NOT NULL                COMMENT '분류',
    PRODUCT_NAME       VARCHAR(100) NOT NULL                COMMENT '제품명',
    CREATED_AT         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT         DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (TISSUE_PRODUCT_ID),
    INDEX IDX_MC_TP_CATEGORY (CATEGORY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='화장지 제품 마스터';


-- 8. 화장지 원자재 마스터
CREATE TABLE IF NOT EXISTS mc_master_tissue_raw_materials (
    TISSUE_RAW_MATERIAL_ID  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '화장지원자재 ID (PK)',
    CATEGORY                VARCHAR(50)  NOT NULL                COMMENT '분류',
    MATERIAL_CODE           VARCHAR(30)  NOT NULL                COMMENT '자재 코드',
    MATERIAL_NAME           VARCHAR(200) NOT NULL                COMMENT '자재명',
    CREATED_AT              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT              DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (TISSUE_RAW_MATERIAL_ID),
    INDEX IDX_MC_TRM_CODE (MATERIAL_CODE),
    INDEX IDX_MC_TRM_CATEGORY (CATEGORY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='화장지 원자재 마스터';


-- 9. 시뮬레이션 저장
CREATE TABLE IF NOT EXISTS mc_simulations (
    SIMULATION_ID  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '시뮬레이션 ID (PK)',
    SIM_NAME       VARCHAR(200) NOT NULL                COMMENT '시뮬레이션 이름',
    BASE_YEAR      INT          NOT NULL                COMMENT '기준연도',
    BASE_MONTH     INT          NOT NULL                COMMENT '기준월',
    SIM_DATA       LONGTEXT     NOT NULL                COMMENT '시뮬레이션 입력 데이터 (JSON)',
    RESULT_DATA    LONGTEXT     NULL                    COMMENT '시뮬레이션 결과 데이터 (JSON)',
    CREATED_BY     VARCHAR(100) NULL DEFAULT 'admin'    COMMENT '생성자',
    CREATED_AT     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',

    PRIMARY KEY (SIMULATION_ID),
    INDEX IDX_MC_SIM_CREATED (CREATED_AT)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='시뮬레이션 저장 데이터';


-- 10. 원단위 계산 제외규칙
CREATE TABLE IF NOT EXISTS mc_exclusion_rules (
    EXCLUSION_RULE_ID       BIGINT       NOT NULL AUTO_INCREMENT COMMENT '제외규칙 ID (PK)',
    MACHINE_CODE            VARCHAR(20)  NOT NULL                COMMENT '호기 코드',
    MATERIAL_GROUP_KEYWORD  VARCHAR(100) NOT NULL                COMMENT '자재그룹 키워드 (포함 매칭)',
    EXCLUDED_PRODUCT_TYPE   VARCHAR(50)  NOT NULL                COMMENT '제외 지종',
    DESCRIPTION             VARCHAR(300) NULL                    COMMENT '설명',
    CREATED_AT              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT              DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (EXCLUSION_RULE_ID),
    INDEX IDX_MC_ER_MACHINE (MACHINE_CODE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='원단위 계산 제외규칙';


-- =====================================================
-- Phase 확장 대응 테이블 (11~13)
-- 모든 원가 유형(재료비/전력비/물류비/고정비)을 하나의 통합 구조로 관리
-- Phase 2~4 추가 시 이 테이블에 INSERT만 하면 된다.
-- =====================================================

-- 11. 원가 항목 마스터 (Phase-extensible cost item meta)
CREATE TABLE IF NOT EXISTS mc_cost_items (
    COST_ITEM_ID   BIGINT       NOT NULL AUTO_INCREMENT COMMENT '원가항목 ID (PK)',
    COST_TYPE      VARCHAR(30)  NOT NULL                COMMENT '원가유형 (MATERIAL/ELECTRICITY/LOGISTICS/LABOR/DEPRECIATION/MAINTENANCE/CONSUMABLE/SELLING)',
    COST_CODE      VARCHAR(30)  NOT NULL                COMMENT '원가항목 코드 (유일)',
    COST_NAME      VARCHAR(100) NOT NULL                COMMENT '원가항목명',
    COST_BEHAVIOR  VARCHAR(20)  NOT NULL                COMMENT '원가행태 (VARIABLE/FIXED/SEMI_VARIABLE)',
    UNIT_OF_MEASURE VARCHAR(20) NULL                    COMMENT '측정단위 (kg, kWh, 톤, 인, 원 등)',
    PHASE          INT          NOT NULL DEFAULT 1      COMMENT '도입 Phase (1=원부재료, 2=전력+물류, 3=고정비, 4=P&L)',
    ALLOC_BASIS    VARCHAR(50)  NULL                    COMMENT '배부기준 (DIRECT/PRODUCTION_QTY/RUNTIME_HOUR/SHIPMENT_TON)',
    CALC_FORMULA   VARCHAR(500) NULL                    COMMENT '계산공식 설명 (driver_qty × unit_price 등)',
    SORT_ORDER     INT          NULL DEFAULT 0          COMMENT '표시순서',
    IS_ACTIVE      TINYINT(1)   NOT NULL DEFAULT 1      COMMENT '활성여부 (1=활성, 0=비활성)',
    DESCRIPTION    VARCHAR(500) NULL                    COMMENT '비고/설명',
    CREATED_AT     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT     DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (COST_ITEM_ID),
    UNIQUE INDEX UQ_MC_CI_CODE (COST_CODE),
    INDEX IDX_MC_CI_TYPE (COST_TYPE),
    INDEX IDX_MC_CI_PHASE (PHASE),
    INDEX IDX_MC_CI_BEHAVIOR (COST_BEHAVIOR)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='원가 항목 마스터 (Phase 확장 대응 - 모든 원가유형 통합 관리)';


-- 12. 공통 원가 실적 레코드 (Phase-extensible unified cost records)
CREATE TABLE IF NOT EXISTS mc_cost_records (
    COST_RECORD_ID    BIGINT       NOT NULL AUTO_INCREMENT COMMENT '원가실적 ID (PK)',
    CALENDAR_YM       VARCHAR(6)   NOT NULL                COMMENT '실적 년월 (YYYYMM)',
    MACHINE_CODE      VARCHAR(20)  NOT NULL                COMMENT '호기 코드',
    COST_TYPE         VARCHAR(30)  NOT NULL                COMMENT '원가유형 (mc_cost_items.COST_TYPE)',
    COST_CODE         VARCHAR(30)  NOT NULL                COMMENT '원가항목 코드 (mc_cost_items.COST_CODE)',
    COST_NAME         VARCHAR(100) NULL                    COMMENT '원가항목명 (조회 편의)',
    PRODUCT_TYPE      VARCHAR(50)  NULL                    COMMENT '지종/제품유형 (지종별 분리 필요 시)',
    PRODUCTION_QTY    DOUBLE       NULL                    COMMENT '기준 생산량 (원단위 계산 분모)',
    DRIVER_QTY        DOUBLE       NULL                    COMMENT '원가동인 수량 (사용량/가동시간/출하량/투입인원)',
    UNIT_PRICE        DOUBLE       NULL                    COMMENT '단가 (원/kg, 원/kWh, 원/톤, 원/인)',
    AMOUNT            DOUBLE       NULL                    COMMENT '금액 = driver_qty × unit_price',
    UNIT_CONSUMPTION  DOUBLE       NULL                    COMMENT '원단위 = driver_qty / production_qty',
    PLAN_DRIVER_QTY   DOUBLE       NULL                    COMMENT '계획 원가동인 수량',
    PLAN_UNIT_PRICE   DOUBLE       NULL                    COMMENT '계획 단가',
    PLAN_AMOUNT       DOUBLE       NULL                    COMMENT '계획 금액',
    QTY_EFFECT        DOUBLE       NULL                    COMMENT '사용량효과 = (실적수량-계획수량) × 계획단가',
    PRICE_EFFECT      DOUBLE       NULL                    COMMENT '단가효과 = (실적단가-계획단가) × 실적수량',
    DATA_SOURCE       VARCHAR(30)  NULL DEFAULT 'MANUAL'   COMMENT '데이터 소스 (SAP/MANUAL/CALC)',
    CREATED_AT        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',

    PRIMARY KEY (COST_RECORD_ID),
    INDEX IDX_MC_CR_YM_MACHINE (CALENDAR_YM, MACHINE_CODE),
    INDEX IDX_MC_CR_COST_TYPE (COST_TYPE),
    INDEX IDX_MC_CR_YM_TYPE (CALENDAR_YM, COST_TYPE),
    INDEX IDX_MC_CR_CODE (COST_CODE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='공통 원가 실적 레코드 (Phase 확장 대응 - 모든 원가유형 동일 구조)';


-- 13. 시뮬레이션 시나리오 (Plugin simulation scenarios)
CREATE TABLE IF NOT EXISTS mc_sim_scenarios (
    SCENARIO_ID          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '시나리오 ID (PK)',
    SCENARIO_NAME        VARCHAR(200) NOT NULL                COMMENT '시나리오명',
    BASE_YM              VARCHAR(6)   NOT NULL                COMMENT '기준 년월 (YYYYMM)',
    MACHINE_CODE         VARCHAR(20)  NOT NULL                COMMENT '호기 코드',
    PRODUCTION_QTY_TON   DOUBLE       NOT NULL                COMMENT '고정 생산량 (톤) - FIX 포인트',
    REVENUE_AMOUNT       DOUBLE       NULL                    COMMENT '매출액 (Phase 4)',
    COST_TYPES_INCLUDED  VARCHAR(200) NULL DEFAULT 'MATERIAL' COMMENT '포함 원가유형 (쉼표구분: MATERIAL,ELECTRICITY,LOGISTICS)',
    SCENARIO_PARAMS      LONGTEXT     NULL                    COMMENT '시나리오 파라미터 (JSON: 지종믹스, 단가변동 등)',
    RESULT_SUMMARY       LONGTEXT     NULL                    COMMENT '실행 결과 요약 (JSON)',
    OPERATING_PROFIT     DOUBLE       NULL                    COMMENT '영업이익 계산 결과',
    STATUS               VARCHAR(20)  NULL DEFAULT 'DRAFT'    COMMENT '상태 (DRAFT/RUNNING/COMPLETED/FAILED)',
    CREATED_BY           VARCHAR(100) NULL                    COMMENT '생성자',
    CREATED_AT           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    UPDATED_AT           DATETIME     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (SCENARIO_ID),
    INDEX IDX_MC_SS_BASE_YM (BASE_YM),
    INDEX IDX_MC_SS_MACHINE (MACHINE_CODE),
    INDEX IDX_MC_SS_STATUS (STATUS)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='시뮬레이션 시나리오 (플러그인 방식 - costTypesIncluded로 원가 계산기 조합)';
