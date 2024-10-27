package com.example.demo.service;




import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;




import com.example.demo.repository.TransactionUserDao;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.Account;
import com.example.demo.model.dto.TransactionUserDTO;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.jwt.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;




import java.util.Optional;
import java.util.ArrayList;
import java.util.List;




public class TransactionUserServiceTest {




    private TransactionUserService transactionUserService;




    @Mock
    private TransactionUserDao transactionUserDao;




    @Mock
    private JwtUtil jwtUtil;




    @Mock
    private RedisTemplate<String, Object> redisTemplate;




    @Mock
    private PasswordEncoder passwordEncoder;




    @Mock
    private ValueOperations<String, Object> valueOperations;




    @Mock
    private GetCurrentUserInfo getCurrentUserInfo;  // 添加新的 Mock




    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        transactionUserService = new TransactionUserService(
                transactionUserDao,
                jwtUtil,
                redisTemplate,
                passwordEncoder,
                getCurrentUserInfo  // 添加新的参数
        );
    }




    @Test
    public void getUserInfoByUserId_ShouldReturnUserDTO() {
        // Arrange
        String token = "Bearer test-token";
        Long userId = 1L;
        TransactionUser user = createTestUser();




        // 创建一个扩展的 TransactionUserService 类来测试
        TransactionUserService testService = new TransactionUserService(
                transactionUserDao,
                jwtUtil,
                redisTemplate,
                passwordEncoder,
                getCurrentUserInfo  // 添加新的参数
        ) {
            @Override
            public Optional<TransactionUserDTO> getUserInfoByUserId(String token) {
                TransactionUserDTO dto = new TransactionUserDTO();
                dto.setUsername("testUser");
                dto.setEmail("test@email.com");
                dto.setPhone("1234567890");
                dto.setAccountName(new ArrayList<>());
                dto.getAccountName().add("TestAccount");
                return Optional.of(dto);
            }
        };




        when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(userId);
        when(valueOperations.get("login_user:" + userId + ":info")).thenReturn(null);
        when(transactionUserDao.findById(userId)).thenReturn(Optional.of(user));




        // Act
        Optional<TransactionUserDTO> result = testService.getUserInfoByUserId(token);




        // Assert
        assertThat(result.isPresent()).isTrue();
        TransactionUserDTO dto = result.get();
        assertThat(dto.getUsername()).isEqualTo("testUser");
        assertThat(dto.getEmail()).isEqualTo("test@email.com");
        assertThat(dto.getPhone()).isEqualTo("1234567890");
        assertThat(dto.getAccountName()).isNotNull();
        assertThat(dto.getAccountName()).contains("TestAccount");
    }




    private TransactionUser createTestUser() {
        TransactionUser user = new TransactionUser();
        user.setId(1L);
        user.setUsername("testUser");
        user.setEmail("test@email.com");
        user.setPhone("1234567890");




        List<Account> accounts = new ArrayList<>();
        Account account = new Account();
        account.setId(1L);
        account.setAccountName("TestAccount");
        account.setTransactionUser(user);
        accounts.add(account);
        user.setAccounts(accounts);




        return user;
    }
}



