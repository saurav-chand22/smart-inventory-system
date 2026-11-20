package com.inventory.smartinventory.config;

import com.inventory.smartinventory.entity.*;
import com.inventory.smartinventory.entity.enums.CustomerOrderStatus;
import com.inventory.smartinventory.entity.enums.ShipmentStatus;
import com.inventory.smartinventory.entity.enums.UserRole;
import com.inventory.smartinventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users if not present
        if (userRepository.count() == 0) {
            User admin = new User("admin", "admin@inventory.com", passwordEncoder.encode("admin123"), "System Administrator", UserRole.ADMIN);
            User employee = new User("employee", "employee@inventory.com", passwordEncoder.encode("employee123"), "Warehouse Associate", UserRole.EMPLOYEE);
            userRepository.save(admin);
            userRepository.save(employee);
        }

        // 2. Seed Categories if empty
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Electronics & Scanners", "Barcode scanners, printers, and handheld terminals"));
            categoryRepository.save(new Category("Warehouse Equipment", "Pallet jacks, storage racks, and handling machinery"));
            categoryRepository.save(new Category("Packaging Materials", "Boxes, bubble wrap, and strapping bands"));
            categoryRepository.save(new Category("Raw Materials", "Metals, copper wiring, and resins"));
            categoryRepository.save(new Category("Safety & PPE", "Protective equipment, hard hats, and gloves"));
        }

        // 3. Seed Warehouses if empty
        if (warehouseRepository.count() == 0) {
            Warehouse w1 = new Warehouse();
            w1.setName("Central Distribution Hub");
            w1.setLocation("7500 S Pulaski Rd, Chicago, IL");
            w1.setCapacity(50000);
            w1.setContactNumber("+1-312-555-9001");
            warehouseRepository.save(w1);

            Warehouse w2 = new Warehouse();
            w2.setName("West Coast Facility");
            w2.setLocation("1240 6th Ave S, Seattle, WA");
            w2.setCapacity(35000);
            w2.setContactNumber("+1-206-555-9002");
            warehouseRepository.save(w2);

            Warehouse w3 = new Warehouse();
            w3.setName("East Coast Logistics Center");
            w3.setLocation("200 Port Terminal Blvd, Elizabeth, NJ");
            w3.setCapacity(40000);
            w3.setContactNumber("+1-908-555-9003");
            warehouseRepository.save(w3);
        }

        // 4. Seed Suppliers if empty
        if (supplierRepository.count() == 0) {
            Supplier s1 = new Supplier();
            s1.setName("TechLogix Global Supplies");
            s1.setContactPerson("Arthur Pendelton");
            s1.setEmail("sales@techlogix.com");
            s1.setPhone("+1-312-555-0199");
            s1.setAddress("100 Tech Blvd, Chicago, IL");
            supplierRepository.save(s1);

            Supplier s2 = new Supplier();
            s2.setName("Apex Industrial Machinery");
            s2.setContactPerson("Elena Rostova");
            s2.setEmail("contact@apexmachinery.com");
            s2.setPhone("+1-206-555-0144");
            s2.setAddress("450 Harbor Way, Seattle, WA");
            supplierRepository.save(s2);
        }

        // 5. Seed sample products and inventory if empty
        if (productRepository.count() == 0) {
            Category cat1 = categoryRepository.findAll().get(0);
            Product p1 = new Product(cat1, "Handheld 2D Barcode Scanner", "Wireless Bluetooth scanner", new BigDecimal("89.99"), 15);
            Product p2 = new Product(cat1, "Industrial Thermal Label Printer", "4-inch heavy duty label printer", new BigDecimal("249.50"), 10);
            productRepository.save(p1);
            productRepository.save(p2);

            Warehouse wh1 = warehouseRepository.findAll().get(0);
            inventoryRepository.save(new Inventory(p1, wh1, 45, 5));
            inventoryRepository.save(new Inventory(p2, wh1, 8, 2));

            // 6. Seed sample Customer Orders and Items
            if (customerOrderRepository.count() == 0) {
                User adminUser = userRepository.findByUsername("admin").orElse(null);

                // Confirmed Order (ready for shipment)
                CustomerOrder o1 = new CustomerOrder();
                o1.setOrderNumber("ORD-19112026-1");
                o1.setCustomerName("Acme Logistics Inc.");
                o1.setCustomerEmail("procurement@acmelogistics.com");
                o1.setCustomerPhone("+91 98765 43210");
                o1.setShippingAddress("1200 Commercial Way, Cyber City, Gurugram");
                o1.setStatus(CustomerOrderStatus.CONFIRMED);
                o1.setTotalAmount(new BigDecimal("449.95"));
                o1.setCreatedBy(adminUser);
                customerOrderRepository.save(o1);

                OrderItem oi1 = new OrderItem(o1, p1, 5, new BigDecimal("89.99"), new BigDecimal("449.95"));
                orderItemRepository.save(oi1);

                // Pending Order (ready for Confirm & Reserve test)
                CustomerOrder o2 = new CustomerOrder();
                o2.setOrderNumber("ORD-19112026-2");
                o2.setCustomerName("Summit Retail Solutions");
                o2.setCustomerEmail("orders@summitretail.in");
                o2.setCustomerPhone("+91 98111 22233");
                o2.setShippingAddress("Plot 55, MIDC Industrial Area, Pune");
                o2.setStatus(CustomerOrderStatus.PENDING);
                o2.setTotalAmount(new BigDecimal("249.50"));
                o2.setCreatedBy(adminUser);
                customerOrderRepository.save(o2);

                OrderItem oi2 = new OrderItem(o2, p2, 1, new BigDecimal("249.50"), new BigDecimal("249.50"));
                orderItemRepository.save(oi2);

                // Sample Shipment
                if (shipmentRepository.count() == 0) {
                    Shipment sh1 = new Shipment();
                    sh1.setTrackingNumber("TRK-1");
                    sh1.setCustomerOrder(o1);
                    sh1.setWarehouse(wh1);
                    sh1.setCarrier("BlueDart Express");
                    sh1.setStatus(ShipmentStatus.PREPARING);
                    shipmentRepository.save(sh1);
                }
            }
        }
    }
}
