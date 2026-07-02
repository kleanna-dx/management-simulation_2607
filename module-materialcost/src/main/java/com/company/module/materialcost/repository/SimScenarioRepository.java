package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.SimScenario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 시뮬레이션 시나리오 Repository
 *
 * 플러그인 방식 시뮬레이션 시나리오를 관리한다.
 * Phase 확장 시에도 동일한 테이블에 costTypesIncluded 필드만 추가하면 된다.
 */
public interface SimScenarioRepository extends JpaRepository<SimScenario, Long> {

    /**
     * 최근 시나리오 목록 (페이징)
     */
    Page<SimScenario> findByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 호기별 시나리오 목록
     */
    List<SimScenario> findByMachineCodeOrderByCreatedAtDesc(String machineCode);

    /**
     * 기준월/호기별 시나리오 목록
     */
    List<SimScenario> findByBaseYmAndMachineCodeOrderByCreatedAtDesc(String baseYm, String machineCode);

    /**
     * 상태별 시나리오 목록
     */
    List<SimScenario> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * 특정 costType을 포함하는 시나리오 검색
     * (예: ELECTRICITY를 포함하는 시나리오 = Phase 2 이상 시뮬레이션)
     */
    @Query("SELECT ss FROM SimScenario ss WHERE ss.costTypesIncluded LIKE CONCAT('%',:costType,'%') " +
            "ORDER BY ss.createdAt DESC")
    List<SimScenario> findByCostTypeIncluded(@Param("costType") String costType);

    /**
     * 시나리오 이름 검색
     */
    @Query("SELECT ss FROM SimScenario ss WHERE ss.scenarioName LIKE CONCAT('%',:keyword,'%') " +
            "ORDER BY ss.createdAt DESC")
    List<SimScenario> findByNameContaining(@Param("keyword") String keyword);

    /**
     * 작성자별 시나리오 목록
     */
    List<SimScenario> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    /**
     * 완료 상태의 시나리오 중 영업이익 상위/하위 조회 (비교 분석용)
     */
    @Query("SELECT ss FROM SimScenario ss WHERE ss.status = 'COMPLETED' AND ss.machineCode = :machine " +
            "ORDER BY ss.operatingProfit DESC")
    List<SimScenario> findCompletedByMachineOrderByProfitDesc(@Param("machine") String machineCode);
}
