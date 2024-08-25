package com.example.demo.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginUser implements Serializable {
    private static final long serialVersionUID = 1L;

    private TransactionUsers user;
    private String token;
    private Long loginTime;
    private Long expireTime;

    public LoginUser(TransactionUsers user, String token) {
        this.user = user;
        this.token = token;
        this.loginTime = System.currentTimeMillis();
        this.expireTime = this.loginTime + 24 * 60 * 60 * 1000; // 设置过期时间为24小时
    }
}
