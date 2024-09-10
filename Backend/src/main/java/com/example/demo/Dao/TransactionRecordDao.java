package com.example.demo.Dao;

import com.example.demo.model.TransactionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.elasticsearch.annotations.Query;

@Repository
public interface TransactionRecordDao extends JpaRepository<TransactionRecord, Long> {
    @Query("SELECT tr FROM TransactionRecord tr WHERE tr.type = ?1")
    List<TransactionRecord> findByType(String type);
}
