package com.example.demo.Dao;


import com.example.demo.model.TransactionUser;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Account;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountDao extends JpaRepository<Account, Long> {

    @Query("SELECT a.id FROM Account a WHERE a.transactionUser.id = ?1 AND a.accountName = ?2")
    public Optional<Long> getAccountIDByUserIdAndAccountName(Long userId, String accountName);



    List<Account> findByTransactionUser(TransactionUser user);
}