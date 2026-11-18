-- ============================================================================
-- Smart Inventory and Supply Chain Management System
-- Master Seed Data Script (Phase 2: Database Development)
-- Realistic Enterprise / College Demonstration Dataset (INR Currency)
-- ============================================================================

USE smart_inventory_db;

-- ----------------------------------------------------------------------------
-- 1. Seed Users (passwords: admin123, employee123)
-- BCrypt: $2a$10$wE9mN5nN2uT9eD0iB7k.OOV3y3x.Lq7jW1bY8c9r3k5j7e9f3b5x.
-- ----------------------------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active) VALUES
(1, 'admin', 'admin@inventory.com', '$2a$10$wE9mN5nN2uT9eD0iB7k.OOV3y3x.Lq7jW1bY8c9r3k5j7e9f3b5x.', 'System Administrator', 'ADMIN', TRUE),
(2, 'employee', 'employee@inventory.com', '$2a$10$wE9mN5nN2uT9eD0iB7k.OOV3y3x.Lq7jW1bY8c9r3k5j7e9f3b5x.', 'Warehouse Associate', 'EMPLOYEE', TRUE),
(3, 'procure_mgr', 'procure@inventory.com', '$2a$10$wE9mN5nN2uT9eD0iB7k.OOV3y3x.Lq7jW1bY8c9r3k5j7e9f3b5x.', 'Procurement Manager', 'EMPLOYEE', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = VALUES(role);

-- ----------------------------------------------------------------------------
-- 2. Seed Categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (id, name, description) VALUES
(1, 'Consumer Electronics & Computing', 'Enterprise laptops, workstations, tablets, and commercial displays'),
(2, 'Warehouse & Barcode Automation', 'Handheld 2D/QR scanners, industrial barcode printers, and mobile terminals'),
(3, 'Industrial Machinery & Handling', 'Hydraulic pallet jacks, semi-electric stackers, and material handling gear'),
(4, 'Networking & IT Infrastructure', 'Managed PoE+ network switches, industrial Wi-Fi access points, and rack units'),
(5, 'Packaging & Logistics Supplies', 'Heavy duty 7-ply corrugated shipping boxes, stretch films, and security seals'),
(6, 'Industrial Safety & PPE', 'ANSI certified impact safety helmets, cut-resistant gloves, and safety vests'),
(7, 'FMCG & Commercial Provisions', 'Fast-moving packaged foods, instant noodles, commercial coffee and beverages'),
(8, 'Raw Materials & Hardware', 'Copper conductors, t-slot aluminum extrusions, fasteners, and heavy hardware')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ----------------------------------------------------------------------------
-- 3. Seed Warehouses
-- ----------------------------------------------------------------------------
INSERT INTO warehouses (id, name, location, capacity, contact_number, status) VALUES
(1, 'Central Distribution Hub', '7500 S Pulaski Rd, Chicago / Bhiwandi Logistics Hub, Mumbai', 60000, '+91 22 2847 9001', 'ACTIVE'),
(2, 'West Coast Facility', 'MIDC Industrial Area, Chakan, Pune', 40000, '+91 20 6655 0144', 'ACTIVE'),
(3, 'North Regional Fulfillment Center', 'IMT Manesar Sector 8, Gurugram, Haryana', 50000, '+91 124 455 9002', 'ACTIVE'),
(4, 'South Tech Logistics Depot', 'Whitefield Industrial Corridor, Bengaluru, Karnataka', 55000, '+91 80 6777 9003', 'ACTIVE'),
(5, 'East India Distribution Terminal', 'Dankuni Logistics Complex, Kolkata, West Bengal', 35000, '+91 33 2288 9004', 'ACTIVE')
ON DUPLICATE KEY UPDATE location = VALUES(location), capacity = VALUES(capacity), status = VALUES(status);

-- ----------------------------------------------------------------------------
-- 4. Seed Suppliers
-- ----------------------------------------------------------------------------
INSERT INTO suppliers (id, name, contact_person, email, phone, address, status) VALUES
(1, 'TechLogix Global Supplies India', 'Vikram Malhotra', 'procurement@techlogix.in', '+91 80 4123 0199', 'Plot 14, Electronics City Phase 1, Bengaluru', 'ACTIVE'),
(2, 'Apex Industrial Machinery Corp', 'Rajesh Singhania', 'sales@apexmachinery.com', '+91 20 6655 0144', 'MIDC Industrial Estate, Chakan, Pune', 'ACTIVE'),
(3, 'SwiftPack Packaging Solutions', 'Ananya Sen', 'orders@swiftpack.co.in', '+91 22 4001 0288', 'Andheri East Logistics Park, Mumbai', 'ACTIVE'),
(4, 'Nestle & Commercial FMCG Wholesale', 'Suresh Kumar', 'orders@nestledistributors.in', '+91 11 4988 2300', 'Connaught Place Commercial Tower, New Delhi', 'ACTIVE'),
(5, 'Bharat Optical & Network Systems', 'Col. Arvind Verma', 'b2b@bharatnetwork.in', '+91 120 488 9911', 'Sector 62, Institutional Area, Noida', 'ACTIVE'),
(6, 'Karam Industrial Safety Products', 'Pooja Hegde', 'corporate@karamsafety.in', '+91 512 269 1101', 'D-12 Industrial Area, Kanpur, UP', 'ACTIVE')
ON DUPLICATE KEY UPDATE contact_person = VALUES(contact_person), phone = VALUES(phone), address = VALUES(address);

-- ----------------------------------------------------------------------------
-- 5. Seed Products (Realistic INR Pricing)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, category_id, sku, name, description, unit_price, reorder_level) VALUES
(1, 1, 'ELC-LAP-5540', 'Dell Latitude 5540 Enterprise Laptop', 'Intel Core i7 13th Gen, 16GB RAM, 512GB NVMe SSD, 15.6 FHD Display', 68500.00, 8),
(2, 2, 'AUT-SCN-2200', 'Honeywell Voyager 2D Wireless Barcode Scanner', 'Long-range Bluetooth 5.0 1D/2D and QR code scanner with charging base', 8999.00, 15),
(3, 2, 'AUT-PRN-4210', 'Zebra ZD421 Industrial Barcode Label Printer', 'Heavy duty 300dpi thermal transfer direct label printer with Ethernet/USB', 26450.00, 10),
(4, 3, 'MCH-PLJ-2500', 'Hydraulic Hand Pallet Truck 2.5T Heavy Duty', 'Polyurethane tandem load wheels, 2500kg lifting capacity, reinforced steel', 19800.00, 5),
(5, 4, 'NET-SWT-2400', 'Cisco Catalyst 24-Port Managed Gigabit PoE+ Switch', 'Layer 2/3 enterprise managed network switch with 4x 10G SFP+ uplinks', 42500.00, 6),
(6, 5, 'PKG-BOX-0500', 'Heavy Duty 7-Ply Corrugated Shipping Boxes (Bundle of 100)', 'Export grade high crush test packaging boxes 14x12x10 inches', 3600.00, 25),
(7, 6, 'SAF-HAT-0100', 'Karam Industrial Impact Safety Helmet', 'ANSI Z89.1 certified Class C high density polymer helmet with ratchet headband', 1250.00, 30),
(8, 2, 'AUT-MTR-1000', 'Zebra TC21 Touch Mobile Computer Terminal', 'Rugged Android 12 enterprise handheld terminal with integrated 2D imager', 34500.00, 7),
(9, 7, 'FMCG-MAG-0024', 'Maggi 2-Minute Masala Noodles (Carton of 24 Packs)', 'Wholesale master pack of authentic Nestlé Maggi 2-Minute Instant Masala Noodles', 360.00, 30),
(10, 7, 'FMCG-NES-1000', 'Nescafe Classic Instant Coffee (Commercial 1kg Pack)', '100% pure instant coffee granules in heavy moisture-barrier commercial pouch', 1450.00, 15),
(11, 1, 'ELC-LAP-450G', 'HP ProBook 450 G10 Business Laptop', 'Intel Core i5 13th Gen, 16GB DDR4, 512GB SSD, Windows 11 Pro', 54990.00, 8),
(12, 3, 'MCH-STK-1500', 'Semi-Electric Mobile Pallet Stacker 1.5T', 'Motorized battery lifting stacker, 1500kg capacity up to 3.0m mast height', 75000.00, 3),
(13, 5, 'PKG-FLM-0500', 'Industrial Cast Stretch Film Roll 500mm (Box of 4)', 'High clarity 23-micron pallet wrapping stretch film, 400m per roll', 1850.00, 30),
(14, 6, 'SAF-GLV-0012', 'Cut-Resistant Nitrile Work Gloves (Pack of 12 Pairs)', 'EN388 Level 5 cut protection, abrasion-resistant micro-foam palm coating', 950.00, 40),
(15, 7, 'FMCG-TEA-5000', 'Red Label Natural Care Tea (Commercial 5kg Bag)', 'Premium Assam CTC black tea infused with 5 Ayurvedic herbs for workplace pantries', 2100.00, 10),
(16, 4, 'NET-WAP-0600', 'Ubiquiti UniFi Pro Wi-Fi 6 Access Point', 'High-density enterprise ceiling mount dual-band Wi-Fi 6 wireless AP', 16800.00, 8)
ON DUPLICATE KEY UPDATE name = VALUES(name), unit_price = VALUES(unit_price), reorder_level = VALUES(reorder_level);

