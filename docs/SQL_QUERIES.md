# Smart Inventory & Supply Chain Management System
## Practical SQL Queries, Views Demonstration, and Integrity Proofs

---

## 1. 15 Practical SQL Queries for the Schema

### Query 1: Low-Stock Inventory Listing with Reorder Deficit (JOIN across 3 tables + HAVING)
*Explanation: Finds all products whose total available stock across warehouses is at or below the safety reorder threshold, calculating the shortage deficit.*
```sql
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    p.reorder_level,
    COALESCE(SUM(i.quantity_available), 0) AS total_available,
    (p.reorder_level - COALESCE(SUM(i.quantity_available), 0)) AS units_needed
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY p.id, p.sku, p.name, c.name, p.reorder_level
HAVING COALESCE(SUM(i.quantity_available), 0) <= p.reorder_level
ORDER BY units_needed DESC;
```

---

### Query 2: Warehouse Stock Valuation and Capacity Utilization (JOIN + Math Aggregates)
*Explanation: Calculates total physical units, available units, total inventory asset value, and percentage capacity utilized for each active warehouse.*
```sql
SELECT 
    w.id AS warehouse_id,
    w.name AS warehouse_name,
    w.capacity,
    COALESCE(SUM(i.quantity_available), 0) AS available_units,
    COALESCE(SUM(i.quantity_reserved), 0) AS reserved_units,
    COALESCE(SUM(i.quantity_available + i.quantity_reserved), 0) AS total_physical_units,
    ROUND((COALESCE(SUM(i.quantity_available + i.quantity_reserved), 0) / w.capacity) * 100, 2) AS capacity_utilization_pct,
    ROUND(COALESCE(SUM((i.quantity_available + i.quantity_reserved) * p.unit_price), 0.00), 2) AS total_valuation_usd
FROM warehouses w
LEFT JOIN inventory i ON w.id = i.warehouse_id
LEFT JOIN products p ON i.product_id = p.id
WHERE w.status = 'ACTIVE'
GROUP BY w.id, w.name, w.capacity
ORDER BY total_valuation_usd DESC;
```

---

### Query 3: Multi-Line Customer Orders Breakdown with Line Subtotals (JOIN across 4 tables)
*Explanation: Displays customer sales orders alongside individual line items, ordered quantities, unit prices, product names, and creator usernames.*
```sql
SELECT 
    co.order_number,
    co.customer_name,
    co.status AS order_status,
    co.order_date,
    u.username AS created_by_user,
    p.sku,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price,
    oi.subtotal,
    co.total_amount AS order_grand_total
FROM customer_orders co
JOIN users u ON co.created_by = u.id
JOIN order_items oi ON co.id = oi.order_id
JOIN products p ON oi.product_id = p.id
ORDER BY co.order_date DESC, oi.id ASC;
```

---

### Query 4: Pending Purchase Orders Requiring Approval or Reception (JOIN with Suppliers and Warehouses)
*Explanation: Lists procurement purchase orders in PENDING or ORDERED status with supplier contact details and receiving facility.*
```sql
SELECT 
    po.po_number,
    po.status AS po_status,
    s.name AS supplier_name,
    s.contact_person,
    s.phone AS supplier_phone,
    w.name AS receiving_warehouse,
    po.order_date,
    po.expected_delivery_date,
    po.total_amount
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
JOIN warehouses w ON po.warehouse_id = w.id
WHERE po.status IN ('PENDING', 'ORDERED')
ORDER BY po.expected_delivery_date ASC;
```

---

### Query 5: Full Stock Movement History for a Specific Product (Audit Trail Inquiry)
*Explanation: Retrieves the chronological audit ledger for product SKU 'ELC-SCN-001', showing movement types, positive/negative quantities, and operators.*
```sql
SELECT 
    st.transaction_date,
    p.sku,
    p.name AS product_name,
    w.name AS warehouse_name,
    st.transaction_type,
    st.quantity,
    st.reference_id,
    st.description,
    u.full_name AS operator_name
FROM stock_transactions st
JOIN products p ON st.product_id = p.id
JOIN warehouses w ON st.warehouse_id = w.id
JOIN users u ON st.created_by = u.id
WHERE p.sku = 'ELC-SCN-001'
ORDER BY st.transaction_date DESC;
```

