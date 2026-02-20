package com.example.service;

import com.example.entity.Cart;
import com.example.entity.User;
import com.example.exception.GlobalExceptionHandler;
import com.example.repository.CartRepository;
import com.example.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, CartRepository cartRepository) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
    }

   

    private void validateUniqueFields(User user) {

        userRepository.findByEmail(user.getEmail())
                .ifPresent(u -> {
                    throw new GlobalExceptionHandler.DuplicateFieldException(
                            "Email already exists: " + user.getEmail());
                });

        if (user.getMobile() != null) {
            userRepository.findByMobile(user.getMobile())
                    .ifPresent(u -> {
                        throw new GlobalExceptionHandler.DuplicateFieldException(
                                "Mobile number already exists: " + user.getMobile());
                    });
        }
    }

  

    @Override
    public User saveUser(User user) {
        validateUniqueFields(user);

       
        if (user.getPasswordHash() != null) {
            user.setPasswordHash(
                    passwordEncoder.encode(user.getPasswordHash()));
        }

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
        userRepository.delete(user);
    }

    @Override
    public User updateUser(Integer id, User updatedUser) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setMobile(updatedUser.getMobile());
        existingUser.setAddress(updatedUser.getAddress());

        return userRepository.save(existingUser);
    }

   

    @Override
    public User register(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

       
        user.setProvider("LOCAL");

      
        user.setPasswordHash(
                passwordEncoder.encode(user.getPasswordHash()));

        User savedUser = userRepository.save(user);

      
        Cart cart = new Cart();
        cart.setUser(savedUser);
        cart.setIsActive('Y');
        cartRepository.save(cart);

        return savedUser;
    }

  

    @Override
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

       n
        if ("GOOGLE".equals(user.getProvider())) {
            throw new RuntimeException("Please login using Google");
        }

      
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user; 
    }

    
    @Override
    public User loginWithGoogle(String email, String fullName) {

       
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                 
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName(fullName);
                    newUser.setProvider("GOOGLE");
                    newUser.setPasswordHash(null); 

                    User saved = userRepository.save(newUser);

                  
                    Cart cart = new Cart();
                    cart.setUser(saved);
                    cart.setIsActive('Y');
                    cartRepository.save(cart);

                    return saved;
                });
    }

    @Override
    public java.util.Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
