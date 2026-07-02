# ARCHITECTURE.md — Phase 1~4 확장 대응 설계서

## 1. 빅 픽처 (Big Picture)

```
생산량(톤) FIX
     │
     ├─ Phase 1: 원부재료비 (MATERIAL)            ← 현재 구축 중
     ├─ Phase 2: 전력비 (ELECTRICITY) + 물류비 (LOGISTICS)
     ├─ Phase 3: 노무비 + 감가상각 + 수선유지 + 소모품 (FIXED)
     └─ Phase 4: 매출 연동 → 영업이익 자동 계산 (P&L)

영업이익 = 매출 − (원부재료비 + 전력비 + 물류비 + 노무비 + 감가상각 + 기타)
```

**핵심 설계 원칙**: Phase 2 개발 시 Phase 1을 뜯어고치지 않는다.

---

## 2. 확장 가능 아키텍처 (Extensible Architecture)

### 2.1 핵심 테이블 3개

| 테이블 | 역할 | Phase 추가 시 영향 |
|--------|------|-------------------|
| `mc_cost_items` | 원가 항목 마스터 (메타) | INSERT only — 새 항목 등록 |
| `mc_cost_records` | 통합 원가 실적 (데이터) | INSERT only — 같은 구조로 저장 |
| `mc_sim_scenarios` | 플러그인 시뮬레이션 | cost_types_included 확장 |

### 2.2 Discriminator 패턴: `cost_type`

```
mc_cost_items.COST_TYPE:
  ├─ MATERIAL        (Phase 1)
  ├─ ELECTRICITY     (Phase 2)
  ├─ LOGISTICS       (Phase 2)
  ├─ LABOR           (Phase 3)
  ├─ DEPRECIATION    (Phase 3)
  ├─ MAINTENANCE     (Phase 3)
  ├─ CONSUMABLE      (Phase 3)
  └─ SELLING         (Phase 4)
```

**하나의 테이블에 모든 원가 유형을 통합**하되, `COST_TYPE` 컬럼으로 구분한다.
Phase 추가 시 Java Enum에 값을 추가하고, mc_cost_items에 INSERT만 하면 된다.

### 2.3 원가 행태(Cost Behavior) 구분

| Behavior | 설명 | 계산 방식 |
|----------|------|-----------|
| `VARIABLE` | 변동비 | driver_qty × unit_price (생산량 비례) |
| `FIXED` | 고정비 | 월정액 / 가동률 흡수 |
| `SEMI_VARIABLE` | 준변동비 | fixed_base + (variable × production_qty) |

Phase 3 고정비 도입 시, 가동률에 따른 흡수 효과 계산:
```
흡수차이 = (실제가동률 - 표준가동률) × 고정비율
```

---

## 3. 공통 원가 레코드 설계 (mc_cost_records)

모든 Phase의 실적 데이터가 **동일한 컬럼 구조**로 저장된다:

```
┌─────────────────────────────────────────────────────────────────┐
│ COST_RECORD_ID | CALENDAR_YM | MACHINE_CODE | COST_TYPE | ...   │
├─────────────────────────────────────────────────────────────────┤
│ Phase 1: MATERIAL  │ driver_qty = 사용량(kg)   │ unit_price = 원/kg    │
│ Phase 2: ELECTRICITY │ driver_qty = 가동시간(h) │ unit_price = 원/kWh   │
│ Phase 2: LOGISTICS │ driver_qty = 출하량(톤)   │ unit_price = 원/톤    │
│ Phase 3: LABOR     │ driver_qty = 투입인원     │ unit_price = 인건비/인 │
│ Phase 3: DEPRECIATION │ driver_qty = 1         │ unit_price = 월정액   │
└─────────────────────────────────────────────────────────────────┘

공통 계산:
  amount = driver_qty × unit_price
  unit_consumption = driver_qty / production_qty
  qty_effect = (actual_driver - plan_driver) × plan_price
  price_effect = (actual_price - plan_price) × actual_driver
```

---

## 4. 플러그인 시뮬레이션 엔진

### 4.1 시나리오 구조

```java
SimScenario {
    productionQtyTon: 15000,          // FIX point
    costTypesIncluded: "MATERIAL",    // Phase 1
    // Phase 2: "MATERIAL,ELECTRICITY,LOGISTICS"
    // Phase 3: "MATERIAL,ELECTRICITY,LOGISTICS,LABOR,DEPRECIATION,MAINTENANCE,CONSUMABLE"
    // Phase 4: + revenueAmount → operatingProfit
}
```

### 4.2 계산 엔진 플러그인 아키텍처

