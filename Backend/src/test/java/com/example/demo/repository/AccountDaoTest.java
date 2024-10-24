//package com.example.demo.repository;
//
//import static com.google.common.truth.Truth.assertThat;
//
//import com.example.demo.model.Account;
//import com.example.demo.model.TransactionUser;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
//import org.springframework.test.context.junit.jupiter.SpringExtension;
//
//import java.util.Optional;
//
//@ExtendWith(SpringExtension.class)
//@DataJpaTest
//public class AccountDaoTest {
//
//    @Autowired
//    private AccountDao accountDao;
//
//    @Autowired
//    private TransactionUserDao transactionUserDao;
//
//    private TransactionUser user;
//    private Account account;
//
//    @BeforeEach
//    public void setUp() {
//        // Create and save a TransactionUser
//        user = new TransactionUser();
//        user.setUsername("testuser");
//        user.setEmail("testuser@example.com");
//        transactionUserDao.save(user);
//
//        // Create and save an Account
//        account = new Account();
//        account.setAccountName("Test Account");
//        account.setTransactionUser(user);
//        accountDao.save(account);
//    }
//
//    @Test
//    public void testGetAccountIDByUserIdAndAccountName() {
//        // Act: Fetch the account ID using the custom query
//        Optional<Long> accountId = accountDao.getAccountIDByUserIdAndAccountName(user.getId(), "Test Account");
//
//        // Assert: Ensure the account ID is present and correct
//        assertThat(accountId).isPresent();
//        assertThat(accountId.get()).isEqualTo(account.getId());
//    }
//
//    @Test
//    public void testFindByTransactionUser() {
//        // Act: Fetch all accounts by the transaction user
//        var accounts = accountDao.findByTransactionUser(user);
//
//        // Assert: Ensure we get the correct number of accounts and data
//        assertThat(accounts).isNotEmpty();
//        assertThat(accounts.get(0).getAccountName()).isEqualTo("Test Account");
//        assertThat(accounts.get(0).getTransactionUser().getId()).isEqualTo(user.getId());
//    }
//
//    @Test
//    public void testFindAccountIdByAccountNameAndTransactionUserId() {
//        // Act: Fetch the account ID using another custom query
//        Long accountId = accountDao.findAccountIdByAccountNameAndTransactionUserId("Test Account", user.getId());
//
//        // Assert: Ensure the account ID is correct
//        assertThat(accountId).isEqualTo(account.getId());
//    }
//}
