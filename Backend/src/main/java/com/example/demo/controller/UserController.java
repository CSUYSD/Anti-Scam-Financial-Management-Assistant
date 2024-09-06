package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.DTO.TransactionUserDTO;
import com.example.demo.model.TransactionUser;
import com.example.demo.service.UserService;
import com.example.demo.utility.RabbitMQProducer;
@RestController
@RequestMapping("/users")
@Validated
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    @GetMapping("/allusers")
    public ResponseEntity<List<TransactionUser>> getAllUsers() {
        List<TransactionUser> users = userService.findAll();
        if (!users.isEmpty()) {
            return ResponseEntity.ok(users);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    @Cacheable(value = "users", key = "#id")
    public ResponseEntity<TransactionUser> getUserById(@PathVariable Long id) {
        Optional<TransactionUser> userOptional = userService.findById(id);
        return userOptional.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/username/{username}")
    @Cacheable(value = "users", key = "#username")
    public ResponseEntity<TransactionUser> getUserByUsername(@PathVariable String username) {
        Optional<TransactionUser> userOptional = userService.findByUsername(username);
        return userOptional.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody TransactionUser transactionUserDetails) {
        try {
            userService.updateUser(id, transactionUserDetails);
            return ResponseEntity.ok("User updated successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating user: " + e.getMessage());
        }
    }


    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.status(HttpStatus.OK).body("User deleted successfully");
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

    @GetMapping("/info")
    public ResponseEntity<TransactionUserDTO> getCurrentUserInfo(@RequestHeader("Authorization") String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        TransactionUserDTO user_info = userService.getUserInfoByUserId(token).orElse(null);
        if (user_info == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(user_info);
    }

    @PostMapping("/rabbit")
    public String testRabbitMQ(@RequestBody String message) {
        rabbitMQProducer.sendMessage(message);
        return message;
    }
}