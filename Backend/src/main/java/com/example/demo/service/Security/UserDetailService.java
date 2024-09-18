package com.example.demo.service.Security;

import com.example.demo.utility.JWT.JwtUtil;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.example.demo.Dao.TransactionUserDao;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.Security.UserDetail;
import com.example.demo.model.UserRole;

import java.util.Collection;
import java.util.Collections;
import java.util.logging.Logger;

@Service
public class UserDetailService implements UserDetailsService {
    private final TransactionUserDao transactionUserDao;
    private static final org.slf4j.Logger logger = LoggerFactory.getLogger(UserDetailService.class);
    @Autowired
    public UserDetailService(TransactionUserDao transactionUserDao) {
        this.transactionUserDao = transactionUserDao;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Attempting to load user: {}", username);
        // 通过用户名查找用户
        TransactionUser transactionUser = transactionUserDao.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        logger.info("User found: {}", username);
        //给用户赋予一个角色，并将其封装成UserDetail对象
        UserRole userRole = transactionUser.getRole();
        Collection<? extends GrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority(userRole.getRoleName()));
        return new UserDetail(transactionUser, authorities);
    }

    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        TransactionUser transactionUser = transactionUserDao.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        //给用户赋予一个角色，并将其封装成UserDetail对象
        UserRole userRole = transactionUser.getRole();
        Collection<? extends GrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority(userRole.getRoleName()));
        return new UserDetail(transactionUser, authorities);
    }

}