package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {

    List<InventoryStock> findByMonthAndPlant(String month, String plant);

    List<InventoryStock> findByMonth(String month);

    @Query("SELECT i FROM InventoryStock i WHERE i.month = :month " +
            "AND (:plant IS NULL OR i.plant = :plant) " +
            "AND (:materialGroup IS NULL OR i.materialGroup = :materialGroup)")
    List<InventoryStock> findByConditions(@Param("month") String month,
                                          @Param("plant") String plant,
                                          @Param("materialGroup") String materialGroup);

    @Query(value = "SELECT MATERIAL_ID, CLOSING_QTY, CLOSING_PRICE " +
            "FROM mc_inventory_stock WHERE MONTH = :month AND PLANT = :plant",
            nativeQuery = true)
    List<Object[]> findClosingMapByMonthAndPlant(@Param("month") String month, @Param("plant") String plant);
}
