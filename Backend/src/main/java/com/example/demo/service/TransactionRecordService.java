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

    // 创建新的交易记录
    public TransactionRecord saveTransactionRecord(TransactionRecord transactionRecord) {
        return transactionRecordDao.save(transactionRecord);
    }

    // 更新已有交易记录
    public TransactionRecord updateTransactionRecord(Long id, TransactionRecord newTransactionRecord) {
        TransactionRecord existingRecord = transactionRecordDao.findById(id).orElse(null);
        if (existingRecord == null) {
            throw new RuntimeException("Record not found");
        }
        // 更新必要的字段
        existingRecord.setAmount(newTransactionRecord.getAmount());
        existingRecord.setTransactionType(newTransactionRecord.getTransactionType());
        existingRecord.setType(newTransactionRecord.getType());
        existingRecord.setTransactionTime(newTransactionRecord.getTransactionTime());

        return transactionRecordDao.save(existingRecord);
    }

    // 删除交易记录
    public void deleteTransactionRecord(Long id) {
        TransactionRecord record = transactionRecordDao.findById(id).orElse(null);
        if (record == null) {
            throw new RuntimeException("Record not found");
        }
        transactionRecordDao.delete(record);
    }
}