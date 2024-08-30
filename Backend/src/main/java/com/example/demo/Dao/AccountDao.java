package com.example.demo.Dao;

import com.example.demo.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface AccountDao extends JpaRepository<Account, Long> {

    @Query("SELECT a FROM Account a WHERE a.username = :username")
    List<Account> findByUsername(@Param("username") String username);

    List<Account> findByTransactionUsersId(Long userId);

    Optional<Account> findByAccountName(String accountName);

    @Query("SELECT a FROM Account a WHERE a.username = :username AND a.accountName = :accountName")
    Optional<Account> findByUsernameAndAccountName(@Param("username") String username, @Param("accountName") String accountName);

    @Query("SELECT a FROM Account a JOIN FETCH a.transactionRecords WHERE a.transactionUsers.id = :userId")
    List<Account> findAllAccountsWithTransactionsByUserId(@Param("userId") Long userId);
}