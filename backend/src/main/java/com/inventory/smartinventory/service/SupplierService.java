package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.SupplierRequest;
import com.inventory.smartinventory.entity.Supplier;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
    }

    @Transactional
    public Supplier createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Supplier with email '" + request.getEmail() + "' already exists");
        }
        Supplier supplier = new Supplier();
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = getSupplierById(id);
        if (!supplier.getEmail().equalsIgnoreCase(request.getEmail()) && supplierRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Supplier with email '" + request.getEmail() + "' already exists");
        }
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            supplier.setStatus(request.getStatus());
        }
        return supplierRepository.save(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        try {
            supplierRepository.delete(supplier);
        } catch (Exception e) {
            throw new BusinessRuleException("Cannot delete supplier with active purchase orders.");
        }
    }
}
