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
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.*;

@RunWith(MockitoJUnitRunner.class)
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

    @Before
    public void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        accountService = new AccountService(accountDao, redisTemplate, transactionUserDao, objectMapper, getCurrentUserInfo);
    }


    @Test
    public void getAllAccountsByUserId_WithValidAccounts_ShouldReturnAccounts() throws UserNotFoundException, AccountNotFoundException {
        // Arrange
        String token = "valid-token";
        Long userId = 1L;
        TransactionUser user = new TransactionUser();
        List<Account> accounts = Arrays.asList(
                createTestAccount(1L, "Account1"),
                createTestAccount(2L, "Account2")
        );
        user.setAccounts(accounts);

        when(getCurrentUserInfo.getCurrentUserId(token)).thenReturn(userId);
        when(transactionUserDao.findById(userId)).thenReturn(Optional.of(user));

        // Act
        List<Account> result = accountService.getAllAccountsByUserId(token);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyElementsIn(accounts);
    }

    @Test
    public void getAccountByAccountId_WithValidId_ShouldReturnAccount() throws AccountNotFoundException {
        // Arrange
        Long accountId = 1L;
        Account expectedAccount = createTestAccount(accountId, "TestAccount");
        when(accountDao.findById(accountId)).thenReturn(Optional.of(expectedAccount));

        // Act
        Account result = accountService.getAccountByAccountId(accountId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(accountId);
        assertThat(result.getAccountName()).isEqualTo("TestAccount");
    }

    @Test
    public void createAccount_WithValidData_ShouldCreateAccount() throws UserNotFoundException, AccountNotFoundException {
        // Arrange
        Long userId = 1L;
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("NewAccount");

        TransactionUser user = new TransactionUser();
        user.setId(userId);

        Set<String> redisKeys = new HashSet<>();
        redisKeys.add("login_user:1:account:initial placeholder");

        when(redisTemplate.keys(anyString())).thenReturn(redisKeys);
        when(transactionUserDao.findById(userId)).thenReturn(Optional.of(user));
        when(accountDao.save(any(Account.class))).thenAnswer(i -> {
            Account a = i.getArgument(0);
            a.setId(1L);
            return a;
        });

        // Act
        String result = accountService.createAccount(accountDTO, userId);

        // Assert
        assertThat(result).isEqualTo("账户创建成功");
    }

    @Test
    public void updateAccount_WithValidData_ShouldUpdateAccount() throws AccountNotFoundException {
        // Arrange
        Long accountId = 1L;
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("UpdatedAccount");
        accountDTO.setTotal_income(100.0);
        accountDTO.setTotal_expense(50.0);

        Account existingAccount = createTestAccount(accountId, "OldName");
        existingAccount.setTotalIncome(0.0);
        existingAccount.setTotalExpense(0.0);
        TransactionUser user = new TransactionUser();
        existingAccount.setTransactionUser(user);

        when(accountDao.findById(accountId)).thenReturn(Optional.of(existingAccount));
        when(accountDao.findByTransactionUser(user)).thenReturn(Collections.singletonList(existingAccount));
        when(accountDao.save(any(Account.class))).thenReturn(existingAccount);

        // Act
        Account result = accountService.updateAccount(accountId, accountDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getAccountName()).isEqualTo("UpdatedAccount");
        assertThat(result.getTotalIncome()).isEqualTo(100.0);
        assertThat(result.getTotalExpense()).isEqualTo(50.0);
    }

    @Test
    public void deleteAccount_WithValidId_ShouldDeleteAccount() throws AccountNotFoundException {
        // Arrange
        Long accountId = 1L;
        Account account = createTestAccount(accountId, "AccountToDelete");
        TransactionUser user = new TransactionUser();
        user.setId(1L);
        account.setTransactionUser(user);

        when(accountDao.findById(accountId)).thenReturn(Optional.of(account));

        // Act
        accountService.deleteAccount(accountId);

        // Assert
        verify(accountDao).delete(account);
        verify(redisTemplate).delete(anyString());
    }

    @Test
    public void setCurrentAccountToRedis_ShouldSetCurrentAccount() {
        // Arrange
        Long accountId = 1L;
        Long userId = 1L;
        String expectedPattern = "login_user:" + userId + ":current_account";

        // Act
        accountService.setCurrentAccountToRedis(accountId, userId);

        // Assert
        verify(valueOperations).set(expectedPattern, accountId);
    }

    @Test(expected = AccountNotFoundException.class)
    public void getAccountByAccountId_WithInvalidId_ShouldThrowException() throws AccountNotFoundException {
        // Arrange
        Long invalidId = 999L;
        when(accountDao.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        accountService.getAccountByAccountId(invalidId);
    }

    @Test(expected = AccountAlreadyExistException.class)
    public void createAccount_WithDuplicateName_ShouldThrowException() throws UserNotFoundException, AccountNotFoundException {
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
        accountService.createAccount(accountDTO, userId);
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