package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import com.example.demo.Dao.ESDao.RecordESDao;
import com.example.demo.model.TransactionRecordES;
import com.example.demo.service.ES.RecordSyncService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;

import com.example.demo.Dao.RecordDao;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.TransactionRecord;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecordService {

    private final RecordDao recordDao;
    private final RecordSyncService recordSyncService;


    public RecordService(RecordDao recordDao, RecordSyncService recordSyncService) {
        this.recordDao = recordDao;
        this.recordSyncService = recordSyncService;
    }

    @Transactional
    // Save transaction record to database and sync to Elasticsearch
    public TransactionRecord saveTransaction(TransactionRecord transactionRecord) {
        TransactionRecord savedRecord = recordDao.save(transactionRecord);
        recordSyncService.syncToElasticsearch(savedRecord);
        return savedRecord;
    }

    
    //    Get all transactionRecords
    public List<TransactionRecord> getAllTransactions() {
        return recordDao.findAll();
    }

    // Get transaction by id
    public TransactionRecord getTransactionById(Long id) {
        TransactionRecord record = recordDao.findById(id).orElse(null);
        return Optional.ofNullable(record).orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }
}