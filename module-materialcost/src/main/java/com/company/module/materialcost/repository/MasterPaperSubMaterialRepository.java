package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.MasterPaperSubMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterPaperSubMaterialRepository extends JpaRepository<MasterPaperSubMaterial, Long> {
    List<MasterPaperSubMaterial> findAllByOrderByMaterialGroupAsc();
}
