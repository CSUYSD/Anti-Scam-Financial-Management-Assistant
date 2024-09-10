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
import com.example.demo.model.Redis.LoginUser;
import com.example.demo.model.TransactionUser;
import com.example.demo.utility.JWT.JwtUtil;





@Service
public class TransactionUserService {
    private static final Logger logger = LoggerFactory.getLogger(TransactionUserService.class);
    private final TransactionUserDao transactionUserDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    @Autowired
    public TransactionUserService(TransactionUserDao transactionUserDao, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate) {
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
        LoginUser loginUser = (LoginUser) redisTemplate.opsForValue().get(redisKey);

        // 如果 Redis 中有用户信息，直接返回
        if (loginUser != null) {
            return Optional.of(getUserInfoFromRedis(loginUser));
        } else {
            // 如果 Redis 中没有用户信息，从数据库中获取
            return transactionUserDao.findById(userId)
                    .map(this::convertToDTO);
        }
    }

    private TransactionUserDTO getUserInfoFromRedis(LoginUser loginUser) {
        TransactionUserDTO userDTO = new TransactionUserDTO();
        userDTO.setUsername(loginUser.getUsername());
        userDTO.setEmail(loginUser.getEmail());
        userDTO.setPhone(loginUser.getPhone());
        userDTO.setAvatar(loginUser.getAvatar());
        userDTO.setAccountName(loginUser.getAccountName());
        return userDTO;
    }

    private TransactionUserDTO convertToDTO(TransactionUser user) {
        TransactionUserDTO userDTO = new TransactionUserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        userDTO.setAvatar(user.getAvatar());
        List<Account> accounts = user.getAccounts();
        for (Account account : accounts) {
            userDTO.getAccountName().add(account.getAccountName());
        }
        return userDTO;
    }
}