package com.example.service;

import com.example.entity.*;
import com.example.exception.GlobalExceptionHandler;
import com.example.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LoyaltycardRepository loyaltycardRepository;

  
    private Loyaltycard getActiveLoyaltyCard(Integer userId) {
        Loyaltycard card = loyaltycardRepository.findByUser_Id(userId);
        if (card != null && (card.getIsActive() == 'Y' || card.getIsActive() == 'y')) {
            return card;
        }
        return null;
    }

   
    private int getUsedPointsInCart(Integer cartId) {
        return cartItemRepository.findByCart_Id(cartId).stream()
                .mapToInt(ci -> ci.getPointsUsed() != null ? ci.getPointsUsed() : 0)
                .sum();
    }

    @Override
    @Transactional
    public void addToCart(Integer userId, Integer productId, Integer quantity, String priceType) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        
        if (priceType == null || priceType.trim().isEmpty()) {
            priceType = "MRP";
        }
        priceType = priceType.toUpperCase();

       
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        
        Cart cart = user.getCart();
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setIsActive('Y');
            user.setCart(cart);
            cartRepository.save(cart);
        }

       
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

       
        Optional<Cartitem> existingItem =
                cartItemRepository.findByCartIdAndProdId(cart.getId(), productId);
        int currentItemPoints = existingItem.isPresent() ? (existingItem.get().getPointsUsed() != null ? existingItem.get().getPointsUsed() : 0) : 0;

      
        BigDecimal priceToUse;
        int pointsToUse = 0;

        if ("MRP".equals(priceType)) {
           
            priceToUse = product.getMrpPrice() != null ? product.getMrpPrice() : BigDecimal.ZERO;
        } 
        else if ("LOYALTY".equals(priceType)) {
            
            Loyaltycard loyaltyCard = getActiveLoyaltyCard(userId);
            if (loyaltyCard == null) {
                throw new RuntimeException("Loyalty pricing requires an active loyalty card");
            }
            if (product.getCardholderPrice() == null) {
                throw new RuntimeException("This product does not have a cardholder price");
            }
            priceToUse = product.getCardholderPrice();
            
            
            if (product.getPointsToBeRedeem() != null && product.getPointsToBeRedeem() > 0) {
                
                int newTotalQuantity = existingItem.isPresent() ? existingItem.get().getQuantity() + quantity : quantity;
                pointsToUse = product.getPointsToBeRedeem() * newTotalQuantity;
                
            
                int usedInCart = getUsedPointsInCart(cart.getId()) - currentItemPoints;
                int availablePoints = (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0) - usedInCart;
                
                if (pointsToUse > availablePoints) {
                    throw new RuntimeException(String.format(
                        "Insufficient loyalty points. Required: %d, Available: %d. Please remove items from cart to continue.",
                        pointsToUse, availablePoints
                    ));
                }
            }
        } 
        else if ("POINTS".equals(priceType)) {
           
            Loyaltycard loyaltyCard = getActiveLoyaltyCard(userId);
            if (loyaltyCard == null) {
                throw new RuntimeException("Points redemption requires an active loyalty card");
            }
            if (product.getPointsToBeRedeem() == null || product.getPointsToBeRedeem() <= 0) {
                throw new RuntimeException("This product cannot be purchased with points");
            }
            
          
            int newTotalQuantity = existingItem.isPresent() ? existingItem.get().getQuantity() + quantity : quantity;
            pointsToUse = product.getPointsToBeRedeem() * newTotalQuantity;
            
          
            int usedInCart = getUsedPointsInCart(cart.getId()) - currentItemPoints;
            int availablePoints = (loyaltyCard.getPointsBalance() != null ? loyaltyCard.getPointsBalance() : 0) - usedInCart;
            
            if (pointsToUse > availablePoints) {
                throw new RuntimeException(String.format(
                    "Insufficient loyalty points. Required: %d, Available: %d. Please remove items from cart to continue.",
                    pointsToUse, availablePoints
                ));
            }
            
          
            priceToUse = BigDecimal.ZERO;
        } 
        else {
            throw new RuntimeException(String.format(
                "Invalid price type: %s. Must be MRP, LOYALTY, or POINTS", priceType
            ));
        }

       
        if (existingItem.isPresent()) {
          
            Cartitem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.setPriceSnapshot(priceToUse);
            item.setPriceType(priceType);
            
           
            if ("POINTS".equals(priceType) || ("LOYALTY".equals(priceType) && product.getPointsToBeRedeem() != null && product.getPointsToBeRedeem() > 0)) {
                item.setPointsUsed((product.getPointsToBeRedeem() != null ? product.getPointsToBeRedeem() : 0) * item.getQuantity());
            } else {
                item.setPointsUsed(0);
            }
            
            cartItemRepository.save(item);

        } else {
            
            Cartitem newItem = new Cartitem();
            newItem.setCart(cart);
            newItem.setProd(product);
            newItem.setQuantity(quantity);
            newItem.setPriceSnapshot(priceToUse);
            newItem.setPriceType(priceType);
            newItem.setPointsUsed(pointsToUse);

            cartItemRepository.save(newItem);
        }
    }


    @Override
    public void removeFromCart(Integer userId, Integer productId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = user.getCart();
        if (cart == null) {
            throw new RuntimeException("Cart not found");
        }

        Cartitem item = cartItemRepository
                .findByCart_IdAndProd_Id(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        cartItemRepository.delete(item);
    }

    @Override
    public void viewCart(Integer userId) {
        Cart cart = cartRepository
                .findByUser_IdAndIsActive(userId, 'Y')
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartItemRepository.findByCart_Id(cart.getId())
                .forEach(i ->
                        System.out.println(
                                i.getProd().getProdName() +
                                " x " + i.getQuantity() +
                                " = " + i.getPriceSnapshot() +
                                " [" + i.getPriceType() + "]" +
                                " (Points: " + i.getPointsUsed() + ")"
                        )
                );
    }

    @Transactional
    public void deleteUser(Integer userId) {
        userRepository.deleteById(userId);
    }
}
