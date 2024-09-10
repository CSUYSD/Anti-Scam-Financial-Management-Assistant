package com.example.demo.service;

import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.model.Account;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.Dao.AccountDao;
import java.util.List;

@Service
public class AccountService {

    private final AccountDao accountDao;

    @Autowired
    public AccountService(AccountDao accountDao) {
        this.accountDao = accountDao;
    }

    public List<Account> getAllAccounts() {
        return accountDao.findAll();
    }

    public Account getAccountById(Long id) throws AccountNotFoundException {
        return accountDao.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("账户未找到，ID: " + id));
    }

    public Account createAccount(Account account) {
        return accountDao.save(account);
    }

    public Account updateAccount(Long id, Account accountDetails) throws AccountNotFoundException {
        Account account = getAccountById(id);
        account.setAccountName(accountDetails.getAccountName());
        account.setBalance(accountDetails.getBalance());
        return accountDao.save(account);
    }
    
    public void deleteAccount(Long id) throws AccountNotFoundException {
        Account account = getAccountById(id);
        accountDao.delete(account);
    }
}

