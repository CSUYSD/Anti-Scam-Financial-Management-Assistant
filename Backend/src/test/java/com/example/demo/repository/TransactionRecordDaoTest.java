package com.example.demo.repository;

import com.example.demo.config.TestConfig;
import com.example.demo.model.Account;
import com.example.demo.model.TransactionRecord;
import com.example.demo.model.TransactionUser;
import com.google.common.truth.Truth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.TestContextManager;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@SpringBootTest
@Import(TestConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.main.allow-bean-definition-overriding=true"
})
class TransactionRecordDaoTest {
    @Autowired
    private TransactionRecordDao transactionRecordDao;

    @Autowired
    private AccountDao accountDao;

    @Autowired
    private TransactionUserDao transactionUserDao;

    @Autowired
    private ConfigurableApplicationContext applicationContext;  // 添加字段声明

    private TestContextManager testContextManager;

    public static void main(String[] args) throws Exception {
        TransactionRecordDaoTest test = new TransactionRecordDaoTest();
        try {
            test.setup();
            test.testFindAllByAccountId();
            test.testFindByAccountIdAndType();
            test.testFindAllByIdInAndAccountId();
            test.testFindCertainDaysRecords();
            System.out.println("All tests passed successfully!");
        } finally {
            // 关闭 Spring 上下文
            if (test.applicationContext != null) {
                test.applicationContext.close();
            }
            // 强制退出程序
            System.exit(0);  // 添加这一行
        }
    }

    public void setup() throws Exception {
        this.testContextManager = new TestContextManager(getClass());
        this.testContextManager.prepareTestInstance(this);

        // 初始化测试数据
        initTestData();
    }

    private void initTestData() {
        // 创建测试用户
        TransactionUser user = new TransactionUser();
        user.setId(1L);
        user.setUsername("testUser");           // 添加用户名
        user.setPassword("testPassword");       // 添加密码
        user.setEmail("test@example.com");      // 添加邮箱
        transactionUserDao.save(user);

        // 创建测试账户
        Account account = new Account();
        account.setId(1L);
        account.setAccountName("Test Account");
        account.setTransactionUser(user);
        account.setTotalIncome(1000.00);
        account.setTotalExpense(50.00);
        accountDao.save(account);

        // 创建收入记录
        TransactionRecord income = new TransactionRecord();
        income.setAccount(account);
        income.setType("INCOME");
        income.setAmount(1000.00);
        income.setTransactionTime(ZonedDateTime.now());
        income.setUserId(1L);
        income.setCategory("Salary");
        income.setTransactionDescription("Monthly salary");
        income.setTransactionMethod("Bank Transfer");
        transactionRecordDao.save(income);

        // 创建支出记录
        TransactionRecord expense = new TransactionRecord();
        expense.setAccount(account);
        expense.setType("EXPENSE");
        expense.setAmount(50.00);
        expense.setTransactionTime(ZonedDateTime.now().minusHours(1));
        expense.setUserId(1L);
        expense.setCategory("Food");
        expense.setTransactionDescription("Lunch");
        expense.setTransactionMethod("Cash");
        transactionRecordDao.save(expense);
    }

    public void testFindAllByAccountId() {
        List<TransactionRecord> records = transactionRecordDao.findAllByAccountId(1L);

        Truth.assertThat(records).isNotNull();
        Truth.assertThat(records).isNotEmpty();
        Truth.assertThat(records).hasSize(2);

        records.forEach(record ->
                Truth.assertThat(record.getAccount().getId()).isEqualTo(1L)
        );

        List<String> types = records.stream()
                .map(TransactionRecord::getType)
                .collect(Collectors.toList());
        Truth.assertThat(types).containsExactly("INCOME", "EXPENSE");

        List<Double> amounts = records.stream()
                .map(TransactionRecord::getAmount)
                .collect(Collectors.toList());
        Truth.assertThat(amounts).containsExactly(1000.00, 50.00);

        System.out.println("testFindAllByAccountId passed!");
    }


    public void testFindByAccountIdAndType() {
        List<TransactionRecord> records = transactionRecordDao.findByAccountIdAndType("INCOME", 1L);

        Truth.assertThat(records).isNotNull();
        Truth.assertThat(records).hasSize(1);
        Truth.assertThat(records.get(0).getType()).isEqualTo("INCOME");
        Truth.assertThat(records.get(0).getAmount()).isEqualTo(1000.00);
    }

    public void testFindAllByIdInAndAccountId() {
        List<TransactionRecord> records = transactionRecordDao
                .findAllByIdInAndAccountId(Arrays.asList(1L, 2L), 1L);

        Truth.assertThat(records).isNotNull();
        Truth.assertThat(records).hasSize(2);
    }

    public void testFindCertainDaysRecords() {
        List<TransactionRecord> records = transactionRecordDao.findCertainDaysRecords(1L, 7);

        Truth.assertThat(records).isNotNull();
        Truth.assertThat(records).hasSize(2);
        Truth.assertThat(records.get(0).getTransactionTime())
                .isGreaterThan(records.get(1).getTransactionTime());
    }
}