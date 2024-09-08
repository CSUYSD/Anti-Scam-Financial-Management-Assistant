package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.Dao.RecordDao;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.TransactionRecord;

@Service
public class RecordService {

    private final RecordDao recordDao;



    public RecordService(RecordDao recordDao) {
        this.recordDao = recordDao;
    }
    
    public List<TransactionRecord> getAllTransactions() {
        return recordDao.findAll();
    }

    // Get transaction by id
    public TransactionRecord getTransactionById(Long id) {
        TransactionRecord record = recordDao.findById(id).orElse(null);
        return Optional.ofNullable(record).orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }
}