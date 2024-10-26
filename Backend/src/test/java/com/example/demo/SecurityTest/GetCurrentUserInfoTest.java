package com.example.demo.SecurityTest;

import com.example.demo.model.TransactionUser;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.jwt.JwtUtil;
import com.google.common.truth.Truth;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Optional;

import static org.mockito.Mockito.*;

public class GetCurrentUserInfoTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private TransactionUserDao transactionUserDao;

    @InjectMocks
    private GetCurrentUserInfo getCurrentUserInfo;

    @Before
    public void setUp() {
        MockitoAnnotations.openMocks(this); // 初始化 Mockito 模拟对象
    }

    @Test
    public void testGetCurrentUserId() {
        // 准备测试数据
        String token = "Bearer test-token";
        Long expectedUserId = 123L;

        // 模拟 jwtUtil 的行为
        when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(expectedUserId);

        // 调用被测方法
        Long actualUserId = getCurrentUserInfo.getCurrentUserId(token);

        // 验证返回值
        Truth.assertThat(actualUserId).isEqualTo(expectedUserId);

        // 验证是否正确调用了 jwtUtil 的方法
        verify(jwtUtil).getUserIdFromToken("test-token");
    }

    @Test
    public void testGetCurrentAccountId() {
        // 准备测试数据
        Long userId = 123L;
        String accountId = "456";
        String pattern = "login_user:123:current_account";

        // 模拟 Redis 的行为
        when(stringRedisTemplate.opsForValue().get(pattern)).thenReturn(accountId);

        // 调用被测方法
        Long actualAccountId = getCurrentUserInfo.getCurrentAccountId(userId);

        // 验证返回值
        Truth.assertThat(actualAccountId).isEqualTo(Long.valueOf(accountId));

        // 验证是否正确调用了 stringRedisTemplate 的方法
        verify(stringRedisTemplate).opsForValue().get(pattern);
    }

    @Test
    public void testGetCurrentUserEntity() {
        // 准备测试数据
        String token = "Bearer test-token";
        Long userId = 123L;
        TransactionUser mockUser = new TransactionUser();
        mockUser.setId(userId);

        // 模拟 jwtUtil 和 transactionUserDao 的行为
        when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(userId);
        when(transactionUserDao.findById(userId)).thenReturn(Optional.of(mockUser));

        // 调用被测方法
        TransactionUser actualUser = getCurrentUserInfo.getCurrentUserEntity(token);

        // 验证返回值
        Truth.assertThat(actualUser).isEqualTo(mockUser);

        // 验证是否正确调用了 jwtUtil 和 transactionUserDao 的方法
        verify(jwtUtil).getUserIdFromToken("test-token");
        verify(transactionUserDao).findById(userId);
    }

    @Test
    public void testGetCurrentUserRole() {
        // 准备测试数据
        String token = "Bearer test-token";
        String expectedRole = "ROLE_USER";

        // 模拟 jwtUtil 的行为
        when(jwtUtil.getRoleFromToken("test-token")).thenReturn(expectedRole);

        // 调用被测方法
        Object actualRole = getCurrentUserInfo.getCurrentUserRole(token);

        // 验证返回值
        Truth.assertThat(actualRole).isEqualTo(expectedRole);

        // 验证是否正确调用了 jwtUtil 的方法
        verify(jwtUtil).getRoleFromToken("test-token");
    }
}
