package com.example.demo.service.ES;

import com.example.demo.repository.TransactionRecordDao;
import com.example.demo.repository.ESDao.RecordESDao;
import com.example.demo.model.TransactionRecordES;
import com.example.demo.model.TransactionRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecordSyncService {

    private final TransactionRecordDao transactionRecordDao;
    private final RecordESDao recordESDao;

    public RecordSyncService(TransactionRecordDao transactionRecordDao,
                             RecordESDao recordESDao) {
        this.transactionRecordDao = transactionRecordDao;
        this.recordESDao = recordESDao;
    }

    @Transactional
    public void syncToElasticsearch(TransactionRecord record) {
        TransactionRecordES esRecord = convertToESEntity(record);
        recordESDao.save(esRecord);
    }

    @Transactional
    public void deleteFromElasticsearch(Long recordId) {
        String esRecordId = String.valueOf(recordId);
        recordESDao.deleteById(esRecordId);
    }

    @Transactional
//  delete batch of records from elastic search
    public void deleteFromElasticsearchInBatch(List<Long> recordIds) {
        List<String> esRecordIds = recordIds.stream()
                .map(String::valueOf)
                .collect(Collectors.toList());
        recordESDao.deleteAllById(esRecordIds);
    }

    @Transactional
    public void updateInElasticsearch(TransactionRecord record) {
        TransactionRecordES esRecord = convertToESEntity(record);
        String esRecordId = String.valueOf(record.getId());

        if (recordESDao.existsById(esRecordId)) {
            // fi record exist
            recordESDao.save(esRecord);
        } else {
            throw new RuntimeException("Record not found in Elasticsearch: " + esRecordId);
        }
    }

    private TransactionRecordES convertToESEntity(TransactionRecord record) {
        TransactionRecordES esRecord = new TransactionRecordES();
        esRecord.setId(String.valueOf(record.getId()));
        esRecord.setType(record.getType());
        esRecord.setCategory(record.getCategory());
        esRecord.setAmount(record.getAmount());
        esRecord.setTransactionMethod(record.getTransactionMethod());
        esRecord.setTransactionTime(record.getTransactionTime());
        esRecord.setTransactionDescription(record.getTransactionDescription());
        esRecord.setUserId(String.valueOf(record.getUserId()));
        esRecord.setAccountId(String.valueOf(record.getAccount().getId()));
        return esRecord;
    }
}