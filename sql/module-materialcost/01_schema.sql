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
