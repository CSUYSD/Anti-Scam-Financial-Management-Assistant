package com.example.demo.controller.Security;

import java.util.Map;

import com.example.demo.exception.PasswordNotCorrectException;
import com.example.demo.model.Security.LoginVo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.DTO.TransactionUserDTO;
import com.example.demo.service.Security.SecurityService;
import com.example.demo.service.Security.UserDetailService;


import jakarta.validation.Valid;

@Validated
@RestController
public class SecurityController {

    private static final Logger logger = LoggerFactory.getLogger(SecurityController.class);
    private final SecurityService securityService;
    private final UserDetailService userDetailService;
    @Autowired
    public SecurityController(SecurityService securityService, AuthenticationManager authenticationManager, UserDetailService userDetailService) {
        this.securityService = securityService;
        this.userDetailService = userDetailService;
    }
    // 登录
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginVo loginVo) {
        logger.info("收到登录请求: {}", loginVo.getUsername());
        return securityService.login(loginVo);
    }

    // 注册
    @PostMapping("/signup")
    public ResponseEntity<String> createUser(@Valid @RequestBody TransactionUserDTO userDTO) {
        try {
            securityService.saveUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("用户已成功保存");
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            logger.error("保存用户时出错: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("保存用户时发生错误");
        }
    }

    //update password
    @PatchMapping("/updatePwd")
    public ResponseEntity<String> updatePassword(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> oldAndNewPwd) {
        try {
            securityService.updatePassword(token, oldAndNewPwd);
            return ResponseEntity.ok("Password updated successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (PasswordNotCorrectException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}