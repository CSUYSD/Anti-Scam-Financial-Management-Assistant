package com.example.demo.service;

import com.example.demo.model.FinancialReport;
import com.example.demo.model.TransactionUser;
import com.example.demo.repository.FinancialReportRepository;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.utility.GetCurrentUserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FinancialReportService {
    private final GetCurrentUserInfo getCurrentUserInfo;
    private final TransactionUserDao transactionUserDao;
    private final FinancialReportRepository financialReportRepository;

    @Autowired
    public FinancialReportService(GetCurrentUserInfo getCurrentUserInfo, TransactionUserDao transactionUserDao, FinancialReportRepository financialReportRepository) {
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.transactionUserDao = transactionUserDao;
        this.financialReportRepository = financialReportRepository;
    }

    public List<FinancialReport> getFinancialReports(String token) {
        if (getCurrentUserInfo.getCurrentUserRole(token).equals("ROLE_USER")){
            TransactionUser user = transactionUserDao.findById(getCurrentUserInfo.getCurrentUserId(token)).get();
            return user.getFinancialReports();
        }
//        else if (getCurrentUserInfo.getCurrentUserRole(token).equals("ROLE_ADMIN")){
//            Optional<TransactionUser> user = transactionUserDao.findById(getCurrentUserInfo.getCurrentUserId(token));
//            if (user.isPresent()){
//                return user.get().getFinancialReports();
//            }
//        }
        return List.of();
    }
}
