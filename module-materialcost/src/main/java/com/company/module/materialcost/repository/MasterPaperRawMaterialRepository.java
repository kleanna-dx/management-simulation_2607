package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.MasterPaperRawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterPaperRawMaterialRepository extends JpaRepository<MasterPaperRawMaterial, Long> {
    List<MasterPaperRawMaterial> findAllByOrderByMaterialGroupAsc();
}
