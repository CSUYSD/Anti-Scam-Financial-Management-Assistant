package com.example.demo.service;

import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;

import com.example.demo.model.Redis.RedisRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.Dao.TransactionRecordDao;
import com.example.demo.model.TransactionRecord;

@Service
public class TransactionRecordService {
    private final TransactionRecordDao transactionRecordDao;
    private final RedisTemplate<String, Object> redisTemplate;

    private HashOperations<String, String, RedisRecord> hashOperations;


    @Autowired
    public TransactionRecordService(TransactionRecordDao transactionRecordDao, RedisTemplate<String, Object> redisTemplate) {
        this.transactionRecordDao = transactionRecordDao;
        this.redisTemplate = redisTemplate;
        this.hashOperations = redisTemplate.opsForHash();
    }

    public TransactionRecord getRecordById(Long id, Long accountId) {
//        TransactionRecord record = transactionRecordDao.findById(id).orElse(null);
//        if (record == null) {
//            throw new RuntimeException("Record not found");
//        }
//        return record;
        String redisKey = "record:" + accountId;
        RedisRecord redisRecord = hashOperations.get(redisKey, id);

        if (redisRecord != null) {
            return convertToTransactionRecord(redisRecord); // Redis中有，直接返回
        }

        TransactionRecord record = transactionRecordDao.findById(id).orElse(null);
        if (record == null) {
            throw new RuntimeException("Record not found");
        }

        // 数据库中找到记录，插入Redis中
        RedisRecord newRedisRecord = convertToRedisRecord(record);
        hashOperations.put(redisKey, String.valueOf(id), newRedisRecord);

        return record;
    }

    public List<TransactionRecord> getAllRecordsByAccount(Long accountId) {
        String redisKey = "record:" + accountId;

        // 从 Redis 中获取所有记录的键值对
        Map<String, RedisRecord> recordsMap = hashOperations.entries(redisKey);

        // 如果 Redis 中有记录，直接返回转换后的结果
        if (!recordsMap.isEmpty()) {
            return recordsMap.values().stream()
                    .map(this::convertToTransactionRecord)
                    .collect(Collectors.toList());
        }

        // 如果 Redis 中没有，去数据库查询账户下的所有记录
        List<TransactionRecord> records = transactionRecordDao.findByAccountId(accountId);

        // 如果数据库中没有记录，返回空列表
        if (records.isEmpty()) {
            return Collections.emptyList();
        }

        // 将查到的所有记录放入 Redis
        records.forEach(record -> {
            RedisRecord redisRecord = convertToRedisRecord(record);
            hashOperations.put(redisKey, String.valueOf(record.getId()), redisRecord);
        });

        return records;
//        return transactionRecordDao.findAll();
    }


    public List<TransactionRecord> findByType(String type) {
        return transactionRecordDao.findByType(type);
    }

    // 创建新的交易记录(finished)
    public TransactionRecord saveTransactionRecord(TransactionRecord transactionRecord) {

//        return transactionRecordDao.save(transactionRecord);
        TransactionRecord savedRecord = transactionRecordDao.save(transactionRecord);

//         将数据存储到Redis中, 使用哈希结构存储
        RedisRecord redisRecord = convertToRedisRecord(savedRecord);
        String redisKey = "record:" + savedRecord.getAccount().getId(); // 用账户ID作为Redis哈希的Key
        hashOperations.put(redisKey, String.valueOf(savedRecord.getId()), redisRecord); // 存储记录到Redis中

        return savedRecord;
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
        TransactionRecord updatedRecord = transactionRecordDao.save(existingRecord);

        // 同步更新Redis
        String redisKey = "record:" + updatedRecord.getAccount().getId();
        RedisRecord redisRecord = convertToRedisRecord(updatedRecord);
        hashOperations.put(redisKey, String.valueOf(updatedRecord.getId()), redisRecord);

        return updatedRecord;
    }

    // 删除交易记录
    public void deleteTransactionRecord(Long id) {
        TransactionRecord record = transactionRecordDao.findById(id).orElse(null);
        if (record == null) {
            throw new RuntimeException("Record not found");
        }

        transactionRecordDao.delete(record);

        // 从Redis中删除
        String redisKey = "record:" + record.getAccount().getId();
        hashOperations.delete(redisKey, id);
    }

    public void deleteTransactionRecordsInBatch(Long accountId, List<Long> recordIds) {
        List<TransactionRecord> records = transactionRecordDao.findAllById(recordIds);

        // 确认所有记录都属于指定的 accountId
        for (TransactionRecord record : records) {
            if (!record.getAccount().getId().equals(accountId)) {
                throw new IllegalArgumentException("Cannot delete records not belonging to the specified account.");
            }
        }

        // 删除数据库中的记录
        transactionRecordDao.deleteAll(records);

        // 同步删除 Redis 中的缓存记录
        for (TransactionRecord record : records) {
            String redisKey = "record:" + record.getAccount().getId();
            redisTemplate.opsForHash().delete(redisKey, record.getId());
        }
    }

    private RedisRecord convertToRedisRecord(TransactionRecord record) {
        return new RedisRecord(
                record.getId(),
                record.getType(),
                record.getTransactionType(),
                record.getAmount(),
                record.getTransactionMethod(),
                record.getTransactionTime(),
                record.getTransactionDescription(),
                record.getAccount().getId()
        );
    }


    private TransactionRecord convertToTransactionRecord(RedisRecord redisRecord) {
        TransactionRecord record = new TransactionRecord();
        record.setId(redisRecord.getId());
        record.setType(redisRecord.getType());
        record.setTransactionType(redisRecord.getTransactionType());
        record.setAmount(redisRecord.getAmount());
        record.setTransactionMethod(redisRecord.getTransactionMethod());
        record.setTransactionTime(redisRecord.getTransactionTime());
        record.setTransactionDescription(redisRecord.getTransactionDescription());
        // 你需要将账户对象也通过查询或者其他方法添加到记录中
        return record;
    }
}