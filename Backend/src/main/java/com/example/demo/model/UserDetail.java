package com.example.demo.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class UserDetail extends User {
    private TransactionUsers transactionUsers;

    public UserDetail(TransactionUsers user, Collection<? extends GrantedAuthority> authorities) {
        super(user.getUsername(), user.getPassword(), authorities);
        this.transactionUsers = user;
    }

    public TransactionUsers getTransactionUsers() {
        return transactionUsers;
    }

    public void setTransactionUsers(TransactionUsers transactionUsers) {
        this.transactionUsers = transactionUsers;
    }
}
