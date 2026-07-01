package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.MasterTissueRawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterTissueRawMaterialRepository extends JpaRepository<MasterTissueRawMaterial, Long> {
    List<MasterTissueRawMaterial> findAllByOrderByCategoryAsc();
}
