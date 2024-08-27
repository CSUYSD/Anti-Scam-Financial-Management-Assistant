package com.example.demo.service;

import com.example.demo.Dao.UserDao;
import com.example.demo.model.TransactionUsers;
import com.example.demo.model.UserDetail;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collections;

@Service
public class UserDetailService implements UserDetailsService {
    private final UserDao userDao;
    @Autowired
    public UserDetailService(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        TransactionUsers transactionUsers = userDao.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new UserDetail(transactionUsers, Collections.emptyList());
    }

    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        TransactionUsers transactionUsers = userDao.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new UserDetail(transactionUsers, Collections.emptyList());
    }
    
}