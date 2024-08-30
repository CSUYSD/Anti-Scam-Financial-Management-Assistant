package com.example.demo.controller;

import com.example.demo.model.TransactionRecord;
import com.example.demo.service.RecordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/records")
public class RecordController {
    private static final Logger logger = LoggerFactory.getLogger(RecordController.class);

    private final RecordService recordService;

    @Autowired
    public RecordController(RecordService recordService) {
        this.recordService = recordService;
    }

    @GetMapping("/allrecords")
    public ResponseEntity<List<TransactionRecord>> getAllTransactionRecords() {
        List<TransactionRecord> transactionRecords = recordService.findAll();
        return ResponseEntity.ok(transactionRecords);
    }

    @GetMapping("/allrecords/{accountId}")
    public ResponseEntity<List<TransactionRecord>> getAllTransactionRecordsByAccountId(@PathVariable Long accountId) {
        List<TransactionRecord> transactionRecords = recordService.findAllByAccountId(accountId);
        for (TransactionRecord record : transactionRecords) {
            logger.info("Processing record with ID: {}", record.getId());
            logger.info("IncomeOrExpense: {}", record.getIncomeOrExpense());
            logger.info("TransactionType: {}", record.getTransactionType());
        }
        if (transactionRecords.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } else {
            return ResponseEntity.ok(transactionRecords);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionRecord> getTransactionRecordById(@PathVariable Long id) {
        Optional<TransactionRecord> transactionRecordOptional = recordService.findById(id);
        return transactionRecordOptional.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/create")
    public ResponseEntity<String> createTransactionRecord(@RequestBody TransactionRecord transactionRecord) {
        try {
            recordService.saveTransactionRecord(transactionRecord);
            return ResponseEntity.status(HttpStatus.CREATED).body("Transaction Record has been created");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating transaction record: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateTransactionRecord(@PathVariable Long id, @RequestBody TransactionRecord transactionRecordDetails) {
        try {
            recordService.updateTransactionRecord(id, transactionRecordDetails);
            return ResponseEntity.ok("Transaction Record updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating transaction record: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransactionRecord(@PathVariable Long id) {
        try {
            recordService.deleteTransactionRecord(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting transaction record: " + e.getMessage());
        }
    }
}
