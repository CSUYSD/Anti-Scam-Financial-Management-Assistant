package com.example.demo.SecurityTest;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.demo.Dao.UserDao;
import com.example.demo.model.TransactionUsers;
import com.example.demo.utility.JWT.JwtUtil;
import static com.google.common.truth.Truth.assertThat;

@SpringBootTest
public class TestSecurityBasic {

    @Autowired
    private UserDao userDao;
    @Autowired
    private JwtUtil jwtUtil;

    @Test
    public void testDatabaseInitialization() {
        List<TransactionUsers> users = userDao.findAll();
        assertThat(users).isNotEmpty();
        assertThat(users.size()).isEqualTo(5);
    }

    @Test
    public void testJwtGenerateToken() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, 1);
        assertThat(jwt).isNotNull();
    }

    @Test
    public void testJwtValidateToken() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, 1);
        assertThat(jwtUtil.validateToken(jwt)).isTrue();
    }

    @Test
    public void testJwtGetUserId() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, 1);
        assertThat(jwtUtil.getUserIdFromToken(jwt)).isEqualTo(userId);
    }

    @Test
    public void testJwtGetUsername() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, 1);
        assertThat(jwtUtil.getUsernameFromToken(jwt)).isEqualTo(username);
    }

    //TODO: Uncomment this test after implementing the getRoleFromToken method
    @Test
    public void testJwtGetRole() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, 1);
        assertThat(jwtUtil.getRoleIdFromToken(jwt)).isEqualTo(1);
    }
    
}