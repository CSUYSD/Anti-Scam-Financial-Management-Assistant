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

    // 根据记录ID和账户ID获取交易记录
    Optional<TransactionRecord> findByIdAndAccountId(Long id, Long accountId);

    // 根据类型获取交易记录
    List<TransactionRecord> findByType(String type);

    // 根据多个ID和账户ID批量获取记录
    List<TransactionRecord> findAllByIdInAndAccountId(List<Long> ids, Long accountId);
}
