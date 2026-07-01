package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.ExclusionRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExclusionRuleRepository extends JpaRepository<ExclusionRule, Long> {
    List<ExclusionRule> findByMachineCode(String machineCode);
}