---

### Query 6: Products With Zero Physical Stock in Any Warehouse (Correlated Subquery with NOT EXISTS)
*Explanation: Identifies products present in the catalog that currently have no inventory presence in any warehouse.*
```sql
SELECT 
    p.id,
    p.sku,
    p.name,
    c.name AS category_name,
    p.unit_price
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE NOT EXISTS (
    SELECT 1 
    FROM inventory i 
    WHERE i.product_id = p.id AND (i.quantity_available > 0 OR i.quantity_reserved > 0)
);
```

---

### Query 7: Top 3 Revenue-Generating Products Across All Customer Orders (GROUP BY + LIMIT)
*Explanation: Aggregates sales order lines to determine top products by gross revenue, filtering only for fulfilled or confirmed orders.*
```sql
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    SUM(oi.quantity) AS total_units_sold,
    ROUND(SUM(oi.subtotal), 2) AS total_sales_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN customer_orders co ON oi.order_id = co.id
WHERE co.status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED')
GROUP BY p.id, p.sku, p.name
ORDER BY total_sales_revenue DESC
LIMIT 3;
```

---

### Query 8: Active Shipments Tracking with Associated Customer Order and Carrier Details
*Explanation: Displays in-flight carrier dispatches, expected delivery timelines, and destination client names.*
```sql
SELECT 
    sh.tracking_number,
    sh.carrier,
    sh.status AS shipment_status,
    sh.shipped_date,
    sh.estimated_delivery_date,
    co.order_number,
    co.customer_name,
    co.shipping_address,
    w.name AS origin_warehouse
FROM shipments sh
JOIN customer_orders co ON sh.order_id = co.id
JOIN warehouses w ON sh.warehouse_id = w.id
WHERE sh.status IN ('PREPARING', 'DISPATCHED', 'IN_TRANSIT')
ORDER BY sh.estimated_delivery_date ASC;
```

---

### Query 9: Supplier Product Cost Comparison (Associative M:N Table Analysis)
*Explanation: Lists products offered by multiple vendors, displaying vendor price differentials and lead times.*
```sql
SELECT 
    p.sku,
    p.name AS product_name,
    s.name AS supplier_name,
    sp.supplier_price,
    p.unit_price AS retail_unit_price,
    ROUND((p.unit_price - sp.supplier_price), 2) AS gross_unit_margin,
    sp.lead_time_days
FROM supplier_product sp
JOIN suppliers s ON sp.supplier_id = s.id
JOIN products p ON sp.product_id = p.id
ORDER BY p.name ASC, sp.supplier_price ASC;
```

---

### Query 10: High-Value Customer Orders Exceeding Average Order Value (Nested Subquery)
*Explanation: Selects confirmed or completed customer orders whose total amount is strictly greater than the average customer order total.*
```sql
SELECT 
    co.id,
    co.order_number,
    co.customer_name,
    co.total_amount,
    co.status,
    co.order_date
FROM customer_orders co
WHERE co.total_amount > (
    SELECT AVG(total_amount) 
    FROM customer_orders 
    WHERE status != 'CANCELLED'
)
ORDER BY co.total_amount DESC;
```

---

### Query 11: Inventory Cross-Tabulation per Warehouse (Conditional CASE Aggregation)
*Explanation: Pivots inventory records to show available stock across Warehouse 1, Warehouse 2, and Warehouse 3 side-by-side.*
```sql
SELECT 
    p.sku,
    p.name AS product_name,
    SUM(CASE WHEN i.warehouse_id = 1 THEN i.quantity_available ELSE 0 END) AS chicago_hub_avail,
    SUM(CASE WHEN i.warehouse_id = 2 THEN i.quantity_available ELSE 0 END) AS west_coast_avail,
    SUM(CASE WHEN i.warehouse_id = 3 THEN i.quantity_available ELSE 0 END) AS east_coast_avail,
    COALESCE(SUM(i.quantity_available), 0) AS network_total_avail
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY p.id, p.sku, p.name
ORDER BY p.name ASC;
```

