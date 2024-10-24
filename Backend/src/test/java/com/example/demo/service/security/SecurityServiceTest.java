package com.example.demo.service.security;

import com.example.demo.exception.PasswordNotCorrectException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.repository.UserRoleDao;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.security.UserRole;
import com.example.demo.model.security.UserDetail;
import com.example.demo.model.security.LoginVo;
import com.example.demo.model.dto.TransactionUserDTO;
import com.example.demo.utility.jwt.JwtUtil;
import com.google.common.truth.Truth;
import org.mockito.*;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

public class SecurityServiceTest {

    private SecurityService securityService;
    private TransactionUserDao transactionUserDao;
    private AuthenticationManager authenticationManager;
    private JwtUtil jwtUtil;
    private RedisTemplate<String, Object> redisTemplate;
    private PasswordEncoder passwordEncoder;
    private UserRoleDao userRoleDao;
    private ValueOperations<String, Object> valueOperations;

    public static void main(String[] args) {
        try {
            SecurityServiceTest test = new SecurityServiceTest();
            test.setup();
            test.testSaveUser();
            test.testLogin();
            test.testUpdatePassword();
            System.out.println("All tests passed successfully!");
        } catch (Exception e) {
            System.err.println("Test failed with exception: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    public void setup() {
        try {
            // 手动创建所有mock对象
            transactionUserDao = Mockito.mock(TransactionUserDao.class);
            authenticationManager = Mockito.mock(AuthenticationManager.class);
            jwtUtil = Mockito.mock(JwtUtil.class);
            redisTemplate = Mockito.mock(RedisTemplate.class);
            passwordEncoder = Mockito.mock(PasswordEncoder.class);
            userRoleDao = Mockito.mock(UserRoleDao.class);
            valueOperations = Mockito.mock(ValueOperations.class);

            Mockito.when(redisTemplate.opsForValue()).thenReturn(valueOperations);

            securityService = new SecurityService(
                    passwordEncoder,
                    transactionUserDao,
                    authenticationManager,
                    jwtUtil,
                    redisTemplate,
                    userRoleDao
            );
            System.out.println("Setup completed successfully");
        } catch (Exception e) {
            System.err.println("Setup failed: " + e.getMessage());
            throw e;
        }
    }

    public void testSaveUser() {
        try {
            System.out.println("Starting testSaveUser...");

            TransactionUserDTO userDTO = new TransactionUserDTO();
            userDTO.setUsername("testUser");
            userDTO.setPassword("password123");

            UserRole userRole = new UserRole();
            userRole.setRole("ROLE_USER");

            // 重置 mock，清除之前的所有交互
            Mockito.reset(transactionUserDao);

            Mockito.when(transactionUserDao.findByUsername("testUser")).thenReturn(Optional.empty());
            Mockito.when(userRoleDao.findByRole("ROLE_USER")).thenReturn(Optional.of(userRole));
            Mockito.when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

            securityService.saveUser(userDTO);

            // 验证 save 方法被调用一次
            Mockito.verify(transactionUserDao, Mockito.times(1)).save(Mockito.any(TransactionUser.class));
            System.out.println("testSaveUser passed!");
        } catch (Exception e) {
            System.err.println("testSaveUser failed: " + e.getMessage());
            throw e;
        }
    }

    public void testLogin() {
        try {
            System.out.println("Starting testLogin...");

            // 重置所有 mock
            Mockito.reset(transactionUserDao, authenticationManager, jwtUtil);

            LoginVo loginVo = new LoginVo();
            loginVo.setUsername("testUser");
            loginVo.setPassword("password123");

            TransactionUser user = new TransactionUser();
            user.setId(1L);
            user.setUsername("testUser");
            user.setPassword("encodedPassword");

            UserRole role = new UserRole();
            role.setRole("ROLE_USER");
            user.setRole(role);

            Authentication authentication = Mockito.mock(Authentication.class);
            UserDetail userDetail = new UserDetail(user,
                    Collections.singleton(new SimpleGrantedAuthority(role.getRoleName())));

            Mockito.when(authenticationManager.authenticate(Mockito.any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            Mockito.when(authentication.getPrincipal()).thenReturn(userDetail);
            Mockito.when(jwtUtil.generateToken(1L, "testUser", "ROLE_USER"))
                    .thenReturn("test-token");

            ResponseEntity<Map<String, Object>> response = securityService.login(loginVo);

            Truth.assertThat(response.getStatusCodeValue()).isEqualTo(200);
            Truth.assertThat(response.getBody().get("token")).isEqualTo("test-token");
            Truth.assertThat(response.getBody().get("username")).isEqualTo("testUser");
            System.out.println("testLogin passed!");
        } catch (Exception e) {
            System.err.println("testLogin failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void testUpdatePassword() {
        try {
            System.out.println("Starting testUpdatePassword...");

            // 重置所有 mock
            Mockito.reset(transactionUserDao, jwtUtil, passwordEncoder);

            String token = "Bearer test-token";
            Map<String, String> passwords = Map.of(
                    "oldpassword", "oldPass123",
                    "newpassword", "newPass123"
            );

            TransactionUser user = new TransactionUser();
            user.setId(1L);
            user.setUsername("testUser");
            user.setPassword("encodedOldPass");

            Mockito.when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(1L);
            Mockito.when(transactionUserDao.findById(1L)).thenReturn(Optional.of(user));
            Mockito.when(passwordEncoder.matches("oldPass123", "encodedOldPass")).thenReturn(true);
            Mockito.when(passwordEncoder.encode("newPass123")).thenReturn("encodedNewPass");

            try {
                securityService.updatePassword(token, passwords);
            } catch (UserNotFoundException e) {
                throw new RuntimeException(e);
            }

            // 验证 save 方法被调用一次
            Mockito.verify(transactionUserDao, Mockito.times(1)).save(Mockito.any(TransactionUser.class));
            System.out.println("testUpdatePassword passed!");
        } catch (Exception e) {
            System.err.println("testUpdatePassword failed: " + e.getMessage());
            try {
                throw e;
            } catch (PasswordNotCorrectException ex) {
                throw new RuntimeException(ex);
            }
        }
    }
}