package com.example.demo.repository;

import com.example.demo.model.FinancialReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialReportRepository extends JpaRepository<FinancialReport, Long> {
    @Query(value = "SELECT * FROM financial_report WHERE user_id = ?1", nativeQuery = true)
    List<FinancialReport> findAllFinancialReportsByUserId(Long userId);

}
