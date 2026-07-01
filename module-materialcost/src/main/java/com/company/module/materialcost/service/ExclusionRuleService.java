package com.company.module.materialcost.service;

import com.company.module.materialcost.dto.ExclusionRuleResponse;
import com.company.module.materialcost.dto.ExclusionRuleSaveRequest;
import com.company.module.materialcost.entity.ExclusionRule;
import com.company.module.materialcost.repository.ExclusionRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExclusionRuleService {

    private final ExclusionRuleRepository exclusionRuleRepository;

    /**
     * 호기별 제외규칙 조회
     */
    public List<ExclusionRuleResponse> getByMachine(String machineCode) {
        return exclusionRuleRepository.findByMachineCode(machineCode)
                .stream()
                .map(ExclusionRuleResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 제외규칙 저장
     */
    @Transactional
    public ExclusionRuleResponse save(ExclusionRuleSaveRequest request) {
        ExclusionRule entity = ExclusionRule.builder()
                .machineCode(request.getMachineCode())
                .materialGroupKeyword(request.getMaterialGroupKeyword())
                .excludedProductType(request.getExcludedProductType())
                .description(request.getDescription())
                .build();
        return ExclusionRuleResponse.from(exclusionRuleRepository.save(entity));
    }

    /**
     * 제외규칙 수정
     */
    @Transactional
    public ExclusionRuleResponse update(Long id, ExclusionRuleSaveRequest request) {
        ExclusionRule entity = exclusionRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("제외규칙을 찾을 수 없습니다: " + id));
        entity.update(request.getMachineCode(), request.getMaterialGroupKeyword(),
                request.getExcludedProductType(), request.getDescription());
        return ExclusionRuleResponse.from(entity);
    }

    /**
     * 제외규칙 삭제
     */
    @Transactional
    public void delete(Long id) {
        exclusionRuleRepository.deleteById(id);
    }
}
