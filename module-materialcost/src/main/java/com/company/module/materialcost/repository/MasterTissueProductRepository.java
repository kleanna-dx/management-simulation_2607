package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.MasterTissueProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterTissueProductRepository extends JpaRepository<MasterTissueProduct, Long> {
    List<MasterTissueProduct> findAllByOrderByCategoryAsc();
}
