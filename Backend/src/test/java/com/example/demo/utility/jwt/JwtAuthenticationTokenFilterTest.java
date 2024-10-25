package com.example.demo.utility.jwt;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;


import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;


import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.demo.service.security.UserDetailService;

import jakarta.servlet.ServletException;

@RunWith(MockitoJUnitRunner.class)
public class JwtAuthenticationTokenFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailService userDetailService;

    @InjectMocks
    private JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private MockFilterChain filterChain;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = new MockFilterChain();
    }

    @Test
    public void testDoFilterInternal_WithValidToken() throws ServletException, IOException {
        // Mock a valid token in the Authorization header
        String token = "Bearer validToken";
        request.addHeader("Authorization", token);

        // Mock JwtUtil methods
        when(jwtUtil.validateToken("validToken")).thenReturn(true);
        when(jwtUtil.getUserIdFromToken("validToken")).thenReturn(1L);  // Mock a user ID from the token
        when(jwtUtil.getRoleFromToken("validToken")).thenReturn("ROLE_USER");  // Mock a role from the token

        // Mock UserDetails
        UserDetails userDetails = mock(UserDetails.class);
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));

        // Mock getAuthorities and userDetailsService.loadUserById
        doReturn(authorities).when(userDetails).getAuthorities();
        when(userDetailService.loadUserById(1L)).thenReturn(userDetails);

        // Mock FilterChain
        FilterChain filterChain = mock(FilterChain.class);

        // Execute the filter
        jwtAuthenticationTokenFilter.doFilterInternal(request, response, filterChain);

        // Verify the token was validated
        verify(jwtUtil).validateToken("validToken");

        // Assert that the authentication is set in the SecurityContext
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().isAuthenticated()).isTrue();

        // Verify that the request was passed to the next filter in the chain
        verify(filterChain).doFilter(request, response);
    }



    @Test
    public void testDoFilterInternal_WithInvalidToken() throws ServletException, IOException {
        // Mock an invalid token
        String token = "Bearer invalidToken";
        request.addHeader("Authorization", token);

        // Mock JWT utility behavior
        when(jwtUtil.validateToken("invalidToken")).thenReturn(false);

        // Execute filter
        jwtAuthenticationTokenFilter.doFilterInternal(request, response, filterChain);

        // Verify that the token was validated
        verify(jwtUtil).validateToken("invalidToken");

        // Assert that no authentication is set in the security context
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    public void testDoFilterInternal_NoToken() throws ServletException, IOException {
        // No token in the header
        jwtAuthenticationTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert that no authentication is set in the security context
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    public void testDoFilterInternal_PublicEndpoint() throws ServletException, IOException {
        // Set the request URI to a public endpoint (e.g., /login)
        request.setRequestURI("/login");

        // Execute filter
        jwtAuthenticationTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert that no authentication is set in the security context for public endpoints
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}