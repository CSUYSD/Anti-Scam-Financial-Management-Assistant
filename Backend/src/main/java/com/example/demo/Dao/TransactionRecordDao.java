package com.example.demo.Dao;

import com.example.demo.model.TransactionRecord;

import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface TransactionRecordDao extends JpaRepository<TransactionRecord, Long> {
    // 根据账户ID获取所有交易记录
    @Query(value = "SELECT * FROM transaction_record WHERE account_id = ?1", nativeQuery = true)
    List<TransactionRecord> findAllByAccountId(Long accountId);

    // 根据ID和账户ID获取记录
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM transaction_record WHERE type = ?1 AND account_id = ?2", nativeQuery = true)
    List<TransactionRecord> findByAccountIdAndType(String type, Long accountId);

    // 根据多个ID和账户ID批量获取记录
    List<TransactionRecord> findAllByIdInAndAccountId(List<Long> ids, Long accountId);

    @Query(value = "SELECT * FROM transaction_record WHERE account_id = :accountId ORDER BY transaction_time DESC, id DESC LIMIT 5", nativeQuery = true)
    List<TransactionRecord> findLatestFiveDaysRecords(Long accountId);
}
