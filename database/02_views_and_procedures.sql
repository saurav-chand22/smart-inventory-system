-- ============================================================================
-- Smart Inventory and Supply Chain Management System
-- Database Views and Stored Procedures (Phase 2: Database Development)
-- Demonstrates DBMS concepts: Joins, Nested Queries, Aggregates, Group By,
-- Having, Views, Stored Procedures, and Transaction Control (Commit/Rollback).
-- ============================================================================

USE smart_inventory_db;

-- ----------------------------------------------------------------------------
-- VIEW 1: vw_product_stock_overview
-- Demonstrates: LEFT JOIN, Aggregation (SUM, COALESCE), GROUP BY, CASE statements
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_product_stock_overview AS
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.id AS category_id,
    c.name AS category_name,
    p.unit_price,
    p.reorder_level,
    COALESCE(SUM(i.quantity_available), 0) AS total_available,
    COALESCE(SUM(i.quantity_reserved), 0) AS total_reserved,
    COALESCE(SUM(i.quantity_available + i.quantity_reserved), 0) AS total_physical_stock,
    (p.unit_price * COALESCE(SUM(i.quantity_available + i.quantity_reserved), 0)) AS total_inventory_value,
    CASE 
        WHEN COALESCE(SUM(i.quantity_available), 0) = 0 THEN 'OUT_OF_STOCK'
        WHEN COALESCE(SUM(i.quantity_available), 0) <= p.reorder_level THEN 'LOW_STOCK'
        ELSE 'ADEQUATE'
    END AS stock_status
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY p.id, p.sku, p.name, c.id, c.name, p.unit_price, p.reorder_level;

-- ----------------------------------------------------------------------------
-- VIEW 2: vw_low_stock_alerts
-- Demonstrates: HAVING clause, Nested aggregation filtering
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_low_stock_alerts AS
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    p.reorder_level,
    COALESCE(SUM(i.quantity_available), 0) AS current_available_stock,
    (p.reorder_level - COALESCE(SUM(i.quantity_available), 0)) AS deficit
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY p.id, p.sku, p.name, c.name, p.reorder_level
HAVING COALESCE(SUM(i.quantity_available), 0) <= p.reorder_level;

-- ----------------------------------------------------------------------------
-- VIEW 3: vw_warehouse_utilization
-- Demonstrates: Joins, Aggregate Functions, Mathematical calculations
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_warehouse_utilization AS
SELECT 
    w.id AS warehouse_id,
    w.name AS warehouse_name,
    w.location,
    w.capacity,
    COALESCE(SUM(i.quantity_available + i.quantity_reserved), 0) AS current_item_count,
    ROUND((COALESCE(SUM(i.quantity_available + i.quantity_reserved), 0) / w.capacity) * 100, 2) AS utilization_percentage,
    COUNT(DISTINCT i.product_id) AS distinct_products_stored
FROM warehouses w
LEFT JOIN inventory i ON w.id = i.warehouse_id
WHERE w.status = 'ACTIVE'
GROUP BY w.id, w.name, w.location, w.capacity;

