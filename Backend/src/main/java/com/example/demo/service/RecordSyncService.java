package com.example.demo.service;

import com.example.demo.Dao.TransactionRecordDao;
import com.example.demo.Dao.TransactionRecordESDao;
import com.example.demo.model.TransactionRecordES;
import com.example.demo.model.TransactionRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecordSyncService {

    private final TransactionRecordDao transactionRecordDao;
    private final TransactionRecordESDao transactionRecordESDao;

    public RecordSyncService(TransactionRecordDao transactionRecordDao,
                             TransactionRecordESDao transactionRecordESDao) {
        this.transactionRecordDao = transactionRecordDao;
        this.transactionRecordESDao = transactionRecordESDao;
    }

    @Transactional
    //   Save transaction record to database and sync to Elasticsearch
    public void syncToElasticsearch(TransactionRecord transactionRecord) {
        TransactionRecordES esRecord = convertToESEntity(transactionRecord);
        transactionRecordESDao.save(esRecord);
    }

//    Convert TransactionRecord to TransactionRecordES
    private TransactionRecordES convertToESEntity(TransactionRecord record) {
        TransactionRecordES esRecord = new TransactionRecordES();
        esRecord.setId(String.valueOf(record.getId()));
        esRecord.setIncomeOrExpense(record.getIncomeOrExpense().toString());
        esRecord.setTransactionType(record.getTransactionType());
        esRecord.setAmount(record.getAmount());
        esRecord.setTransactionMethod(record.getTransactionMethod());
        esRecord.setTransactionTime(record.getTransactionTime());
        esRecord.setTransactionDescription(record.getTransactionDescription());
        esRecord.setAccountId(String.valueOf(record.getAccount().getId()));
        return esRecord;
    }
}