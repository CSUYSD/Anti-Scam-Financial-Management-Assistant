package com.example.demo.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.Collections;

@Getter
@Setter
public class UserDetail extends User {
    private TransactionUsers transactionUsers;

    // 修改构造函数，接受单个 GrantedAuthority
    public UserDetail(TransactionUsers user, GrantedAuthority authority) {
        super(user.getUsername(), user.getPassword(), Collections.singletonList(authority));
        this.transactionUsers = user;
    }

    public void setTransactionUsers(TransactionUsers transactionUsers) {
        this.transactionUsers = transactionUsers;
    }
}
