package com.example.demo.service;

import com.example.demo.Dao.AccountDao;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.model.Account;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountService {
    private static final Logger logger = LoggerFactory.getLogger(AccountService.class);

    private final AccountDao accountDao;

    @Autowired
    public AccountService(AccountDao accountDao) {
        this.accountDao = accountDao;
    }

    public List<Account> findAll() {
        return accountDao.findAll();
    }

    public Optional<Account> findById(Long id) {
        return accountDao.findById(id);
    }

    public Optional<Account> findByAccountName(String accountName) {
        return accountDao.findByAccountName(accountName);
    }

    public List<Account> findByUsername(String username) {
        return accountDao.findByUsername(username);
    }

    public List<Account> findByTransactionUsersId(Long userId) {
        return accountDao.findByTransactionUsersId(userId);
    }

    public Optional<Account> findByUsernameAndAccountName(String username, String accountName) {
        return accountDao.findByUsernameAndAccountName(username, accountName);
    }

    public List<Account> findAllAccountsWithTransactionsByUserId(Long userId) {
        return accountDao.findAllAccountsWithTransactionsByUserId(userId);
    }

    public void saveAccount(Account account) {
        accountDao.save(account);
    }

    public void deleteAccount(Long id) throws AccountNotFoundException, DataIntegrityViolationException {
        Optional<Account> accountOptional = accountDao.findById(id);

        if (!accountOptional.isPresent()) {
            throw new AccountNotFoundException("Account not found");
        }

        accountDao.deleteById(id);
    }


    public void updateAccount(Long id, Account updatedAccount) throws AccountNotFoundException {
        Optional<Account> existingAccountOptional = accountDao.findById(id);

        if (!existingAccountOptional.isPresent()) {
            throw new AccountNotFoundException("Account not found");
        }

        Account existingAccount = existingAccountOptional.get();
        // 检查是否尝试更改用户名
        if (!existingAccount.getUsername().equals(updatedAccount.getUsername())) {
            throw new IllegalArgumentException("Username cannot be changed");
        }

        existingAccount.setAccountName(updatedAccount.getAccountName());
        existingAccount.setTransactionUsers(updatedAccount.getTransactionUsers());
        existingAccount.setTransactionRecords(updatedAccount.getTransactionRecords());

        accountDao.save(existingAccount);
    }
}