package com.example.demo.service;

import com.example.demo.model.TransactionUsers;
import com.example.demo.model.UserDetail;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
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


    public List<TransactionUsers> GetAllUsers() {
        return userRepository.findAll();
    }

    public Optional<TransactionUsers> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public UserDetail loadUserByUsername(String username) throws UsernameNotFoundException {
        //创建user实例
        Optional<TransactionUsers> user = userRepository.findByUsername(username);
        // 若没查询到一定要抛出该异常，这样才能被Spring Security的错误处理器处理
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("没有找到该用户");
        }
        // 走到这代表查询到了实体对象，那就返回我们自定义的UserDetail对象（这里权限暂时放个空集合，后面我会讲解）
        return new UserDetail(user.orElse(null), Collections.emptyList());
    }
}
