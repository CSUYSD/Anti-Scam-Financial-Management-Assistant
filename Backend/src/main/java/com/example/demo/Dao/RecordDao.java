package com.example.demo.Dao;

import com.example.demo.model.TransactionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecordDao extends JpaRepository<TransactionRecord, Long> {
}