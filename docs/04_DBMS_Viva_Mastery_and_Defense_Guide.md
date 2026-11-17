# Smart Inventory and Supply Chain Management System
## DBMS Viva Mastery & Comprehensive Defense Guide

---

### Part 1: Relational Database Normalization Proof (1NF to 3NF)

#### Question: Prove that your database schema satisfies Third Normal Form (3NF).
**Answer:**
A relational schema is in **3NF** if and only if:
1. It is in **2NF**.
2. No non-prime attribute is transitively dependent on the primary key (i.e., every non-prime attribute depends **directly** on the candidate key: $X \to Y \implies X$ is a superkey, or $Y$ is a prime attribute).

Let's examine key entities from our schema:

##### 1. First Normal Form (1NF) Compliance:
- **Condition:** Every column contains only atomic (indivisible) values, and there are no repeating groups.
- **Proof:**
  - In `products`, attributes `sku`, `name`, `unit_price`, and `reorder_level` are scalar primitives.
  - In `warehouses`, `location` is atomic; we do not store multi-valued arrays of shelves or bins in a single string.
  - In `purchase_orders` and `customer_orders`, line items are decoupled into child tables `purchase_order_items` and `order_items` rather than comma-separated lists of products.

##### 2. Second Normal Form (2NF) Compliance:
- **Condition:** The table is in 1NF and contains **NO partial dependencies** (every non-prime attribute is fully functionally dependent on the entire primary key, not a proper subset).
- **Proof:**
  - In single-column primary key tables (`products`, `categories`, `warehouses`, `suppliers`), partial dependency is mathematically impossible because the candidate key is minimal (size = 1).
  - In composite tables:
    - In `supplier_product`: The composite key is $(supplier\_id, product\_id)$. Non-prime attributes are $supplier\_sku$ and $lead\_time\_days$. A supplier's specific lead time depends on **both** the specific supplier and the specific product. Neither $supplier\_id \to lead\_time\_days$ nor $product\_id \to lead\_time\_days$ holds individually. Hence, full functional dependency exists:
      $$(supplier\_id, product\_id) \to lead\_time\_days$$
    - In `inventory`: Composite candidate key $(warehouse\_id, product\_id)$ uniquely determines $quantity\_available$ and $quantity\_reserved$. The quantity available belongs specifically to that product stored at that warehouse. No partial dependency exists.

##### 3. Third Normal Form (3NF) Compliance:
- **Condition:** The table is in 2NF and contains **NO transitive dependencies** ($X \to Y$ and $Y \to Z$ where $Z$ is non-prime and $Y$ is not a candidate key).
- **Proof:**
  - In `products`:
    - Functional Dependencies: $product\_id \to category\_id$, $category\_id \to category\_name$.
    - *Anti-Pattern (Violation):* If `products` contained $category\_name$, then $product\_id \to category\_id \to category\_name$ would be a transitive dependency!
    - *Resolution:* $category\_name$ was isolated into the `categories` relation. `products` stores only the foreign key $category\_id$.
  - In `customer_orders` and `order_items`:
    - `customer_orders` holds order-level metadata ($order\_number$, $customer\_name$, $status$, $total\_amount$).
    - `order_items` holds item-level metadata ($order\_id$, $product\_id$, $quantity$, $unit\_price$, $subtotal$).
    - Product details like $product\_name$ or $category\_id$ are NOT duplicated in `order_items`, eliminating transitive redundancy.
    - Note on $unit\_price$ in `order_items`: This is **historical fact capture** (point-in-time pricing), not a transitive dependency on `product_id`. If the product price changes tomorrow in `products`, past executed orders must retain the historical purchase price.

---

### Part 2: ACID Transactions & Concurrency Control

#### Question: How does the system guarantee the ACID properties during inventory updates?

