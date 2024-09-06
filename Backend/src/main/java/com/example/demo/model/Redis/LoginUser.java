package com.example.demo.model.Redis;


import java.io.Serial;
import java.io.Serializable;

import com.example.demo.model.Account;
import com.example.demo.model.TransactionUser;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginUser implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private TransactionUser user;
    private String token;
    private Long loginTime;
    private Long expireTime;

    public LoginUser(TransactionUser user, String token) {
        this.user = user;
        this.token = token;
        this.loginTime = System.currentTimeMillis();
        this.expireTime = this.loginTime + 24 * 60 * 60 * 1000; // 设置过期时间为24小时
    }
}
