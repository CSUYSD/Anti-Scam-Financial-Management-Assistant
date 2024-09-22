package com.example.demo.model.Security;

import com.example.demo.model.TransactionUser;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

@Getter
@Setter
public class UserDetail extends User {
    private TransactionUser transactionUser;

    // 修改构造函数，接受单个 GrantedAuthority
    public UserDetail(TransactionUser user, Collection<? extends GrantedAuthority> authorities) {
        super(user.getUsername(), user.getPassword(), authorities);
        this.transactionUser = user;
    }

    public void setTransactionUser(TransactionUser transactionUser) {
        this.transactionUser = transactionUser;
    }
}
