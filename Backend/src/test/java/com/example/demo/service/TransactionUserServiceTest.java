package com.example.demo.service;

import com.example.demo.repository.TransactionUserDao;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.Account;
import com.example.demo.model.dto.TransactionUserDTO;
import com.example.demo.utility.jwt.JwtUtil;
import com.google.common.truth.Truth;
import org.mockito.*;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.ArrayList;
import java.util.List;

public class TransactionUserServiceTest {

    private TransactionUserService transactionUserService;

    @Mock
    private TransactionUserDao transactionUserDao;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    public static void main(String[] args) throws Exception {
        TransactionUserServiceTest test = new TransactionUserServiceTest();
        test.setup();
        test.testFindByUsername();
        test.testGetUserInfoByUserId();
    }

    public void setup() throws Exception {
        MockitoAnnotations.openMocks(this);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        transactionUserService = new TransactionUserService(
                transactionUserDao,
                jwtUtil,
                redisTemplate,
                passwordEncoder
        );
    }

    public void testFindByUsername() throws Exception {
        // Arrange
        String username = "testUser";
        TransactionUser expectedUser = new TransactionUser();
        expectedUser.setUsername(username);
        Mockito.when(transactionUserDao.findByUsername(username)).thenReturn(Optional.of(expectedUser));

        // Act
        Optional<TransactionUser> result = transactionUserService.findByUsername(username);

        // Assert
        Truth.assertThat(result.isPresent()).isTrue();
        Truth.assertThat(result.get().getUsername()).isEqualTo(username);
        System.out.println("testFindByUsername passed!");
    }

    public void testGetUserInfoByUserId() throws Exception {
        // Arrange
        String token = "Bearer test-token";
        Long userId = 1L;
        TransactionUser user = createTestUser();

        Mockito.when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(userId);
        Mockito.when(redisTemplate.opsForValue().get("login_user:" + userId + ":info")).thenReturn(null);
        Mockito.when(transactionUserDao.findById(userId)).thenReturn(Optional.of(user));

        // Act
        Optional<TransactionUserDTO> result = transactionUserService.getUserInfoByUserId(token);

        // Assert
        Truth.assertThat(result.isPresent()).isTrue();
        TransactionUserDTO dto = result.get();
        Truth.assertThat(dto.getUsername()).isEqualTo("testUser");
        Truth.assertThat(dto.getEmail()).isEqualTo("test@email.com");
        Truth.assertThat(dto.getAccountName()).contains("TestAccount");
        System.out.println("testGetUserInfoByUserId passed!");
    }

    private TransactionUser createTestUser() {
        TransactionUser user = new TransactionUser();
        user.setUsername("testUser");
        user.setEmail("test@email.com");

        List<Account> accounts = new ArrayList<>();
        Account account = new Account();
        account.setAccountName("TestAccount");
        accounts.add(account);
        user.setAccounts(accounts);

        return user;
    }
}