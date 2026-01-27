package com.example.controller;

import com.example.config.JwtUtil;
import com.example.dto.LoginRequestDTO;
import com.example.dto.LoginResponseDTO;
import com.example.entity.User;
import com.example.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.service.EmailService; // Added by Hamzah


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    private final UserService userService;

    @Autowired
    private EmailService emailService; // Added by Hamzah


    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    // LOGIN
//    @PostMapping("/login")
//    public User login(
//            @RequestParam String email,
//            @RequestParam String password
//    ) {
//        return userService.login(email, password);
//    }

//    @PostMapping("/login")
//    public User login(@Valid @RequestBody LoginRequestDTO dto) {
//        return userService.login(dto.getEmail(), dto.getPassword());
//    }

//    @PostMapping("/login")
//    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO dto) {
//
//        User user = userService.login(dto.getEmail(), dto.getPassword());
//
//        LoginResponseDTO response = new LoginResponseDTO();
//        response.setUserId(user.getId());
//        response.setFullName(user.getFullName());
//        response.setEmail(user.getEmail());
//        response.setMessage("Login successful");
//
//        return response;
//    }

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO dto) {

        User user = userService.login(dto.getEmail(), dto.getPassword());

        // Added by Hamzah - send login success email
        emailService.sendLoginSuccessMail(user);

        String token = jwtUtil.generateToken(user.getEmail());

        LoginResponseDTO response = new LoginResponseDTO();
        response.setUserId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setToken(token);
        response.setMessage("Login successful");
 
        return response;
    }
}