---

### Query 12: Daily Stock Activity Summary by Movement Type (Date Grouping)
*Explanation: Groups stock transaction volume by date and transaction type to observe warehouse intake versus dispatch throughput.*
```sql
SELECT 
    DATE(st.transaction_date) AS activity_date,
    st.transaction_type,
    COUNT(st.id) AS transaction_count,
    SUM(ABS(st.quantity)) AS total_units_moved
FROM stock_transactions st
GROUP BY DATE(st.transaction_date), st.transaction_type
ORDER BY activity_date DESC, st.transaction_type ASC;
```

---

### Query 13: Querying the Stock Overview View (`vw_product_stock_overview`)
*Explanation: Reads from the view to find all products classified as either 'LOW_STOCK' or 'OUT_OF_STOCK'.*
```sql
SELECT 
    sku,
    product_name,
    category_name,
    total_available,
    reorder_level,
    total_inventory_value,
    stock_status
FROM vw_product_stock_overview
WHERE stock_status IN ('LOW_STOCK', 'OUT_OF_STOCK')
ORDER BY total_available ASC;
```

---

### Query 14: Querying the Warehouse Utilization View (`vw_warehouse_utilization`)
*Explanation: Reads from the warehouse utilization view to locate facilities operating above 20% capacity.*
```sql
SELECT 
    warehouse_name,
    location,
    capacity,
    current_item_count,
    utilization_percentage,
    distinct_products_stored
FROM vw_warehouse_utilization
ORDER BY utilization_percentage DESC;
```

---

### Query 15: Querying the Supplier Summary View (`vw_supplier_order_summary`)
*Explanation: Reads from the supplier order summary view to report vendors with total procurement volume exceeding $1,000.*
```sql
SELECT 
    supplier_name,
    email,
    total_purchase_orders,
    total_spend,
    average_po_value,
    pending_orders,
    completed_orders
FROM vw_supplier_order_summary
WHERE total_spend > 1000.00
ORDER BY total_spend DESC;
```

---

## 2. Demonstrating Existing Views & Stored Procedures in MySQL Workbench

### 2.1 Inspecting the 5 Database Views

Run each `SELECT` statement in MySQL Workbench after selecting `smart_inventory_db`:

```sql
USE smart_inventory_db;

-- 1. Demonstrate View 1: Overall Stock Balances & Status Flags
SELECT * FROM vw_product_stock_overview;

-- 2. Demonstrate View 2: Low-Stock Deficit Alerts
SELECT * FROM vw_low_stock_alerts;

-- 3. Demonstrate View 3: Warehouse Capacity & Stored Items
SELECT * FROM vw_warehouse_utilization;

-- 4. Demonstrate View 4: Supplier Procurement Performance
SELECT * FROM vw_supplier_order_summary;

-- 5. Demonstrate View 5: Customer Order and Shipment Tracking Activity
SELECT * FROM vw_recent_order_activity;
```

---

### 2.2 Executing Stored Procedure 1: `sp_reserve_stock_for_order`

This procedure attempts to atomically reserve stock for Order #4 (`ORD-2026-1004`, status `PENDING`) at Warehouse #1 (`Central Distribution Hub`) executed by User #1 (`admin`).

```sql
USE smart_inventory_db;

-- Step 1: Declare session variables to capture OUT parameters
SET @v_status_code = 0;
SET @v_message = '';

-- Step 2: Execute procedure with Order ID 4, Warehouse ID 1, User ID 1
CALL sp_reserve_stock_for_order(4, 1, 1, @v_status_code, @v_message);

-- Step 3: Inspect procedure execution status
SELECT 
    @v_status_code AS returned_http_status, 
    @v_message AS returned_response_message;

-- Step 4: Verify Order #4 transitioned to CONFIRMED
SELECT id, order_number, status, total_amount 
FROM customer_orders 
WHERE id = 4;

-- Step 5: Verify stock reservation was logged in audit trail
SELECT * 
FROM stock_transactions 
WHERE reference_id = 'ORD-4' 
ORDER BY id DESC;
```

