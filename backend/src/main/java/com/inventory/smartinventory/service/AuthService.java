package com.inventory.smartinventory.service;

import com.inventory.smartinventory.config.JwtUtil;
import com.inventory.smartinventory.dto.AuthResponse;
import com.inventory.smartinventory.dto.LoginRequest;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessRuleException("Invalid username or password"));

        if (!user.getIsActive()) {
            throw new BusinessRuleException("User account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getFullName(), user.getRole().name());
    }
}
