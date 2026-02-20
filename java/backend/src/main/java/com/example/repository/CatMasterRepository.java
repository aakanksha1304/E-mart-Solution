package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entity.Catmaster;

import java.util.List;
import java.util.Optional;

public interface CatMasterRepository
        extends JpaRepository<Catmaster, Integer> {

    
    List<Catmaster> findBySubcatIdIsNull();

   
    List<Catmaster> findBySubcatId(String subcatId);

    
    Catmaster findByCatId(String catId);
        
    
}
