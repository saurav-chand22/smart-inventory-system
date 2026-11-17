-- ============================================================================
-- Smart Inventory and Supply Chain Management System
-- Seed Data Script (Phase 2: Database Development)
-- Realistic College Viva / Demonstration Data
-- ============================================================================

USE smart_inventory_db;

-- ----------------------------------------------------------------------------
-- 1. Seed Users (passwords: admin123, employee123)
-- BCrypt .mF7C77j7Jv6bK9i8e7Y5yK9n3L0Y5e.g8e5s8e5w3q1v2z3C
-- ----------------------------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active) VALUES
(1, 'admin', 'admin@inventory.com', '.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'System Administrator', 'ADMIN', TRUE),
(2, 'employee', 'employee@inventory.com', '.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Warehouse Associate', 'EMPLOYEE', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- ----------------------------------------------------------------------------
-- 2. Seed Categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (id, name, description) VALUES
(1, 'Electronics & Scanners', 'Barcode scanners, handheld terminals, thermal printers and networking gear'),
(2, 'Warehouse Equipment', 'Pallet jacks, storage racks, carts, and handling machinery'),
(3, 'Packaging Materials', 'Corrugated boxes, bubble wrap, shrink wrap, and strapping bands'),
(4, 'Raw Materials', 'Industrial metals, copper wiring, tubing, and plastic resins'),
(5, 'Safety & PPE', 'Protective equipment, hard hats, safety goggles, and high-visibility vests')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ----------------------------------------------------------------------------
-- 3. Seed Suppliers
-- ----------------------------------------------------------------------------
INSERT INTO suppliers (id, name, contact_person, email, phone, address, status) VALUES
(1, 'TechLogix Global Supplies', 'Arthur Pendelton', 'sales@techlogix.com', '+1-312-555-0199', '100 Tech Blvd, Chicago, IL', 'ACTIVE'),
(2, 'Apex Industrial Machinery', 'Elena Rostova', 'contact@apexmachinery.com', '+1-206-555-0144', '450 Harbor Way, Seattle, WA', 'ACTIVE'),
(3, 'Metro Pack & Ship Co.', 'David Miller', 'orders@metropack.com', '+1-201-555-0182', '78 Industrial Pkwy, Newark, NJ', 'ACTIVE'),
(4, 'Vulcan Raw Metals Corp', 'Samantha Reed', 'info@vulcanmetals.com', '+1-412-555-0128', '890 Iron Works Rd, Pittsburgh, PA', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ----------------------------------------------------------------------------
-- 4. Seed Warehouses
-- ----------------------------------------------------------------------------
INSERT INTO warehouses (id, name, location, capacity, contact_number, status) VALUES
(1, 'Central Distribution Hub', '7500 S Pulaski Rd, Chicago, IL', 50000, '+1-312-555-9001', 'ACTIVE'),
(2, 'West Coast Facility', '1240 6th Ave S, Seattle, WA', 35000, '+1-206-555-9002', 'ACTIVE'),
(3, 'East Coast Logistics Center', '200 Port Terminal Blvd, Elizabeth, NJ', 40000, '+1-908-555-9003', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ----------------------------------------------------------------------------
-- 5. Seed Products
-- ----------------------------------------------------------------------------
INSERT INTO products (id, category_id, sku, name, description, unit_price, reorder_level) VALUES
(1, 1, 'ELC-SCN-001', 'Handheld 2D Barcode Scanner', 'Wireless Bluetooth 2D barcode scanner with charging cradle', 89.99, 15),
(2, 1, 'ELC-PRN-002', 'Industrial Thermal Label Printer', '4-inch heavy duty thermal barcode label printer 300dpi', 249.50, 10),
(3, 2, 'EQP-PLJ-001', 'Heavy Duty Hydraulic Pallet Jack', '5500 lbs capacity manual pallet truck with polyurethane wheels', 420.00, 5),
(4, 2, 'EQP-LAD-002', 'Rolling Warehouse Safety Ladder', '6-step steel safety ladder with lockable caster wheels', 185.00, 8),
(5, 3, 'PKG-BOX-001', 'Corrugated Box 12x12x12 Bundle (25pk)', 'Heavy duty single-wall kraft corrugated shipping boxes', 32.50, 50),
(6, 3, 'PKG-BBL-002', 'Perforated Bubble Cushioning Roll', '350ft x 12in clear bubble wrap for delicate goods packaging', 28.00, 40),
(7, 4, 'RAW-COP-001', 'Heavy Gauge Copper Wiring Spool (500m)', 'Pure annealed industrial copper conductor spool', 145.00, 15),
(8, 4, 'RAW-ALM-002', 'T-Slot Aluminum Extrusion 2020 (10pk)', 'Modular anodized aluminum framework rail 1000mm', 65.00, 25),
(9, 5, 'SAF-HAT-001', 'Vented Hard Hat with Ratchet Suspension', 'ANSI certified Class C industrial protective helmet', 22.00, 30),
(10, 5, 'SAF-GLV-002', 'Cut-Resistant Nitrile Coated Gloves (12pk)', 'Level 5 cut resistance heavy duty assembly gloves', 36.00, 45)
ON DUPLICATE KEY UPDATE sku = VALUES(sku);

-- ----------------------------------------------------------------------------
-- 6. Seed Supplier-Product Associations
-- ----------------------------------------------------------------------------
INSERT INTO supplier_product (supplier_id, product_id, supplier_price, lead_time_days) VALUES
(1, 1, 62.00, 5),
(1, 2, 185.00, 7),
(2, 3, 310.00, 10),
(2, 4, 130.00, 8),
(3, 5, 21.00, 3),
(3, 6, 17.50, 3),
(4, 7, 105.00, 14),
(4, 8, 45.00, 12),
(1, 9, 14.00, 4),
(3, 10, 22.00, 4)
ON DUPLICATE KEY UPDATE supplier_price = VALUES(supplier_price);

-- ----------------------------------------------------------------------------
-- 7. Seed Inventory (Stock distributed across Warehouses)
-- Notice some items have low stock to demonstrate low-stock alert views
-- ----------------------------------------------------------------------------
INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved) VALUES
-- Warehouse 1: Central Distribution Hub
(1, 1, 45, 5),
(2, 1, 8, 2),  -- Note: reorder_level is 10, total available is low!
(3, 1, 12, 1),
(4, 1, 14, 0),
(5, 1, 120, 25),
(6, 1, 90, 10),
(7, 1, 6, 0),  -- Note: reorder_level is 15, low stock!
(8, 1, 40, 5),
(9, 1, 75, 10),
(10, 1, 110, 15),

-- Warehouse 2: West Coast Facility
(1, 2, 20, 0),
(2, 2, 4, 1),
(3, 2, 4, 0),
(5, 2, 60, 10),
(6, 2, 35, 5),
(9, 2, 25, 5),
(10, 2, 40, 0),

-- Warehouse 3: East Coast Logistics Center
(1, 3, 30, 2),
(3, 3, 7, 0),
(5, 3, 80, 15),
(6, 3, 50, 0),
(7, 3, 18, 2),
(8, 3, 30, 0),
(9, 3, 40, 0)
ON DUPLICATE KEY UPDATE quantity_available = VALUES(quantity_available);

-- ----------------------------------------------------------------------------
-- 8. Seed Purchase Orders & Items
-- ----------------------------------------------------------------------------
INSERT INTO purchase_orders (id, po_number, supplier_id, warehouse_id, status, total_amount, created_by, order_date, expected_delivery_date, received_date) VALUES
(1, 'PO-2026-0001', 1, 1, 'RECEIVED', 4290.00, 1, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(2, 'PO-2026-0002', 3, 1, 'RECEIVED', 1160.00, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 'PO-2026-0003', 2, 2, 'ORDERED', 3100.00, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), NULL),
(4, 'PO-2026-0004', 4, 1, 'PENDING', 2100.00, 1, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), NULL)
ON DUPLICATE KEY UPDATE po_number = VALUES(po_number);

INSERT INTO purchase_order_items (purchase_order_id, product_id, ordered_quantity, received_quantity, unit_price) VALUES
(1, 1, 30, 30, 62.00),
(1, 2, 13, 13, 185.00),
(2, 5, 40, 40, 21.00),
(2, 6, 20, 20, 17.50),
(3, 3, 10, 0, 310.00),
(4, 7, 20, 0, 105.00);

-- ----------------------------------------------------------------------------
-- 9. Seed Customer Orders & Items
-- ----------------------------------------------------------------------------
INSERT INTO customer_orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, status, total_amount, created_by, order_date) VALUES
(1, 'ORD-2026-1001', 'Acme Logistics Inc.', 'procurement@acmelogistics.com', '+1-555-888-0101', '1200 Commercial Way, Chicago, IL 60601', 'DELIVERED', 1069.94, 2, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(2, 'ORD-2026-1002', 'Bayside Manufacturing', 'orders@baysidemfg.com', '+1-555-888-0102', '450 Dockside Ave, Seattle, WA 98101', 'SHIPPED', 699.00, 2, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 'ORD-2026-1003', 'Summit Freight Solutions', 'ops@summitfreight.com', '+1-555-888-0103', '900 Interstate Pkwy, Newark, NJ 07101', 'CONFIRMED', 452.48, 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'ORD-2026-1004', 'Horizon Retailers', 'inventory@horizonstore.com', '+1-555-888-0104', '300 Main St, Springfield, IL 62701', 'PENDING', 548.97, 2, NOW())
ON DUPLICATE KEY UPDATE order_number = VALUES(order_number);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 4, 89.99, 359.96),
(1, 2, 2, 249.50, 499.00),
(1, 5, 5, 32.50, 162.50),
(1, 10, 1, 36.00, 36.00),
(2, 3, 1, 420.00, 420.00),
(2, 4, 1, 185.00, 185.00),
(2, 9, 4, 22.00, 88.00),
(3, 1, 2, 89.99, 179.98),
(3, 6, 5, 28.00, 140.00),
(3, 5, 4, 32.50, 130.00),
(4, 1, 3, 89.99, 269.97),
(4, 9, 5, 22.00, 110.00),
(4, 10, 4, 36.00, 144.00);

-- ----------------------------------------------------------------------------
-- 10. Seed Shipments
-- ----------------------------------------------------------------------------
INSERT INTO shipments (id, tracking_number, order_id, warehouse_id, carrier, status, shipped_date, estimated_delivery_date, delivered_date) VALUES
(1, 'TRK-FX-99882201', 1, 1, 'FedEx Freight', 'DELIVERED', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'TRK-UPS-77441102', 2, 2, 'UPS Ground', 'IN_TRANSIT', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), NULL),
(3, 'TRK-DHL-33662203', 3, 3, 'DHL Express', 'PREPARING', NULL, DATE_ADD(NOW(), INTERVAL 3 DAY), NULL)
ON DUPLICATE KEY UPDATE tracking_number = VALUES(tracking_number);

