package com.example.demo.Dao;

import com.example.demo.model.TransactionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordDao extends JpaRepository<TransactionRecord, Long> {
    List<TransactionRecord> findByAccountId(Long accountId);
}
