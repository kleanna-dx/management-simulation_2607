package com.company.module.materialcost.service;

import com.company.module.materialcost.dto.RawRecordResponse;
import com.company.module.materialcost.entity.RawRecord;
import com.company.module.materialcost.repository.RawRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RawRecordService {

    private final RawRecordRepository rawRecordRepository;

    /**
     * 원시 실적 데이터 검색 (페이징)
     */
    public Page<RawRecordResponse> searchRecords(String ym, String machine, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RawRecord> records = rawRecordRepository.searchRecords(ym, machine, search, pageable);
        return records.map(RawRecordResponse::from);
    }

    /**
     * 사용 가능한 월 목록 조회
     */
    public List<String> getAvailableMonths() {
        return rawRecordRepository.findDistinctCalendarYm();
    }

    /**
     * 특정 월의 호기 목록 조회
     */
    public List<String> getMachinesByMonth(String ym) {
        return rawRecordRepository.findDistinctMachineCodeByYm(ym);
    }

    /**
     * 자재그룹별 요약 (대시보드용)
     */
    public List<Map<String, Object>> getSummaryByGroup(String ym, String machine) {
        List<Object[]> results = rawRecordRepository.findSummaryByGroup(ym, machine);
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("materialGroupName", row[0]);
            map.put("totalIssueQty", row[1]);
            map.put("totalIssueAmount", row[2]);
            map.put("materialCount", row[3]);
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * 호기별·지종별 생산량 조회
     */
    public List<Map<String, Object>> getProductionByMachineAndType(String ym) {
        List<Object[]> results = rawRecordRepository.findProductionByMachineAndType(ym);
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("machineCode", row[0]);
            map.put("productTypeName", row[1]);
            map.put("totalProduction", row[2]);
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * 호기별 자재 상세 (사용량, 단가)
     */
    public List<Map<String, Object>> getMaterialDetailByMachine(String ym, String machine) {
        List<Object[]> results = rawRecordRepository.findMaterialDetailByMachine(ym, machine);
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("machineCode", row[0]);
            map.put("materialCode", row[1]);
            map.put("materialName", row[2]);
            map.put("materialGroupName", row[3]);
            map.put("usageQty", row[4]);
            map.put("unitPrice", row[5]);
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * 벌크 데이터 저장 (엑셀 업로드)
     */
    @Transactional
    public int saveBulk(List<RawRecord> records) {
        rawRecordRepository.saveAll(records);
        return records.size();
    }

    /**
     * 특정 월+호기 데이터 삭제
     */
    @Transactional
    public int deleteByYmAndMachine(String ym, String machine) {
        return rawRecordRepository.deleteByCalendarYmAndMachineCode(ym, machine);
    }
}
