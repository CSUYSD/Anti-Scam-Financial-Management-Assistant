package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Dao.TransactionRecordDao;
import com.example.demo.model.TransactionRecord;

@Service
public class TransactionRecordService {
    private final TransactionRecordDao transactionRecordDao;

    @Autowired
    public TransactionRecordService(TransactionRecordDao transactionRecordDao) {
        this.transactionRecordDao = transactionRecordDao;
    }

    public TransactionRecord getRecordById(Long id) {
        TransactionRecord record = transactionRecordDao.findById(id).orElse(null);
        if (record == null) {
            throw new RuntimeException("Record not found");
        }
        return record;
    }

    public List<TransactionRecord> getAllRecord() {
        return transactionRecordDao.findAll();
    }
    // ... 其他方法保持不变

    public List<TransactionRecord> findByType(String type) {
        return transactionRecordDao.findByType(type);
    }
}