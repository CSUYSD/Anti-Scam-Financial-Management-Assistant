package com.example.demo.controller;

import com.example.demo.model.TransactionUsers;
import com.example.demo.service.UserService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/RestfulApi/users")
public class UserController {
    private static final Logger logger = (Logger) LoggerFactory.getLogger(UserController.class);

    private UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping
    public ResponseEntity<List<TransactionUsers>> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionUsers> getUserById(@PathVariable Long id) {
        return userService.findById(id);
    }



    @PostMapping("/signup")
    public String createUser(@RequestBody TransactionUsers transactionUsers) {
        userService.saveUser(transactionUsers);
        return "success";

    }

//    @PutMapping("/{id}")
//    public ResponseEntity<TransactionUsers> updateUser(@PathVariable Long id, @RequestBody TransactionUsers transactionUsersDetails) {
//        TransactionUsers transactionUsers = userRepository.findById(id).orElseThrow(() -> new RuntimeException("TransactionUsers not found"));
//
//        transactionUsers.setFullName(transactionUsersDetails.getFullName());
//        transactionUsers.setPhone(transactionUsersDetails.getPhone());
//        transactionUsers.setDOB(transactionUsersDetails.getDOB());
//        transactionUsers.setEmail(transactionUsersDetails.getEmail());
//
//        TransactionUsers updatedTransactionUsers = userRepository.save(transactionUsers);
//        return ResponseEntity.ok(updatedTransactionUsers);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
//        TransactionUsers transactionUsers = userRepository.findById(id).orElseThrow(() -> new RuntimeException("TransactionUsers not found"));
//        userRepository.delete(transactionUsers);
//        return ResponseEntity.noContent().build();
//    }
}

