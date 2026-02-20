package com.example.service;

import java.util.List;

import com.example.entity.Loyaltycard;

public interface LoyaltycardService {

   
    Loyaltycard createLoyaltycard(Loyaltycard loyaltycard);
    Loyaltycard getLoyaltycardById(Integer id);
    Loyaltycard getLoyaltycardByUserId(Integer userId);
    List<Loyaltycard> getAllLoyaltycards();
    Loyaltycard updateLoyaltycard(Integer id, Loyaltycard loyaltycard);
    void deleteLoyaltycard(Integer id);

  
    void updatePoints(Integer userId, int pointsChange);
}
