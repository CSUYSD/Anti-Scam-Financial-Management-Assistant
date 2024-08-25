package com.example.demo.service.impl;

import com.example.demo.Dao.UserDao;
import com.example.demo.model.LoginUser;
import com.example.demo.utility.JwtUtil;
import com.example.demo.model.TransactionUsers;
import com.example.demo.model.UserDetail;
import com.github.alenfive.rocketapi.entity.vo.LoginVo;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.service.spi.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl {

    private final PasswordEncoder passwordEncoder;
    private final UserDao userDao;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public AuthServiceImpl(PasswordEncoder passwordEncoder, UserDao userDao,
                           AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                           RedisTemplate<String, Object> redisTemplate) {
        this.passwordEncoder = passwordEncoder;
        this.userDao = userDao;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
    }

    public void saveUser(TransactionUsers user) throws DataIntegrityViolationException {
        //检查用户名是否已存在
        if (userDao.findByUsername(user.getUsername()).isPresent()) {
            throw new DataIntegrityViolationException("User already exists");
        }
        // Encode the password before saving the user
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userDao.save(user);
    }

        //用户登录功能，接收前端传来的用户名和密码，进行身份验证
        public ResponseEntity<Map<String, Object>> login(LoginVo loginVo) {
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(loginVo.getUsername(), loginVo.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);

            if (Objects.isNull(authentication)) {
                throw new ServiceException("Username or password error");
            }

            UserDetail userDetail = (UserDetail) authentication.getPrincipal();
            TransactionUsers user = userDetail.getTransactionUsers();

            String token = jwtUtil.generateToken(user.getId(), user.getUsername());

            // 创建LoginUser对象并存入Redis
            LoginUser loginUser = new LoginUser(user, token);
            String redisKey = "login:" + user.getId();
            redisTemplate.opsForValue().set(redisKey, loginUser, 24, TimeUnit.HOURS);

            Map<String, Object> map = new HashMap<>();
            map.put("token", token);
            return ResponseEntity.ok(map);
        }

        // 用户登出功能，接收前端传来的token，删除Redis中的登录信息
        public ResponseEntity<?> logout(HttpServletRequest request) {
            String token = request.getHeader("token");
            if (StringUtils.hasText(token)) {
                Claims claims = jwtUtil.parseJWT(token);
                String userId = claims.getSubject();
                String redisKey = "login:" + userId;
                redisTemplate.delete(redisKey);
            }
            return ResponseEntity.ok("Logged out successfully");
        }
}