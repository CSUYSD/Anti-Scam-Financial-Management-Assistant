package com.example.demo.service;

import com.example.demo.Dao.AccountDao;
import com.example.demo.Dao.RecordDao;
import com.example.demo.model.Account;
import com.example.demo.model.TransactionRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecordService {

    private final RecordDao recordDao;
    private final AccountDao accountDao;

    @Autowired
    public RecordService(RecordDao recordDao, AccountDao accountDao) {
        this.recordDao = recordDao;
        this.accountDao = accountDao;
    }

    public List<TransactionRecord> findAll() {
        return recordDao.findAll();
    }

    public Optional<TransactionRecord> findById(Long id) {
        return recordDao.findById(id);
    }
    public List<TransactionRecord> findAllByAccountId(Long accountId) {
        return recordDao.findByAccountId(accountId);
    }
    public void saveTransactionRecord(TransactionRecord transactionRecord) {
        Account account = accountDao.findById(transactionRecord.getAccount().getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid account ID"));

        transactionRecord.setAccount(account);
        recordDao.save(transactionRecord);
    }

    public void updateTransactionRecord(Long id, TransactionRecord transactionRecordDetails) {
        TransactionRecord existingRecord = recordDao.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid transaction record ID"));

        Account account = accountDao.findById(existingRecord.getAccount().getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid account ID"));

        transactionRecordDetails.setAccount(account);

        existingRecord.setIncomeOrExpense(transactionRecordDetails.getIncomeOrExpense());
        existingRecord.setTransactionType(transactionRecordDetails.getTransactionType());
        existingRecord.setAmount(transactionRecordDetails.getAmount());
        existingRecord.setTransactionMethod(transactionRecordDetails.getTransactionMethod());
        existingRecord.setTransactionTime(transactionRecordDetails.getTransactionTime());
        existingRecord.setTransactionDescription(transactionRecordDetails.getTransactionDescription());

        recordDao.save(existingRecord);
    }

    public void deleteTransactionRecord(Long id) {
        recordDao.deleteById(id);
    }
}
