package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.CostRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 공통 원가 실적 Repository
 *
 * 모든 Phase의 원가 실적을 통합 관리한다.
 * cost_type 필터로 Phase별 데이터를 분리 조회한다.
 */
public interface CostRecordRepository extends JpaRepository<CostRecord, Long> {

    /**
     * 월/호기별 전체 원가 실적 조회
     */
    List<CostRecord> findByCalendarYmAndMachineCode(String calendarYm, String machineCode);

    /**
     * 월/호기/cost_type별 원가 실적 조회 (Phase별 분리 조회)
     */
    List<CostRecord> findByCalendarYmAndMachineCodeAndCostType(
            String calendarYm, String machineCode, String costType);

    /**
     * 여러 cost_type으로 필터링 (시뮬레이션에서 플러그인 방식 조합)
     */
    List<CostRecord> findByCalendarYmAndMachineCodeAndCostTypeIn(
            String calendarYm, String machineCode, List<String> costTypes);

    /**
     * 페이징 조회 (검색 포함)
     */
    @Query("SELECT cr FROM CostRecord cr WHERE cr.calendarYm = :ym " +
            "AND (:machine IS NULL OR cr.machineCode = :machine) " +
            "AND (:costType IS NULL OR cr.costType = :costType) " +
            "AND (:search IS NULL OR cr.costName LIKE CONCAT('%',:search,'%') OR cr.costCode LIKE CONCAT('%',:search,'%'))")
    Page<CostRecord> searchRecords(@Param("ym") String ym,
                                   @Param("machine") String machine,
                                   @Param("costType") String costType,
                                   @Param("search") String search,
                                   Pageable pageable);

    /**
     * 월별 cost_type별 합계 금액 조회 (Dashboard용)
     */
    @Query(value = "SELECT COST_TYPE, SUM(AMOUNT) as totalAmount, COUNT(*) as recordCount " +
            "FROM mc_cost_records WHERE CALENDAR_YM = :ym AND (:machine IS NULL OR MACHINE_CODE = :machine) " +
            "GROUP BY COST_TYPE ORDER BY COST_TYPE",
            nativeQuery = true)
    List<Object[]> findSummaryByCostType(@Param("ym") String ym, @Param("machine") String machine);

    /**
     * 월별 cost_code별 상세 합계 (사용량효과/단가효과 포함)
     */
    @Query(value = "SELECT COST_TYPE, COST_CODE, COST_NAME, " +
            "SUM(DRIVER_QTY) as totalDriverQty, " +
            "CASE WHEN SUM(DRIVER_QTY) > 0 THEN SUM(AMOUNT) / SUM(DRIVER_QTY) ELSE 0 END as avgUnitPrice, " +
            "SUM(AMOUNT) as totalAmount, " +
            "SUM(QTY_EFFECT) as totalQtyEffect, " +
            "SUM(PRICE_EFFECT) as totalPriceEffect " +
            "FROM mc_cost_records WHERE CALENDAR_YM = :ym AND MACHINE_CODE = :machine " +
            "GROUP BY COST_TYPE, COST_CODE, COST_NAME " +
            "ORDER BY COST_TYPE, COST_CODE",
            nativeQuery = true)
    List<Object[]> findDetailByCostTypeAndCode(@Param("ym") String ym, @Param("machine") String machine);

    /**
     * 최근 N개월 추이 데이터 (트렌드 차트용)
     */
    @Query(value = "SELECT CALENDAR_YM, COST_TYPE, SUM(AMOUNT) as totalAmount " +
            "FROM mc_cost_records WHERE MACHINE_CODE = :machine AND COST_TYPE IN :costTypes " +
            "GROUP BY CALENDAR_YM, COST_TYPE ORDER BY CALENDAR_YM",
            nativeQuery = true)
    List<Object[]> findTrendByMachineAndTypes(@Param("machine") String machine,
                                              @Param("costTypes") List<String> costTypes);

    /**
     * 해당 월/호기의 전체 원가 합계 (P&L 영업이익 계산용)
     */
    @Query("SELECT SUM(cr.amount) FROM CostRecord cr " +
            "WHERE cr.calendarYm = :ym AND cr.machineCode = :machine")
    Double sumTotalAmountByYmAndMachine(@Param("ym") String ym, @Param("machine") String machine);

    /**
     * 해당 월/호기의 cost_type별 합계
     */
    @Query("SELECT SUM(cr.amount) FROM CostRecord cr " +
            "WHERE cr.calendarYm = :ym AND cr.machineCode = :machine AND cr.costType = :costType")
    Double sumAmountByYmAndMachineAndType(@Param("ym") String ym,
                                          @Param("machine") String machine,
                                          @Param("costType") String costType);

    /**
     * 사용 가능한 년월 목록
     */
    @Query("SELECT DISTINCT cr.calendarYm FROM CostRecord cr ORDER BY cr.calendarYm DESC")
    List<String> findDistinctCalendarYm();

    /**
     * 특정 월의 호기 목록
     */
    @Query("SELECT DISTINCT cr.machineCode FROM CostRecord cr WHERE cr.calendarYm = :ym ORDER BY cr.machineCode")
    List<String> findDistinctMachineCodeByYm(@Param("ym") String ym);
}
