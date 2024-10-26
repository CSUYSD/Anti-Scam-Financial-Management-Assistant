package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import com.example.demo.model.redis.RedisAccount;
import com.example.demo.utility.GetCurrentUserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.repository.TransactionUserDao;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.dto.TransactionUserDTO;
import com.example.demo.model.redis.RedisUser;
import com.example.demo.model.TransactionUser;
import com.example.demo.utility.jwt.JwtUtil;





@Service
public class TransactionUserService {
    private static final Logger logger = LoggerFactory.getLogger(TransactionUserService.class);
    private final TransactionUserDao transactionUserDao;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final GetCurrentUserInfo  getCurrentUserInfo;

    private final PasswordEncoder passwordEncoder;
    @Autowired
    public TransactionUserService(TransactionUserDao transactionUserDao, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, PasswordEncoder passwordEncoder, GetCurrentUserInfo  getCurrentUserInfo) {
        this.transactionUserDao = transactionUserDao;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.passwordEncoder = passwordEncoder;
        this.getCurrentUserInfo = getCurrentUserInfo;

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

    public void updateUser(String token, TransactionUserDTO updatedUser) throws UserNotFoundException {
        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        Optional<TransactionUser> existingUserOptional = transactionUserDao.findById(userId);

        if (existingUserOptional.isEmpty()) {
            throw new UserNotFoundException("User not found");
        }

        TransactionUser existingUser = existingUserOptional.get();
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());

        transactionUserDao.save(existingUser);

        String redisUserKey = "login_user:" + userId + ":info";
        RedisUser redisUser = (RedisUser) redisTemplate.opsForValue().get(redisUserKey);

        if (redisUser != null) {
            // update user info in redis
            RedisUser updatedRedisUser = new RedisUser(
                    redisUser.getUserId(),
                    updatedUser.getUsername(),
                    updatedUser.getEmail(),
                    updatedUser.getPhone(),
                    redisUser.getAvatar(),
                    redisUser.getToken()
            );

            // save update user info into redis with same login session
            Long ttl = redisTemplate.getExpire(redisUserKey);
            if (ttl > 0) {
                redisTemplate.opsForValue().set(redisUserKey, updatedRedisUser, ttl, TimeUnit.SECONDS);
            } else {
                redisTemplate.opsForValue().set(redisUserKey, updatedRedisUser, 1, TimeUnit.HOURS);
            }
        }
    }

    // **提取的查找现有用户的方法
    private TransactionUser findExistingUser(Long id) throws UserNotFoundException {
        return transactionUserDao.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    // **提取的更新密码的方法
    private void updatePasswordIfNotEmpty(TransactionUser updatedUser, TransactionUser existingUser) {
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(updatedUser.getPassword());
            existingUser.setPassword(encodedPassword);
        }
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
        String userRedisKey = "login_user:" + userId + ":info";


        RedisUser redisUser = (RedisUser) redisTemplate.opsForValue().get(userRedisKey);

        // 如果 Redis 中有用户信息，直接返回
        if (redisUser != null) {
            return Optional.of(getUserInfoFromRedis(redisUser, userId));
        } else {
            // 如果 Redis 中没有用户信息，从数据库中获取
            return transactionUserDao.findById(userId)
                    .map(this::convertToDTO);
        }
    }

    private TransactionUserDTO getUserInfoFromRedis(RedisUser redisUser, Long userId) {
        TransactionUserDTO userDTO = setTransactionUserDTO(redisUser);

        List<String> accountNames = new ArrayList<>();
        String keyPattern = "login_user:" + userId + ":account*";
        Set<String> accountKeys = redisTemplate.keys(keyPattern);
        for (String key : accountKeys){
            if (key.equals("login_user:" + userId + ":account:initial placeholder")){
                continue;
            }
            String accountName = ((RedisAccount) redisTemplate.opsForValue().get(key)).getName();
            accountNames.add(accountName);
        }
        userDTO.setAccountName(accountNames);
        return userDTO;
    }

    private TransactionUserDTO convertToDTO(TransactionUser user) {
        TransactionUserDTO userDTO = setTransactionUserDTO(user);
        List<Account> accounts = user.getAccounts();
        for (Account account : accounts) {
            userDTO.getAccountName().add(account.getAccountName());
        }
        return userDTO;
    }

    private TransactionUserDTO setTransactionUserDTO(Object user) {
        TransactionUserDTO userDTO = new TransactionUserDTO();

        if (user instanceof TransactionUser transactionUser) {
            populateUserDTO(userDTO, transactionUser.getUsername(), transactionUser.getEmail(), transactionUser.getPhone(), transactionUser.getAvatar());
        } else if (user instanceof RedisUser redisUser) {
            populateUserDTO(userDTO, redisUser.getUsername(), redisUser.getEmail(), redisUser.getPhone(), redisUser.getAvatar());
        } else {
            throw new IllegalArgumentException("Unsupported user type: " + user.getClass().getName());
        }

        return userDTO;
    }

    private void populateUserDTO(TransactionUserDTO userDTO, String username, String email, String phone, String avatar) {
        userDTO.setUsername(username);
        userDTO.setEmail(email);
        userDTO.setPhone(phone);
        userDTO.setAvatar(avatar);
    }

}