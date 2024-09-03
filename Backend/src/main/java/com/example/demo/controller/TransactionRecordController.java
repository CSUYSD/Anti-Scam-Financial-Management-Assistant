package com.example.demo.controller;

import com.example.demo.model.TransactionRecord;
import com.example.demo.service.RecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionRecordController {

    private final RecordService recordService;

    public TransactionRecordController(RecordService recordService) {
        this.recordService = recordService;
    }

    @PostMapping("/save")
    public ResponseEntity<TransactionRecord> saveTransaction(@RequestBody TransactionRecord transactionRecord) {
        TransactionRecord savedRecord = recordService.saveTransaction(transactionRecord);
        return ResponseEntity.ok(savedRecord);
    }

}
