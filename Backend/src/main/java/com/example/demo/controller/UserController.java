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


    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<TransactionUsers> getAllUsers() {
        return userService.GetAllUsers();
    }



    @PostMapping("/signup")
    public TransactionUsers createUser(@RequestBody TransactionUsers transactionUsers) {
        return userService.registerUser(transactionUsers);
    }


}

