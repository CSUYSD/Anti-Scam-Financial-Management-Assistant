package com.example.demo.service;

import com.example.demo.model.TransactionUsers;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public TransactionUsers registerUser(TransactionUsers transactionUsers) {
        transactionUsers.setPassword(passwordEncoder.encode(transactionUsers.getPassword()));
        return userRepository.save(transactionUsers);
    }

    public Optional<TransactionUsers> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //创建user实例
        TransactionUsers transactionUsers = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("TransactionUsers not found"));

        return org.springframework.security.core.userdetails.User.withUsername(transactionUsers.getUsername())
                .password(transactionUsers.getPassword())
                .authorities("USER")  // 默认权限
                .build();
    }
}
