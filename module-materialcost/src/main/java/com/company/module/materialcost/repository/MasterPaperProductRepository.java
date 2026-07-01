package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.MasterPaperProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterPaperProductRepository extends JpaRepository<MasterPaperProduct, Long> {
    List<MasterPaperProduct> findAllByOrderByGradeCodeAsc();
}