-- ----------------------------------------------------------------------------
-- 11. Seed Stock Transactions (Immutable Audit Trail)
-- ----------------------------------------------------------------------------
INSERT INTO stock_transactions (product_id, warehouse_id, transaction_type, quantity, reference_id, description, created_by, transaction_date) VALUES
(1, 1, 'STOCK_IN', 30, 'PO-2026-0001', 'Received goods from Purchase Order #1', 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(2, 1, 'STOCK_IN', 13, 'PO-2026-0001', 'Received goods from Purchase Order #1', 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1, 1, 'STOCK_OUT', 4, 'ORD-2026-1001', 'Fulfilled items for Customer Order #1', 2, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 1, 'STOCK_OUT', 2, 'ORD-2026-1001', 'Fulfilled items for Customer Order #1', 2, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 1, 'STOCK_OUT', 5, 'ORD-2026-1001', 'Fulfilled items for Customer Order #1', 2, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(3, 2, 'STOCK_OUT', 1, 'ORD-2026-1002', 'Dispatched for Customer Order #2', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 3, 'STOCK_RESERVATION', 2, 'ORD-2026-1003', 'Reserved for confirmed Customer Order #3', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 3, 'STOCK_RESERVATION', 5, 'ORD-2026-1003', 'Reserved for confirmed Customer Order #3', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 1, 'STOCK_ADJUSTMENT', -2, 'ADJ-CYCLE-01', 'Cycle count discrepancy write-off', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(9, 1, 'STOCK_TRANSFER', 10, 'TRF-W1-W2', 'Inter-warehouse stock rebalancing transfer', 1, DATE_SUB(NOW(), INTERVAL 1 DAY));