| ACID Property | Implementation in Smart Inventory System |
| :--- | :--- |
| **Atomicity** | Guaranteed via Spring `@Transactional(rollbackFor = Exception.class)` and MySQL InnoDB write-ahead logging (Undo Log). For example, when confirming an order with 5 items, if item 4 has insufficient stock, the transaction throws `InsufficientStockException`. The Undo Log immediately rolls back reservations for items 1, 2, and 3. All or nothing. |
| **Consistency** | Maintained via schema CHECK constraints (`CHECK (quantity_available >= 0)`, `CHECK (unit_price >= 0)`), Foreign Key integrity (`ON DELETE RESTRICT`), and business invariants. The database will reject any commit that causes negative physical stock. |
| **Isolation** | Default isolation level: **READ COMMITTED**. Prevents dirty reads. To prevent lost updates during concurrent checkout of the same product, the system employs **Pessimistic Locking** (`SELECT ... FOR UPDATE`), serializing write operations on the exact inventory row. |
| **Durability** | Guaranteed by InnoDB Redo Logs (`ib_logfile0`). Once a transaction commits, the changes are written to the transaction log before memory pages are flushed to disk. Even during abrupt server power failure, crash recovery guarantees state persistence. |

---

### Part 3: Pessimistic vs Optimistic Locking

#### Question: Why did you choose Pessimistic Locking over Optimistic Locking for stock reservations?
**Answer:**
- **Optimistic Locking** uses a `@Version` timestamp/number and checks `WHERE version = ?` at update time. If another transaction modified the row, an `OptimisticLockException` is thrown, discarding the transaction.
  - *Disadvantage in High-Velocity Inventory:* In high-demand flash sales or simultaneous orders, optimistic locking causes high abort/retry rates, degrading customer checkout completion.
- **Pessimistic Locking** (`PESSIMISTIC_WRITE` / `SELECT ... FOR UPDATE`):
  - Directly requests an **Exclusive (X) Row Lock** from MySQL InnoDB.
  - Concurrent transactions attempting to reserve stock on the same SKU in the same warehouse wait sequentially on the row lock for up to the lock timeout (`innodb_lock_wait_timeout`).
  - No customer order is unnecessarily aborted; transactions process in arrival queue order.

#### Question: How do you prevent Deadlocks during multi-item order reservation?
**Answer:**
A deadlock occurs when Transaction A locks Product 1 and waits for Product 2, while Transaction B locks Product 2 and waits for Product 1.
- **Prevention Strategy in System Design:** In `CustomerOrderService`, order items are sorted by `productId` ascending before acquiring row locks:
  ```java
  items.sort(Comparator.comparing(item -> item.getProduct().getId()));
  ```
- Because all concurrent transactions acquire row locks in the exact same global primary key order, circular wait conditions ($T_1 \to T_2 \to T_1$) are mathematically impossible!

---

### Part 4: Database Indexing Strategy

#### Question: Explain your indexing architecture. Which columns are indexed and why?

```sql
-- 1. Clustered Indexes (Primary Keys)
-- Built on B+Tree leaf nodes containing actual row data.
CREATE TABLE products (id BIGINT AUTO_INCREMENT PRIMARY KEY, ...);

-- 2. Unique Secondary Indexes
-- Prevents duplicate business keys and speeds up O(log N) lookup.
CREATE UNIQUE INDEX idx_products_sku ON products(sku);
CREATE UNIQUE INDEX idx_po_number ON purchase_orders(po_number);
CREATE UNIQUE INDEX idx_order_number ON customer_orders(order_number);
CREATE UNIQUE INDEX idx_shipments_tracking ON shipments(tracking_number);

-- 3. Composite Foreign Key Indexes
-- Speeds up warehouse-product joins and prevents full table scans.
CREATE UNIQUE INDEX uk_inventory_wh_prod ON inventory(warehouse_id, product_id);
CREATE UNIQUE INDEX uk_supp_prod ON supplier_product(supplier_id, product_id);

-- 4. Status & Foreign Key Secondary Indexes
-- Highly filtered columns in WHERE clauses.
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_status ON customer_orders(status);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_stock_tx_created ON stock_transactions(created_at);
```

##### Index Cardinality & Selectivity:
- `sku`, `tracking_number`, `order_number`: Cardinality is equal to row count ($Selectivity = 1.0$), making B+Tree point lookups extremely efficient (depth typically 3 to 4 I/O ops).
- `(warehouse_id, product_id)`: Composite index eliminates index skip scans and fulfills both equality and join conditions in a single tree traversal.

