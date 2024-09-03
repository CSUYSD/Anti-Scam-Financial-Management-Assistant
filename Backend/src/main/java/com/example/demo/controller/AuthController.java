package com.example.demo.controller;

import java.util.Map;

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
import com.example.demo.service.AuthService;
import com.github.alenfive.rocketapi.entity.vo.LoginVo;

import jakarta.validation.Valid;

@Validated
@RestController
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService, AuthenticationManager authenticationManager) {
        this.authService = authService;
    }
    // 登录，接收前端传来的用户名和密码，进行身份验证
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginVo loginVo) {
        logger.info("收到登录请求: {}", loginVo.getUsername());
        return authService.login(loginVo);
    }

    // 注册，接收前端传来的用户信息（对密码进行加密），保存到数据库
    @PostMapping("/signup")
    public ResponseEntity<String> createUser(@Valid @RequestBody TransactionUsers transactionUsers) {
        try {
            authService.saveUser(transactionUsers);
            return ResponseEntity.status(HttpStatus.CREATED).body("用户已成功保存");
        } catch (DataIntegrityViolationException e) {
            logger.error("保存用户时出错: ", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("用户名已存在: " + e.getMessage());
        }
    }
}