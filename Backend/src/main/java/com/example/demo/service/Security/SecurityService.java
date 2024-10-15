package com.example.demo.service.Security;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.repository.TransactionUserDao;
import com.example.demo.repository.UserRoleDao;
import com.example.demo.exception.PasswordNotCorrectException;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.DTO.TransactionUserDTO;
import com.example.demo.model.Redis.RedisAccount;
import com.example.demo.model.Redis.RedisUser;
import com.example.demo.model.Security.UserDetail;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.UserRole;
import com.example.demo.utility.JWT.JwtUtil;
import com.example.demo.model.Security.LoginVo;

@Service
public class SecurityService {
    private static final Logger logger = LoggerFactory.getLogger(SecurityService.class);
    private final PasswordEncoder passwordEncoder;
    private final TransactionUserDao transactionUserDao;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRoleDao userRoleDao;

    @Autowired
    public SecurityService(PasswordEncoder passwordEncoder, TransactionUserDao transactionUserDao, AuthenticationManager authenticationManager, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, UserRoleDao userRoleDao) {
        this.passwordEncoder = passwordEncoder;
        this.transactionUserDao = transactionUserDao;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.userRoleDao = userRoleDao;
    }

    @Transactional
    public void saveUser(TransactionUserDTO userDTO) {
        if (transactionUserDao.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("User already exists");
        }
        
        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        UserRole userRole = userRoleDao.findByRole("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default user role not found"));

        TransactionUser user = new TransactionUser();
        BeanUtils.copyProperties(userDTO, user);
        user.setRole(userRole);

        transactionUserDao.save(user);
    }

    //Login
    public ResponseEntity<Map<String, Object>> login(LoginVo loginVo) {
        logger.info("尝试登录用户: {}", loginVo.getUsername());
        try {
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginVo.getUsername(), loginVo.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);

            UserDetail userDetail = (UserDetail) authentication.getPrincipal();
            TransactionUser transactionUser = userDetail.getTransactionUser();

            // **生成token
            String token = jwtUtil.generateToken(transactionUser.getId(), transactionUser.getUsername(), transactionUser.getRole().getRoleName());

            // **Redis 部分
            saveRedisUser(transactionUser, token);
            saveUserAccounts(transactionUser);

            //**保存
            logger.info("用户 {} 登录成功", loginVo.getUsername());
            return ResponseEntity.ok(Map.of("token", token, "username", transactionUser.getUsername()));
        } catch (AuthenticationException e) {
            logger.error("用户 {} 登录失败: {}", loginVo.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "用户名或密码错误"));
        } catch (Exception e) {
            logger.error("登录过程中发生错误: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "登录过程中发生错误"));
        }
    }

    // 提取的保存 Redis 用户信息的方法
    private void saveRedisUser(TransactionUser transactionUser, String token) {
        List<Account> accounts = transactionUser.getAccounts();
        RedisUser redisUser = new RedisUser(
                transactionUser.getId(),
                transactionUser.getUsername(),
                transactionUser.getEmail(),
                transactionUser.getPhone(),
                transactionUser.getAvatar(),
                token
        );

        String redisUserKey = "login_user:" + transactionUser.getId() + ":info";
        redisTemplate.opsForValue().set(redisUserKey, redisUser, 1, TimeUnit.HOURS);
    }

    // 提取的保存用户账户信息的方法
    private void saveUserAccounts(TransactionUser transactionUser) {
        List<Account> accounts = transactionUser.getAccounts();
        String userAccountsKey = "login_user:" + transactionUser.getId() + ":account:" + "initial placeholder";
        if (accounts.isEmpty()) {
            redisTemplate.opsForValue().set(userAccountsKey, new ArrayList<>(), 1, TimeUnit.HOURS);
        } else {
            List<Long> accountIds = accounts.stream().map(Account::getId).collect(Collectors.toList());
            redisTemplate.opsForValue().set(userAccountsKey, accountIds, 1, TimeUnit.HOURS);

            for (Account account : accounts) {
                String redisAccountKey = "login_user:" + transactionUser.getId() + ":account:" + account.getId();
                RedisAccount redisAccount = new RedisAccount(
                        account.getId(),
                        account.getAccountName(),
                        account.getTotalIncome(),
                        account.getTotalExpense()
                );
                redisTemplate.opsForValue().set(redisAccountKey, redisAccount, 1, TimeUnit.HOURS);
            }
        }
    }

    // update password
    public void updatePassword(String token, Map<String, String> oldAndNewPwd) throws UserNotFoundException, PasswordNotCorrectException {
        token = token.replace("Bearer ", "");
        Long userId = jwtUtil.getUserIdFromToken(token);
        TransactionUser user = transactionUserDao.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("用户未找到"));

        String oldPassword = oldAndNewPwd.get("oldpassword");
        String newPassword = oldAndNewPwd.get("newpassword");

        // 使用 PasswordEncoder 的 matches 方法验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new PasswordNotCorrectException("原密码不正确");
        }

        // 加密新密码
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedNewPassword);
        transactionUserDao.save(user);
    }
}