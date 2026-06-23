# 원부자재 사전원가 분석 시스템

## 프로젝트 개요
- **목적**: 호기(생산라인)별 원부자재의 전월/당월 실적을 비교하고, 사용량 및 단가 차이에 따른 손익 효과를 분석
- **핵심 분석 로직**:
  - **수량차이 효과** = (당월수량 - 전월수량) × 전월단가
  - **단가차이 효과** = (당월단가 - 전월단가) × 당월수량
  - **총 원가차이** = 수량차이 효과 + 단가차이 효과

## 기능

### 완료된 기능
- [x] **대시보드**: 전월 대비 당월 원가 요약 카드 (총원가, 수량효과, 단가효과)
- [x] **호기별 비교 차트**: 전월/당월 원가 비교 막대 차트
- [x] **손익효과 분해 차트**: 수량차이 vs 단가차이 호기별 시각화
- [x] **카테고리별 분석**: 원자재/부자재 구분 요약
- [x] **원가 영향 TOP 5**: 원가차이가 큰 항목 자동 추출
- [x] **상세분석표**: 전체 항목별 수량/단가/원가 비교 테이블
- [x] **CSV 내보내기**: 분석 결과를 CSV로 다운로드
- [x] **데이터 입력**: 호기/자재별 월별 실적 데이터 CRUD
- [x] **기준정보 관리**: 호기/원부자재 마스터 데이터 관리
- [x] **필터링**: 분석기간(년/월) 및 호기 필터

### 미구현 기능
- [ ] 엑셀 파일 업로드/다운로드
- [ ] 다중 월 트렌드 분석 (3개월 이상 추이)
- [ ] 예산 대비 실적 분석
- [ ] 사용자 인증/권한 관리
- [ ] 자재별 원단위(사용량/생산량) 분석

## URL
- **개발 서버**: https://3000-iiyyxk2nzmc4mtf3rk3y7-2b54fc91.sandbox.novita.ai

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/units` | 호기 목록 조회 |
| POST | `/api/units` | 호기 등록 |
| GET | `/api/materials?category=RAW|SUB` | 원부자재 목록 조회 |
| POST | `/api/materials` | 원부자재 등록 |
| GET | `/api/records?unit_id=&year=&month=` | 월별 실적 데이터 조회 |
| POST | `/api/records` | 실적 데이터 등록/수정 (Upsert) |
| POST | `/api/records/bulk` | 실적 일괄 등록 |
| DELETE | `/api/records/:id` | 실적 삭제 |
| GET | `/api/analysis/comparison?year=&month=&unit_id=` | **전월대비 분석** (핵심) |
| GET | `/api/analysis/unit-summary?year=&month=` | 호기별 요약 분석 |
| GET | `/api/analysis/category-summary?year=&month=&unit_id=` | 카테고리별 분석 |

## 데이터 모델

### units (호기 마스터)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| unit_code | TEXT | 호기코드 (UNIT-01) |
| unit_name | TEXT | 호기명 (1호기) |

### materials (원부자재 마스터)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| material_code | TEXT | 자재코드 (RM-001) |
| material_name | TEXT | 자재명 |
| category | TEXT | RAW(원자재) / SUB(부자재) |
| unit_of_measure | TEXT | 단위 (kg, L, EA, m) |

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

## 기술 스택
- **Backend**: Hono (TypeScript) + Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: TailwindCSS + Chart.js + Vanilla JS
- **Build**: Vite + @hono/vite-build
- **Deployment**: Cloudflare Pages

## 손익효과 분석 로직 설명

```
예시: 철강판(SPHC) - 1호기
┌──────────┬────────────┬────────────┬────────────┐
│          │  전월(5월)  │  당월(6월)  │   차이     │
├──────────┼────────────┼────────────┼────────────┤
│ 사용량   │ 12,500 kg  │ 13,200 kg  │ +700 kg    │
│ 단가     │ 980 원/kg  │ 1,020 원/kg│ +40 원     │
│ 총원가   │12,250,000  │13,464,000  │+1,214,000  │
└──────────┴────────────┴────────────┴────────────┘

수량차이 효과 = (13,200 - 12,500) × 980 = +686,000원 (원가 증가)
단가차이 효과 = (1,020 - 980) × 13,200 = +528,000원 (원가 증가)
총 원가차이 = 686,000 + 528,000 = +1,214,000원
```

- **양수(+)** = 원가 증가 → 손익 악화 (빨간색)
- **음수(-)** = 원가 절감 → 손익 개선 (파란색)

## 로컬 개발

```bash
# 빌드
npm run build

# DB 마이그레이션
npm run db:migrate:local

# 시드 데이터 투입
npm run db:seed

# 개발 서버 시작
npm run dev:sandbox
```