---

### Part 5: Stored Procedures vs Application Layer Logic

#### Question: Why did you write Stored Procedures in MySQL if you already have Spring Boot Services?
**Answer:**
In enterprise system design, having stored procedures alongside application services serves three distinct architectural advantages:
1. **Network Latency Minimization:** In high-volume batch processing (such as end-of-day purchase order receiving or batch stock allocation), executing logic inside the database engine avoids dozens of round-trip network hops between the app server and DB server.
2. **Database-Tier Encapsulation:** If third-party legacy ERP systems, automated batch cron jobs, or reporting tools directly access the MySQL database, the stored procedures (`sp_reserve_stock_for_order`, `sp_receive_purchase_order`) enforce identical business rules without duplicating Java code.
3. **Prepared Execution Plan:** Stored procedures are parsed, validated, and optimized by the MySQL query optimizer once, keeping the execution plan in the query cache.

---

### Part 6: Database Views vs Materialized Views

#### Question: What views did you create, and why are they useful?
**Answer:**
We created 5 SQL views:
1. `vw_product_stock_overview`: Joins `products`, `categories`, and `inventory` to compute total available, total reserved, and total physical inventory per SKU.
2. `vw_low_stock_alerts`: Filters products where aggregated available stock is strictly less than `reorder_level`.
3. `vw_warehouse_utilization`: Aggregates distinct SKU count, total units, and storage percentage utilization against maximum capacity.
4. `vw_supplier_order_summary`: Aggregates purchase orders per supplier with total spend and fulfillment status.
5. `vw_recent_order_activity`: Provides high-level operational feed for dashboard consumers.

##### Benefits:
- **Security & Data Hiding:** Application read queries access views without exposing raw physical table structures or sensitive cost margins.
- **Query Simplification:** Complex multi-table joins with `GROUP BY` and `HAVING` clauses are written and tuned once in SQL, keeping backend JPA queries concise.

---

### Part 7: 20 Quick-Fire College Viva Questions & Answers

1. **Q: What is the storage engine used in MySQL?**  
   *A:* MySQL InnoDB. It supports ACID transactions, foreign key constraints, row-level locking, and crash recovery via redo/undo logs. MyISAM does not support transactions or row-level locking.

2. **Q: What is a surrogate key vs a natural key in your project?**  
   *A:* `id BIGINT AUTO_INCREMENT` is a surrogate key (synthetic, integer-based, immutable). `sku` (e.g., `SKU-ELEC-001`) and `po_number` are natural/business keys.

3. **Q: What is the N+1 query problem and how did you prevent it in Hibernate?**  
   *A:* The N+1 problem occurs when fetching $N$ records causes 1 query for the parent list and $N$ additional queries for lazy associations. We prevented this using `JOIN FETCH` queries in JPA repositories and careful DTO projection.

4. **Q: What is the difference between `DELETE CASCADE` and `RESTRICT` in foreign keys?**  
   *A:* In our supply chain schema, we use `ON DELETE RESTRICT` for products and warehouses. If a product has active inventory records or order items, deleting the product is blocked to prevent accidental loss of historical audit ledgers.

5. **Q: What is the difference between clustered and non-clustered index in MySQL?**  
   *A:* In InnoDB, the primary key is always the clustered index; the leaf pages contain the entire table row. Non-clustered (secondary) index leaf nodes store the secondary key value and the primary key pointer (requiring a "bookmark lookup" unless it is a covering index).

6. **Q: Why are prices stored as `DECIMAL(12,2)` instead of `FLOAT` or `DOUBLE`?**  
   *A:* Floating-point numbers (`FLOAT`, `DOUBLE`) use IEEE 754 binary representation, causing rounding and precision errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). `DECIMAL` is an exact fixed-point representation mandatory for financial transactions.

7. **Q: What is BCNF? Does your schema satisfy BCNF?**  
   *A:* Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF where for every non-trivial functional dependency $X \to Y$, $X$ must be a superkey. Yes, in all our tables, all determinants are superkeys.

