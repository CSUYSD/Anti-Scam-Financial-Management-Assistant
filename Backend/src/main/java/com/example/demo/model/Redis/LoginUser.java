package com.example.demo.model.Redis;

import java.io.Serializable;
import java.time.LocalDate;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginUser implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long userId;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String accountName;
    private String token;
    private Long loginTime;
    private Long expireTime;

    public LoginUser(Long userId, String username, String email, String phone, String fullName, String accountName, String token) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.fullName = fullName;
        this.accountName = accountName;
        this.token = token;
        this.loginTime = System.currentTimeMillis();
        this.expireTime = this.loginTime + 24 * 60 * 60 * 1000; // 设置过期时间为24小时
    }
}
