package com.example.demo.service;

import com.example.demo.model.TransactionUsers;
import com.example.demo.Dao.UserDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private UserDao userDao;
//    private PasswordEncoder passwordEncoder;
    @Autowired
    public UserService(UserDao userDao) {
        this.userDao = userDao;
//        this.passwordEncoder = passwordEncoder;
    }

//    public TransactionUsers registerUser(TransactionUsers transactionUsers) {
//        transactionUsers.setPassword(passwordEncoder.encode(transactionUsers.getPassword()));
//        return userRepository.saveUser(transactionUsers);
//    }

    public ResponseEntity<List<TransactionUsers>> findAll() {
        List<TransactionUsers> users = userDao.findAll();
        return ResponseEntity.ok(users);
    }

    public ResponseEntity<TransactionUsers> findById(Long id) {
        Optional<TransactionUsers> user = userDao.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public Optional<TransactionUsers> findByUsername(String username) {
        return userDao.findByUsername(username);
    }

    public ResponseEntity<String> saveUser(TransactionUsers user) {
        try{
            userDao.save(user);
            Optional<TransactionUsers> userOptional = userDao.findById(user.getId());
            if (userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.CREATED).body("User has been saved");
            }
        }catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //创建user实例
        TransactionUsers transactionUsers = userDao.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("TransactionUsers not found"));

        return org.springframework.security.core.userdetails.User.withUsername(transactionUsers.getUsername())
                .password(transactionUsers.getPassword())
                .authorities("USER")  // 默认权限
                .build();
    }
}