-- ----------------------------------------------------------------------------
-- 6. Seed Supplier-Product Associations
-- ----------------------------------------------------------------------------
INSERT INTO supplier_product (supplier_id, product_id, supplier_price, lead_time_days) VALUES
(1, 1, 61500.00, 5),
(1, 2, 7200.00, 4),
(1, 3, 21800.00, 6),
(1, 8, 28000.00, 7),
(1, 11, 48500.00, 5),
(2, 4, 15500.00, 10),
(2, 12, 62000.00, 14),
(3, 6, 2800.00, 3),
(3, 13, 1400.00, 3),
(4, 9, 275.00, 2),
(4, 10, 1150.00, 3),
(4, 15, 1680.00, 3),
(5, 5, 34500.00, 7),
(5, 16, 13500.00, 5),
(6, 7, 850.00, 4),
(6, 14, 680.00, 4)
ON DUPLICATE KEY UPDATE supplier_price = VALUES(supplier_price), lead_time_days = VALUES(lead_time_days);

-- ----------------------------------------------------------------------------
-- 7. Seed Inventory (Stock Allocations across Warehouses)
-- Guarantees stock exists in Central Distribution Hub (Warehouse 1) and other hubs!
-- Notice some items have low available stock to trigger low-stock alerts.
-- ----------------------------------------------------------------------------
INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved) VALUES
-- Warehouse 1: Central Distribution Hub
(1, 1, 35, 4),    -- Dell Laptops
(2, 1, 28, 6),    -- Barcode Scanners
(3, 1, 14, 2),    -- Label Printers
(4, 1, 12, 1),    -- Pallet Trucks
(5, 1, 3, 2),     -- Cisco Switches (reorder_level = 6 -> LOW STOCK ALERT!)
(6, 1, 180, 20),  -- Shipping Boxes
(7, 1, 85, 10),   -- Helmets
(8, 1, 16, 3),    -- Mobile Computers
(9, 1, 150, 20),  -- Maggi Noodles (150 available in Central Hub!)
(10, 1, 45, 5),   -- Nescafe Coffee
(11, 1, 20, 2),   -- HP Laptops
(12, 1, 2, 0),    -- Semi-Electric Stacker (reorder_level = 3 -> LOW STOCK ALERT!)
(13, 1, 120, 15), -- Stretch Film
(14, 1, 95, 10),  -- Safety Gloves
(15, 1, 25, 4),   -- Tea Packs
(16, 1, 18, 2),   -- UniFi APs

