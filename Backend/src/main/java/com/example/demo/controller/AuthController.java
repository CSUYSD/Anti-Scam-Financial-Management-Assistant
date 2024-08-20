package com.example.demo.controller;

import com.example.demo.service.AuthService;
import com.github.alenfive.rocketapi.entity.vo.LoginVo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    @Autowired
    public AuthController(AuthService authService, AuthenticationManager authenticationManager) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
    }

//    用户登录功能，接收前端传来的用户名和密码，进行身份验证
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginVo loginVo) {
            return authService.login(loginVo);
    }
}