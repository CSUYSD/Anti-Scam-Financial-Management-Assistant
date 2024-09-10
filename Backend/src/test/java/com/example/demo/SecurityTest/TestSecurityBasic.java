package com.example.demo.SecurityTest;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.example.demo.Dao.TransactionUserDao;
import com.example.demo.model.TransactionUser;
import com.example.demo.utility.JWT.JwtUtil;
import static com.google.common.truth.Truth.assertThat;

@SpringBootTest
public class TestSecurityBasic {

    @Autowired
    private TransactionUserDao transactionUserDao;
    @Autowired
    private JwtUtil jwtUtil;

    @Test
    public void testDatabaseInitialization() {
        List<TransactionUser> users = transactionUserDao.findAll();
        assertThat(users).isNotEmpty();
        assertThat(users.size()).isEqualTo(5);
    }

    @Test
    public void testJwtGenerateToken() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, "ROLE_USER");
        assertThat(jwt).isNotNull();
    }

    @Test
    public void testJwtValidateToken() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, "ROLE_USER");
        assertThat(jwtUtil.validateToken(jwt)).isTrue();
    }

    @Test
    public void testJwtGetUserId() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, "ROLE_USER");
        assertThat(jwtUtil.getUserIdFromToken(jwt)).isEqualTo(userId);
    }

    @Test
    public void testJwtGetUsername() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, "ROLE_USER");
        assertThat(jwtUtil.getUsernameFromToken(jwt)).isEqualTo(username);
    }

    //TODO: Uncomment this test after implementing the getRoleFromToken method
    @Test
    public void testJwtGetRole() {
        Long userId = 10L;
        String username = "testuser";
        String jwt = jwtUtil.generateToken(userId, username, "ROLE_USER");
        assertThat(jwtUtil.getRoleFromToken(jwt)).isEqualTo(1);
    }


    
}
