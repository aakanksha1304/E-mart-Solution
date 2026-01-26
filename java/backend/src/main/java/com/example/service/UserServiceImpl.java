package com.example.service;

import com.example.dto.RegisterRequest;
import com.example.entity.User;
import com.example.exception.GlobalExceptionHandler;
import com.example.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private void validateUniqueFields(User user) {

        userRepository.findByEmail(user.getEmail())
                .ifPresent(u -> {
                    throw new GlobalExceptionHandler.DuplicateFieldException(
                            "Email already exists: " + user.getEmail());
                });

        userRepository.findByMobile(user.getMobile())
                .ifPresent(u -> {
                    throw new GlobalExceptionHandler.DuplicateFieldException(
                            "Mobile number already exists: " + user.getMobile());
                });
    }

    @Override
    public User saveUser(User user) {
        validateUniqueFields(user);
        // 🔐 Encode password before storing
        user.setPasswordHash(
                passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.deleteById(id);
        userRepository.delete(user);
    }

    @Override
    public User updateUser(Integer id, User updatedUser) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update allowed fields only
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setMobile(updatedUser.getMobile());
        existingUser.setAddress(updatedUser.getAddress());

        return userRepository.save(existingUser);
    }

    // REGISTER USER
    @Override
    public User register(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // 🔐 HASH PASSWORD BEFORE SAVING
        user.setPasswordHash(
                passwordEncoder.encode(user.getPasswordHash())
        );

        return userRepository.save(user);
    }

    // LOGIN USER
    @Override
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔐 VERIFY PASSWORD
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user; // later you will generate JWT here
    }

}
