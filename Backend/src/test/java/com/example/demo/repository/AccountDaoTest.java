package com.example.demo.repository;

import com.example.demo.config.TestConfig;
import com.example.demo.model.Account;
import com.example.demo.model.TransactionUser;
import com.google.common.truth.Truth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestContextManager;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@SpringBootTest
@Import(TestConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.main.allow-bean-definition-overriding=true"
})
class AccountDaoTest {
    @Autowired
    private AccountDao accountDao;

    @Autowired
    private TransactionUserDao transactionUserDao;

    @Autowired
    private ConfigurableApplicationContext applicationContext;

    private TestContextManager testContextManager;

    public static void main(String[] args) throws Exception {
        AccountDaoTest test = new AccountDaoTest();
        try {
            test.setup();
            test.testGetAccountIDByUserIdAndAccountName();
            test.testFindByTransactionUser();
            test.testFindAccountIdByAccountNameAndTransactionUserId();
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
        // 创建测试用户
        TransactionUser user = new TransactionUser();
        user.setId(1L);
        user.setUsername("testUser");
        user.setPassword("testPassword");
        user.setEmail("test@example.com");
        transactionUserDao.save(user);

        // 创建测试账户1
        Account account1 = new Account();
        account1.setId(1L);
        account1.setAccountName("Test Account 1");
        account1.setTransactionUser(user);
        account1.setTotalIncome(1000.00);
        account1.setTotalExpense(50.00);
        accountDao.save(account1);

        // 创建测试账户2
        Account account2 = new Account();
        account2.setId(2L);
        account2.setAccountName("Test Account 2");
        account2.setTransactionUser(user);
        account2.setTotalIncome(2000.00);
        account2.setTotalExpense(100.00);
        accountDao.save(account2);
    }

    public void testGetAccountIDByUserIdAndAccountName() {
        Optional<Long> accountId = accountDao.getAccountIDByUserIdAndAccountName(1L, "Test Account 1");

        // 修改断言写法
        Truth.assertThat(accountId.isPresent()).isTrue();
        Truth.assertThat(accountId.get()).isEqualTo(1L);

        // 测试不存在的账户
        Optional<Long> nonExistentAccount = accountDao.getAccountIDByUserIdAndAccountName(1L, "Non Existent");
        Truth.assertThat(nonExistentAccount.isPresent()).isFalse();

        System.out.println("testGetAccountIDByUserIdAndAccountName passed!");
    }

    public void testFindByTransactionUser() {
        TransactionUser user = transactionUserDao.findById(1L).orElseThrow();
        List<Account> accounts = accountDao.findByTransactionUser(user);

        Truth.assertThat(accounts).isNotNull();
        Truth.assertThat(accounts.size()).isEqualTo(2);

        // 修改断言写法
        List<String> accountNames = accounts.stream()
                .map(Account::getAccountName)
                .collect(Collectors.toList());
        Truth.assertThat(accountNames).containsExactly("Test Account 1", "Test Account 2");

        System.out.println("testFindByTransactionUser passed!");
    }

    public void testFindAccountIdByAccountNameAndTransactionUserId() {
        Long accountId = accountDao.findAccountIdByAccountNameAndTransactionUserId("Test Account 1", 1L);

        Truth.assertThat(accountId).isNotNull();
        Truth.assertThat(accountId).isEqualTo(1L);

        // 测试不存在的账户
        Long nonExistentId = accountDao.findAccountIdByAccountNameAndTransactionUserId("Non Existent", 1L);
        Truth.assertThat(nonExistentId).isNull();

        System.out.println("testFindAccountIdByAccountNameAndTransactionUserId passed!");
    }
}