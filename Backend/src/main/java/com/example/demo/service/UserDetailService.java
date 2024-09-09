package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.example.demo.Dao.UserDao;
import com.example.demo.model.TransactionUsers;
import com.example.demo.model.UserDetail;
import com.example.demo.model.UserRole;

import java.util.Collection;
import java.util.Collections;

@Service
public class UserDetailService implements UserDetailsService {
    private final UserDao userDao;
    @Autowired
    public UserDetailService(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 通过用户名查找用户
        TransactionUsers transactionUsers = userDao.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        //给用户赋予一个角色，并将其封装成UserDetail对象
        UserRole userRole = transactionUsers.getRole();
        Collection<? extends GrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority(userRole.getRoleName()));
        return new UserDetail(transactionUsers, authorities);
    }

    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        TransactionUsers transactionUsers = userDao.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        //给用户赋予一个角色，并将其封装成UserDetail对象
        UserRole userRole = transactionUsers.getRole();
        Collection<? extends GrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority(userRole.getRoleName()));
        return new UserDetail(transactionUsers, authorities);
    }
    
}