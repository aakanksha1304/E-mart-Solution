package com.example.repository;

import com.example.entity.Cartitem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.math.BigDecimal;

public interface CartItemRepository extends JpaRepository<Cartitem, Integer> {

    
    Optional<Cartitem> findByCart_IdAndProd_Id(Integer cartId, Integer prodId);

  
    List<Cartitem> findByCart_Id(Integer cartId);

 
    List<Cartitem> findByPriceSnapshot(BigDecimal priceSnapshot);

    Optional<Cartitem> findByCartIdAndProdId(Integer cartId, Integer prodId);

}
