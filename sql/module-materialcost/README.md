# module-materialcost SQL 스크립트

## 원부자재 사전원가 분석 시스템

### 실행 순서

1. **01_schema.sql** — DDL (테이블 생성)
   - 총 10개 테이블 생성
   - 모든 테이블에 `mc_` 접두사 사용 (모듈 네임스페이스)
   - 인덱스, COMMENT 포함

2. **02_seed_data.sql** — 초기 데이터 (INSERT)
   - 원단위 계산 제외규칙 (PM2, PM3)
   - 제지/화장지 제품 마스터 기본 데이터
   - 원부자재 마스터 샘플 데이터

### 실행 방법

```bash
# MariaDB CLI
mysql -u root -p your_database < sql/module-materialcost/01_schema.sql
mysql -u root -p your_database < sql/module-materialcost/02_seed_data.sql
```

### 테이블 목록

| 테이블명 | 설명 |
|---------|------|
| mc_raw_records | 원부자재 원시 실적 데이터 (SAP BW) |
| mc_manual_inputs | 부서별 수기입력 데이터 |
| mc_inventory_stock | 재고 입출고 데이터 |
| mc_master_paper_products | 제지 제품 마스터 |
| mc_master_paper_raw_materials | 제지 원자재 마스터 |
| mc_master_paper_sub_materials | 제지 부자재 마스터 |
| mc_master_tissue_products | 화장지 제품 마스터 |
| mc_master_tissue_raw_materials | 화장지 원자재 마스터 |
| mc_simulations | 시뮬레이션 저장 |
| mc_exclusion_rules | 원단위 계산 제외규칙 |

### 플랫폼 통합

settings.gradle:
```
include 'module-materialcost'
```

app/build.gradle:
```
implementation project(':module-materialcost')
```
