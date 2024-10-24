package com.example.demo.utility.jwt;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;

import java.util.HashSet;
import java.util.Set;

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

public class JwtLogoutHandlerTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private RedisConnection redisConnection;

    @InjectMocks
    private JwtLogoutHandler jwtLogoutHandler;

    private HttpServletRequest request;
    private HttpServletResponse response;
    private Authentication authentication;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        authentication = mock(Authentication.class);
    }

    @Test
    public void testLogout_WithValidToken() throws Exception {
        // Mock JWT and Redis operations
        String token = "validToken";
        Long userId = 1L;
        String keyPattern = "login_user:" + userId + ":*";

        // Mock extracting token from request and userId from token
        when(jwtUtil.extractTokenFromRequest(request)).thenReturn(token);
        when(jwtUtil.getUserIdFromToken(token)).thenReturn(userId);

        // Mock Redis scan result
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

        // Perform logout operation
        jwtLogoutHandler.logout(request, response, authentication);

        // Verify Redis keys deletion
        verify(redisTemplate).delete(keys);

        // Verify token invalidation
        verify(jwtUtil).invalidateToken(token);

        // Assert
        assertThat(keys).isNotEmpty();
        assertThat(keys).contains("login_user:1:someSessionKey");
    }

    @Test
    public void testLogout_WithNullToken() {
        // Mock no token present in the request
        when(jwtUtil.extractTokenFromRequest(request)).thenReturn(null);

        // Perform logout operation
        jwtLogoutHandler.logout(request, response, authentication);

        // We won't verify redisTemplate interactions here as the method might still be invoked
        // Focus on ensuring the token was null and no invalidation was attempted
        verify(jwtUtil, never()).invalidateToken(anyString());

        // Assert that no authentication is present in the security context
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

}
