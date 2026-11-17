package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.ShipmentRequest;
import com.inventory.smartinventory.entity.*;
import com.inventory.smartinventory.entity.enums.CustomerOrderStatus;
import com.inventory.smartinventory.entity.enums.ShipmentStatus;
import com.inventory.smartinventory.entity.enums.TransactionType;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StockTransactionService stockTransactionService;

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));
    }

    @Transactional
    public Shipment createShipment(ShipmentRequest request, User user) {
        CustomerOrder order = customerOrderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with ID: " + request.getOrderId()));

        if (order.getStatus() != CustomerOrderStatus.CONFIRMED && order.getStatus() != CustomerOrderStatus.PROCESSING) {
            throw new BusinessRuleException("Order must be CONFIRMED or PROCESSING to create a shipment. Current status: " + order.getStatus());
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + request.getWarehouseId()));

        Shipment shipment = new Shipment();
        shipment.setTrackingNumber("TRK-" + (System.currentTimeMillis() % 1000000));
        shipment.setCustomerOrder(order);
        shipment.setWarehouse(warehouse);
        shipment.setCarrier(request.getCarrier());
        shipment.setStatus(ShipmentStatus.PREPARING);
        shipment.setEstimatedDeliveryDate(request.getEstimatedDeliveryDate());

        order.setStatus(CustomerOrderStatus.PROCESSING);
        customerOrderRepository.save(order);

        return shipmentRepository.save(shipment);
    }

    @Transactional(rollbackFor = Exception.class)
    public Shipment updateShipmentStatus(Long shipmentId, ShipmentStatus newStatus, User user) {
        Shipment shipment = getShipmentById(shipmentId);
        CustomerOrder order = shipment.getCustomerOrder();
        Warehouse warehouse = shipment.getWarehouse();

        if (newStatus == ShipmentStatus.DISPATCHED && shipment.getStatus() == ShipmentStatus.PREPARING) {
            shipment.setShippedDate(LocalDateTime.now());
            order.setStatus(CustomerOrderStatus.SHIPPED);

            for (OrderItem item : order.getItems()) {
                inventoryRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), warehouse.getId()).ifPresent(inv -> {
                    int consumeQty = Math.min(inv.getQuantityReserved(), item.getQuantity());
                    inv.setQuantityReserved(inv.getQuantityReserved() - consumeQty);
                    inventoryRepository.save(inv);

                    stockTransactionService.recordTransaction(
                            item.getProduct(), warehouse, TransactionType.STOCK_OUT,
                            consumeQty, shipment.getTrackingNumber(), "Order dispatched: Tracking #" + shipment.getTrackingNumber(), user
                    );
                });
            }
            customerOrderRepository.save(order);
        } else if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredDate(LocalDateTime.now());
            order.setStatus(CustomerOrderStatus.DELIVERED);
            customerOrderRepository.save(order);
        } else if (newStatus == ShipmentStatus.CANCELLED) {
            if (order != null && order.getStatus() == CustomerOrderStatus.PROCESSING) {
                order.setStatus(CustomerOrderStatus.CONFIRMED);
                customerOrderRepository.save(order);
            }
        }

        shipment.setStatus(newStatus);
        return shipmentRepository.save(shipment);
    }
}
