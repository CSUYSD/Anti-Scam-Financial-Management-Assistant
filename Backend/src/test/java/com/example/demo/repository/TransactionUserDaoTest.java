package com.example.demo.repository;

import com.example.demo.config.TestConfig;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.security.UserRole;
import com.google.common.truth.Truth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestContextManager;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.util.Optional;

@SpringBootTest
@Import(TestConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.main.allow-bean-definition-overriding=true"
})
class TransactionUserDaoTest {
    @Autowired
    private TransactionUserDao transactionUserDao;

    @Autowired
    private UserRoleDao userRoleDao;

    @Autowired
    private ConfigurableApplicationContext applicationContext;

    private TestContextManager testContextManager;

    public static void main(String[] args) throws Exception {
        TransactionUserDaoTest test = new TransactionUserDaoTest();
        try {
            test.setup();
            test.testFindByUsername();
            test.testSaveAndFindById();
            System.out.println("All tests passed successfully!");
        } finally {
            if (test.applicationContext != null) {
                test.applicationContext.close();
            }
            System.exit(0);
        }
    }

    public void setup() throws Exception {
        this.testContextManager = new TestContextManager(getClass());
        this.testContextManager.prepareTestInstance(this);
        initTestData();
    }

    private void initTestData() {
        // 创建用户角色
        UserRole userRole = new UserRole();
        userRole.setRole_id(1);
        userRole.setRole("ROLE_USER");
        userRoleDao.save(userRole);

        // 创建测试用户
        TransactionUser user = new TransactionUser();
        user.setUsername("testUser");
        user.setPassword("Test@123");
        user.setEmail("test@example.com");
        user.setPhone("1234567890");
        user.setDob(LocalDate.of(1990, 1, 1));
        user.setRole(userRole);
        transactionUserDao.save(user);
    }

    public void testFindByUsername() {
        // 测试查找存在的用户
        Optional<TransactionUser> foundUser = transactionUserDao.findByUsername("testUser");
        Truth.assertThat(foundUser.isPresent()).isTrue();
        Truth.assertThat(foundUser.get().getUsername()).isEqualTo("testUser");
        Truth.assertThat(foundUser.get().getEmail()).isEqualTo("test@example.com");
        Truth.assertThat(foundUser.get().getPhone()).isEqualTo("1234567890");
        Truth.assertThat(foundUser.get().getRole().getRoleName()).isEqualTo("ROLE_USER");

        // 测试查找不存在的用户
        Optional<TransactionUser> nonExistentUser = transactionUserDao.findByUsername("nonExistentUser");
        Truth.assertThat(nonExistentUser.isPresent()).isFalse();

        System.out.println("testFindByUsername passed!");
    }

    public void testSaveAndFindById() {
        // 创建新用户
        TransactionUser newUser = new TransactionUser();
        newUser.setUsername("newUser");
        newUser.setPassword("New@123");
        newUser.setEmail("new@example.com");
        newUser.setPhone("0987654321");
        newUser.setDob(LocalDate.of(1995, 12, 31));
        newUser.setRole(userRoleDao.findByRole("ROLE_USER").orElseThrow());

        // 保存用户
        TransactionUser savedUser = transactionUserDao.save(newUser);
        Truth.assertThat(savedUser.getId()).isNotNull();

        // 通过ID查找用户
        Optional<TransactionUser> foundUser = transactionUserDao.findById(savedUser.getId());
        Truth.assertThat(foundUser.isPresent()).isTrue();
        Truth.assertThat(foundUser.get().getUsername()).isEqualTo("newUser");
        Truth.assertThat(foundUser.get().getEmail()).isEqualTo("new@example.com");
        Truth.assertThat(foundUser.get().getPhone()).isEqualTo("0987654321");

        // 测试查找不存在的ID
        Optional<TransactionUser> nonExistentUser = transactionUserDao.findById(999L);
        Truth.assertThat(nonExistentUser.isPresent()).isFalse();

        System.out.println("testSaveAndFindById passed!");
    }
}