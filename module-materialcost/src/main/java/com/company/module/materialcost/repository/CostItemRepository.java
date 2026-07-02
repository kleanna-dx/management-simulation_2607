package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.CostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 원가 항목 마스터 Repository
 *
 * Phase별 원가 항목을 조회/관리한다.
 * Phase 2~4 추가 시에도 이 Repository는 수정 없이 그대로 사용된다.
 */
public interface CostItemRepository extends JpaRepository<CostItem, Long> {

    /**
     * 특정 Phase의 활성 원가 항목 목록 조회
     */
    List<CostItem> findByPhaseAndIsActiveTrueOrderBySortOrder(Integer phase);

    /**
     * 특정 cost_type의 활성 원가 항목 목록 조회
     */
    List<CostItem> findByCostTypeAndIsActiveTrueOrderBySortOrder(String costType);

    /**
     * 여러 cost_type에 해당하는 활성 원가 항목 목록 조회
     * (시뮬레이션에서 costTypesIncluded 파싱 후 사용)
     */
    List<CostItem> findByCostTypeInAndIsActiveTrueOrderBySortOrder(List<String> costTypes);

    /**
     * costCode로 단건 조회
     */
    Optional<CostItem> findByCostCode(String costCode);

    /**
     * 특정 Phase 이하(포함)의 모든 활성 원가 항목 조회
     * Phase 2 시뮬레이션 시 Phase 1+2 항목 모두 필요
     */
    @Query("SELECT ci FROM CostItem ci WHERE ci.phase <= :maxPhase AND ci.isActive = true ORDER BY ci.phase, ci.sortOrder")
    List<CostItem> findActiveItemsUpToPhase(@Param("maxPhase") Integer maxPhase);

    /**
     * cost_behavior별 그룹 조회 (변동비/고정비 분리 계산용)
     */
    List<CostItem> findByCostBehaviorAndIsActiveTrueOrderBySortOrder(String costBehavior);

    /**
     * 전체 활성 항목 수 (Dashboard 통계용)
     */
    long countByIsActiveTrue();

    /**
     * cost_type별 활성 항목 수
     */
    long countByCostTypeAndIsActiveTrue(String costType);
}
