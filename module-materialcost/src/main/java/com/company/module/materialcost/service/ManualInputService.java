package com.company.module.materialcost.service;

import com.company.module.materialcost.dto.ManualInputResponse;
import com.company.module.materialcost.dto.ManualInputSaveRequest;
import com.company.module.materialcost.entity.ManualInput;
import com.company.module.materialcost.repository.ManualInputRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManualInputService {

    private final ManualInputRepository manualInputRepository;
    private final ObjectMapper objectMapper;

    private static final List<String> PRODUCTION_FIELDS = List.of("cur_usage", "cur_uc");
    private static final List<String> PURCHASE_FIELDS = List.of("incoming_qty", "incoming_price");

    /**
     * 최신 저장 데이터 조회
     */
    public Optional<ManualInputResponse> getLatest(String ym, String machine) {
        return manualInputRepository.findLatestByYmAndMachine(ym, machine)
                .map(ManualInputResponse::from);
    }

    /**
     * 수기입력 저장 (부서별 merge 방식)
     */
    @Transactional
    public ManualInputResponse save(ManualInputSaveRequest request) {
        String ym = request.getYm();
        String machine = request.getMachine();
        String deptType = request.getDeptType() != null ? request.getDeptType() : "all";

        // 기존 통합 데이터 로드
        Map<String, Object> existingData = new HashMap<>();
        existingData.put("production", new HashMap<>());
        existingData.put("materials", new HashMap<>());
        existingData.put("new_materials", new ArrayList<>());

        Optional<ManualInput> existingOpt = manualInputRepository.findLatestByYmAndMachine(ym, machine);
        if (existingOpt.isPresent()) {
            try {
                existingData = objectMapper.readValue(existingOpt.get().getData(),
                        new TypeReference<Map<String, Object>>() {});
            } catch (JsonProcessingException e) {
                // 파싱 실패 시 빈 데이터로 진행
            }
        }

        // 현재 부서 데이터 파싱
        Map<String, Object> incomingData;
        try {
            incomingData = objectMapper.readValue(request.getData(),
                    new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("데이터 파싱 실패: " + e.getMessage());
        }

        // Merge 로직
        Map<String, Object> mergedMaterials = existingData.containsKey("materials")
                ? new HashMap<>((Map<String, Object>) existingData.get("materials"))
                : new HashMap<>();

        Map<String, Object> incomingMaterials = incomingData.containsKey("materials")
                ? (Map<String, Object>) incomingData.get("materials")
                : new HashMap<>();

        for (Map.Entry<String, Object> entry : incomingMaterials.entrySet()) {
            String matCode = entry.getKey();
            Map<String, Object> incoming = (Map<String, Object>) entry.getValue();
            Map<String, Object> existing = mergedMaterials.containsKey(matCode)
                    ? new HashMap<>((Map<String, Object>) mergedMaterials.get(matCode))
                    : new HashMap<>();

            // 부서별 필드 merge
            List<String> fieldsToMerge = "production".equals(deptType) ? PRODUCTION_FIELDS : 
                                         "purchase".equals(deptType) ? PURCHASE_FIELDS : null;
            if (fieldsToMerge != null) {
                for (String field : fieldsToMerge) {
                    if (incoming.containsKey(field)) {
                        existing.put(field, incoming.get(field));
                    }
                }
            } else {
                existing.putAll(incoming);
            }

            // 이슈사항 append
            mergeIssue(existing, incoming, deptType);

            mergedMaterials.put(matCode, existing);
        }

        // 생산량 merge
        Map<String, Object> mergedProduction = existingData.containsKey("production")
                ? new HashMap<>((Map<String, Object>) existingData.get("production"))
                : new HashMap<>();
        if (incomingData.containsKey("production")) {
            mergedProduction.putAll((Map<String, Object>) incomingData.get("production"));
        }

        // 신규 자재 merge
        List<Object> mergedNewMats = existingData.containsKey("new_materials")
                ? new ArrayList<>((List<Object>) existingData.get("new_materials"))
                : new ArrayList<>();
        if (incomingData.containsKey("new_materials")) {
            List<Map<String, Object>> newMats = (List<Map<String, Object>>) incomingData.get("new_materials");
            for (Map<String, Object> nm : newMats) {
                boolean exists = mergedNewMats.stream()
                        .anyMatch(e -> ((Map<String, Object>) e).get("code").equals(nm.get("code")));
                if (!exists) mergedNewMats.add(nm);
            }
        }

        // 최종 통합 데이터
        Map<String, Object> mergedData = new HashMap<>();
        mergedData.put("production", mergedProduction);
        mergedData.put("materials", mergedMaterials);
        mergedData.put("new_materials", mergedNewMats);

        String deptLabel = "production".equals(deptType) ? "생산" :
                           "purchase".equals(deptType) ? "구매" : "전체";
        String savedByLabel = request.getSavedBy() != null ?
                request.getSavedBy() + "(" + deptLabel + ")" : "";

        try {
            String mergedDataJson = objectMapper.writeValueAsString(mergedData);
            ManualInput entity = ManualInput.builder()
                    .ym(ym)
                    .machineCode(machine)
                    .deptType(deptType)
                    .data(mergedDataJson)
                    .savedBy(savedByLabel)
                    .build();

            ManualInput saved = manualInputRepository.save(entity);
            return ManualInputResponse.from(saved);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("데이터 직렬화 실패: " + e.getMessage());
        }
    }

    /**
     * 히스토리 조회
     */
    public List<ManualInputResponse> getHistory(String ym, String machine) {
        return manualInputRepository.findHistoryByYmAndMachine(ym, machine)
                .stream()
                .map(ManualInputResponse::from)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 이슈사항 merge 로직: 같은 부서 라인 교체, 다른 부서 유지
     */
    private void mergeIssue(Map<String, Object> existing, Map<String, Object> incoming, String deptType) {
        Object incomingIssue = incoming.get("issue");
        if (incomingIssue == null || incomingIssue.toString().isEmpty()) return;

        String deptLabel = "production".equals(deptType) ? "[생산]" :
                           "purchase".equals(deptType) ? "[구매]" : "";
        String newIssue = deptLabel.isEmpty() ? incomingIssue.toString() :
                deptLabel + " " + incomingIssue.toString();

        Object existingIssue = existing.get("issue");
        if (existingIssue != null && !existingIssue.toString().isEmpty()) {
            if (!deptLabel.isEmpty()) {
                String[] lines = existingIssue.toString().split("\n");
                List<String> filtered = new ArrayList<>();
                for (String line : lines) {
                    if (!line.startsWith(deptLabel)) {
                        filtered.add(line);
                    }
                }
                filtered.add(newIssue);
                existing.put("issue", String.join("\n", filtered));
            } else {
                existing.put("issue", existingIssue + "\n" + newIssue);
            }
        } else {
            existing.put("issue", newIssue);
        }
    }
}
