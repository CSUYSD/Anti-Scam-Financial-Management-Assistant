package com.example.demo.controller;

import java.util.Map;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.TransactionUsers;
import com.example.demo.service.impl.AuthServiceImpl;
import com.github.alenfive.rocketapi.entity.vo.LoginVo;

@Validated
@RestController
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthServiceImpl authServiceImpl;
    private final AuthenticationManager authenticationManager;
    @Autowired
    public AuthController(AuthServiceImpl authServiceImpl, AuthenticationManager authenticationManager) {
        this.authServiceImpl = authServiceImpl;
        this.authenticationManager = authenticationManager;
    }
    // 登录，接收前端传来的用户名和密码，进行身份验证
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginVo loginVo) {
        return authServiceImpl.login(loginVo);
    }

    // 注册，接收前端传来的用户信息（对密码进行加密），保存到数据库
    @PostMapping("/signup")
    public ResponseEntity<String> createUser(@Valid @RequestBody TransactionUsers transactionUsers) {
        try {
            authServiceImpl.saveUser(transactionUsers);
            return ResponseEntity.status(HttpStatus.CREATED).body("用户已成功保存");
        } catch (DataIntegrityViolationException e) {
            logger.error("保存用户时出错: ", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("用户名已存在: " + e.getMessage());
        }
    }
}