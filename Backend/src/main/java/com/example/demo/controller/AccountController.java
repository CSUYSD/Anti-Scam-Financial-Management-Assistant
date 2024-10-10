package com.example.demo.controller;
import java.util.List;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.exception.AccountAlreadyExistException;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.AccountDTO;
import com.example.demo.service.AccountService;
import com.example.demo.utility.JWT.JwtUtil;

import jakarta.validation.Valid;

@RestController 
@RequestMapping("/account")
@Validated
public class AccountController {
    private final JwtUtil jwtUtil;
    private final AccountService accountService;
    private static final Logger logger = Logger.getLogger(String.valueOf(AccountController.class));
    private final StringRedisTemplate stringRedisTemplate;

    @Autowired
    public AccountController(AccountService accountService, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, StringRedisTemplate stringRedisTemplate) {
        this.accountService = accountService;
        this.jwtUtil = jwtUtil;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @PostMapping("/create")
    public ResponseEntity<String> createAccount(@RequestHeader("Authorization") String token, @Valid @RequestBody AccountDTO account) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("未提供令牌");
        }
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

        try {
            // 尝试创建账户
            String result = accountService.createAccount(account, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            // 账户创建成功
        } catch (AccountAlreadyExistException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("账户名已存在");
            // 账户名已存在
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("用户未找到");
            // 用户未找到
        } catch (Exception e) {
            logger.severe(e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("服务器错误");
        }
    }
    
    @GetMapping("/current")
    public ResponseEntity<Account> getAccountByAccountId(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            String pattern = "login_user:" + userId +":current_account";
            String accountId = stringRedisTemplate.opsForValue().get(pattern);
            Account account = accountService.getAccountByAccountId(Long.valueOf(accountId));

            return ResponseEntity.ok(account);
        } catch (AccountNotFoundException e) {
            logger.severe(e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateAccount(@PathVariable Long id, @RequestBody @Valid AccountDTO accountDetails) {

        try {
            Account updatedAccount = accountService.updateAccount(id, accountDetails);
            return ResponseEntity.ok(updatedAccount);
        } catch (AccountNotFoundException e) {

            // 记录错误日志
            // logger.error("Account not found: " + id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("账户未找到，ID: " + id);
        } catch (AccountAlreadyExistException e) {
            // 记录错误日志
            // logger.error("Account name already exists for another account", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("账户名已存在，请选择不同的账户名");
        } catch (Exception e) {
            // 捕获其他异常，并记录日志
            // logger.error("Unexpected error during account update", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        try {
            accountService.deleteAccount(id);
            return ResponseEntity.noContent().build();
        } catch (AccountNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/switch")
    public ResponseEntity<String> switchAccount(@RequestParam Long accountId, @RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            accountService.setCurrentAccountToRedis(accountId, userId);
            return ResponseEntity.ok("设置成功");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("设置失败");
        }
    }




}