8. **Q: What is dirty read, non-repeatable read, and phantom read?**  
   *A:*
   - *Dirty Read:* Reading uncommitted data from another transaction.
   - *Non-Repeatable Read:* Reading the same row twice within a transaction and getting different attribute values because another transaction modified and committed it.
   - *Phantom Read:* Re-executing a range query and finding newly inserted rows that match the predicate.

9. **Q: What is the difference between DDL, DML, and DCL?**  
   *A:*
   - DDL (Data Definition Language): `CREATE`, `ALTER`, `DROP`, `TRUNCATE`.
   - DML (Data Manipulation Language): `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
   - DCL (Data Control Language): `GRANT`, `REVOKE`.

10. **Q: How does BCrypt work for password hashing?**  
    *A:* BCrypt uses the Blowfish cipher with a randomized 16-byte salt and an adaptive work factor (iteration count: 10 rounds). It protects against rainbow table attacks and brute force.

11. **Q: What is JWT and how does stateless authentication work?**  
    *A:* JSON Web Token has three parts: Header, Payload (claims: username, role, expiry), and Signature (HMAC-SHA256). The backend does not store session IDs in server memory; the token is validated cryptographically on every request.

12. **Q: What is the difference between pessimistic write lock and pessimistic read lock?**  
    *A:* Pessimistic Read lock (`SELECT ... FOR SHARE`) prevents others from modifying the row, but permits multiple concurrent readers. Pessimistic Write lock (`SELECT ... FOR UPDATE`) prevents others from reading with lock or modifying the row.

13. **Q: How does `DataInitializer.java` work in your Spring Boot application?**  
    *A:* It implements `CommandLineRunner`. During Spring Boot startup, it executes automatically, checks if the `users` table is empty, and if so, seeds default admin (`admin`/`admin123`) and employee (`employee`/`emp123`) accounts with BCrypt-hashed passwords.

14. **Q: How do you handle stock transfers between two warehouses?**  
    *A:* In `InventoryService.transferStock`, an atomic transaction decreases `quantityAvailable` in warehouse A, increases `quantityAvailable` in warehouse B, and logs two linked audit transactions (`TRANSFER`) to maintain perfect stock conservation.

15. **Q: Why is `stock_transactions` table append-only?**  
    *A:* In forensic accounting and supply chain auditing, stock transactions must be an immutable append-only ledger. Records are never updated or deleted; any correction is made by issuing a compensating `ADJUSTMENT` transaction.

16. **Q: What HTTP status codes are returned by your REST APIs?**  
    *A:*
    - `200 OK`: Successful read or update.
    - `201 Created`: Successful creation.
    - `400 Bad Request`: Validation failure or insufficient stock.
    - `401 Unauthorized`: Missing or expired JWT token.
    - `403 Forbidden`: Insufficient role permissions (e.g. employee trying to access admin endpoint).
    - `404 Not Found`: Resource ID not found.
    - `500 Internal Server Error`: Unexpected server exception.

17. **Q: How is CORS handled between React (port 5173) and Spring Boot (port 8080)?**  
    *A:* In `WebConfig.java` / `SecurityConfig.java`, we configure a `CorsConfigurationSource` permitting requests from `http://localhost:5173` with methods `GET, POST, PUT, PATCH, DELETE, OPTIONS` and header `Authorization`.

18. **Q: What is the role of Vite in your React frontend?**  
    *A:* Vite is a modern frontend build tool that uses native ES modules (ESM) during development for lightning-fast Hot Module Replacement (HMR) and uses Rollup for optimized production bundling.

19. **Q: What is the purpose of Axios interceptors in `services/api.js`?**  
    *A:* The request interceptor automatically extracts the JWT token from `localStorage` and attaches the `Authorization: Bearer <token>` header to every outbound HTTP call. The response interceptor catches 401 errors and redirects to `/login`.

20. **Q: If your database grows to 10 million transactions, how would you scale it?**  
    *A:*
    1. Table Partitioning (partition `stock_transactions` by year/month range).
    2. Read/Write replica splitting (Master for writes, read replicas for reports).
    3. Archival strategy (move transactions older than 3 years to cold storage).
    4. Database caching with Redis for hot catalog data.
