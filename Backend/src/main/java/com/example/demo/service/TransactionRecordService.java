package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


import com.example.demo.Dao.TransactionUserDao;
import com.example.demo.exception.AccountAlreadyExistException;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.AccountDTO;
import com.example.demo.model.DTO.TransactionRecordDTO;
import com.example.demo.model.Redis.RedisAccount;
import com.example.demo.model.TransactionUser;
import com.example.demo.utility.JWT.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import com.example.demo.utility.DtoParser;

import com.example.demo.Dao.TransactionRecordDao;
import com.example.demo.Dao.AccountDao;
import com.example.demo.model.TransactionRecord;
import org.springframework.web.bind.annotation.RequestHeader;


@Service
public class TransactionRecordService {
    private final TransactionRecordDao transactionRecordDao;
    private final TransactionUserDao transactionUserDao;
    private final AccountDao accountDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate redisTemplate;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    public TransactionRecordService(TransactionRecordDao transactionRecordDao, JwtUtil jwtUtil, @Qualifier("redisTemplate") RedisTemplate redisTemplate, AccountDao accountDao, TransactionUserDao transactionUserDao) {
        this.transactionRecordDao = transactionRecordDao;
        this.transactionUserDao = transactionUserDao;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.accountDao = accountDao;
    }



    public List<TransactionRecord> getAllRecordsByAccountId(Long accountId) {
        return transactionRecordDao.findAllByAccountId(accountId);
    }


    public void addTransactionRecord(@RequestHeader String token, TransactionRecordDTO transactionRecordDTO) throws AccountNotFoundException {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        String pattern = "login_user:" + userId +":current_account";
        String accountId = stringRedisTemplate.opsForValue().get(pattern);
        System.out.printf("===============================accountId: %s===============================", accountId);

        Account account = accountDao.findById(Long.valueOf(accountId))
                .orElseThrow(() -> new RuntimeException("Account not found for id: " + accountId));

        TransactionUser user = transactionUserDao.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found for id: " + userId));
        // update account income and expense
        if (transactionRecordDTO.getType().equalsIgnoreCase("expense")) {
            account.setTotalExpense(account.getTotalExpense() + transactionRecordDTO.getAmount());
        }
        if (transactionRecordDTO.getType().equalsIgnoreCase("income")) {
            account.setTotalIncome(account.getTotalIncome() + transactionRecordDTO.getAmount());
        }
        TransactionRecord transactionRecord = DtoParser.toTransactionRecord(transactionRecordDTO);
        transactionRecord.setAccount(account);
        transactionRecord.setUserId(userId);



        transactionRecordDao.save(transactionRecord);
    }

    @Transactional
    public void updateTransactionRecord(Long id, TransactionRecord newTransactionRecord) throws AccountNotFoundException {
        TransactionRecord existingRecord = transactionRecordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found for id: " + id));

        Account account = accountDao.findById(existingRecord.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found for id: " + existingRecord.getAccount().getId()));

        // Subtract the amount of the original record before updating
        if (existingRecord.getType().equalsIgnoreCase("expense")) {
            account.setTotalExpense(account.getTotalExpense() - existingRecord.getAmount());
        } else if (existingRecord.getType().equalsIgnoreCase("income")) {
            account.setTotalIncome(account.getTotalIncome() - existingRecord.getAmount());
        }

        // Update the amount of the account according to income and expense
        if (newTransactionRecord.getType().equalsIgnoreCase("expense")) {
            account.setTotalExpense(account.getTotalExpense() + newTransactionRecord.getAmount());
        } else if (newTransactionRecord.getType().equalsIgnoreCase("income")) {
            account.setTotalIncome(account.getTotalIncome() + newTransactionRecord.getAmount());
        }

        existingRecord.setAmount(newTransactionRecord.getAmount());
        existingRecord.setCategory(newTransactionRecord.getCategory());
        existingRecord.setType(newTransactionRecord.getType());
        existingRecord.setTransactionTime(newTransactionRecord.getTransactionTime());
        existingRecord.setTransactionDescription(newTransactionRecord.getTransactionDescription());
        existingRecord.setTransactionMethod(newTransactionRecord.getTransactionMethod());


        transactionRecordDao.save(existingRecord);
    }


    public List<TransactionRecord> findRecordByAccountIdAndType(String type, Long accountId) {
        return transactionRecordDao.findByAccountIdAndType(type, accountId);
    }


    public void deleteTransactionRecord(Long id) throws AccountNotFoundException {
        TransactionRecord record = transactionRecordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found for id: " + id));

        Account account = accountDao.findById(record.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found for id: " + record.getAccount().getId()));

        if (record.getType().equalsIgnoreCase("expense")) {
            account.setTotalExpense(account.getTotalExpense() - record.getAmount());
        } else if (record.getType().equalsIgnoreCase("income")) {
            account.setTotalIncome(account.getTotalIncome() - record.getAmount());
        }

        transactionRecordDao.delete(record);
    }

    @Transactional
    public void deleteTransactionRecordsInBatch(Long accountId, List<Long> recordIds) {
        List<TransactionRecord> records = transactionRecordDao.findAllByIdInAndAccountId(recordIds, accountId);
        if (records.isEmpty()) {
            throw new RuntimeException("No records found for provided IDs and accountId: " + accountId);
        }
        transactionRecordDao.deleteAll(records);
    }

    public List<TransactionRecord> getCertainDaysRecords(Long accountId, Integer duration) {
        return transactionRecordDao.findCertainDaysRecords(accountId, duration);
    }
}