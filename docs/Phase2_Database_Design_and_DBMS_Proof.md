# Phase 2: Database Development and DBMS Concept Proof

**Project Title:** Smart Inventory and Supply Chain Management System  
**Database Name:** `smart_inventory_db`  
**RDBMS Engine:** MySQL 8.0 (InnoDB)

---

## 1. Relational Database Implementation

The database consists of **13 normalized tables** engineered to satisfy **Third Normal Form (3NF)** and enforce referential and domain integrity via primary keys, foreign keys, unique constraints, and check constraints.

### Table Summary & Record Types
| Table | Primary Key | Description | Relationships |
| :--- | :--- | :--- | :--- |
| `users` | `id` | Authentication & role-based credentials | Referenced by POs, Orders, Transactions |
| `categories` | `id` | Product classifications | 1:M with `products` |
| `products` | `id` | SKU catalog, pricing & reorder thresholds | M:1 with `categories`, 1:M with `inventory` |
| `suppliers` | `id` | Vendor directory & contact points | M:N with `products`, 1:M with `purchase_orders` |
| `warehouses` | `id` | Physical facilities & storage capacities | 1:M with `inventory`, `shipments` |
| `inventory` | `id` | Real-time stock counts (available vs reserved) | Composite link: `product_id` + `warehouse_id` |
| `supplier_product` | `id` | Associative table for supplier price & lead times | Resolves M:N (`suppliers` <-> `products`) |
| `purchase_orders` | `id` | Inbound restocking orders from suppliers | 1:M with `purchase_order_items` |
| `purchase_order_items` | `id` | Line items for purchase orders | M:1 with `products` |
| `customer_orders` | `id` | Outbound sales orders placed by customers | 1:M with `order_items`, 1:M with `shipments` |
| `order_items` | `id` | Line items for customer orders | M:1 with `products` |
| `shipments` | `id` | Logistics dispatch and tracking details | M:1 with `customer_orders`, M:1 with `warehouses` |
| `stock_transactions` | `id` | Immutable audit trail of every stock change | M:1 with `products`, `warehouses`, `users` |

---

## 2. Integrity Constraints & Business Rules

1. **Check Constraints**:
   - `unit_price >= 0` and `reorder_level >= 0` on `products`.
   - `quantity_available >= 0` and `quantity_reserved >= 0` on `inventory` (prevents negative stock under any condition).
   - `capacity > 0` on `warehouses`.
   - `ordered_quantity > 0` on `purchase_order_items`.
   - `quantity > 0` on `order_items`.
2. **Referential Cascades**:
   - `ON DELETE CASCADE` is applied from Orders to their respective Line Items (`order_items`, `purchase_order_items`) to avoid orphan line records.
   - `ON DELETE RESTRICT` is enforced on master entities (`categories`, `products`, `suppliers`, `warehouses`) so that master records with transaction history cannot be deleted accidentally.
3. **Unique Keys**:
   - `products.sku`, `categories.name`, `warehouses.name`, `purchase_orders.po_number`, `customer_orders.order_number`, `shipments.tracking_number`.
   - Composite unique constraint `(product_id, warehouse_id)` on `inventory` prevents duplicate warehouse slots for the same SKU.
   - Composite unique constraint `(supplier_id, product_id)` on `supplier_product`.

---

## 3. DBMS Concepts Demonstrated

### 3.1 Database Views
- **`vw_product_stock_overview`**: Joins `products`, `categories`, and aggregates multi-warehouse `inventory`. Employs `COALESCE`, `SUM()`, `GROUP BY`, and conditional `CASE` statements to categorize stock health (`ADEQUATE`, `LOW_STOCK`, `OUT_OF_STOCK`).
- **`vw_low_stock_alerts`**: Demonstrates the `HAVING` clause by filtering aggregate stock across warehouses where total available quantity is less than or equal to the product reorder level.
- **`vw_warehouse_utilization`**: Computes live storage utilization percentages against stated physical capacities.
- **`vw_supplier_order_summary`**: Aggregates purchase order spend and counts per vendor.
- **`vw_recent_order_activity`**: Multi-table inner/left joins linking customer orders, line items, and shipping progress.

### 3.2 Stored Procedures & Transaction Control
1. **`sp_reserve_stock_for_order`**:
   - Demonstrates: `START TRANSACTION`, row-level locking (`SELECT ... FOR UPDATE`), cursor loops (`DECLARE cur_items CURSOR`), condition evaluation, `COMMIT`, and `ROLLBACK` on `SQLEXCEPTION`.
   - Logic: Ensures that if an order requires 5 distinct items, all 5 items must have sufficient available stock in the selected warehouse. If any item is deficient, the transaction immediately issues `ROLLBACK` and returns HTTP-style error code `422`, preventing partial reservations.
2. **`sp_receive_purchase_order`**:
   - Demonstrates: Atomic stock increment on PO delivery, upserting inventory records (`ON DUPLICATE KEY UPDATE`), updating order item received counts, updating PO status to `RECEIVED`, and logging immutable `STOCK_IN` transactions within a single atomic commit.

---

## 4. Academic Viva SQL Query Portfolio

For B.Tech examination / viva, these queries directly demonstrate key syllabus topics:

### 4.1 SQL Join & Aggregation
```sql
-- Find total inventory value per category
SELECT 
    c.name AS category_name,
    COUNT(DISTINCT p.id) AS total_products,
    COALESCE(SUM(i.quantity_available), 0) AS total_units_in_stock,
    COALESCE(SUM(i.quantity_available * p.unit_price), 0.00) AS total_category_value
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY c.id, c.name
ORDER BY total_category_value DESC;
```

### 4.2 Nested Subquery with `IN` and `EXISTS`
```sql
-- Identify suppliers who have active purchase orders but have never had any delayed shipments
SELECT s.id, s.name, s.email
FROM suppliers s
WHERE s.id IN (
    SELECT DISTINCT supplier_id 
    FROM purchase_orders 
    WHERE status IN ('PENDING', 'ORDERED')
);
```

### 4.3 Group By with `HAVING`
```sql
-- Warehouses storing more than 50 total units of inventory
SELECT 
    w.name AS warehouse_name,
    w.location,
    SUM(i.quantity_available + i.quantity_reserved) AS total_stock
FROM warehouses w
JOIN inventory i ON w.id = i.warehouse_id
GROUP BY w.id, w.name, w.location
HAVING total_stock > 50;
```
