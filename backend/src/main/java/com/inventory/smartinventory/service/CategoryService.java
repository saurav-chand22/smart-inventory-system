package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.CategoryRequest;
import com.inventory.smartinventory.entity.Category;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    @Transactional
    public Category createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BusinessRuleException("Category with name '" + request.getName() + "' already exists");
        }
        Category category = new Category(request.getName(), request.getDescription());
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = getCategoryById(id);
        if (!category.getName().equalsIgnoreCase(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new BusinessRuleException("Category with name '" + request.getName() + "' already exists");
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        try {
            categoryRepository.delete(category);
        } catch (Exception e) {
            throw new BusinessRuleException("Cannot delete category as it is currently associated with products.");
        }
    }
}
