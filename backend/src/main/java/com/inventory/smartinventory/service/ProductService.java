package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.ProductRequest;
import com.inventory.smartinventory.entity.Category;
import com.inventory.smartinventory.entity.Product;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.CategoryRepository;
import com.inventory.smartinventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return productRepository.findAll();
        }
        return productRepository.searchProducts(query.trim());
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    @Transactional
    public Product createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Product product = new Product(
                category,
                request.getName(),
                request.getDescription(),
                request.getUnitPrice(),
                request.getReorderLevel()
        );
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setUnitPrice(request.getUnitPrice());
        product.setReorderLevel(request.getReorderLevel());

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        try {
            productRepository.delete(product);
        } catch (Exception e) {
            throw new BusinessRuleException("Cannot delete product as it has active inventory or order history.");
        }
    }
}