-- Warehouse 2: West Coast Facility (Pune)
(1, 2, 18, 0),
(2, 2, 12, 0),
(4, 2, 8, 0),
(6, 2, 90, 0),
(9, 2, 80, 0),
(10, 2, 20, 0),
(13, 2, 50, 0),
(14, 2, 40, 0),

-- Warehouse 3: North Regional Center (Gurugram)
(1, 3, 22, 2),
(2, 3, 15, 0),
(3, 3, 8, 0),
(7, 3, 60, 5),
(9, 3, 120, 10),
(10, 3, 30, 0),
(11, 3, 14, 0),

-- Warehouse 4: South Tech Depot (Bengaluru)
(1, 4, 40, 5),
(2, 4, 30, 2),
(3, 4, 15, 2),
(5, 4, 12, 0),
(8, 4, 20, 2),
(9, 4, 100, 0),
(16, 4, 25, 0),

-- Warehouse 5: East India Terminal (Kolkata)
(4, 5, 6, 0),
(6, 5, 80, 0),
(7, 5, 40, 0),
(9, 5, 75, 0),
(14, 5, 50, 0)
ON DUPLICATE KEY UPDATE quantity_available = VALUES(quantity_available), quantity_reserved = VALUES(quantity_reserved);

-- ----------------------------------------------------------------------------
-- 8. Seed Purchase Orders & Items
-- ----------------------------------------------------------------------------
INSERT INTO purchase_orders (id, po_number, supplier_id, warehouse_id, status, total_amount, created_by, order_date, expected_delivery_date, received_date) VALUES
(1, 'PO-2026-0001', 4, 1, 'RECEIVED', 112500.00, 1, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
(2, 'PO-2026-0002', 1, 1, 'RECEIVED', 1785000.00, 1, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(3, 'PO-2026-0003', 2, 2, 'ORDERED', 155000.00, 1, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), NULL),
(4, 'PO-2026-0004', 3, 1, 'APPROVED', 70000.00, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), NULL),
(5, 'PO-2026-0005', 5, 4, 'PENDING', 276000.00, 1, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), NULL),
(6, 'PO-2026-0006', 6, 3, 'RECEIVED', 42500.00, 1, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount), status = VALUES(status);

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, ordered_quantity, received_quantity, unit_price) VALUES
(1, 1, 9, 200, 200, 275.00),    -- 200 Maggi Packs
(2, 1, 10, 50, 50, 1150.00),    -- 50 Nescafe Jars
(3, 2, 1, 25, 25, 61500.00),    -- 25 Dell Laptops
(4, 2, 2, 35, 35, 7200.00),     -- 35 Barcode Scanners
(5, 3, 4, 10, 0, 15500.00),     -- 10 Pallet Trucks
(6, 4, 6, 25, 0, 2800.00),      -- 25 Box Bundles
(7, 5, 5, 8, 0, 34500.00),      -- 8 Cisco Switches
(8, 6, 7, 50, 50, 850.00)       -- 50 Helmets
ON DUPLICATE KEY UPDATE ordered_quantity = VALUES(ordered_quantity), received_quantity = VALUES(received_quantity);

