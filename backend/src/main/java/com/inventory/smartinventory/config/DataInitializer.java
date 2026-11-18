package com.inventory.smartinventory.config;

import com.inventory.smartinventory.entity.*;
import com.inventory.smartinventory.entity.enums.*;
import com.inventory.smartinventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private PurchaseOrderItemRepository purchaseOrderItemRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users if not present
        User admin = userRepository.findByUsername("admin").orElse(null);
        User employee = userRepository.findByUsername("employee").orElse(null);

        if (admin == null) {
            admin = new User("admin", "admin@inventory.com", passwordEncoder.encode("admin123"), "System Administrator", UserRole.ADMIN);
            userRepository.save(admin);
        }
        if (employee == null) {
            employee = new User("employee", "employee@inventory.com", passwordEncoder.encode("employee123"), "Warehouse Associate", UserRole.EMPLOYEE);
            userRepository.save(employee);
        }

        // 2. Seed Categories if empty
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Consumer Electronics", "Enterprise laptops, tablets, displays, and desktop workstations"));
            categoryRepository.save(new Category("Warehouse Automation", "Handheld barcode scanners, RFID readers, and mobile computers"));
            categoryRepository.save(new Category("Industrial Machinery", "Hydraulic hand pallet trucks, stackers, and dock levelers"));
            categoryRepository.save(new Category("Network & Telecom", "Managed switches, fiber patch panels, and industrial routers"));
            categoryRepository.save(new Category("Packaging Materials", "Heavy corrugated shipping boxes, stretch films, and tamper seals"));
            categoryRepository.save(new Category("Industrial Safety & PPE", "ANSI safety helmets, high-visibility jackets, and footwear"));
        }

        // 3. Seed Warehouses if empty
        if (warehouseRepository.count() == 0) {
            Warehouse w1 = new Warehouse();
            w1.setName("West Zone Mega Fulfillment Hub");
            w1.setLocation("Bhiwandi, Mumbai, Maharashtra");
            w1.setCapacity(60000);
            w1.setContactNumber("+91 22 2847 9001");
            warehouseRepository.save(w1);

            Warehouse w2 = new Warehouse();
            w2.setName("North Regional Fulfillment Center");
            w2.setLocation("IMT Manesar, Gurugram, NCR");
            w2.setCapacity(45000);
            w2.setContactNumber("+91 124 455 9002");
            warehouseRepository.save(w2);

            Warehouse w3 = new Warehouse();
            w3.setName("South Tech Logistics Depot");
            w3.setLocation("Whitefield, Bengaluru, Karnataka");
            w3.setCapacity(50000);
            w3.setContactNumber("+91 80 6777 9003");
            warehouseRepository.save(w3);

            Warehouse w4 = new Warehouse();
            w4.setName("East Distribution Center");
            w4.setLocation("Dankuni Industrial Corridor, Kolkata");
            w4.setCapacity(35000);
            w4.setContactNumber("+91 33 2288 9004");
            warehouseRepository.save(w4);
        }

        // 4. Seed Suppliers if empty
        if (supplierRepository.count() == 0) {
            Supplier s1 = new Supplier();
            s1.setName("TechLogix Global Supplies India");
            s1.setContactPerson("Vikram Malhotra");
            s1.setEmail("procurement@techlogix.in");
            s1.setPhone("+91 80 4123 0199");
            s1.setAddress("Plot 14, Electronics City Phase 1, Bengaluru");
            supplierRepository.save(s1);

            Supplier s2 = new Supplier();
            s2.setName("Apex Industrial Machinery Corp");
            s2.setContactPerson("Rajesh Singhania");
            s2.setEmail("sales@apexmachinery.com");
            s2.setPhone("+91 20 6655 0144");
            s2.setAddress("MIDC Industrial Estate, Chakan, Pune");
            supplierRepository.save(s2);

            Supplier s3 = new Supplier();
            s3.setName("SwiftPack Packaging Solutions");
            s3.setContactPerson("Ananya Sen");
            s3.setEmail("orders@swiftpack.co.in");
            s3.setPhone("+91 22 4001 0288");
            s3.setAddress("Andheri East Logistics Park, Mumbai");
            supplierRepository.save(s3);

            Supplier s4 = new Supplier();
            s4.setName("Bharat Optical & Network Systems");
            s4.setContactPerson("Col. Arvind Verma");
            s4.setEmail("b2b@bharatnetwork.in");
            s4.setPhone("+91 120 488 9911");
            s4.setAddress("Sector 62, Institutional Area, Noida");
            supplierRepository.save(s4);
        }

        // 5. Seed Products & Inventory if empty
        if (productRepository.count() == 0) {
            Category cElectronics = categoryRepository.findAll().get(0);
            Category cAutomation = categoryRepository.findAll().get(1);
            Category cMachinery = categoryRepository.findAll().get(2);
            Category cNetwork = categoryRepository.findAll().get(3);
            Category cPackaging = categoryRepository.findAll().get(4);
            Category cSafety = categoryRepository.findAll().get(5);

            Warehouse whMumbai = warehouseRepository.findAll().get(0);
            Warehouse whGurugram = warehouseRepository.findAll().get(1);
            Warehouse whBengaluru = warehouseRepository.findAll().get(2);

            Product p1 = new Product(cElectronics, "SKU-LAP-5540", "Dell Latitude 5540 Enterprise Laptop", "Intel Core i7 13th Gen, 16GB RAM, 512GB SSD", new BigDecimal("68500.00"), 8);
            Product p2 = new Product(cAutomation, "SKU-SCN-2200", "Honeywell Voyager 2D Wireless Scanner", "Long-range Bluetooth barcode & QR scanner", new BigDecimal("8999.00"), 15);
            Product p3 = new Product(cAutomation, "SKU-PRN-4100", "Zebra ZD421 Industrial Label Printer", "High-speed 300dpi thermal transfer barcode printer", new BigDecimal("26450.00"), 10);
            Product p4 = new Product(cMachinery, "SKU-MHT-2500", "Hydraulic Hand Pallet Truck 2.5T", "Heavy duty polyurethane wheels, 2500kg lifting capacity", new BigDecimal("19800.00"), 5);
            Product p5 = new Product(cNetwork, "SKU-SWT-2400", "Cisco Catalyst 24-Port Managed Switch", "Gigabit PoE+ enterprise switch with 4x SFP+ uplinks", new BigDecimal("42500.00"), 6);
            Product p6 = new Product(cPackaging, "SKU-BOX-0500", "Heavy Duty Corrugated Boxes (Set of 200)", "7-Ply high crush resistance export packing boxes", new BigDecimal("5400.00"), 20);
            Product p7 = new Product(cSafety, "SKU-PPE-0100", "Karam Industrial Safety Helmet", "Ratchet suspension certified impact safety hard hat", new BigDecimal("1250.00"), 30);
            Product p8 = new Product(cAutomation, "SKU-MTR-1000", "Zebra TC21 Touch Mobile Computer", "Android 12 enterprise rugged handheld terminal", new BigDecimal("34500.00"), 7);

            productRepository.save(p1);
            productRepository.save(p2);
            productRepository.save(p3);
            productRepository.save(p4);
            productRepository.save(p5);
            productRepository.save(p6);
            productRepository.save(p7);
            productRepository.save(p8);

            // Seed Inventory allocations
            inventoryRepository.save(new Inventory(p1, whMumbai, 24, 4));
            inventoryRepository.save(new Inventory(p1, whBengaluru, 18, 2));
            inventoryRepository.save(new Inventory(p2, whMumbai, 42, 6));
            inventoryRepository.save(new Inventory(p2, whGurugram, 5, 0)); // Low stock trigger!
            inventoryRepository.save(new Inventory(p3, whMumbai, 14, 2));
            inventoryRepository.save(new Inventory(p4, whMumbai, 8, 1));
            inventoryRepository.save(new Inventory(p5, whBengaluru, 12, 1));
            inventoryRepository.save(new Inventory(p6, whMumbai, 150, 20));
            inventoryRepository.save(new Inventory(p7, whGurugram, 85, 10));
            inventoryRepository.save(new Inventory(p8, whBengaluru, 3, 0)); // Low stock trigger!

            // 6. Seed Purchase Orders
            if (purchaseOrderRepository.count() == 0) {
                Supplier sTechLogix = supplierRepository.findAll().get(0);
                Supplier sApex = supplierRepository.findAll().get(1);
                Supplier sSwift = supplierRepository.findAll().get(2);

                // PO 1 - Received
                PurchaseOrder po1 = new PurchaseOrder();
                po1.setPoNumber("PO-2026-0001");
                po1.setSupplier(sTechLogix);
                po1.setWarehouse(whMumbai);
                po1.setStatus(PurchaseOrderStatus.RECEIVED);
                po1.setTotalAmount(new BigDecimal("274000.00"));
                po1.setCreatedBy(admin);
                po1.setOrderDate(LocalDateTime.now().minusDays(12));
                po1.setExpectedDeliveryDate(LocalDate.now().minusDays(5));
                po1.setReceivedDate(LocalDateTime.now().minusDays(4));
                purchaseOrderRepository.save(po1);

                PurchaseOrderItem poi1 = new PurchaseOrderItem(po1, p1, 4, new BigDecimal("68500.00"));
                poi1.setReceivedQuantity(4);
                purchaseOrderItemRepository.save(poi1);

                // PO 2 - Received
                PurchaseOrder po2 = new PurchaseOrder();
                po2.setPoNumber("PO-2026-0002");
                po2.setSupplier(sSwift);
                po2.setWarehouse(whMumbai);
                po2.setStatus(PurchaseOrderStatus.RECEIVED);
                po2.setTotalAmount(new BigDecimal("54000.00"));
                po2.setCreatedBy(admin);
                po2.setOrderDate(LocalDateTime.now().minusDays(8));
                po2.setExpectedDeliveryDate(LocalDate.now().minusDays(2));
                po2.setReceivedDate(LocalDateTime.now().minusDays(1));
                purchaseOrderRepository.save(po2);

                PurchaseOrderItem poi2 = new PurchaseOrderItem(po2, p6, 10, new BigDecimal("5400.00"));
                poi2.setReceivedQuantity(10);
                purchaseOrderItemRepository.save(poi2);

                // PO 3 - Ordered
                PurchaseOrder po3 = new PurchaseOrder();
                po3.setPoNumber("PO-2026-0003");
                po3.setSupplier(sApex);
                po3.setWarehouse(whMumbai);
                po3.setStatus(PurchaseOrderStatus.ORDERED);
                po3.setTotalAmount(new BigDecimal("99000.00"));
                po3.setCreatedBy(admin);
                po3.setOrderDate(LocalDateTime.now().minusDays(3));
                po3.setExpectedDeliveryDate(LocalDate.now().plusDays(4));
                purchaseOrderRepository.save(po3);

                PurchaseOrderItem poi3 = new PurchaseOrderItem(po3, p4, 5, new BigDecimal("19800.00"));
                purchaseOrderItemRepository.save(poi3);

                // PO 4 - Approved (Ready for user to click "Receive Goods" during demo!)
                PurchaseOrder po4 = new PurchaseOrder();
                po4.setPoNumber("PO-2026-0004");
                po4.setSupplier(sTechLogix);
                po4.setWarehouse(whBengaluru);
                po4.setStatus(PurchaseOrderStatus.APPROVED);
                po4.setTotalAmount(new BigDecimal("68990.00"));
                po4.setCreatedBy(admin);
                po4.setOrderDate(LocalDateTime.now().minusDays(1));
                po4.setExpectedDeliveryDate(LocalDate.now().plusDays(6));
                purchaseOrderRepository.save(po4);

                PurchaseOrderItem poi4 = new PurchaseOrderItem(po4, p8, 2, new BigDecimal("34495.00"));
                purchaseOrderItemRepository.save(poi4);
            }

            // 7. Seed Customer Orders
            if (customerOrderRepository.count() == 0) {
                // Order 1: Delivered
                CustomerOrder o1 = new CustomerOrder();
                o1.setOrderNumber("ORD-2026-1001");
                o1.setCustomerName("Infosys Enterprise Procurement");
                o1.setCustomerEmail("it-procurement@infosys.com");
                o1.setCustomerPhone("+91 80 2852 0261");
                o1.setShippingAddress("Gate 4, Infosys City, Electronic City, Bengaluru - 560100");
                o1.setStatus(CustomerOrderStatus.DELIVERED);
                o1.setTotalAmount(new BigDecimal("137000.00"));
                o1.setCreatedBy(admin);
                o1.setOrderDate(LocalDateTime.now().minusDays(9));
                customerOrderRepository.save(o1);

                OrderItem oi1 = new OrderItem(o1, p1, 2, new BigDecimal("68500.00"), new BigDecimal("137000.00"));
                orderItemRepository.save(oi1);

                // Order 2: Shipped / Dispatched
                CustomerOrder o2 = new CustomerOrder();
                o2.setOrderNumber("ORD-2026-1002");
                o2.setCustomerName("Tata Consultancy Services Ltd");
                o2.setCustomerEmail("vendorops@tcs.com");
                o2.setCustomerPhone("+91 22 6778 9999");
                o2.setShippingAddress("TCS Banyan Park, Suren Road, Andheri East, Mumbai - 400093");
                o2.setStatus(CustomerOrderStatus.SHIPPED);
                o2.setTotalAmount(new BigDecimal("73998.00"));
                o2.setCreatedBy(admin);
                o2.setOrderDate(LocalDateTime.now().minusDays(5));
                customerOrderRepository.save(o2);

                OrderItem oi2 = new OrderItem(o2, p2, 6, new BigDecimal("8999.00"), new BigDecimal("53994.00"));
                OrderItem oi2b = new OrderItem(o2, p4, 1, new BigDecimal("19800.00"), new BigDecimal("19800.00"));
                orderItemRepository.save(oi2);
                orderItemRepository.save(oi2b);

                // Order 3: Confirmed (Ready to create shipment!)
                CustomerOrder o3 = new CustomerOrder();
                o3.setOrderNumber("ORD-2026-1003");
                o3.setCustomerName("Wipro Digital Solutions");
                o3.setCustomerEmail("infra@wipro.com");
                o3.setCustomerPhone("+91 80 2844 0011");
                o3.setShippingAddress("Doddakannelli, Sarjapur Road, Bengaluru - 560035");
                o3.setStatus(CustomerOrderStatus.CONFIRMED);
                o3.setTotalAmount(new BigDecimal("52900.00"));
                o3.setCreatedBy(admin);
                o3.setOrderDate(LocalDateTime.now().minusDays(2));
                customerOrderRepository.save(o3);

                OrderItem oi3 = new OrderItem(o3, p3, 2, new BigDecimal("26450.00"), new BigDecimal("52900.00"));
                orderItemRepository.save(oi3);

                // Order 4: Confirmed (Ready to dispatch shipment!)
                CustomerOrder o4 = new CustomerOrder();
                o4.setOrderNumber("ORD-2026-1004");
                o4.setCustomerName("Reliance Retail Logistics");
                o4.setCustomerEmail("supplies@relianceretail.com");
                o4.setCustomerPhone("+91 22 3555 1000");
                o4.setShippingAddress("Reliance Corporate Park, Thane-Belapur Road, Ghansoli, Navi Mumbai");
                o4.setStatus(CustomerOrderStatus.CONFIRMED);
                o4.setTotalAmount(new BigDecimal("85000.00"));
                o4.setCreatedBy(admin);
                o4.setOrderDate(LocalDateTime.now().minusDays(1));
                customerOrderRepository.save(o4);

                OrderItem oi4 = new OrderItem(o4, p5, 2, new BigDecimal("42500.00"), new BigDecimal("85000.00"));
                orderItemRepository.save(oi4);

                // Order 5: Pending (Ready for teacher/user to click "Confirm & Reserve Stock"!)
                CustomerOrder o5 = new CustomerOrder();
                o5.setOrderNumber("ORD-2026-1005");
                o5.setCustomerName("HCL Technologies Ltd");
                o5.setCustomerEmail("procure@hcl.com");
                o5.setCustomerPhone("+91 120 252 0917");
                o5.setShippingAddress("Plot 3A, Sector 126, Noida, Uttar Pradesh - 201303");
                o5.setStatus(CustomerOrderStatus.PENDING);
                o5.setTotalAmount(new BigDecimal("39600.00"));
                o5.setCreatedBy(admin);
                o5.setOrderDate(LocalDateTime.now());
                customerOrderRepository.save(o5);

                OrderItem oi5 = new OrderItem(o5, p4, 2, new BigDecimal("19800.00"), new BigDecimal("39600.00"));
                orderItemRepository.save(oi5);

                // 8. Seed Shipments
                if (shipmentRepository.count() == 0) {
                    // Delivered Shipment
                    Shipment sh1 = new Shipment();
                    sh1.setTrackingNumber("TRK-982341-BD");
                    sh1.setCustomerOrder(o1);
                    sh1.setWarehouse(whBengaluru);
                    sh1.setCarrier("BlueDart Express");
                    sh1.setStatus(ShipmentStatus.DELIVERED);
                    sh1.setShippedDate(LocalDateTime.now().minusDays(7));
                    sh1.setDeliveredDate(LocalDateTime.now().minusDays(5));
                    shipmentRepository.save(sh1);

                    // Dispatched Shipment
                    Shipment sh2 = new Shipment();
                    sh2.setTrackingNumber("TRK-847291-FX");
                    sh2.setCustomerOrder(o2);
                    sh2.setWarehouse(whMumbai);
                    sh2.setCarrier("FedEx Logistics");
                    sh2.setStatus(ShipmentStatus.DISPATCHED);
                    sh2.setShippedDate(LocalDateTime.now().minusDays(1));
                    shipmentRepository.save(sh2);

                    // Preparing Shipment (Ready for user to click "Dispatch"!)
                    Shipment sh3 = new Shipment();
                    sh3.setTrackingNumber("TRK-539201-DL");
                    sh3.setCustomerOrder(o3);
                    sh3.setWarehouse(whMumbai);
                    sh3.setCarrier("Delhivery Supply Chain");
                    sh3.setStatus(ShipmentStatus.PREPARING);
                    shipmentRepository.save(sh3);
                }

                // 9. Seed Stock Transactions (Historical Audit Trail)
                if (stockTransactionRepository.count() == 0) {
                    stockTransactionRepository.save(new StockTransaction(p1, whMumbai, TransactionType.STOCK_IN, 30, "PO-2026-0001", "Goods received from TechLogix Global", admin));
                    stockTransactionRepository.save(new StockTransaction(p6, whMumbai, TransactionType.STOCK_IN, 200, "PO-2026-0002", "Bulk packaging received from SwiftPack", admin));
                    stockTransactionRepository.save(new StockTransaction(p1, whBengaluru, TransactionType.STOCK_TRANSFER, 10, "TRF-2026-001", "Inter-warehouse stock rebalance Mumbai to Bengaluru", admin));
                    stockTransactionRepository.save(new StockTransaction(p1, whBengaluru, TransactionType.STOCK_OUT, 2, "ORD-2026-1001", "Order fulfilled: Tracking #TRK-982341-BD", admin));
                    stockTransactionRepository.save(new StockTransaction(p2, whMumbai, TransactionType.STOCK_OUT, 6, "ORD-2026-1002", "Order dispatched: Tracking #TRK-847291-FX", admin));
                    stockTransactionRepository.save(new StockTransaction(p3, whMumbai, TransactionType.STOCK_RESERVATION, 2, "ORD-2026-1003", "Stock reserved for Wipro Digital Solutions", admin));
                    stockTransactionRepository.save(new StockTransaction(p5, whBengaluru, TransactionType.STOCK_RESERVATION, 2, "ORD-2026-1004", "Stock reserved for Reliance Retail", admin));
                    stockTransactionRepository.save(new StockTransaction(p7, whGurugram, TransactionType.STOCK_ADJUSTMENT, 5, "ADJ-2026-092", "Physical audit reconciliation: surplus safety gear verified", admin));
                }
            }
        }
    }
}
