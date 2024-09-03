package com.example.demo.service;

import com.example.demo.Dao.TransactionRecordDao;
import com.example.demo.Dao.TransactionRecordESDao;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.TransactionRecord;
import com.example.demo.model.TransactionRecordES;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecordService {

    private final TransactionRecordDao transactionRecordDao;
    private final RecordSyncService recordSyncService;
    private final TransactionRecordESDao transactionRecordESDao;
    private final ElasticsearchOperations elasticsearchOperations;


    public RecordService(TransactionRecordDao transactionRecordDao, RecordSyncService recordSyncService, TransactionRecordESDao transactionRecordESDao, ElasticsearchOperations elasticsearchOperations) {
        this.transactionRecordDao = transactionRecordDao;
        this.recordSyncService = recordSyncService;
        this.transactionRecordESDao = transactionRecordESDao;
        this.elasticsearchOperations = elasticsearchOperations;
    }

    @Transactional
    // Save transaction record to database and sync to Elasticsearch
    public TransactionRecord saveTransaction(TransactionRecord transactionRecord) {
        TransactionRecord savedRecord = transactionRecordDao.save(transactionRecord);
        recordSyncService.syncToElasticsearch(savedRecord);
        return savedRecord;
    }

    // Search transactions by keyword
    public Page<TransactionRecordES> searchTransactions(String keyword, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);

        if (keyword != null && !keyword.isEmpty()) {
            return transactionRecordESDao.findByTransactionDescriptionContainingOrTransactionTypeContaining(
                    keyword, keyword, pageRequest);
        } else {
            return transactionRecordESDao.findAll(pageRequest);
        }
    }

    // Advanced search transactions by description, type, and amount range
    public SearchHits<TransactionRecordES> advancedSearch(String description, String type, Double minAmount, Double maxAmount) {
        CriteriaQuery query = new CriteriaQuery(new Criteria());

        if (description != null && !description.isEmpty()) {
            query.addCriteria(Criteria.where("transactionDescription").contains(description));
        }
        if (type != null && !type.isEmpty()) {
            query.addCriteria(Criteria.where("transactionType").is(type));
        }
        if (minAmount != null && maxAmount != null) {
            query.addCriteria(Criteria.where("amount").between(minAmount, maxAmount));
        }

        return elasticsearchOperations.search(query, TransactionRecordES.class);
    }

    // Get transaction by id
    public TransactionRecordES getTransactionById(String id) {
        return transactionRecordESDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id " + id));
    }
}