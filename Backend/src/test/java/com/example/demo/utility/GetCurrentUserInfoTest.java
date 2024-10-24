package com.example.demo.utility;

import com.example.demo.model.TransactionUser;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.utility.jwt.JwtUtil;
import com.google.common.truth.Truth;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Optional;

public class GetCurrentUserInfoTest {

    private GetCurrentUserInfo getCurrentUserInfo;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private TransactionUserDao transactionUserDao;

    @Mock
    private ValueOperations<String, String> valueOperations;

    public static void main(String[] args) throws Exception {
        GetCurrentUserInfoTest test = new GetCurrentUserInfoTest();
        test.setup();
        test.testGetCurrentUserId();
        test.testGetCurrentAccountId();
        test.testGetCurrentAccountIdWithInvalidValue();
        test.testGetCurrentUserEntity();
        test.testGetCurrentUserRole();
        System.out.println("All tests passed!");
    }

    public void setup() {
        MockitoAnnotations.openMocks(this);
        getCurrentUserInfo = new GetCurrentUserInfo(jwtUtil, stringRedisTemplate, transactionUserDao);
        Mockito.when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    public void testGetCurrentUserId() {
        // Arrange
        String token = "Bearer test-token";
        Long expectedUserId = 1L;
        Mockito.when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(expectedUserId);

        // Act
        Long result = getCurrentUserInfo.getCurrentUserId(token);

        // Assert
        Truth.assertThat(result).isEqualTo(expectedUserId);
        System.out.println("testGetCurrentUserId passed!");
    }

    public void testGetCurrentAccountId() {
        // Arrange
        Long userId = 1L;
        String pattern = "login_user:1:current_account";
        String expectedAccountId = "2";
        Mockito.when(valueOperations.get(pattern)).thenReturn(expectedAccountId);

        // Act
        Long result = getCurrentUserInfo.getCurrentAccountId(userId);

        // Assert
        Truth.assertThat(result).isEqualTo(2L);
        System.out.println("testGetCurrentAccountId passed!");
    }

    public void testGetCurrentAccountIdWithInvalidValue() {
        // Arrange
        Long userId = 1L;
        String pattern = "login_user:1:current_account";
        Mockito.when(valueOperations.get(pattern)).thenReturn(null);

        // Act
        Long result = getCurrentUserInfo.getCurrentAccountId(userId);

        // Assert
        Truth.assertThat(result).isNull();
        System.out.println("testGetCurrentAccountIdWithInvalidValue passed!");
    }

    public void testGetCurrentUserEntity() {
        // Arrange
        String token = "Bearer test-token";
        Long userId = 1L;
        TransactionUser expectedUser = new TransactionUser();
        expectedUser.setId(userId);

        Mockito.when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(userId);
        Mockito.when(transactionUserDao.findById(userId)).thenReturn(Optional.of(expectedUser));

        // Act
        TransactionUser result = getCurrentUserInfo.getCurrentUserEntity(token);

        // Assert
        Truth.assertThat(result).isNotNull();
        Truth.assertThat(result.getId()).isEqualTo(userId);
        System.out.println("testGetCurrentUserEntity passed!");
    }

    public void testGetCurrentUserRole() {
        // Arrange
        String token = "Bearer test-token";
        String expectedRole = "ROLE_USER";
        Mockito.when(jwtUtil.getRoleFromToken("test-token")).thenReturn(expectedRole);

        // Act
        Object result = getCurrentUserInfo.getCurrentUserRole(token);

        // Assert
        Truth.assertThat(result).isEqualTo(expectedRole);
        System.out.println("testGetCurrentUserRole passed!");
    }
}