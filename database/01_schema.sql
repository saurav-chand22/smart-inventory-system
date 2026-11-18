-- ============================================================================
-- Smart Inventory and Supply Chain Management System
-- Database Schema Script (Phase 2: Database Development)
-- Compliant with 3NF, Foreign Keys, Indexes, and Constraints
-- ============================================================================

CREATE DATABASE IF NOT EXISTS smart_inventory_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_inventory_db;

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. Table: categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. Table: products
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    reorder_level INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT chk_product_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_product_reorder_level CHECK (reorder_level >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. Table: suppliers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. Table: warehouses
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    contact_number VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_warehouse_capacity CHECK (capacity > 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. Table: inventory
-- Tracks available and reserved stock for each product per warehouse
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    CONSTRAINT uq_inventory_product_warehouse UNIQUE (product_id, warehouse_id),
    CONSTRAINT chk_inv_qty_avail CHECK (quantity_available >= 0),
    CONSTRAINT chk_inv_qty_reserved CHECK (quantity_reserved >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. Table: supplier_product (Associative M:N Table)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    supplier_price DECIMAL(10, 2) NOT NULL,
    lead_time_days INT NOT NULL DEFAULT 7,
    CONSTRAINT fk_sp_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    CONSTRAINT fk_sp_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_supplier_product UNIQUE (supplier_id, product_id),
    CONSTRAINT chk_sp_price CHECK (supplier_price >= 0),
    CONSTRAINT chk_sp_lead_time CHECK (lead_time_days >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. Table: purchase_orders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_by BIGINT NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    received_date TIMESTAMP NULL,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_po_total_amount CHECK (total_amount >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. Table: purchase_order_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    ordered_quantity INT NOT NULL,
    received_quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_poi_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_poi_ordered_qty CHECK (ordered_quantity > 0),
    CONSTRAINT chk_poi_received_qty CHECK (received_quantity >= 0),
    CONSTRAINT chk_poi_unit_price CHECK (unit_price >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 10. Table: customer_orders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    shipping_address TEXT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_by BIGINT NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_co_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_co_total_amount CHECK (total_amount >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 11. Table: order_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_oi_quantity CHECK (quantity > 0),
    CONSTRAINT chk_oi_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_oi_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 12. Table: shipments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    carrier VARCHAR(100) NOT NULL,
    status ENUM('PREPARING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED') NOT NULL DEFAULT 'PREPARING',
    shipped_date TIMESTAMP NULL,
    estimated_delivery_date DATE,
    delivered_date TIMESTAMP NULL,
    CONSTRAINT fk_shipment_order FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE RESTRICT,
    CONSTRAINT fk_shipment_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 13. Table: stock_transactions (Audit Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    transaction_type ENUM('STOCK_IN', 'STOCK_OUT', 'STOCK_TRANSFER', 'STOCK_ADJUSTMENT', 'STOCK_RESERVATION', 'STOCK_RELEASE') NOT NULL,
    quantity INT NOT NULL,
    reference_id VARCHAR(50),
    description TEXT,
    created_by BIGINT NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_st_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_st_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_st_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Performance Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_inventory_lookup ON inventory(product_id, warehouse_id);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_co_number ON customer_orders(order_number);
CREATE INDEX idx_co_status ON customer_orders(status);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_stock_trans_type_date ON stock_transactions(transaction_type, transaction_date);