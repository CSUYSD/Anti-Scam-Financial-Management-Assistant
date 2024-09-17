package com.example.demo.service;

import com.example.demo.Dao.TransactionUserDao;
import com.example.demo.exception.AccountAlreadyExistException;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.AccountDTO;
import com.example.demo.model.TransactionUser;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.Dao.AccountDao;
import java.util.List;
import java.util.Map;

import com.example.demo.model.Redis.LoginUser;
import org.springframework.data.redis.core.RedisTemplate;
import com.example.demo.exception.UserNotFoundException;

@Service
public class AccountService {

    private final AccountDao accountDao;
    private final RedisTemplate<String, Object> redisTemplate;
    private final TransactionUserDao transactionUserDao;

    @Autowired
    public AccountService(AccountDao accountDao, RedisTemplate<String, Object> redisTemplate, TransactionUserDao transactionUserDao) {
        this.accountDao = accountDao;
        this.redisTemplate = redisTemplate;
        this.transactionUserDao = transactionUserDao;
    }

    public List<Account> getAllAccounts() {
        return accountDao.findAll();
    }

    public Account getAccountById(Long id) throws AccountNotFoundException {
        return accountDao.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("账户未找到，ID: " + id));
    }

    public String createAccount(AccountDTO accountDTO, Long id) throws UserNotFoundException, AccountAlreadyExistException, AccountNotFoundException {
        String redisKey = "login_user:" + id;
        // 获取redis用户信息
        LoginUser loginUser = (LoginUser) redisTemplate.opsForValue().get(redisKey);
        
        if (loginUser == null) {
            throw new RuntimeException("用户未登录或会话已过期");
        }
        
        // 检查账户名是否已存在
        Map<String, String> existsAccount = loginUser.getAccountInfo();
        for (Map.Entry<String, String> entry : existsAccount.entrySet()) {
            if (entry.getValue().equals(accountDTO.getName())) {
                throw new AccountAlreadyExistException("账户名已存在");
            }
        }
        
        // 获取用户,从token里找到的id
        TransactionUser user = transactionUserDao.findById(id)
            .orElseThrow(() -> new UserNotFoundException("用户不存在"));
        
        // 创建新账户
        Account newAccount = new Account();
        newAccount.setAccountName(accountDTO.getName());
        newAccount.setTransactionUser(user);
        newAccount.setBalance(0.0);
        accountDao.save(newAccount);

        // 更新 Redis 中的用户信息
        Long accountId = accountDao.getAccountIDByUserIdAndAccountName(id, accountDTO.getName())
            .orElseThrow(() -> new AccountNotFoundException("账户未找到"));
        existsAccount.put(accountId.toString(), accountDTO.getName());
        loginUser.setAccountInfo(existsAccount);
        redisTemplate.opsForValue().set(redisKey, loginUser);

        return "账户创建成功";
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

