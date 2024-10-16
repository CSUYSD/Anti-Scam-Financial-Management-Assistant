package com.example.demo.service;

import com.example.demo.repository.TransactionUserDao;
import com.example.demo.exception.AccountAlreadyExistException;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.dto.AccountDTO;
import com.example.demo.model.Redis.RedisAccount;
import com.example.demo.model.TransactionUser;
import com.example.demo.utility.GetCurrentUserInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.formula.functions.T;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.repository.AccountDao;

import java.util.List;
import java.util.Set;

import java.util.stream.Collectors;


import org.springframework.data.redis.core.RedisTemplate;
import com.example.demo.exception.UserNotFoundException;


@Service
public class AccountService {

    private final AccountDao accountDao;
    private final RedisTemplate<String, Object> redisTemplate;
    private final TransactionUserDao transactionUserDao;
    private final ObjectMapper objectMapper;
    private final GetCurrentUserInfo getCurrentUserInfo;

    @Autowired
    public AccountService(AccountDao accountDao, RedisTemplate<String, Object> redisTemplate, TransactionUserDao transactionUserDao, ObjectMapper objectMapper, GetCurrentUserInfo getCurrentUserInfo) {
        this.accountDao = accountDao;
        this.redisTemplate = redisTemplate;
        this.transactionUserDao = transactionUserDao;
        this.objectMapper = objectMapper;
        this.getCurrentUserInfo = getCurrentUserInfo;
    }

    public List<Account> getAllAccountsByUserId(String token) throws UserNotFoundException, AccountNotFoundException {
        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        TransactionUser currentUser = transactionUserDao.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("用户未找到"));

        List<Account> accounts = currentUser.getAccounts();

        if (accounts == null || accounts.isEmpty()) {
            throw new AccountNotFoundException("用户没有关联的账户");
        }

        return accounts;
    }

    public Account getAccountByAccountId(Long id) throws AccountNotFoundException {
        return accountDao.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("账户未找到，ID: " + id));
    }

    public String createAccount(AccountDTO accountDTO, Long userId) throws UserNotFoundException, AccountAlreadyExistException, AccountNotFoundException {
        String pattern = "login_user:" + userId + ":account*" ;
        // 获取redis用户信息
        Set<String> keys = redisTemplate.keys(pattern);
        assert keys != null;
        if (keys.isEmpty()) {
            throw new RuntimeException("用户未登录或会话已过期");
        }
        // 检查账户名是否已存在
        for (String key : keys){
            if (key.equals("login_user:" + userId + ":account:initial placeholder")){
                continue;
            }
            Object obj = redisTemplate.opsForValue().get(key);
            RedisAccount redisAccount = convertToRedisAccount(obj);
            if (redisAccount.getName().equals(accountDTO.getName())){
                throw new AccountAlreadyExistException("账户名已存在");
            }
        }

        // 获取用户,从token里找到的id
        TransactionUser user = transactionUserDao.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("用户不存在"));

        Account newAccount = new Account();
        newAccount.setAccountName(accountDTO.getName());
        newAccount.setTransactionUser(user);
        newAccount.setTotalIncome(0.0);
        newAccount.setTotalExpense(0.0);
        accountDao.save(newAccount);

        // 把这个新account加进用户关联的redis里
        updateRedisAccount(userId, newAccount.getId(), newAccount);

//        System.out.println("New Account Key: " + newAccountKey);
//        System.out.println("New Redis Account: " + newRedisAccount);
        return "账户创建成功";
    }


    // 这前端似乎没用上过
    public Account updateAccount(Long id, AccountDTO accountDTO) throws AccountNotFoundException {
        Account existingAccount = getAccountByAccountId(id);
        TransactionUser user = existingAccount.getTransactionUser();

        List<Account> existingAccounts = accountDao.findByTransactionUser(user)
                .stream()
                .filter(account -> !account.getId().equals(id))  // 排除当前修改的账户
                .toList();

        for (Account account : existingAccounts) {
            if (account.getAccountName().equals(accountDTO.getName())) {
                throw new AccountAlreadyExistException("该用户下的账户名已存在");
            }
        }
        System.out.println("accountDTO"+accountDTO);
        // 更新账户名称和余额
        existingAccount.setAccountName(accountDTO.getName());
        double income = existingAccount.getTotalIncome();
        double expense = existingAccount.getTotalExpense();
        existingAccount.setTotalIncome(accountDTO.getTotal_income() + income);
        existingAccount.setTotalExpense(accountDTO.getTotal_expense() + expense);

        // 保存并返回更新后的账户信息
        Account updatedAccount = accountDao.save(existingAccount);
        System.out.println(updatedAccount);
        // 更新 Redis 缓存
        updateRedisAccount(existingAccount.getTransactionUser().getId(), existingAccount.getId(), updatedAccount);

        return updatedAccount;
    }


    public void deleteAccount(Long id) throws AccountNotFoundException {
        Account account = getAccountByAccountId(id);

        // 删除数据库中的账户
        accountDao.delete(account);

        // 删除 Redis 中的缓存
        String redisKey = "login_user:" + account.getTransactionUser().getId() + ":account:" + id;
        redisTemplate.delete(redisKey);

    }

    public void setCurrentAccountToRedis(Long accountId, Long userId) {
        String pattern = "login_user:" + userId + ":current_account";
        redisTemplate.opsForValue().set(pattern, accountId);
    }

    public void updateRedisAccount(Long userId, Long accountId, Account account) {
        String redisKey = "login_user:" + userId + ":account:" + accountId;
        RedisAccount redisAccount = new RedisAccount(
                account.getId(),
                account.getAccountName(),
                account.getTotalIncome(),
                account.getTotalExpense());
        redisTemplate.opsForValue().set(redisKey, redisAccount);
    }

    private RedisAccount convertToRedisAccount(Object obj) {
        if (obj instanceof RedisAccount) {
            return (RedisAccount) obj;
        } else {
            return objectMapper.convertValue(obj, RedisAccount.class);
        }
    }

}