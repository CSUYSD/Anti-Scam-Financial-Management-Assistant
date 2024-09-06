package com.example.demo.service;

import com.example.demo.Dao.UserDao;
import com.example.demo.Dao.UserRoleDao;
import com.example.demo.model.LoginUser;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.Security.UserDetail;
import com.example.demo.model.UserRole;
import com.example.demo.utility.JWT.JwtUtil;
import com.github.alenfive.rocketapi.entity.vo.LoginVo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class SecurityService {
    private static final Logger logger = LoggerFactory.getLogger(SecurityService.class);
    private final PasswordEncoder passwordEncoder;
    private final UserDao userDao;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRoleDao userRoleDao;

    @Autowired
    public SecurityService(PasswordEncoder passwordEncoder, UserDao userDao, AuthenticationManager authenticationManager, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate, UserRoleDao userRoleDao) {
        this.passwordEncoder = passwordEncoder;
        this.userDao = userDao;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.userRoleDao = userRoleDao;
    }

    @Transactional
    public void saveUser(TransactionUser user) throws DataIntegrityViolationException {
        //检查用户名是否已存在
        if (userDao.findByUsername(user.getUsername()).isPresent()) {
            throw new DataIntegrityViolationException("User already exists");
        }
        // Encode the password before saving the user
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 获取 USER 角色
        UserRole userRole = userRoleDao.findByRole("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default user role not found"));

        // 设置用户角色
        user.setRole(userRole);

        userDao.save(user);
    }

    //用户登录功能，接收前端传来的用户名和密码，进行身份验证
    public ResponseEntity<Map<String, Object>> login(LoginVo loginVo) {
        logger.info("尝试登录用户: {}", loginVo.getUsername());
        try {
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginVo.getUsername(), loginVo.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);

            UserDetail userDetail = (UserDetail) authentication.getPrincipal();
            TransactionUser transactionUser = userDetail.getTransactionUser();

            // 获取用户角色
            String token = jwtUtil.generateToken(transactionUser.getId(), transactionUser.getUsername(), transactionUser.getRole().getRoleName());

            // 创建LoginUser对象并存入Redis
            LoginUser loginUser = new LoginUser(transactionUser, token);
            String redisKey = "login:" + transactionUser.getId();
            redisTemplate.opsForValue().set(redisKey, loginUser, 24, TimeUnit.HOURS);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", transactionUser.getUsername());

            logger.info("用户 {} 登录成功", loginVo.getUsername());
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            logger.error("用户 {} 登录失败: {}", loginVo.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "用户名或密码错误"));
        } catch (Exception e) {
            logger.error("登录过程中发生错误: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "登录过程中发生错误"));
        }
    }
}