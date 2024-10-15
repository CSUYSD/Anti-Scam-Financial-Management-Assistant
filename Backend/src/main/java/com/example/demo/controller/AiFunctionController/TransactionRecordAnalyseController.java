package com.example.demo.controller.AiFunctionController;

import com.example.demo.service.AI.TransactionReportAnalyseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analyse")
@Slf4j
public class TransactionRecordAnalyseController {
    public final TransactionReportAnalyseService transactionReportAnalyseService;
    @Autowired
    public TransactionRecordAnalyseController(TransactionReportAnalyseService transactionReportAnalyseService) {
        this.transactionReportAnalyseService = transactionReportAnalyseService;
    }

    @RequestMapping("/current-record")
    public String analyseCurrentRecord(String currentRecord, String recentRecords) {
        return transactionReportAnalyseService.analyseCurrentRecord(currentRecord, recentRecords);
    }

}
