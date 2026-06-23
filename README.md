# 원부자재 사전원가 분석 시스템

## 프로젝트 개요
- **목적**: 호기(생산라인)별 원부자재의 전월/당월 실적을 비교하고, 사용량 및 단가 차이에 따른 손익 효과를 분석
- **핵심 분석 로직**:
  - **수량차이 효과** = (당월수량 - 전월수량) × 전월단가
  - **단가차이 효과** = (당월단가 - 전월단가) × 당월수량
  - **총 원가차이** = 수량차이 효과 + 단가차이 효과

## 기능

### 완료된 기능
- [x] **통합 대시보드**: 전월 대비 당월 원가 요약 카드 (총원가, 수량효과, 단가효과)
- [x] **호기별 비교 차트**: 전월/당월 원가 비교 막대 차트 (고정 200px 높이)
- [x] **손익효과 분해 차트**: 수량차이 vs 단가차이 호기별 시각화
- [x] **카테고리별 분석**: 원자재/부자재 구분 요약
- [x] **원가 영향 TOP 5**: 원가차이가 큰 항목 자동 추출
- [x] **상세분석표**: 전체 항목별 수량/단가/원가 비교 테이블
- [x] **CSV 내보내기**: 분석 결과를 CSV로 다운로드
- [x] **Excel 업로드**: SheetJS 기반 엑셀 파일 업로드 → 일괄 데이터 INSERT
- [x] **템플릿 다운로드**: 엑셀 업로드용 템플릿 파일 제공
- [x] **수동 데이터 입력**: 호기/자재별 월별 실적 데이터 CRUD
- [x] **기준정보 관리**: 호기/원부자재 마스터 데이터 관리 + 생산량 관리
- [x] **필터링**: 분석기간(년/월) 및 호기 필터
- [x] **시뮬레이션 엔진**: 생산계획 → BOM 기반 자재 소요량/원가 예측
- [x] **BOM 관리**: 제품-자재 매핑 (원단위 설정) + 추가/삭제 UI
- [x] **시뮬레이션 저장/이력**: 시뮬레이션 결과 저장 및 이력 조회

### 미구현 기능
- [ ] 다중 월 트렌드 분석 (3개월 이상 추이)
- [ ] 예산 대비 실적 분석
- [ ] 사용자 인증/권한 관리
- [ ] 시뮬레이션 시나리오 비교 (다중 시나리오 대비)

## 탭 구성 (7개)
1. **통합분석** - 대시보드 + 차트 + 카테고리 요약 + TOP5
2. **상세분석표** - 전체 항목 비교 테이블 + CSV 내보내기
3. **데이터업로드** - Excel 업로드 + 템플릿 다운로드
4. **수동입력** - 단건 실적 입력 폼
5. **시뮬레이션** - 생산계획 입력 → BOM 기반 원가 예측
6. **제품-자재매핑** - BOM 관리 (제품별 자재 + 원단위)
7. **기준정보** - 호기/자재/생산량 마스터 관리

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/units` | 호기 목록 조회 |
| POST | `/api/units` | 호기 등록 |
| GET | `/api/materials?category=RAW\|SUB` | 원부자재 목록 조회 |
| POST | `/api/materials` | 원부자재 등록 |
| GET | `/api/records?unit_id=&year=&month=` | 월별 실적 데이터 조회 |
| POST | `/api/records` | 실적 데이터 등록/수정 (Upsert) |
| POST | `/api/records/bulk` | 실적 일괄 등록 |
| DELETE | `/api/records/:id` | 실적 삭제 |
| GET | `/api/analysis/comparison?year=&month=&unit_id=` | **전월대비 분석** (핵심) |
| GET | `/api/analysis/unit-summary?year=&month=` | 호기별 요약 분석 |
| GET | `/api/analysis/category-summary?year=&month=&unit_id=` | 카테고리별 분석 |
| **GET** | **`/api/products`** | **제품 목록 조회** |
| **POST** | **`/api/products`** | **제품 등록** |
| **GET** | **`/api/bom?product_id=`** | **BOM 조회 (제품별 자재매핑)** |
| **POST** | **`/api/bom`** | **BOM 항목 추가/수정 (Upsert)** |
| **DELETE** | **`/api/bom/:id`** | **BOM 항목 삭제** |
| **POST** | **`/api/simulation/run`** | **시뮬레이션 실행** |
| **POST** | **`/api/simulation/save`** | **시뮬레이션 결과 저장** |
| **GET** | **`/api/simulations`** | **시뮬레이션 이력 조회** |

## 시뮬레이션 엔진 로직

### 입력
```json
{
  "base_year": 2026,
  "base_month": 6,
  "plans": [
    {"product_id": 1, "planned_qty": 1200},
    {"product_id": 3, "planned_qty": 800}
  ]
}
```

### 계산 로직
```
예상 사용량 = BOM 원단위 × 계획 생산량
예상 원가 = 예상 사용량 × 기준월 단가

