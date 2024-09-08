package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.Dao.UserDao;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.TransactionUserDTO;
import com.example.demo.model.Redis.LoginUser;
import com.example.demo.model.TransactionUser;
import com.example.demo.utility.JWT.JwtUtil;



@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserDao userDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    @Autowired
    public UserService(UserDao userDao, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate) {
        this.userDao = userDao;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
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

    @Transactional(readOnly = true)
    public Optional<TransactionUserDTO> getUserInfoByUserId(String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);
        String redisKey = "login_user:" + userId;
        LoginUser loginUser = (LoginUser) redisTemplate.opsForValue().get(redisKey);
        
//        if (loginUser != null) {
            return Optional.of(getUserInfoFromRedis(loginUser));
//        } else {
//            return userDao.findById(userId)
//                    .map(this::convertToDTO);
//        }
    }

    private TransactionUserDTO getUserInfoFromRedis(LoginUser loginUser) {
        TransactionUserDTO userDTO = new TransactionUserDTO();
        userDTO.setUsername(loginUser.getUsername());
        userDTO.setEmail(loginUser.getEmail());
        userDTO.setPhone(loginUser.getPhone());
        userDTO.setFullName(loginUser.getFullName());
        userDTO.setAccountName(loginUser.getAccountName());
        return userDTO;
    }

    private TransactionUserDTO convertToDTO(TransactionUser user) {
        TransactionUserDTO userDTO = new TransactionUserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        userDTO.setFullName(user.getFullName());
        List<Account> accounts = user.getAccounts();
        userDTO.setAccountName(accounts != null && !accounts.isEmpty() ? accounts.get(0).getAccountName() : "No linked account");

        return userDTO;
    }
}