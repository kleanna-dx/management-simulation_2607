package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.ManualInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ManualInputRepository extends JpaRepository<ManualInput, Long> {

    @Query("SELECT m FROM ManualInput m WHERE m.ym = :ym AND m.machineCode = :machine ORDER BY m.manualInputId DESC")
    List<ManualInput> findByYmAndMachineCodeOrderByIdDesc(@Param("ym") String ym, @Param("machine") String machine);

    default Optional<ManualInput> findLatestByYmAndMachine(String ym, String machine) {
        List<ManualInput> list = findByYmAndMachineCodeOrderByIdDesc(ym, machine);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Query("SELECT m FROM ManualInput m WHERE m.ym = :ym AND m.machineCode = :machine ORDER BY m.manualInputId DESC")
    List<ManualInput> findHistoryByYmAndMachine(@Param("ym") String ym, @Param("machine") String machine);
}
