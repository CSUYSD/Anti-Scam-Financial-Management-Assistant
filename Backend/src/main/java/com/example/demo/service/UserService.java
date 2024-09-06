package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.example.demo.Dao.UserDao;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.TransactionUserDTO;
import com.example.demo.model.TransactionUser;
import com.example.demo.utility.JWT.JwtUtil;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserDao userDao;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserService(UserDao userDao, JwtUtil jwtUtil) {
        this.userDao = userDao;
        this.jwtUtil = jwtUtil;
    }

    public List<TransactionUser> findAll() {
        return userDao.findAll();
    }

    public Optional<TransactionUser> findById(Long id) {
        return userDao.findById(id);
    }

    public Optional<TransactionUser> findByUsername(String username) {
        return userDao.findByUsername(username);
    }

    public void updateUser(Long id, TransactionUser updatedUser) throws UserNotFoundException {
        Optional<TransactionUser> existingUserOptional = userDao.findById(id);

        if (!existingUserOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        TransactionUser existingUser = existingUserOptional.get();
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setPassword(updatedUser.getPassword());

        userDao.save(existingUser);
    }

    public void deleteUser(Long id) throws UserNotFoundException, DataIntegrityViolationException {
        Optional<TransactionUser> userOptional = userDao.findById(id);

        if (!userOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        userDao.deleteById(id);
    }

    public Optional<TransactionUserDTO> getUserInfoByUserId(String token) throws DataIntegrityViolationException {
        token = token.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);
        Optional<TransactionUser> userOptional = userDao.findById(userId);
        TransactionUser user = userOptional.get();
        TransactionUserDTO userDTO = new TransactionUserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        userDTO.setDOB(user.getDOB());
        userDTO.setFullName(user.getFullName());

        List<Account> accounts = user.getAccounts();
        if (!accounts.isEmpty()) {
            userDTO.setAccountName(accounts.get(0).getAccountName());
        } else {
            userDTO.setAccountName("No linked account");
        }
        return Optional.of(userDTO);
    }

}