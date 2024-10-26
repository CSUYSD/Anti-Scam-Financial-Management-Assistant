package com.example.demo.service.security;

import com.example.demo.model.TransactionUser;
import com.example.demo.model.security.UserDetail;
import com.example.demo.model.security.UserRole;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.utility.jwt.JwtUtil;
import com.google.common.truth.Truth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

public class UserDetailServiceTest {

    private UserDetailService userDetailService;

    @Mock
    private TransactionUserDao transactionUserDao;

    @Mock
    private JwtUtil jwtUtil;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        userDetailService = new UserDetailService(transactionUserDao, jwtUtil);
    }

    @Test
    public void testLoadUserByUsername() {
        // Arrange
        String username = "testUser";
        TransactionUser user = createTestUser(username);
        Mockito.when(transactionUserDao.findByUsername(username))
                .thenReturn(Optional.of(user));

        // Act
        UserDetails result = userDetailService.loadUserByUsername(username);

        // Assert
        Truth.assertThat(result).isInstanceOf(UserDetail.class);
        UserDetail userDetail = (UserDetail) result;
        Truth.assertThat(userDetail.getUsername()).isEqualTo(username);
        Truth.assertThat(userDetail.getTransactionUser()).isEqualTo(user);
        Truth.assertThat(userDetail.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())
                .contains("ROLE_USER");
    }

    @Test
    public void testLoadUserByUsernameNotFound() {
        // Arrange
        String username = "nonexistentUser";
        Mockito.when(transactionUserDao.findByUsername(username))
                .thenReturn(Optional.empty());

        try {
            // Act
            userDetailService.loadUserByUsername(username);
            throw new AssertionError("Expected UsernameNotFoundException was not thrown");
        } catch (Exception e) {
            // Assert
            Truth.assertThat(e).isInstanceOf(UsernameNotFoundException.class);
            Truth.assertThat(e).hasMessageThat().contains("User not found");
        }
    }

    @Test
    public void testLoadUserById() {
        // Arrange
        Long userId = 1L;
        TransactionUser user = createTestUser("testUser");
        user.setId(userId);
        Mockito.when(transactionUserDao.findById(userId))
                .thenReturn(Optional.of(user));

        // Act
        UserDetails result = userDetailService.loadUserById(userId);

        // Assert
        Truth.assertThat(result).isInstanceOf(UserDetail.class);
        UserDetail userDetail = (UserDetail) result;
        Truth.assertThat(userDetail.getTransactionUser().getId()).isEqualTo(userId);
        Truth.assertThat(userDetail.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())
                .contains("ROLE_USER");
    }

    @Test
    public void testLoadUserByIdNotFound() {
        // Arrange
        Long userId = 999L;
        Mockito.when(transactionUserDao.findById(userId))
                .thenReturn(Optional.empty());

        try {
            // Act
            userDetailService.loadUserById(userId);
            throw new AssertionError("Expected UsernameNotFoundException was not thrown");
        } catch (Exception e) {
            // Assert
            Truth.assertThat(e).isInstanceOf(UsernameNotFoundException.class);
            Truth.assertThat(e).hasMessageThat().contains("User not found");
        }
    }

    private TransactionUser createTestUser(String username) {
        TransactionUser user = new TransactionUser();
        user.setUsername(username);
        user.setPassword("testPassword");

        UserRole role = new UserRole();
        role.setRole("ROLE_USER");
        user.setRole(role);

        return user;
    }
}