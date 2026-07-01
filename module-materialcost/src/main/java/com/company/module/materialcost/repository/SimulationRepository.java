package com.company.module.materialcost.repository;

import com.company.module.materialcost.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SimulationRepository extends JpaRepository<Simulation, Long> {
    List<Simulation> findAllByOrderByCreatedAtDesc();
}
