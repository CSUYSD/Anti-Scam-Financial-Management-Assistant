package com.example.demo.controller;

import com.example.demo.model.TransactionRecord;
import com.example.demo.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionRecordController {

    private final TransactionService transactionService;

    public TransactionRecordController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/save")
    public ResponseEntity<TransactionRecord> saveTransaction(@RequestBody TransactionRecord transactionRecord) {
        TransactionRecord savedRecord = transactionService.saveTransaction(transactionRecord);
        return ResponseEntity.ok(savedRecord);
    }

}
