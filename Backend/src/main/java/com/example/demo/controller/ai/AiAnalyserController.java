package com.example.demo.controller.ai;

import com.example.demo.service.ai.AiAnalyserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai/analyser")
@Slf4j
@AllArgsConstructor
public class AiAnalyserController {
    @Autowired public final AiAnalyserService aiAnalyserService;

    @PostMapping("/financial-report")
    public ResponseEntity<String> generateOverAllFinancialReport(@RequestHeader("Authorization") String token) {
        log.info("Generating overall financial report");
        return ResponseEntity.ok(aiAnalyserService.generateOverAllFinancialReport(token));
    }

}
