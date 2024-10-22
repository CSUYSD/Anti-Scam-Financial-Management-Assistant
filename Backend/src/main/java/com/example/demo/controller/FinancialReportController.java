package com.example.demo.controller;

import com.example.demo.model.FinancialReport;
import com.example.demo.service.FinancialReportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/financial-report")
@Slf4j
public class FinancialReportController {
    private final FinancialReportService financialReportService;
    @Autowired
    public FinancialReportController(FinancialReportService financialReportService) {
        this.financialReportService = financialReportService;
    }

    @GetMapping
    public ResponseEntity<List<FinancialReport>> getFinancialReport(@RequestHeader("Authorization") String token) {
        try {
            List<FinancialReport> reports = financialReportService.getFinancialReports(token);
            if (reports == null || reports.isEmpty()) {
                return ResponseEntity.noContent().build(); // 无内容
            }
            return ResponseEntity.ok().body(reports); // 正常返回
        } catch (Exception e) {
            log.error("Error in getting financial report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList()); // 空列表表示错误处理
        }
    }
}