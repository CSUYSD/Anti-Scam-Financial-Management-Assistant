package com.example.demo.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
@Getter
@Setter
public class UserDetail extends User {
    private TransactionUsers transactionUsers;

    public UserDetail(TransactionUsers user, Collection<? extends GrantedAuthority> authorities) {
        super(user.getUsername(), user.getPassword(), authorities);
        this.transactionUsers = user;
    }

    public void setTransactionUsers(TransactionUsers transactionUsers) {
        this.transactionUsers = transactionUsers;
    }
}
