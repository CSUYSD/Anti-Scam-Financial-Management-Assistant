package com.example.demo.SecurityTest;

import com.example.demo.config.websocket.WebSocketConfig;
import com.example.demo.utility.jwt.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;

class WebSocketConfigTest {

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private WebSocketConfig webSocketConfig;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testPreSendWithValidToken() {
        // 设置 StompHeaderAccessor
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.addNativeHeader("Authorization", "Bearer validToken");
        Map<String, Object> sessionAttributes = new HashMap<>();
        accessor.setSessionAttributes(sessionAttributes);

        when(jwtUtil.validateToken(anyString())).thenReturn(true);
        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);
        when(jwtUtil.getRoleFromToken(anyString())).thenReturn("ROLE_USER");

        // 使用反射来调用私有方法 extractToken
        try {
            Method extractTokenMethod = WebSocketConfig.class.getDeclaredMethod("extractToken", StompHeaderAccessor.class);
            extractTokenMethod.setAccessible(true);  // 允许访问私有方法
            String token = (String) extractTokenMethod.invoke(webSocketConfig, accessor);

            assertThat(token).isEqualTo("validToken");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    void testExtractTokenFromHeaderWithReflection() throws Exception {
        // Arrange
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.addNativeHeader("Authorization", "Bearer testToken");

        // 使用反射访问私有方法
        Method extractTokenMethod = WebSocketConfig.class.getDeclaredMethod("extractToken", StompHeaderAccessor.class);
        extractTokenMethod.setAccessible(true);  // 允许访问私有方法

        // Act
        String token = (String) extractTokenMethod.invoke(webSocketConfig, accessor);

        // Assert
        assertThat(token).isEqualTo("testToken");
    }

    @Test
    void testExtractTokenFromUrlWithReflection() throws Exception {
        // Arrange
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        Map<String, Object> sessionAttributes = new HashMap<>();
        sessionAttributes.put("query", "token=testToken");
        accessor.setSessionAttributes(sessionAttributes);

        // 使用反射访问私有方法
        Method extractTokenMethod = WebSocketConfig.class.getDeclaredMethod("extractToken", StompHeaderAccessor.class);
        extractTokenMethod.setAccessible(true);  // 允许访问私有方法

        // Act
        String token = (String) extractTokenMethod.invoke(webSocketConfig, accessor);

        // Assert
        assertThat(token).isEqualTo("testToken");
    }

    @Test
    void testExtractTokenWithNoToken() throws Exception {
        // Arrange
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);

        // 使用反射访问私有方法
        Method extractTokenMethod = WebSocketConfig.class.getDeclaredMethod("extractToken", StompHeaderAccessor.class);
        extractTokenMethod.setAccessible(true);  // 允许访问私有方法

        // Act
        String token = (String) extractTokenMethod.invoke(webSocketConfig, accessor);

        // Assert
        assertThat(token).isNull();
    }
}