-- ----------------------------------------------------------------------------
-- 9. Seed Customer Orders & Items
-- Diverse lifecycles: DELIVERED, SHIPPED, CONFIRMED, and PENDING (ready to test!)
-- ----------------------------------------------------------------------------
INSERT INTO customer_orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, status, total_amount, created_by, order_date) VALUES
(1, 'ORD-2026-1001', 'Tata Consultancy Services Ltd', 'procurement@tcs.com', '+91 22 6778 1000', 'TCS Olympus, Hiranandani Estate, Thane, Maharashtra - 400607', 'DELIVERED', 274000.00, 1, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(2, 'ORD-2026-1002', 'BigBasket Wholesale Hub', 'ops@bigbasket.com', '+91 80 4040 5050', 'Warehouse #12, Peenya Industrial Area, Bengaluru - 560058', 'DELIVERED', 32500.00, 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(3, 'ORD-2026-1003', 'Infosys Enterprise Solutions', 'vendor@infosys.com', '+91 80 2852 0261', 'Electronics City Phase 1, Hosur Road, Bengaluru - 560100', 'SHIPPED', 106894.00, 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 'ORD-2026-1004', 'Reliance Retail Hypermarkets', 'supplychain@ril.com', '+91 22 3555 5000', 'Reliance Corporate Park, Thane-Belapur Rd, Ghansoli, Navi Mumbai', 'CONFIRMED', 86400.00, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 'ORD-2026-1005', 'Wipro Digital Technologies', 'b2b@wipro.com', '+91 80 2844 0011', 'Sarjapur Road, Doddakannelli, Bengaluru - 560035', 'CONFIRMED', 85000.00, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 'ORD-2026-1006', 'Delhivery Logistics Terminal', 'procure@delhivery.com', '+91 124 671 9500', 'Sector 34, Gurugram, Haryana - 122001', 'PROCESSING', 103500.00, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 'ORD-2026-1007', 'Flipkart Internet Pvt Ltd', 'inventory@flipkart.com', '+91 80 4908 7777', 'Buildings Alyssa & Begonia, Embassy Tech Village, Bengaluru - 560103', 'PENDING', 346100.00, 1, NOW()),
(8, 'ORD-2026-1008', 'Apollo Hospitals Enterprise', 'logistics@apollohospitals.com', '+91 44 2829 0200', 'Greams Lane, Thousand Lights, Chennai - 600006', 'PENDING', 22450.00, 1, NOW())
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount), status = VALUES(status);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 4, 68500.00, 274000.00),    -- 4 Dell Laptops
(2, 2, 9, 50, 360.00, 18000.00),      -- 50 Maggi Packs
(3, 2, 10, 10, 1450.00, 14500.00),    -- 10 Nescafe Jars
(4, 3, 2, 6, 8999.00, 53994.00),      -- 6 Scanners
(5, 3, 3, 2, 26450.00, 52900.00),     -- 2 Label Printers
(6, 4, 9, 20, 360.00, 7200.00),       -- 20 Maggi Packs
(7, 4, 4, 4, 19800.00, 79200.00),     -- 4 Pallet Trucks
(8, 5, 5, 2, 42500.00, 85000.00),     -- 2 Cisco Switches
(9, 6, 8, 3, 34500.00, 103500.00),    -- 3 Zebra Mobile Computers
(10, 7, 1, 5, 68500.00, 342500.00),   -- 5 Dell Laptops
(11, 7, 9, 10, 360.00, 3600.00),      -- 10 Maggi Packs
(12, 8, 7, 12, 1250.00, 15000.00),    -- 12 Helmets
(13, 8, 14, 8, 950.00, 7600.00)       -- 8 Gloves
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), subtotal = VALUES(subtotal);

