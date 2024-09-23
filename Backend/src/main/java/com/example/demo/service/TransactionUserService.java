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

import com.example.demo.Dao.TransactionUserDao;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.TransactionUserDTO;
import com.example.demo.model.Redis.RedisUser;
import com.example.demo.model.TransactionUser;
import com.example.demo.utility.JWT.JwtUtil;





@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final TransactionUserDao transactionUserDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    @Autowired
    public UserService(TransactionUserDao transactionUserDao, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate) {
        this.transactionUserDao = transactionUserDao;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
    }

    public List<TransactionUser> findAll() {
        return transactionUserDao.findAll();
    }

    public Optional<TransactionUser> findById(Long id) {
        return transactionUserDao.findById(id);
    }

    public Optional<TransactionUser> findByUsername(String username) {
        return transactionUserDao.findByUsername(username);
    }

    public void updateUser(Long id, TransactionUser updatedUser) throws UserNotFoundException {
        Optional<TransactionUser> existingUserOptional = transactionUserDao.findById(id);

        if (!existingUserOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        TransactionUser existingUser = existingUserOptional.get();
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setPassword(updatedUser.getPassword());

        transactionUserDao.save(existingUser);
    }

    public void deleteUser(Long id) throws UserNotFoundException, DataIntegrityViolationException {
        Optional<TransactionUser> userOptional = transactionUserDao.findById(id);

        if (!userOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        transactionUserDao.deleteById(id);
    }

    public void updateAvatar(String token, String avatar) throws UserNotFoundException {
        token = token.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);
        Optional<TransactionUser> userOptional = transactionUserDao.findById(userId);

        if (!userOptional.isPresent()) {
            throw new UserNotFoundException("User not found");
        }
        
        TransactionUser user = userOptional.get();
        user.setAvatar(avatar);
        transactionUserDao.save(user);
    }


    @Transactional(readOnly = true)
    public Optional<TransactionUserDTO> getUserInfoByUserId(String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);
        String redisKey = "login_user:" + userId;
        RedisUser redisUser = (RedisUser) redisTemplate.opsForValue().get(redisKey);
        
        if (redisUser != null) {
            return Optional.of(getUserInfoFromRedis(redisUser));
        } else {
            return transactionUserDao.findById(userId)
                    .map(this::convertToDTO);
        }
    }

    private TransactionUserDTO getUserInfoFromRedis(RedisUser redisUser) {
        TransactionUserDTO userDTO = new TransactionUserDTO();
        userDTO.setUsername(redisUser.getUsername());
        userDTO.setEmail(redisUser.getEmail());
        userDTO.setPhone(redisUser.getPhone());
        userDTO.setAvatar(redisUser.getAvatar());
        userDTO.setAccountName(redisUser.getAccountName());
        return userDTO;
    }

    private TransactionUserDTO convertToDTO(TransactionUser user) {
        TransactionUserDTO userDTO = new TransactionUserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        userDTO.setAvatar(user.getAvatar());
        List<Account> accounts = user.getAccounts();
        userDTO.setAccountName(accounts != null && !accounts.isEmpty() ? accounts.get(0).getAccountName() : "No linked account");
        return userDTO;
    }
}