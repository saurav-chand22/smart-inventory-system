package com.inventory.smartinventory.repository;

import com.inventory.smartinventory.entity.CustomerOrder;
import com.inventory.smartinventory.entity.enums.CustomerOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);
    List<CustomerOrder> findByStatus(CustomerOrderStatus status);
    List<CustomerOrder> findAllByOrderByOrderDateDesc();
    Long countByStatus(CustomerOrderStatus status);
}
