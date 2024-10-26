package com.example.demo.service;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;

import com.example.demo.exception.AccountAlreadyExistException;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.dto.AccountDTO;
import com.example.demo.model.redis.RedisAccount;
import com.example.demo.repository.AccountDao;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.utility.GetCurrentUserInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertThrows;

public class AccountServiceTest {

    private AccountService accountService;

    @Mock
    private AccountDao accountDao;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private TransactionUserDao transactionUserDao;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private GetCurrentUserInfo getCurrentUserInfo;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        accountService = new AccountService(accountDao, redisTemplate, transactionUserDao, objectMapper, getCurrentUserInfo);
    }

    // ... 其他测试方法保持不变 ...

    @Test
    public void getAccountByAccountId_WithInvalidId_ShouldThrowException() {
        // Arrange
        Long invalidId = 999L;
        when(accountDao.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AccountNotFoundException.class, () ->
                accountService.getAccountByAccountId(invalidId)
        );
    }

    @Test
    public void createAccount_WithDuplicateName_ShouldThrowException() {
        // Arrange
        Long userId = 1L;
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("ExistingAccount");

        Set<String> redisKeys = new HashSet<>();
        redisKeys.add("login_user:1:account:1");

        RedisAccount existingRedisAccount = new RedisAccount(1L, "ExistingAccount", 0.0, 0.0);

        when(redisTemplate.keys(anyString())).thenReturn(redisKeys);
        when(redisTemplate.opsForValue().get(anyString())).thenReturn(existingRedisAccount);
        when(objectMapper.convertValue(any(), eq(RedisAccount.class))).thenReturn(existingRedisAccount);

        // Act & Assert
        assertThrows(AccountAlreadyExistException.class, () ->
                accountService.createAccount(accountDTO, userId)
        );
    }

    private Account createTestAccount(Long id, String name) {
        Account account = new Account();
        account.setId(id);
        account.setAccountName(name);
        account.setTotalIncome(0.0);
        account.setTotalExpense(0.0);
        return account;
    }
}