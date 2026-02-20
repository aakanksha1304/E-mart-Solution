package com.example.service;

import com.example.dto.CategoryBrowseResponse;
import com.example.entity.Catmaster;
import com.example.entity.Product;
import com.example.repository.CatMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogServiceImpl implements CatalogService {

    private final CatMasterRepository catRepo;
    private final ProductService productService;

    public CatalogServiceImpl(CatMasterRepository catRepo,
            ProductService productService) {
        this.catRepo = catRepo;
        this.productService = productService;
    }

  
    @Override
    public List<Catmaster> getMainCategories() {
        return catRepo.findBySubcatIdIsNull();
    }

   
    @Override
    public List<Catmaster> getSubCategories(String catId) {
        return catRepo.findBySubcatId(catId);
    }

    
    @Override
    public List<Product> getProductsByCategory(Integer catMasterId) {
        return productService.getProductsByCategory(catMasterId);
    }

   
    @Override
    public CategoryBrowseResponse browseByCategory(String catId) {

        CategoryBrowseResponse response = new CategoryBrowseResponse();

       
        Catmaster category = catRepo.findByCatId(catId);
        if (category == null) {
            throw new RuntimeException("Category not found: " + catId);
        }

    
        List<Catmaster> subCategories = catRepo.findBySubcatId(catId);

       
        if (!subCategories.isEmpty()) {
            response.setHasSubCategories(true);
            response.setSubCategories(subCategories);
            response.setProducts(null); 
            return response;
        }

    
        List<Product> products = productService.getProductsByCategory(category.getId());

        response.setHasSubCategories(false);
        response.setSubCategories(null);
        response.setProducts(products); 

        return response;
    }
}