```
SimulationEngine (Orchestrator)
    │
    ├─ MaterialCostCalculator   ← Phase 1 (현재)
    │     └─ 원단위 × 생산량 × 이동평균단가
    │
    ├─ ElectricityCostCalculator  ← Phase 2
    │     └─ (생산량 / 라인속도) × 전력단가 × 설비용량
    │
    ├─ LogisticsCostCalculator    ← Phase 2
    │     └─ 출하량(≈생산량) × 거래선별 운송단가
    │
    ├─ FixedCostCalculator        ← Phase 3
    │     └─ 노무비(정액) + 감가상각(정액) + 수선유지 + 소모품
    │     └─ 가동률 흡수 효과 계산
    │
    └─ ProfitCalculator           ← Phase 4
          └─ 매출(지종별 판가 × 생산량) − 총원가 합계
```

### 4.3 Phase별 활성화 방식

시뮬레이션 실행 시:
1. `costTypesIncluded` 파싱 → `List<String> types`
2. `mc_cost_items`에서 해당 type의 활성 항목 조회
3. 각 type별 Calculator 호출 (존재하지 않는 type은 skip)
4. 결과 합산 → `operatingProfit` (Phase 4에서만 의미)

```java
// Phase 확장 시 코드 변경 없이 Calculator만 추가
@Component
public class SimulationEngine {
    private final Map<String, CostCalculator> calculators;

    public SimResult execute(SimScenario scenario) {
        List<String> types = Arrays.asList(scenario.getCostTypesIncluded().split(","));
        double totalCost = 0;
        for (String type : types) {
            CostCalculator calc = calculators.get(type);
            if (calc != null) {
                totalCost += calc.calculate(scenario);
            }
        }
        double profit = scenario.getRevenueAmount() != null
            ? scenario.getRevenueAmount() - totalCost : -totalCost;
        return new SimResult(totalCost, profit);
    }
}
```

---

## 5. API 구조 설계

### 5.1 URL 패턴

```
/{모듈명}-api/{리소스}

현재 (Phase 1):
  /materialcost-api/raw-records          ← SAP 원시데이터
  /materialcost-api/manual-inputs        ← 수기입력
  /materialcost-api/inventory-stocks     ← 재고
  /materialcost-api/simulations          ← 레거시 시뮬레이션

확장 (Phase 1-4 공통):
  /materialcost-api/cost-items           ← 원가항목 마스터 CRUD
  /materialcost-api/cost-records         ← 통합 원가실적 (cost_type 필터)
  /materialcost-api/sim-scenarios        ← 플러그인 시뮬레이션

Phase별 전용 (필요 시):
  /materialcost-api/cost-records?costType=MATERIAL
  /materialcost-api/cost-records?costType=ELECTRICITY
  /materialcost-api/cost-records?costType=LOGISTICS
```

### 5.2 API 확장 전략

Phase 추가 시 기존 API 변경 없이:
- `cost-items`: 새 type INSERT → 자동 조회 가능
- `cost-records`: 새 type 데이터 INSERT → `?costType=` 필터로 조회
- `sim-scenarios`: `costTypesIncluded`에 새 type 추가 → 엔진이 자동 포함

---

## 6. 데이터 흐름 (Data Flow)

### 6.1 현재 (Phase 1: 원부재료비)

```
SAP BW Excel 업로드 → mc_raw_records (원시)
                            ↓
                    가공/정합 로직
                            ↓
                    mc_cost_records (MATERIAL)
                            ↓
                    mc_sim_scenarios → 결과
```

### 6.2 Phase 2 추가 시 (변경 없음, 추가만)

```
[기존 - 변경 없음]
SAP BW Excel → mc_raw_records → mc_cost_records (MATERIAL)

[추가]
전력 데이터 API → mc_cost_records (ELECTRICITY)
물류 ERP 연동  → mc_cost_records (LOGISTICS)

mc_sim_scenarios.costTypesIncluded = "MATERIAL,ELECTRICITY,LOGISTICS"
    → MaterialCostCalculator + ElectricityCostCalculator + LogisticsCostCalculator
```

### 6.3 Phase 3~4 추가 시

```
[기존 - 변경 없음]
Phase 1 + Phase 2 그대로

[추가]
인사시스템 → mc_cost_records (LABOR)
자산관리  → mc_cost_records (DEPRECIATION)
ERP      → mc_cost_records (MAINTENANCE, CONSUMABLE)

[Phase 4]
매출시스템 → sim_scenario.revenue_amount
결과: 영업이익 = revenue - total_cost
```

---

## 7. AI 질의 범위 확장

