package com.example.demo.Dao;

import com.example.demo.model.TransactionRecord;

import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;


import org.springframework.data.elasticsearch.annotations.Query;

@Repository
public interface TransactionRecordDao extends JpaRepository<TransactionRecord, Long> {
    @Query("SELECT tr FROM TransactionRecord tr WHERE tr.type = ?1")
    // 根据账户ID获取所有交易记录
    List<TransactionRecord> findAllByAccountId(Long accountId);

    // 根据ID和账户ID获取记录
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM transaction_record WHERE type = ?1 AND account_id = ?2", nativeQuery = true)
    List<TransactionRecord> findByAccountIdAndType(String type, Long accountId);

    // 根据多个ID和账户ID批量获取记录
    List<TransactionRecord> findAllByIdInAndAccountId(List<Long> ids, Long accountId);

}
