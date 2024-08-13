package com.example.demo.controller;

import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.TransactionUsers;
import com.example.demo.service.UserService;
import com.example.demo.service.UserServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    private final UserServiceImpl userServiceImpl;

    @Autowired
    public UserController(UserService userService, UserServiceImpl userServiceImpl) {
        this.userService = userService;
        this.userServiceImpl = userServiceImpl;
    }


    @GetMapping("/allusers")
    public ResponseEntity<List<TransactionUsers>> getAllUsers() {
        List<TransactionUsers> users = userService.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionUsers> getUserById(@PathVariable Long id) {
        Optional<TransactionUsers> userOptional = userService.findById(id);
        return userOptional
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

//    用户注册功能，接收前端传来的用户信息（对密码进行加密），保存到数据库
    @PostMapping("/signup")
    public ResponseEntity<String> createUser(@RequestBody TransactionUsers transactionUsers) {
        try {
            userServiceImpl.saveUser(transactionUsers);
            return ResponseEntity.status(HttpStatus.CREATED).body("User has been saved");
        } catch (DataIntegrityViolationException e) {
            logger.error("Error saving user: ", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error saving user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody TransactionUsers transactionUsersDetails) {
        try {
            userService.updateUser(id, transactionUsersDetails);
            return ResponseEntity.ok("User updated successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            logger.error("Error deleting user: ", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error deleting user: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error deleting user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred: " + e.getMessage());
        }
    }
}