| Phase | AI 질의 데이터 범위 | 예시 질문 |
|-------|---------------------|-----------|
| 1 | mc_cost_records WHERE cost_type='MATERIAL' | "이번 달 고지 원단위가 왜 올랐어?" |
| 2 | + ELECTRICITY, LOGISTICS | "전력비 포함 변동원가 총액은?" |
| 3 | + LABOR, DEPRECIATION, ... | "가동률 80%일 때 제조원가 얼마?" |
| 4 | + REVENUE → Operating Profit | "SC 지종 이익률이 떨어진 원인은?" |

AI 질의 시 `cost_types` 파라미터로 범위를 제어:
```sql
SELECT * FROM mc_cost_records
WHERE calendar_ym = ? AND machine_code = ?
  AND cost_type IN (/* phase에 따라 확장 */)
```

---

## 8. Phase별 개발 로드맵

### Phase 1 완성 목표 (현재)
- [x] mc_raw_records 기반 SAP 데이터 업로드/조회
- [x] mc_manual_inputs 부서별 수기입력 (merge + issue append)
- [x] mc_exclusion_rules 원단위 제외규칙
- [x] mc_cost_items Phase 1 MATERIAL 항목 등록
- [ ] mc_cost_records에 가공된 재료비 실적 적재
- [ ] SAP 수불 이동계획 (3개월 rolling)
- [ ] 이동평균 단가 자동계산
- [ ] 사용량효과 / 단가효과 분해
- [ ] 지종·고객·라인 3가지 믹스 시뮬레이션 (mc_sim_scenarios)
- [ ] AI 자연어 질의 (원부재료 범위)

### Phase 2 준비 상태
- [x] mc_cost_items에 ELECTRICITY/LOGISTICS 항목 정의 (IS_ACTIVE=0)
- [x] mc_cost_records 구조 확장 불필요 (동일 구조 사용)
- [x] SimScenario.costTypesIncluded 확장 지원
- [ ] ElectricityCostCalculator 구현
- [ ] LogisticsCostCalculator 구현
- [ ] 전력/물류 데이터 소스 연동

### Phase 3 준비 상태
- [x] mc_cost_items에 LABOR/DEPRECIATION/MAINTENANCE/CONSUMABLE 항목 정의 (IS_ACTIVE=0)
- [x] cost_behavior = FIXED/SEMI_VARIABLE 구조 지원
- [ ] FixedCostCalculator 구현 (가동률 흡수 효과)
- [ ] 배부 기준 설계 (직접/안분)

### Phase 4 준비 상태
- [x] SimScenario.revenueAmount 필드 존재
- [x] SimScenario.operatingProfit 필드 존재
- [x] mc_cost_items에 SELLING 항목 정의 (IS_ACTIVE=0)
- [ ] ProfitCalculator 구현
- [ ] 매출 데이터 연동 (지종별 판가 × 생산량)

---

## 9. 테이블 관계도 (ERD 요약)

```
mc_cost_items (마스터)
    │ COST_CODE (1)
    │
    └──→ mc_cost_records (실적) ← COST_CODE (N)
              │
              └──→ mc_sim_scenarios ← costTypesIncluded로 조합
                        │
                        └──→ 영업이익 (Phase 4)

mc_raw_records (SAP 원시) ──가공──→ mc_cost_records (MATERIAL)
mc_manual_inputs ──보정──→ mc_cost_records
mc_exclusion_rules ──필터──→ mc_cost_records (원단위 계산 시)
```

---

## 10. 기술적 결정 사항

| 결정 | 이유 |
|------|------|
| 단일 테이블 (Single Table) 전략 | Phase별 테이블 분리 시 JOIN 복잡, 통합 P&L 계산 어려움 |
| cost_type Discriminator | JPA 상속 대신 String 구분자 → DB 독립적, 마이그레이션 용이 |
| IS_ACTIVE 플래그 | Phase 미착수 항목을 미리 등록 → 구조 검증 가능 |
| JSON (scenarioParams, resultSummary) | Phase별 상이한 파라미터를 유연하게 저장 |
| Calculator 플러그인 패턴 | OCP(개방-폐쇄 원칙) 준수 → 기존 코드 수정 없이 확장 |
| driver_qty/unit_price 공통 구조 | 모든 원가를 "동인수량 × 단가" 로 통일 → 사용량효과/단가효과 분해 일반화 |

---

## 11. 개발 환경

| 구분 | 기술 |
|------|------|
| 현재 운영 | Hono + Cloudflare Workers + D1 (SQLite) |
| 목표 플랫폼 | Spring Boot 3.2.5 + Java 17 + MariaDB |
| 빌드 | Gradle multi-module |
| ORM | Spring Data JPA (ddl-auto=none) |
| Naming | PhysicalNamingStrategyStandardImpl |
| 모듈 경로 | module-materialcost/ |

---

*Last updated: 2026-07-02*
