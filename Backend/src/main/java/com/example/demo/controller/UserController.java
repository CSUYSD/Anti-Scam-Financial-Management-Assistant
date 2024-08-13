package com.example.demo.controller;

import com.example.demo.model.TransactionUsers;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/RestfulApi/users")
public class UserController {

    private UserService userService;
    private UserRepository userRepository;
    @Autowired
    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }


    @GetMapping
    public List<TransactionUsers> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionUsers> getUserById(@PathVariable Long id) {
        TransactionUsers transactionUsers = userRepository.findById(id).orElseThrow(() -> new RuntimeException("TransactionUsers not found"));
        return ResponseEntity.ok(transactionUsers);
    }

    @PostMapping("/signup")
    public TransactionUsers createUser(@RequestBody TransactionUsers transactionUsers) {
        return userRepository.save(transactionUsers);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionUsers> updateUser(@PathVariable Long id, @RequestBody TransactionUsers transactionUsersDetails) {
        TransactionUsers transactionUsers = userRepository.findById(id).orElseThrow(() -> new RuntimeException("TransactionUsers not found"));

        transactionUsers.setFullName(transactionUsersDetails.getFullName());
        transactionUsers.setPhone(transactionUsersDetails.getPhone());
        transactionUsers.setDOB(transactionUsersDetails.getDOB());
        transactionUsers.setEmail(transactionUsersDetails.getEmail());

        TransactionUsers updatedTransactionUsers = userRepository.save(transactionUsers);
        return ResponseEntity.ok(updatedTransactionUsers);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        TransactionUsers transactionUsers = userRepository.findById(id).orElseThrow(() -> new RuntimeException("TransactionUsers not found"));
        userRepository.delete(transactionUsers);
        return ResponseEntity.noContent().build();
    }
}