-- ----------------------------------------------------------------------------
-- 10. Seed Shipments
-- ----------------------------------------------------------------------------
INSERT INTO shipments (id, tracking_number, order_id, warehouse_id, carrier, status, shipped_date, estimated_delivery_date, delivered_date) VALUES
(1, 'TRK-982341-BD', 1, 1, 'BlueDart Express', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 'TRK-847291-FX', 2, 1, 'FedEx Logistics India', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 'TRK-739104-DL', 3, 4, 'Delhivery Supply Chain', 'DISPATCHED', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), NULL),
(4, 'TRK-539201-BD', 4, 1, 'BlueDart Express', 'PREPARING', NULL, DATE_ADD(NOW(), INTERVAL 3 DAY), NULL),
(5, 'TRK-473772-FX', 5, 1, 'FedEx Logistics India', 'PREPARING', NULL, DATE_ADD(NOW(), INTERVAL 4 DAY), NULL)
ON DUPLICATE KEY UPDATE status = VALUES(status), carrier = VALUES(carrier);

-- ----------------------------------------------------------------------------
-- 11. Seed Stock Transactions (Immutable Audit Trail)
-- ----------------------------------------------------------------------------
INSERT INTO stock_transactions (product_id, warehouse_id, transaction_type, quantity, reference_id, description, created_by, transaction_date) VALUES
(9, 1, 'STOCK_IN', 200, 'PO-2026-0001', 'Received initial bulk carton shipment of Maggi Noodles from Nestle', 1, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(10, 1, 'STOCK_IN', 50, 'PO-2026-0001', 'Received Nescafe Classic commercial packs from Nestle', 1, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(1, 1, 'STOCK_IN', 25, 'PO-2026-0002', 'Received Dell Latitude enterprise laptops from TechLogix', 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 1, 'STOCK_IN', 35, 'PO-2026-0002', 'Received Honeywell 2D scanners from TechLogix', 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, 1, 'STOCK_OUT', 4, 'ORD-2026-1001', 'Fulfillment dispatched for TCS Enterprise Order #ORD-2026-1001', 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(9, 1, 'STOCK_OUT', 50, 'ORD-2026-1002', 'Fulfillment dispatched for BigBasket Order #ORD-2026-1002', 1, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(10, 1, 'STOCK_OUT', 10, 'ORD-2026-1002', 'Fulfillment dispatched for BigBasket Order #ORD-2026-1002', 1, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 4, 'STOCK_OUT', 6, 'ORD-2026-1003', 'Dispatched from Bengaluru Hub for Infosys #ORD-2026-1003', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(9, 1, 'STOCK_RESERVATION', 20, 'ORD-2026-1004', 'Atomic stock reservation confirmed for Reliance Retail', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 1, 'STOCK_RESERVATION', 4, 'ORD-2026-1004', 'Atomic stock reservation confirmed for Reliance Retail', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 1, 'STOCK_RESERVATION', 2, 'ORD-2026-1005', 'Atomic stock reservation confirmed for Wipro Digital', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 3, 'STOCK_IN', 50, 'PO-2026-0006', 'Received safety helmets at Gurugram Depot from Karam', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 1, 'STOCK_TRANSFER', 5, 'TRF-2026-001', 'Inter-hub rebalancing transfer: 5 Laptops from Mumbai to Bengaluru Hub', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 1, 'STOCK_ADJUSTMENT', 10, 'ADJ-2026-081', 'Annual physical warehouse cycle audit reconciliation surplus', 1, DATE_SUB(NOW(), INTERVAL 1 DAY));
