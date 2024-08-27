package com.example.demo.service;

import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.TransactionUsers;
import com.example.demo.Dao.UserDao;
import com.example.demo.model.UserDetail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);


    private final UserDao userDao;

    @Autowired
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public List<TransactionUsers> findAll() {
        return userDao.findAll();
    }

    public Optional<TransactionUsers> findById(Long id) {
        return userDao.findById(id);
    }

    public Optional<TransactionUsers> findByUsername(String username) {
        return userDao.findByUsername(username);
    }


    public void updateUser(Long id, TransactionUsers updatedUser) throws UserNotFoundException {
        Optional<TransactionUsers> existingUserOptional = userDao.findById(id);

        if (!existingUserOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        TransactionUsers existingUser = existingUserOptional.get();
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setPassword(updatedUser.getPassword());

        userDao.save(existingUser);
    }

    public void deleteUser(Long id) throws UserNotFoundException, DataIntegrityViolationException {
        Optional<TransactionUsers> userOptional = userDao.findById(id);

        if (!userOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        userDao.deleteById(id);
    }


}