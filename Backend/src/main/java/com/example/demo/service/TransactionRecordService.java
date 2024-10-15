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
//    private final RedisTemplate<String, Object> redisTemplate;
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


    public void addTransactionRecord(@RequestHeader String token, TransactionRecordDTO transactionRecordDTO) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        String accountId = getCurrentAccountId(userId);
        System.out.printf("===============================accountId: %s===============================", accountId);

        Account account = findAccountById(Long.valueOf(accountId));

        TransactionUser user = findTransactionUserById(userId);

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

//        System.out.println("Account Total Income: " + account.getTotalIncome());
//        System.out.println("Account Total Expense: " + account.getTotalExpense());

        updateRedisAccount(account);
    }

    @Transactional
    public void updateTransactionRecord(Long id, TransactionRecord newTransactionRecord){
        TransactionRecord existingRecord = findTransactionRecordById(id);
        Account account = findAccountById(existingRecord.getAccount().getId());

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

        updateRedisAccount(account);
    }


    public List<TransactionRecord> findRecordByAccountIdAndType(String type, Long accountId) {
        return transactionRecordDao.findByAccountIdAndType(type, accountId);
    }


    public void deleteTransactionRecord(Long id) {
        TransactionRecord record = findTransactionRecordById(id);
        Account account = findAccountById(record.getAccount().getId());

        if (record.getType().equalsIgnoreCase("expense")) {
            account.setTotalExpense(account.getTotalExpense() - record.getAmount());
        } else if (record.getType().equalsIgnoreCase("income")) {
            account.setTotalIncome(account.getTotalIncome() - record.getAmount());
        }

        transactionRecordDao.delete(record);

        updateRedisAccount(account);
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


    private void updateRedisAccount(Account account) {
        String redisAccountKey = "login_user:" + account.getTransactionUser().getId() + ":account:" + account.getId();
//        System.out.println("Redis Key: " + redisAccountKey);
        RedisAccount redisAccount = new RedisAccount(
                account.getId(),
                account.getAccountName(),
                account.getTotalIncome(),
                account.getTotalExpense());
//                account.getTransactionRecords());

//        System.out.println("Redis Account: " + redisAccount);

        try {
            redisTemplate.opsForValue().set(redisAccountKey, redisAccount);
        } catch (Exception e) {
            System.err.println("Error updating Redis account: " + e.getMessage());
        }
    }

    private String getCurrentAccountId(Long userId) {
        String pattern = "login_user:" + userId + ":current_account";
        return stringRedisTemplate.opsForValue().get(pattern);
    }

    private TransactionRecord findTransactionRecordById(Long id) {
        return transactionRecordDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found for id: " + id));
    }

    private Account findAccountById(Long accountId) {
        return accountDao.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found for id: " + accountId));
    }

    private TransactionUser findTransactionUserById(Long userId) {
        return transactionUserDao.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found for id: " + userId));
    }
}