-- ----------------------------------------------------------------------------
-- VIEW 4: vw_supplier_order_summary
-- Demonstrates: Aggregate functions (COUNT, SUM, AVG) grouped by Supplier
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_supplier_order_summary AS
SELECT 
    s.id AS supplier_id,
    s.name AS supplier_name,
    s.email,
    s.phone,
    COUNT(po.id) AS total_purchase_orders,
    COALESCE(SUM(po.total_amount), 0.00) AS total_spend,
    COALESCE(AVG(po.total_amount), 0.00) AS average_po_value,
    SUM(CASE WHEN po.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_orders,
    SUM(CASE WHEN po.status = 'RECEIVED' THEN 1 ELSE 0 END) AS completed_orders
FROM suppliers s
LEFT JOIN purchase_orders po ON s.id = po.supplier_id
GROUP BY s.id, s.name, s.email, s.phone;

-- ----------------------------------------------------------------------------
-- VIEW 5: vw_recent_order_activity
-- Demonstrates: Multi-table JOIN with Customer Orders and Shipments
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_recent_order_activity AS
SELECT 
    co.id AS order_id,
    co.order_number,
    co.customer_name,
    co.status AS order_status,
    co.total_amount,
    co.order_date,
    COUNT(oi.id) AS total_items,
    sh.tracking_number,
    sh.carrier,
    sh.status AS shipment_status
FROM customer_orders co
LEFT JOIN order_items oi ON co.id = oi.order_id
LEFT JOIN shipments sh ON co.id = sh.order_id
GROUP BY co.id, co.order_number, co.customer_name, co.status, co.total_amount, co.order_date, sh.tracking_number, sh.carrier, sh.status;

-- ----------------------------------------------------------------------------
-- STORED PROCEDURE 1: sp_reserve_stock_for_order
-- Demonstrates: Stored Procedure, Explicit Database Transaction,
-- Row Locking (FOR UPDATE), Conditional Validation, COMMIT and ROLLBACK.
-- ----------------------------------------------------------------------------
DELIMITER //

DROP PROCEDURE IF EXISTS sp_reserve_stock_for_order //
CREATE PROCEDURE sp_reserve_stock_for_order(
    IN p_order_id BIGINT,
    IN p_warehouse_id BIGINT,
    IN p_user_id BIGINT,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_product_id BIGINT;
    DECLARE v_quantity_needed INT;
    DECLARE v_available_stock INT;
    
    -- Cursor for iterating over order items
    DECLARE cur_items CURSOR FOR 
        SELECT product_id, quantity 
        FROM order_items 
        WHERE order_id = p_order_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- Error handler to trigger rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 500;
        SET p_message = 'Database error occurred during stock reservation. Transaction rolled back.';
    END;

    START TRANSACTION;

    -- Verify the order exists and is PENDING
    IF NOT EXISTS (SELECT 1 FROM customer_orders WHERE id = p_order_id AND status = 'PENDING') THEN
        ROLLBACK;
        SET p_status_code = 400;
        SET p_message = 'Order does not exist or is not in PENDING state.';
        LEAVE proc_label;
    END IF;

    -- Phase A: Check stock availability for all items
    OPEN cur_items;
    check_loop: LOOP
        FETCH cur_items INTO v_product_id, v_quantity_needed;
        IF v_done THEN
            LEAVE check_loop;
        END IF;

        -- Retrieve available stock with row-level lock
        SELECT COALESCE(quantity_available, 0) INTO v_available_stock
        FROM inventory
        WHERE product_id = v_product_id AND warehouse_id = p_warehouse_id
        FOR UPDATE;

        IF v_available_stock IS NULL OR v_available_stock < v_quantity_needed THEN
            CLOSE cur_items;
            ROLLBACK;
            SET p_status_code = 422;
            SET p_message = CONCAT('Insufficient stock for Product ID: ', v_product_id, '. Required: ', v_quantity_needed, ', Available: ', COALESCE(v_available_stock, 0));
            LEAVE proc_label;
        END IF;
    END LOOP;
    CLOSE cur_items;

    -- Phase B: Deduct available and add to reserved
    SET v_done = FALSE;
    OPEN cur_items;
    reserve_loop: LOOP
        FETCH cur_items INTO v_product_id, v_quantity_needed;
        IF v_done THEN
            LEAVE reserve_loop;
        END IF;

        UPDATE inventory
        SET quantity_available = quantity_available - v_quantity_needed,
            quantity_reserved = quantity_reserved + v_quantity_needed
        WHERE product_id = v_product_id AND warehouse_id = p_warehouse_id;

        -- Record immutable stock transaction audit entry
        INSERT INTO stock_transactions (
            product_id, warehouse_id, transaction_type, quantity, reference_id, description, created_by
        ) VALUES (
            v_product_id, p_warehouse_id, 'STOCK_RESERVATION', v_quantity_needed, 
            CONCAT('ORD-', p_order_id), CONCAT('Reserved for Order #', p_order_id), p_user_id
        );
    END LOOP;
    CLOSE cur_items;

    -- Phase C: Update order status to CONFIRMED
    UPDATE customer_orders
    SET status = 'CONFIRMED'
    WHERE id = p_order_id;

    COMMIT;
    SET p_status_code = 200;
    SET p_message = 'Order successfully confirmed and stock reserved.';
END //

-- ----------------------------------------------------------------------------
-- STORED PROCEDURE 2: sp_receive_purchase_order
-- Demonstrates: Atomic stock increment on receipt, updating PO status,
-- logging transactions, and transaction commitment.
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_receive_purchase_order //
CREATE PROCEDURE sp_receive_purchase_order(
    IN p_po_id BIGINT,
    IN p_user_id BIGINT,
    OUT p_status_code INT,
    OUT p_message VARCHAR(255)
)
po_proc_label: BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_product_id BIGINT;
    DECLARE v_ordered_qty INT;
    DECLARE v_warehouse_id BIGINT;
    DECLARE v_current_status VARCHAR(50);

    DECLARE cur_po_items CURSOR FOR 
        SELECT product_id, ordered_quantity 
        FROM purchase_order_items 
        WHERE purchase_order_id = p_po_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 500;
        SET p_message = 'Database error occurred during purchase order receiving. Rolled back.';
    END;

    START TRANSACTION;

    SELECT warehouse_id, status INTO v_warehouse_id, v_current_status
    FROM purchase_orders
    WHERE id = p_po_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 404;
        SET p_message = 'Purchase order not found.';
        LEAVE po_proc_label;
    END IF;

    IF v_current_status NOT IN ('ORDERED', 'APPROVED', 'PENDING') THEN
        ROLLBACK;
        SET p_status_code = 400;
        SET p_message = CONCAT('Cannot receive PO in status: ', v_current_status);
        LEAVE po_proc_label;
    END IF;

    OPEN cur_po_items;
    recv_loop: LOOP
        FETCH cur_po_items INTO v_product_id, v_ordered_qty;
        IF v_done THEN
            LEAVE recv_loop;
        END IF;

        -- Upsert inventory record
        INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved)
        VALUES (v_product_id, v_warehouse_id, v_ordered_qty, 0)
        ON DUPLICATE KEY UPDATE 
            quantity_available = quantity_available + v_ordered_qty;

        -- Update received quantity on order item
        UPDATE purchase_order_items
        SET received_quantity = v_ordered_qty
        WHERE purchase_order_id = p_po_id AND product_id = v_product_id;

        -- Record STOCK_IN transaction
        INSERT INTO stock_transactions (
            product_id, warehouse_id, transaction_type, quantity, reference_id, description, created_by
        ) VALUES (
            v_product_id, v_warehouse_id, 'STOCK_IN', v_ordered_qty,
            CONCAT('PO-', p_po_id), CONCAT('Stock received from PO #', p_po_id), p_user_id
        );
    END LOOP;
    CLOSE cur_po_items;

    -- Update PO status to RECEIVED
    UPDATE purchase_orders
    SET status = 'RECEIVED',
        received_date = CURRENT_TIMESTAMP
    WHERE id = p_po_id;

    COMMIT;
    SET p_status_code = 200;
    SET p_message = 'Purchase order received successfully and inventory updated.';
END //

DELIMITER ;