수량차이 효과 = (예상사용량 - 전월사용량) × 전월단가
단가차이 효과 = (기준월단가 - 전월단가) × 예상사용량
원가차이 = 예상원가 - 전월원가
```

### 예시
```
제품: 백상지(A급), 계획 생산량: 1,200 ton
BOM: LBKP 원단위 0.267 ton/제품ton

예상 사용량 = 0.267 × 1,200 = 320.4 ton
기준월 단가 (6월) = 880,000 원/ton
예상 원가 = 320.4 × 880,000 = 281,952,000 원

전월(5월) 사용량: 3,200 ton, 단가: 850,000 원/ton
수량차이 효과 = (320.4 - 3,200) × 850,000 = -2,447,660,000 원
단가차이 효과 = (880,000 - 850,000) × 320.4 = +9,612,000 원
```

## 데이터 모델

### units (호기 마스터)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| unit_code | TEXT | 호기코드 (PM2, PM3, CHEM, TISSUE) |
| unit_name | TEXT | 호기명 |

### materials (원부자재 마스터)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| material_code | TEXT | 자재코드 (RM-001) |
| material_name | TEXT | 자재명 |
| category | TEXT | RAW(원자재) / SUB(부자재) |
| unit_of_measure | TEXT | 단위 (kg, ton, L, EA) |

### monthly_records (월별 실적)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| unit_id | INTEGER | 호기 FK |
| material_id | INTEGER | 자재 FK |
| year, month | INTEGER | 실적 기간 |
| usage_qty | REAL | 사용량 |
| unit_price | REAL | 단가 (원) |
| total_cost | REAL | 총원가 (자동 계산) |
| production_qty | REAL | 생산량 |

### products (제품 마스터) - NEW
| 컬럼 | 타입 | 설명 |
|------|------|------|
| product_code | TEXT | 제품코드 (PRD-PM2-01) |
| product_name | TEXT | 제품명 (백상지A급, 아트지 등) |
| unit_id | INTEGER | 소속 호기 FK |
| unit_of_measure | TEXT | 단위 (ton) |

### bom (자재명세서) - NEW
| 컬럼 | 타입 | 설명 |
|------|------|------|
| product_id | INTEGER | 제품 FK |
| material_id | INTEGER | 자재 FK |
| unit_consumption | REAL | 원단위 (제품 1ton 생산 시 자재 소요량) |
| effective_date | TEXT | 적용 시작일 |

### simulations (시뮬레이션 이력) - NEW
| 컬럼 | 타입 | 설명 |
|------|------|------|
| sim_name | TEXT | 시뮬레이션명 |
| base_year, base_month | INTEGER | 기준 기간 |
| sim_data | TEXT (JSON) | 생산계획 데이터 |
| result_data | TEXT (JSON) | 계산 결과 |

## 기술 스택
- **Backend**: Hono (TypeScript) + Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: TailwindCSS + Chart.js + SheetJS (XLSX) + Vanilla JS
- **Build**: Vite + @hono/vite-cloudflare-pages
- **Deployment**: Cloudflare Pages
- **Font**: Inter (Google Fonts)
- **Color System**: Indigo (primary) + Tailwind Slate

## 로컬 개발

```bash
# 빌드
npm run build

# DB 마이그레이션 (전체)
npm run db:migrate:local

# 시드 데이터 투입
npm run db:seed
npx wrangler d1 execute material-cost-analysis --local --file=./seed_bom.sql

# 개발 서버 시작 (PM2)
pm2 start ecosystem.config.cjs

# 테스트
curl http://localhost:3000
curl http://localhost:3000/api/products
curl -X POST http://localhost:3000/api/simulation/run -H "Content-Type: application/json" -d '{"base_year":2026,"base_month":6,"plans":[{"product_id":1,"planned_qty":1200}]}'
```

## 호기 구성
| 코드 | 호기명 | 주요 제품 |
|------|--------|-----------|
| PM2 | PM2 | 백상지(A급), 백상지(B급) |
| PM3 | PM3 | 아트지, 스노우화이트 |
| CHEM | 제지약품 | - |
| TISSUE | 화장지 | 두루마리(3겹), 미용티슈 |
