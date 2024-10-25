package com.example.demo.utility.jwt;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashSet;
import java.util.Set;

public class JwtLogoutHandlerTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private RedisConnection redisConnection;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private JwtLogoutHandler jwtLogoutHandler;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.clearContext(); // 清除安全上下文
    }

    @Test
    public void testLogoutWithValidToken() {
        // 准备测试数据
        String token = "validToken";
        Long userId = 1L;

        // Mock JWT和Redis操作
        when(jwtUtil.extractTokenFromRequest(request)).thenReturn(token);
        when(jwtUtil.getUserIdFromToken(token)).thenReturn(userId);

        // Mock Redis scan结果
        Set<String> keys = new HashSet<>();
        keys.add("login_user:1:someSessionKey");

        Cursor<byte[]> cursor = mock(Cursor.class);
        when(cursor.hasNext()).thenReturn(true, false);
        when(cursor.next()).thenReturn("login_user:1:someSessionKey".getBytes());

        when(redisTemplate.execute(any(RedisCallback.class))).thenAnswer(invocation -> {
            RedisCallback<Set<String>> callback = invocation.getArgument(0);
            return callback.doInRedis(redisConnection);
        });
        when(redisConnection.scan(any(ScanOptions.class))).thenReturn(cursor);

        // 执行登出操作
        jwtLogoutHandler.logout(request, response, authentication);

        // 验证Redis keys删除
        verify(redisTemplate).delete(keys);
        verify(jwtUtil).invalidateToken(token);

        // 断言
        assertThat(keys).isNotEmpty();
        assertThat(keys).contains("login_user:1:someSessionKey");
    }

    @Test
    public void testLogoutWithNullToken() {
        // Mock无token的请求
        when(jwtUtil.extractTokenFromRequest(request)).thenReturn(null);

        // 执行登出操作
        jwtLogoutHandler.logout(request, response, authentication);

        // 验证token未被尝试失效
        verify(jwtUtil, never()).invalidateToken(anyString());
    }
}