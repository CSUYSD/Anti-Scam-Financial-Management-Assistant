package com.example.demo.service;

import java.util.List;


import jakarta.transaction.Transactional;
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

    public List<TransactionRecord> getAllRecordsByAccount(Long accountId) {
        return transactionRecordDao.findAllByAccountId(accountId);
    }

//    public TransactionRecord getRecordById(Long id) {
//        TransactionRecord record = transactionRecordDao.findById(id).orElse(null);
//        if (record == null) {
//            throw new RuntimeException("Record not found");
//        }
//        return record;
//    }


    public TransactionRecord getRecordById(Long id, Long accountId) {
        return transactionRecordDao.findByIdAndAccountId(id, accountId)
                .orElseThrow(() -> new RuntimeException("Record not found for id " + id + " and accountId " + accountId));
    }

    public TransactionRecord saveTransactionRecord(TransactionRecord transactionRecord) {
        return transactionRecordDao.save(transactionRecord);
    }

    @Transactional
    public TransactionRecord updateTransactionRecord(Long id, TransactionRecord newTransactionRecord) {
        TransactionRecord existingRecord = transactionRecordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found for id: " + id));

        existingRecord.setAmount(newTransactionRecord.getAmount());
        existingRecord.setTransactionType(newTransactionRecord.getTransactionType());
        existingRecord.setType(newTransactionRecord.getType());
        existingRecord.setTransactionTime(newTransactionRecord.getTransactionTime());
        existingRecord.setTransactionDescription(newTransactionRecord.getTransactionDescription());
        existingRecord.setTransactionMethod(newTransactionRecord.getTransactionMethod());

        return transactionRecordDao.save(existingRecord);
    }


    public List<TransactionRecord> findByType(String type) {
        return transactionRecordDao.findByType(type);
    }


    public void deleteTransactionRecord(Long id) {
        TransactionRecord record = transactionRecordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found for id: " + id));
        transactionRecordDao.delete(record);
    }

    @Transactional
    public void deleteTransactionRecordsInBatch(Long accountId, List<Long> recordIds) {
        List<TransactionRecord> records = transactionRecordDao.findAllByIdInAndAccountId(recordIds, accountId);
        if (records.isEmpty()) {
            throw new RuntimeException("No records found for provided IDs and accountId: " + accountId);
        }
        transactionRecordDao.deleteAll(records);
    }

}