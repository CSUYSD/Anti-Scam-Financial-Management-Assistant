package com.example.demo.utility.jwt;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String SECRET = "mysecretkeymysecretkeymysecretkeymysecretkey"; // 测试用密钥
    private static final long EXPIRATION_TIME = 86400000L; // 1天的毫秒数

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        jwtUtil = new JwtUtil(SECRET, EXPIRATION_TIME);
    }

    @Test
    public void testGenerateToken() {
        // Act
        String token = jwtUtil.generateToken(1L, "testuser", "ROLE_USER");

        // Assert
        assertThat(token).isNotNull();
    }

    @Test
    public void testGetUsernameFromToken() {
        // Arrange
        String token = jwtUtil.generateToken(1L, "testuser", "ROLE_USER");

        // Act
        String username = jwtUtil.getUsernameFromToken(token);

        // Assert
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    public void testGetUserIdFromToken() {
        // Arrange
        String token = jwtUtil.generateToken(1L, "testuser", "ROLE_USER");

        // Act
        Long userId = jwtUtil.getUserIdFromToken(token);

        // Assert
        assertThat(userId).isEqualTo(1L);
    }

    @Test
    public void testGetRoleFromToken() {
        // Arrange
        String token = jwtUtil.generateToken(1L, "testuser", "ROLE_USER");

        // Act
        String role = jwtUtil.getRoleFromToken(token);

        // Assert
        assertThat(role).isEqualTo("ROLE_USER");
    }

    @Test
    public void testValidateToken_ValidToken() {
        // Arrange
        String token = jwtUtil.generateToken(1L, "testuser", "ROLE_USER");

        // Act
        boolean isValid = jwtUtil.validateToken(token);

        // Assert
        assertThat(isValid).isTrue();
    }

    @Test
    public void testValidateToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalidToken";

        // Act
        boolean isValid = jwtUtil.validateToken(invalidToken);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    public void testInvalidateToken() {
        // Arrange
        String token = jwtUtil.generateToken(1L, "testuser", "ROLE_USER");
        jwtUtil.invalidateToken(token);

        // Act
        boolean isValid = jwtUtil.validateToken(token);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    public void testExtractTokenFromRequest_ValidToken() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Bearer validToken");

        // Act
        String token = jwtUtil.extractTokenFromRequest(request);

        // Assert
        assertThat(token).isEqualTo("validToken");
    }

    @Test
    public void testExtractTokenFromRequest_NoToken() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(null);

        // Act
        String token = jwtUtil.extractTokenFromRequest(request);

        // Assert
        assertThat(token).isNull();
    }
}