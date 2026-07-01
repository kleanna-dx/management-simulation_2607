package com.company.module.materialcost.service;

import com.company.module.materialcost.dto.SimulationResponse;
import com.company.module.materialcost.dto.SimulationSaveRequest;
import com.company.module.materialcost.entity.Simulation;
import com.company.module.materialcost.repository.SimulationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SimulationService {

    private final SimulationRepository simulationRepository;

    /**
     * 시뮬레이션 목록 조회
     */
    public List<SimulationResponse> getList() {
        return simulationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(SimulationResponse::listItem)
                .collect(Collectors.toList());
    }

    /**
     * 시뮬레이션 상세 조회
     */
    public SimulationResponse getDetail(Long id) {
        Simulation entity = simulationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("시뮬레이션을 찾을 수 없습니다: " + id));
        return SimulationResponse.from(entity);
    }

    /**
     * 시뮬레이션 저장
     */
    @Transactional
    public SimulationResponse save(SimulationSaveRequest request) {
        Simulation entity = Simulation.builder()
                .simName(request.getSimName())
                .baseYear(request.getBaseYear())
                .baseMonth(request.getBaseMonth())
                .simData(request.getSimData())
                .resultData(request.getResultData())
                .createdBy(request.getCreatedBy())
                .build();
        return SimulationResponse.from(simulationRepository.save(entity));
    }
}
