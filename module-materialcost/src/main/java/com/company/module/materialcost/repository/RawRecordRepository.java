package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.RawRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RawRecordRepository extends JpaRepository<RawRecord, Long> {

    Page<RawRecord> findByCalendarYmAndMachineCode(String calendarYm, String machineCode, Pageable pageable);

    Page<RawRecord> findByCalendarYm(String calendarYm, Pageable pageable);

    @Query("SELECT r FROM RawRecord r WHERE r.calendarYm = :ym " +
            "AND (:machine IS NULL OR r.machineCode = :machine) " +
            "AND (:search IS NULL OR r.materialName LIKE CONCAT('%',:search,'%') OR r.materialGroupName LIKE CONCAT('%',:search,'%'))")
    Page<RawRecord> searchRecords(@Param("ym") String ym,
                                  @Param("machine") String machine,
                                  @Param("search") String search,
                                  Pageable pageable);

    @Query("SELECT DISTINCT r.calendarYm FROM RawRecord r ORDER BY r.calendarYm DESC")
    List<String> findDistinctCalendarYm();

    @Query("SELECT DISTINCT r.machineCode FROM RawRecord r WHERE r.calendarYm = :ym ORDER BY r.machineCode")
    List<String> findDistinctMachineCodeByYm(@Param("ym") String ym);

    @Query(value = "SELECT MATERIAL_GROUP_NAME, " +
            "SUM(ISSUE_QTY) as totalIssueQty, " +
            "SUM(ISSUE_AMOUNT) as totalIssueAmount, " +
            "COUNT(DISTINCT MATERIAL_CODE) as materialCount " +
            "FROM mc_raw_records WHERE CALENDAR_YM = :ym AND (:machine IS NULL OR MACHINE_CODE = :machine) " +
            "GROUP BY MATERIAL_GROUP_NAME ORDER BY totalIssueAmount DESC",
            nativeQuery = true)
    List<Object[]> findSummaryByGroup(@Param("ym") String ym, @Param("machine") String machine);

    @Query(value = "SELECT MACHINE_CODE, PRODUCT_TYPE_NAME, " +
            "SUM(TOTAL_PRODUCTION) as totalProduction " +
            "FROM mc_raw_records WHERE CALENDAR_YM = :ym " +
            "GROUP BY MACHINE_CODE, PRODUCT_TYPE_NAME",
            nativeQuery = true)
    List<Object[]> findProductionByMachineAndType(@Param("ym") String ym);

    @Query(value = "SELECT MACHINE_CODE, MATERIAL_CODE, MATERIAL_NAME, MATERIAL_GROUP_NAME, " +
            "SUM(ISSUE_QTY) as usageQty, " +
            "CASE WHEN SUM(ISSUE_QTY) > 0 THEN SUM(ISSUE_AMOUNT) / SUM(ISSUE_QTY) ELSE 0 END as unitPrice " +
            "FROM mc_raw_records WHERE CALENDAR_YM = :ym AND MACHINE_CODE = :machine " +
            "GROUP BY MACHINE_CODE, MATERIAL_CODE, MATERIAL_NAME, MATERIAL_GROUP_NAME " +
            "ORDER BY MATERIAL_GROUP_NAME, MATERIAL_NAME",
            nativeQuery = true)
    List<Object[]> findMaterialDetailByMachine(@Param("ym") String ym, @Param("machine") String machine);

    @Modifying
    @Query("DELETE FROM RawRecord r WHERE r.calendarYm = :ym AND r.machineCode = :machine")
    int deleteByCalendarYmAndMachineCode(@Param("ym") String ym, @Param("machine") String machine);

    long countByCalendarYm(String calendarYm);
}
