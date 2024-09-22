package com.example.demo.service;

import com.example.demo.Dao.TransactionUserDao;
import com.example.demo.exception.AccountAlreadyExistException;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.AccountDTO;
import com.example.demo.model.Redis.RedisAccount;
import com.example.demo.model.TransactionUser;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.Dao.AccountDao;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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

    public String createAccount(AccountDTO accountDTO, Long userId) throws UserNotFoundException, AccountAlreadyExistException, AccountNotFoundException {
        String pattern = "login_user:" + userId + ":account*" ;
        // 获取redis用户信息
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys.isEmpty()) {
            throw new RuntimeException("用户未登录或会话已过期");
        }
        // 检查账户名是否已存在
        for (String key : keys){
            if (key.equals("login_user:" + userId + ":account:initial placeholder")){
                continue;
            }
            RedisAccount redisAccount = (RedisAccount) redisTemplate.opsForValue().get(key);
            if (redisAccount.getName().equals(accountDTO.getName())){
                throw new AccountAlreadyExistException("账户名已存在");
            }
        }
        
        // 获取用户,从token里找到的id
        TransactionUser user = transactionUserDao.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("用户不存在"));
        
        // 存到PSQL里
        Account newAccount = new Account();
        newAccount.setAccountName(accountDTO.getName());
        newAccount.setTransactionUser(user);
        newAccount.setBalance(0.0);
        accountDao.save(newAccount);

        // 把这个新account加进用户关联的redis里
        String newAccountKey = "login_user:" + userId + ":account:" + newAccount.getId();
        RedisAccount newRedisAccount =
                new RedisAccount(
                        newAccount.getId(),
                        newAccount.getAccountName(),
                        newAccount.getBalance(),
                        new ArrayList<>());

        redisTemplate.opsForValue().set(newAccountKey, newRedisAccount);
        return "账户创建成功";
    }

//    public Account updateAccount(Long id, Account accountDetails) throws AccountNotFoundException {
//        Account account = getAccountById(id);
//        account.setAccountName(accountDetails.getAccountName());
//        account.setBalance(accountDetails.getBalance());
//        return accountDao.save(account);
//    }
    // 更新账户信息
    public Account updateAccount(Long id, AccountDTO accountDTO) throws AccountNotFoundException {
        Account existingAccount = getAccountById(id);

        // 更新账户名称和余额
        existingAccount.setAccountName(accountDTO.getName());
        existingAccount.setBalance(accountDTO.getBalance());

        // 保存并返回更新后的账户信息
        return accountDao.save(existingAccount);
    }
    public void deleteAccount(Long id) throws AccountNotFoundException {
        Account account = getAccountById(id);
        accountDao.delete(account);
    }
}