---

### 2.3 Executing Stored Procedure 2: `sp_receive_purchase_order`

This procedure receives incoming goods for Purchase Order #4 (`PO-2026-0004`, status `PENDING`) executed by User #1 (`admin`), increasing stock in Warehouse #1.

```sql
USE smart_inventory_db;

-- Step 1: Declare session variables
SET @v_po_status = 0;
SET @v_po_msg = '';

-- Step 2: Execute procedure for Purchase Order ID 4 by User ID 1
CALL sp_receive_purchase_order(4, 1, @v_po_status, @v_po_msg);

-- Step 3: Review return codes
SELECT 
    @v_po_status AS status_code, 
    @v_po_msg AS execution_message;

-- Step 4: Verify Purchase Order transitioned to RECEIVED
SELECT id, po_number, status, received_date 
FROM purchase_orders 
WHERE id = 4;

-- Step 5: Verify items were marked received
SELECT purchase_order_id, product_id, ordered_quantity, received_quantity 
FROM purchase_order_items 
WHERE purchase_order_id = 4;

-- Step 6: Verify STOCK_IN was audited
SELECT * 
FROM stock_transactions 
WHERE reference_id = 'PO-4' 
ORDER BY id DESC;
```

---

## 3. 5 Integrity Constraint Proofs (Testing DB Constraints)

These 5 SQL snippets demonstrate that the relational database schema strictly enforces data integrity, rejecting invalid operations with native database engine error messages.

### Proof 1: CHECK Constraint Violation on Product Unit Price (`chk_product_unit_price`)
*Test: Attempting to insert a product with a negative price (`-49.99`).*
```sql
USE smart_inventory_db;

INSERT INTO products (category_id, sku, name, unit_price, reorder_level)
VALUES (1, 'ERR-PRICE-NEG', 'Faulty Negative Price Item', -49.99, 10);
```
- **Expected Error**:
```
Error Code: 3819. Check constraint 'chk_product_unit_price' is violated.
```

---

### Proof 2: CHECK Constraint Violation on Available Inventory (`chk_inv_qty_avail`)
*Test: Attempting to insert or update an inventory balance to a negative quantity (`-5`).*
```sql
USE smart_inventory_db;

INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved)
VALUES (1, 1, -5, 0);
```
- **Expected Error**:
```
Error Code: 3819. Check constraint 'chk_inv_qty_avail' is violated.
```

---

### Proof 3: UNIQUE Constraint Violation on Product SKU (`products.sku`)
*Test: Attempting to insert a duplicate SKU (`ELC-SCN-001`), which is already assigned to the Handheld 2D Barcode Scanner.*
```sql
USE smart_inventory_db;

INSERT INTO products (category_id, sku, name, unit_price, reorder_level)
VALUES (1, 'ELC-SCN-001', 'Duplicate Scanner SKU Test', 99.00, 15);
```
- **Expected Error**:
```
Error Code: 1062. Duplicate entry 'ELC-SCN-001' for key 'products.sku'
```

---

### Proof 4: Foreign Key RESTRICT Violation on Category Deletion (`fk_products_category`)
*Test: Attempting to delete Category #1 (`Electronics & Scanners`), which has associated child rows in `products`.*
```sql
USE smart_inventory_db;

DELETE FROM categories 
WHERE id = 1;
```
- **Expected Error**:
```
Error Code: 1451. Cannot delete or update a parent row: a foreign key constraint fails (`smart_inventory_db`.`products`, CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT)
```

---

### Proof 5: Composite UNIQUE Constraint Violation on Inventory (`uq_inventory_product_warehouse`)
*Test: Attempting to insert a duplicate row for Product #1 at Warehouse #1, where a balance record already exists.*
```sql
USE smart_inventory_db;

INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved)
VALUES (1, 1, 50, 10);
```
- **Expected Error**:
```
Error Code: 1062. Duplicate entry '1-1' for key 'inventory.uq_inventory_product_warehouse'
```
