package com.example.service;

import com.example.entity.Cartitem;
import com.example.entity.Loyaltycard;
import com.example.entity.*;
import com.example.exception.BadRequestException;
import com.example.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final LoyaltycardService loyaltycardService;

   
    public OrderServiceImpl(OrderRepository orderRepository,
            UserRepository userRepository,
            CartItemRepository cartItemRepository,
            OrderItemRepository orderItemRepository,
            LoyaltycardService loyaltycardService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderItemRepository = orderItemRepository;
        this.loyaltycardService = loyaltycardService;
    }

   
    @Override
    @Transactional
    public Ordermaster placeOrderFromCart(Integer userId, Integer cartId, String paymentMode) {
        try {
          
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BadRequestException("User not found with id: " + userId));

           
            if (cartId == null && user.getCart() != null) {
                cartId = user.getCart().getId();
            }

            if (cartId == null) {
                throw new BadRequestException("Cart ID is missing and could not be resolved.");
            }

            List<Cartitem> cartItems = cartItemRepository.findByCart_Id(cartId);

            if (cartItems.isEmpty()) {
                throw new BadRequestException("Cart is empty. Cannot place order.");
            }

     
            boolean hasNonMrpItems = cartItems.stream()
                    .anyMatch(ci -> ci.getPriceType() != null && !"MRP".equals(ci.getPriceType()));
            Loyaltycard loyaltyCard = null;

            if (hasNonMrpItems) {
                loyaltyCard = loyaltycardService.getLoyaltycardByUserId(userId);
                if (loyaltyCard == null) {
                    throw new BadRequestException(
                        "Loyalty card required for non-MRP pricing. Please use MRP pricing or obtain a loyalty card."
                    );
                }
                if (loyaltyCard.getIsActive() != 'Y' && loyaltyCard.getIsActive() != 'y') {
                    throw new BadRequestException(
                        "Your loyalty card is inactive. Please contact support or use MRP pricing."
                    );
                }
            }

           
            for (Cartitem item : cartItems) {
                Product product = item.getProd();
                String priceType = item.getPriceType() != null ? item.getPriceType() : "MRP"; // Default to MRP

                if ("LOYALTY".equals(priceType)) {
                    if (product.getCardholderPrice() == null) {
                        throw new BadRequestException(
                            String.format("Product '%s' is not eligible for cardholder pricing.", 
                                product.getProdName())
                        );
                    }
                } else if ("POINTS".equals(priceType)) {
                    if (product.getPointsToBeRedeem() == null || product.getPointsToBeRedeem() <= 0) {
                        throw new BadRequestException(
                            String.format("Product '%s' cannot be purchased with points.", 
                                product.getProdName())
                        );
                    }
                }
            }

            for (Cartitem item : cartItems) {
                Product product = item.getProd();
                String priceType = item.getPriceType() != null ? item.getPriceType() : "MRP"; // Default to MRP
                BigDecimal expectedPrice;

                if ("MRP".equals(priceType)) {
                    expectedPrice = product.getMrpPrice() != null ? product.getMrpPrice() : BigDecimal.ZERO;
                } else if ("LOYALTY".equals(priceType)) {
                    expectedPrice = product.getCardholderPrice() != null ? product.getCardholderPrice() : BigDecimal.ZERO;
                } else { 
                    expectedPrice = BigDecimal.ZERO;
                }

               
                BigDecimal priceSnapshot = item.getPriceSnapshot() != null ? item.getPriceSnapshot() : BigDecimal.ZERO;
                if (priceSnapshot.subtract(expectedPrice).abs().compareTo(new BigDecimal("0.01")) > 0) {
                    throw new BadRequestException(
                        String.format("Price mismatch for '%s'. Expected: %s, Stored: %s. Please refresh cart.",
                            product.getProdName(), expectedPrice, priceSnapshot)
                    );
                }
            }


            int totalPointsUsed = cartItems.stream()
                    .mapToInt(ci -> ci.getPointsUsed() != null ? ci.getPointsUsed() : 0)
                    .sum();

            if (totalPointsUsed > 0) {
                if (loyaltyCard == null) {
                    loyaltyCard = loyaltycardService.getLoyaltycardByUserId(userId);
                }

                if (loyaltyCard == null || (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0) < totalPointsUsed) {
                    throw new BadRequestException(
                        String.format("Insufficient loyalty points. Required: %d, Available: %d",
                            totalPointsUsed, loyaltyCard != null ? loyaltyCard.getPointsBalance() : 0)
                    );
                }
            }

          
            BigDecimal totalAmount = cartItems.stream()
                    .map(ci -> ci.getPriceSnapshot().multiply(BigDecimal.valueOf(ci.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

        
            Ordermaster ordermaster = new Ordermaster();
            ordermaster.setUser(user);
            ordermaster.setPaymentMode(paymentMode);
            ordermaster.setOrderStatus("Pending");
            ordermaster.setTotalAmount(totalAmount);
            ordermaster.setOrderDate(Instant.now()); 
            ordermaster.setItems(new ArrayList<>());

           
            Ordermaster savedOrder = orderRepository.save(ordermaster);

           
            for (Cartitem cartItem : cartItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setProduct(cartItem.getProd());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getPriceSnapshot());
                
                orderItem.setPointsUsed(cartItem.getPointsUsed() != null ? cartItem.getPointsUsed() : 0);
                orderItem.setPriceType(cartItem.getPriceType() != null ? cartItem.getPriceType() : "MRP");

                savedOrder.getItems().add(orderItem);
            }

          
            orderItemRepository.saveAll(savedOrder.getItems());

           

            return savedOrder;

        } catch (Exception e) {
           
            System.err.println("❌ ERROR in placeOrderFromCart:");
            System.err.println("Message: " + e.getMessage());
            System.err.println("Class: " + e.getClass().getName());
            e.printStackTrace();
            throw new RuntimeException("Order placement failed: " + e.getMessage(), e);
        }
    }

   
    @Override
    public List<Ordermaster> getAllOrders() {
        return orderRepository.findAll();
    }

   
    @Override
    public Ordermaster getOrderById(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    
    @Override
    public List<Ordermaster> getOrdersByUser(Integer userId) {
        return orderRepository.findByUserId(userId);
    }
}
