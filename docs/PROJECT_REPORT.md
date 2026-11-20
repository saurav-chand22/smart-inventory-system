# Smart Inventory & Supply Chain Management System
## Comprehensive Architectural, Database, and Operational System Report

---

## 1. OVERVIEW

### 1.1 What the System Does
The **Smart Inventory and Supply Chain Management System** is a full-stack, enterprise-grade inventory and fulfillment platform. It tracks raw materials, equipment, and finished goods across multiple physical warehouses. The system coordinates vendor procurement via Purchase Orders, manages customer sales orders, enforces atomic inventory reservation with database-level row locking, and tracks logistics dispatches through carrier shipments. Every physical and logical stock movement (receipts, reservations, releases, adjustments, and dispatches) is logged into an immutable audit trail.

### 1.2 User Roles & Access Control
The application supports role-based access control (RBAC) with two user roles:
- **`ADMIN` (System Administrator)**:
  - Full operational and administrative control.
  - Can create, edit, and delete product catalog items, categories, suppliers, and warehouses.
  - Can draft, approve, order, and cancel Purchase Orders.
  - Can view and manage all inventory stock adjustments, customer orders, shipments, and audit logs.
- **`EMPLOYEE` (Warehouse Associate)**:
  - Read access to categories, products, suppliers, warehouses, inventory, and stock transactions.
  - Operational capabilities: can create customer orders, confirm orders (reserving stock), create shipments, dispatch shipments (deducting stock), receive goods from approved Purchase Orders (increasing stock), and perform stock adjustments.
  - Cannot create, modify, or delete master data (products, categories, suppliers, warehouses).
  - Cannot approve or issue new Purchase Orders.

### 1.3 Technology Stack & Versions
- **Backend Framework**: Spring Boot `3.3.5` on Java `21` (LTS)
- **Security & Tokens**: Spring Security `6.3.4` with JJWT (`io.jsonwebtoken`) `0.12.6` (HMAC-SHA256)
- **ORM & Data Access**: Spring Data JPA / Hibernate `6.5.3.Final`
- **Validation**: Jakarta Validation / Hibernate Validator `8.0.1.Final`
- **Primary Database**: MySQL `8.0+` (`mysql-connector-j`) / In-Memory H2 Database `2.2.224` (MySQL emulation mode for local development and demonstration)
- **Frontend Framework**: React `18.3.1` (Single-Page Application with React Router DOM `6.28.0`)
- **Build Tool & Bundler**: Vite `5.4.21`
- **Icons & Styling**: Lucide React `0.460.0`, Custom Vanilla CSS System (`index.css`)
- **HTTP Client**: Axios `1.7.9`

### 1.4 How to Run Locally

#### Prerequisites
1. Java Development Kit (JDK) 21 installed.
2. Node.js (v18+) and npm installed.

#### Running Backend
The backend can be launched using the pre-configured local Maven wrapper located in `tools/apache-maven-3.9.6`:
```powershell
# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"

# Navigate to backend directory
cd C:\Users\Shivam\Desktop\smart-inventory-system\backend

# Run with H2 in-memory profile
..\tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"
```
- **Backend Port**: `8085`
- **H2 Web Console**: `http://localhost:8085/h2-console`
  - JDBC URL: `jdbc:h2:mem:smart_inventory_db`
  - User: `sa`
  - Password: *(empty)*

#### Running Frontend
```powershell
cd C:\Users\Shivam\Desktop\smart-inventory-system\frontend
npm install
npm run dev
```
- **Frontend URL**: `http://localhost:5173`
- The Vite development server automatically proxies `/api/*` calls to `http://localhost:8085`.

#### One-Click Windows Launcher
Double-click `start_all.bat` at the project root to start both backend and frontend servers simultaneously and open the web browser.

#### Default Seed Credentials (`DataInitializer.java`)
| Username | Password | Role | Full Name | Email |
|---|---|---|---|---|
| `admin` | `admin123` | `ADMIN` | System Administrator | `admin@inventory.com` |
| `employee` | `employee123` | `EMPLOYEE` | Warehouse Associate | `employee@inventory.com` |

---

### 1.5 Folder Tree and File Manifest

```
smart-inventory-system/
├── backend/
│   ├── pom.xml                                  # Maven dependencies, build plugins & compiler configuration
│   └── src/
│       ├── main/
│       │   ├── java/com/inventory/smartinventory/
│       │   │   ├── SmartInventoryApplication.java   # Spring Boot entry point
│       │   │   ├── config/
│       │   │   │   ├── DataInitializer.java        # CommandLineRunner database seeder (admin/employee, categories, etc.)
│       │   │   │   ├── JwtAuthenticationFilter.java# Per-request JWT extraction, validation and SecurityContext population
│       │   │   │   ├── JwtUtil.java                # HMAC-SHA256 token generation, claims extraction, expiration checking
│       │   │   │   └── SecurityConfig.java         # Security filter chain, CORS configuration, URL access matchers
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java         # /api/auth endpoints (login, current user profile)
│       │   │   │   ├── CategoryController.java     # /api/categories CRUD endpoints
│       │   │   │   ├── CustomerOrderController.java# /api/customer-orders lifecycle (create, confirm, cancel)
│       │   │   │   ├── DashboardController.java    # /api/dashboard KPI summary and metrics
│       │   │   │   ├── InventoryController.java    # /api/inventory stock queries and manual adjustments
│       │   │   │   ├── ProductController.java      # /api/products catalog search, filtering, CRUD
│       │   │   │   ├── PurchaseOrderController.java# /api/purchase-orders supplier procurement workflow
│       │   │   │   ├── ShipmentController.java     # /api/shipments dispatch, tracking, status transitions
│       │   │   │   ├── StockTransactionController.java # /api/stock-transactions immutable audit log queries
│       │   │   │   ├── SupplierController.java     # /api/suppliers vendor directory CRUD
│       │   │   │   └── WarehouseController.java    # /api/warehouses storage facility management
│       │   │   ├── dto/                        # Request and Response transfer payloads
│       │   │   │   ├── ApiResponse.java            # Standard generic API envelope: {success, message, data}
│       │   │   │   ├── AuthResponse.java           # Login token response with user profile details
│       │   │   │   ├── CategoryRequest.java        # Category creation/update DTO
│       │   │   │   ├── CustomerOrderRequest.java   # Customer order payload with nested line items
│       │   │   │   ├── DashboardStatsResponse.java # Aggregated metrics DTO for top dashboard cards
│       │   │   │   ├── LoginRequest.java           # Authentication credentials payload (username, password)
│       │   │   │   ├── ProductRequest.java         # Product creation/edit DTO with validations
│       │   │   │   ├── PurchaseOrderRequest.java   # Purchase order request with nested PO item list
│       │   │   │   ├── ShipmentRequest.java        # Carrier dispatch creation DTO
│       │   │   │   ├── StockAdjustmentRequest.java # Inventory delta adjustment DTO
│       │   │   │   ├── SupplierRequest.java        # Supplier details DTO
│       │   │   │   └── WarehouseRequest.java       # Warehouse registration DTO
│       │   │   ├── entity/                         # JPA domain models mapped to DB tables
│       │   │   │   ├── Category.java               # Entity for 'categories' table
│       │   │   │   ├── CustomerOrder.java          # Entity for 'customer_orders' table
│       │   │   │   ├── Inventory.java              # Entity for 'inventory' table (composite stock balances)
│       │   │   │   ├── OrderItem.java              # Entity for 'order_items' line items table
│       │   │   │   ├── Product.java                # Entity for 'products' table
│       │   │   │   ├── PurchaseOrder.java          # Entity for 'purchase_orders' table
│       │   │   │   ├── PurchaseOrderItem.java      # Entity for 'purchase_order_items' table
│       │   │   │   ├── Shipment.java               # Entity for 'shipments' table
│       │   │   │   ├── StockTransaction.java       # Entity for 'stock_transactions' audit table
│       │   │   │   ├── Supplier.java               # Entity for 'suppliers' table
│       │   │   │   ├── SupplierProduct.java        # Associative entity for 'supplier_product' M:N table
│       │   │   │   ├── User.java                   # Entity for 'users' authentication table
│       │   │   │   ├── Warehouse.java              # Entity for 'warehouses' facility table
│       │   │   │   └── enums/                      # Domain state and type enumerations
│       │   │   │       ├── CustomerOrderStatus.java # PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
│       │   │   │       ├── PurchaseOrderStatus.java # PENDING, APPROVED, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED
│       │   │   │       ├── ShipmentStatus.java      # PREPARING, DISPATCHED, IN_TRANSIT, DELIVERED, DELAYED, CANCELLED
│       │   │   │       ├── TransactionType.java     # STOCK_IN, STOCK_OUT, STOCK_TRANSFER, STOCK_ADJUSTMENT, STOCK_RESERVATION, STOCK_RELEASE
│       │   │   │       └── UserRole.java            # ADMIN, EMPLOYEE
│       │   │   ├── exception/
│       │   │   │   ├── BusinessRuleException.java  # HTTP 400 Bad Request exception
│       │   │   │   ├── ErrorResponse.java          # Standard structured error envelope
│       │   │   │   ├── GlobalExceptionHandler.java # @RestControllerAdvice intercepting validations and domain exceptions
│       │   │   │   ├── InsufficientStockException.java # HTTP 422 Unprocessable Entity exception
│       │   │   │   └── ResourceNotFoundException.java  # HTTP 404 Not Found exception
│       │   │   ├── repository/                     # Spring Data JPA repositories with query methods
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   ├── CustomerOrderRepository.java
│       │   │   │   ├── InventoryRepository.java    # Includes pessimistic row-lock lockByProductIdAndWarehouseId()
│       │   │   │   ├── OrderItemRepository.java
│       │   │   │   ├── ProductRepository.java      # Includes custom JPQL search and low-stock filters
│       │   │   │   ├── PurchaseOrderItemRepository.java
│       │   │   │   ├── PurchaseOrderRepository.java
│       │   │   │   ├── ShipmentRepository.java
│       │   │   │   ├── StockTransactionRepository.java
│       │   │   │   ├── SupplierProductRepository.java
│       │   │   │   ├── SupplierRepository.java
│       │   │   │   ├── UserRepository.java
│       │   │   │   └── WarehouseRepository.java
│       │   │   └── service/                        # Transactional domain logic layer
│       │   │       ├── AuthService.java            # Authentication, BCrypt verification, JWT issuance
│       │   │       ├── CategoryService.java        # Category CRUD business logic
│       │   │       ├── CustomerOrderService.java   # Order creation, pessimistic stock reservation, order cancellation
│       │   │       ├── DashboardService.java       # Aggregated KPIs and metrics calculations
│       │   │       ├── InventoryService.java       # Stock add, manual adjustment with negative balance guards
│       │   │       ├── ProductService.java         # Product management, SKU validation, safety checks
│       │   │       ├── PurchaseOrderService.java   # Procurement lifecycle, approval, receipt stock-in
│       │   │       ├── ShipmentService.java        # Shipment tracking, dispatch reserved stock consumption
│       │   │       ├── StockTransactionService.java# Immutable transaction logging
│       │   │       ├── SupplierService.java        # Supplier management business logic
│       │   │       └── WarehouseService.java       # Warehouse facility business logic
│       │   └── resources/
│       │       ├── application.properties          # Production MySQL configuration profile
│       │       └── application-h2.properties       # Local in-memory H2 development profile
├── database/
│   ├── 01_schema.sql                            # Production DDL schema: 13 tables, constraints, indexes
│   ├── 02_views_and_procedures.sql              # 5 database views and 2 stored procedures
│   ├── 03_seed_data.sql                         # Demonstration seed rows for all 13 tables
│   └── setup_database.sql                       # Master orchestration runner script
├── frontend/
│   ├── package.json                             # Frontend dependencies and npm scripts
│   ├── vite.config.js                           # Vite bundler configuration and backend proxy (/api -> :8085)
│   ├── index.html                               # HTML entry point with Google Fonts
│   └── src/
│       ├── App.jsx                              # Route definitions, protected layout wrapper, public route guards
│       ├── index.css                            # Modern dark/light corporate UI theme stylesheet
│       ├── main.jsx                             # React DOM entry point
│       ├── components/
│       │   ├── Modal.jsx                        # Reusable accessible modal dialog component
│       │   ├── Navbar.jsx                       # Top navigation bar with active user role badge
│       │   ├── Sidebar.jsx                      # Left sidebar navigation links with active routing indicators
│       │   └── StatCard.jsx                     # Dashboard metric card component with icons and badges
│       ├── context/
│       │   └── AuthContext.jsx                  # React Context provider for user session, token, and role state
│       ├── pages/                               # Page view components
│       │   ├── Categories.jsx                   # Category list and management
│       │   ├── CustomerOrders.jsx               # Customer order placement, confirmation, and cancellation
│       │   ├── Dashboard.jsx                    # Executive operational overview and KPI summaries
│       │   ├── Inventory.jsx                    # Stock level table, warehouse filters, manual stock adjustment
│       │   ├── Login.jsx                        # User login page with demo credential shortcuts
│       │   ├── Products.jsx                     # Product catalog with search, category filter, and CRUD
│       │   ├── ProfileSettings.jsx              # Current user account details and sign-out
│       │   ├── PurchaseOrders.jsx               # PO procurement table, line item creator, status workflow
│       │   ├── Shipments.jsx                    # Shipment dispatches, carrier assignments, status changes
│       │   ├── StockTransactions.jsx            # Audit trail table with filters for product and warehouse
│       │   ├── Suppliers.jsx                    # Vendor contact list and management
│       │   └── Warehouses.jsx                   # Facility capacity, status, and location management
│       └── services/
│           └── api.js                           # Central Axios client with JWT interceptor and 401 redirect
├── start_all.bat                                # Windows batch script to launch both servers and open browser
├── start_backend.bat                            # Windows batch script to run backend Spring Boot application
└── start_frontend.bat                           # Windows batch script to run frontend Vite dev server
```

---

## 2. DATABASE ARCHITECTURE

### 2.1 Table Schemas & Data Dictionaries

The database schema consists of **13 normalized tables** (`smart_inventory_db`).

#### 1. `users`
Stores system operators, credentials, and access roles.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique identifier for the user account |
| `username` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Login identifier used during authentication |
| `email` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Official contact email address |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | One-way BCrypt cryptographic hash of the password |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Display name of the user |
| `role` | `ENUM` | `NOT NULL`, Default `'EMPLOYEE'` | Access level: `ADMIN` or `EMPLOYEE` |
| `is_active` | `BOOLEAN` | `NOT NULL`, Default `TRUE` | Whether the user account is allowed to log in |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Account creation timestamp |

#### 2. `categories`
Hierarchical or thematic groupings of products.
```sql
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique identifier for the product category |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Distinct category name (e.g. "Electronics & Scanners") |
| `description` | `TEXT` | Nullable | Explanatory description of items in this category |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Timestamp when category was added |

#### 3. `products`
The master catalog of sellable or inventory-tracked items.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique product identifier |
| `category_id` | `BIGINT` | `FK` -> `categories(id)`, `ON DELETE RESTRICT` | Category reference; cannot delete category with products |
| `sku` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Stock Keeping Unit code (e.g., `ELC-SCN-001`) |
| `name` | `VARCHAR(150)` | `NOT NULL` | Full commercial title of the item |
| `description` | `TEXT` | Nullable | Detailed product specification |
| `unit_price` | `DECIMAL(10, 2)`| `NOT NULL`, `CHECK (unit_price >= 0)` | Base sales price per unit; cannot be negative |
| `reorder_level`| `INT` | `NOT NULL`, Default `10`, `CHECK (>= 0)` | Threshold below which system triggers low-stock alerts |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Record creation date |
| `updated_at` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP ON UPDATE` | Last modification date |

#### 4. `suppliers`
External vendors supplying inventory goods.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique supplier identifier |
| `name` | `VARCHAR(150)` | `NOT NULL` | Company or organization legal name |
| `contact_person`| `VARCHAR(100)`| Nullable | Primary account executive / contact name |
| `email` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Official procurement contact email |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Primary contact telephone number |
| `address` | `TEXT` | Nullable | Physical corporate or dispatch address |
| `status` | `ENUM` | `NOT NULL`, Default `'ACTIVE'` | Operational status (`ACTIVE` or `INACTIVE`) |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Vendor registration date |

#### 5. `warehouses`
Physical fulfillment and storage facilities.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Facility unique identifier |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Facility name (e.g., "Central Distribution Hub") |
| `location` | `VARCHAR(255)` | `NOT NULL` | Physical street address and city |
| `capacity` | `INT` | `NOT NULL`, `CHECK (capacity > 0)` | Maximum total units facility can house; must be > 0 |
| `contact_number`| `VARCHAR(20)`| Nullable | Dispatch dock phone number |
| `status` | `ENUM` | `NOT NULL`, Default `'ACTIVE'` | Active operational status |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Facility commissioning date |

#### 6. `inventory`
Real-time stock balance per product per warehouse.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique balance record identifier |
| `product_id` | `BIGINT` | `FK` -> `products(id)`, `ON DELETE CASCADE` | Product whose balance is tracked |
| `warehouse_id` | `BIGINT` | `FK` -> `warehouses(id)`, `ON DELETE CASCADE`| Facility where stock is located |
| `quantity_available`| `INT` | `NOT NULL`, Default `0`, `CHECK (>= 0)` | Units ready to be sold or reserved |
| `quantity_reserved` | `INT` | `NOT NULL`, Default `0`, `CHECK (>= 0)` | Units committed to confirmed customer orders |
| `last_updated` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP ON UPDATE`| Timestamp of last quantity change |
| *Composite* | `(product_id, warehouse_id)` | `UNIQUE` | Guarantees exactly one row per product per facility |

#### 7. `supplier_product`
Associative table modeling the M:N relationship between suppliers and products.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Association record identifier |
| `supplier_id` | `BIGINT` | `FK` -> `suppliers(id)`, `ON DELETE CASCADE` | Associated supplier |
| `product_id` | `BIGINT` | `FK` -> `products(id)`, `ON DELETE CASCADE` | Associated product |
| `supplier_price`| `DECIMAL(10, 2)`| `NOT NULL`, `CHECK (>= 0)` | Cost to purchase 1 unit from this vendor |
| `lead_time_days`| `INT` | `NOT NULL`, Default `7`, `CHECK (>= 0)` | Days required from order to delivery |
| *Composite* | `(supplier_id, product_id)`| `UNIQUE` | A supplier can have only one contract price per product |

#### 8. `purchase_orders`
Header for procurement orders sent to suppliers.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique purchase order ID |
| `po_number` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Business identifier (e.g. `PO-123456`) |
| `supplier_id` | `BIGINT` | `FK` -> `suppliers(id)`, `ON DELETE RESTRICT`| Vendor fulfilling the order |
| `warehouse_id` | `BIGINT` | `FK` -> `warehouses(id)`, `ON DELETE RESTRICT`| Destination warehouse for stock-in |
| `status` | `ENUM` | `NOT NULL`, Default `'PENDING'` | Lifecycle state: `PENDING`, `APPROVED`, etc. |
| `total_amount` | `DECIMAL(12, 2)`| `NOT NULL`, Default `0.00`, `CHECK (>= 0)` | Calculated sum of all PO line items |
| `created_by` | `BIGINT` | `FK` -> `users(id)`, `ON DELETE RESTRICT` | Staff member who initiated the order |
| `order_date` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Date and time order was created |
| `expected_delivery_date`| `DATE` | Nullable | Anticipated arrival date |
| `received_date`| `TIMESTAMP` | Nullable | Date and time goods were accepted into stock |

#### 9. `purchase_order_items`
Individual line items belonging to a purchase order.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Line item unique ID |
| `purchase_order_id`| `BIGINT` | `FK` -> `purchase_orders(id)`, `ON DELETE CASCADE`| Parent PO |
| `product_id` | `BIGINT` | `FK` -> `products(id)`, `ON DELETE RESTRICT`| Item to be received |
| `ordered_quantity` | `INT` | `NOT NULL`, `CHECK (ordered_quantity > 0)` | Units requested from vendor |
| `received_quantity`| `INT` | `NOT NULL`, Default `0`, `CHECK (>= 0)` | Units accepted into warehouse |
| `unit_price` | `DECIMAL(10, 2)`| `NOT NULL`, `CHECK (unit_price >= 0)` | Contract unit purchase price |

#### 10. `customer_orders`
Header for client sales orders.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Order unique ID |
| `order_number` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Business identifier (e.g. `ORD-654321`) |
| `customer_name`| `VARCHAR(150)` | `NOT NULL` | Purchasing client name |
| `customer_email`| `VARCHAR(100)` | `NOT NULL` | Client notification email address |
| `customer_phone`| `VARCHAR(20)` | Nullable | Contact telephone number |
| `shipping_address`| `TEXT` | `NOT NULL` | Physical delivery destination |
| `status` | `ENUM` | `NOT NULL`, Default `'PENDING'` | Lifecycle state: `PENDING`, `CONFIRMED`, etc. |
| `total_amount` | `DECIMAL(12, 2)`| `NOT NULL`, Default `0.00`, `CHECK (>= 0)` | Total payable amount for all items |
| `created_by` | `BIGINT` | `FK` -> `users(id)`, `ON DELETE RESTRICT`| Employee who entered the order |
| `order_date` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Order timestamp |

#### 11. `order_items`
Line items belonging to a customer order.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Line item unique ID |
| `order_id` | `BIGINT` | `FK` -> `customer_orders(id)`, `ON DELETE CASCADE`| Parent customer order |
| `product_id` | `BIGINT` | `FK` -> `products(id)`, `ON DELETE RESTRICT`| Sold product |
| `quantity` | `INT` | `NOT NULL`, `CHECK (quantity > 0)` | Quantity ordered by customer |
| `unit_price` | `DECIMAL(10, 2)`| `NOT NULL`, `CHECK (unit_price >= 0)` | Locked unit selling price at order time |
| `subtotal` | `DECIMAL(12, 2)`| `NOT NULL`, `CHECK (subtotal >= 0)` | Computed line total (`quantity * unit_price`) |

#### 12. `shipments`
Physical logistics dispatches associated with customer orders.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Dispatch tracking record ID |
| `tracking_number`| `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Public tracking code (e.g. `TRK-881290`) |
| `order_id` | `BIGINT` | `FK` -> `customer_orders(id)`, `ON DELETE RESTRICT`| Associated sales order |
| `warehouse_id` | `BIGINT` | `FK` -> `warehouses(id)`, `ON DELETE RESTRICT`| Dispatching origin facility |
| `carrier` | `VARCHAR(100)` | `NOT NULL` | Logistics company (FedEx, UPS, DHL, etc.) |
| `status` | `ENUM` | `NOT NULL`, Default `'PREPARING'` | Dispatch state |
| `shipped_date` | `TIMESTAMP` | Nullable | Exact departure timestamp |
| `estimated_delivery_date`| `DATE`| Nullable | Planned delivery arrival date |
| `delivered_date`| `TIMESTAMP` | Nullable | Final delivery handover timestamp |

#### 13. `stock_transactions`
Immutable, append-only operational audit log.
```sql
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
```
| Column | Type | Constraints | Plain-English Meaning |
|---|---|---|---|
| `id` | `BIGINT` | `PK`, `AUTO_INCREMENT` | Unique audit transaction ID |
| `product_id` | `BIGINT` | `FK` -> `products(id)`, `ON DELETE RESTRICT`| Product moved or adjusted |
| `warehouse_id` | `BIGINT` | `FK` -> `warehouses(id)`, `ON DELETE RESTRICT`| Facility where movement took place |
| `transaction_type`| `ENUM` | `NOT NULL` | Movement classification (`STOCK_IN`, `STOCK_OUT`, etc.) |
| `quantity` | `INT` | `NOT NULL` | Quantity changed (positive or negative delta) |
| `reference_id` | `VARCHAR(50)` | Nullable | External or internal document ref (e.g. `PO-1001`, `ORD-1002`) |
| `description` | `TEXT` | Nullable | Audit explanation or reasoning |
| `created_by` | `BIGINT` | `FK` -> `users(id)`, `ON DELETE RESTRICT`| User who executed the action |
| `transaction_date`| `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | System timestamp of the transaction |

---

### 2.2 Table Relationships in Plain English
1. **Category to Products (1:N)**: One category contains many products. A product belongs to exactly one category. If a category has products, deletion is prohibited (`ON DELETE RESTRICT`).
2. **Product to Inventory (1:N)**: One product can be stocked across multiple warehouses. Each inventory row tracks balances for one product in one warehouse.
3. **Warehouse to Inventory (1:N)**: One warehouse holds multiple inventory records. The composite key `(product_id, warehouse_id)` is `UNIQUE`.
4. **Supplier to Products (M:N via `supplier_product`)**: One supplier offers many products, and one product can be sourced from multiple suppliers. The associative table `supplier_product` serves as the junction table storing contract prices and lead times.
5. **Supplier to Purchase Orders (1:N)**: One supplier can receive many purchase orders.
6. **Purchase Order to Line Items (1:N via `purchase_order_items`)**: One purchase order has one or more line items. Deleting the PO cascades to delete its items (`ON DELETE CASCADE`).
7. **Customer Order to Line Items (1:N via `order_items`)**: One customer order has one or more line items. Deleting the order cascades to delete its items (`ON DELETE CASCADE`).
8. **Customer Order to Shipments (1:N)**: One customer order can have one or more shipments (currently typically 1:1, but modeled as 1:N in schema).
9. **User to Purchase Orders / Customer Orders / Stock Transactions (1:N)**: System users author purchase orders, customer orders, and trigger audit log transactions. Deleting an active user who authored audit logs is strictly prevented (`ON DELETE RESTRICT`).

---

### 2.3 Database Views

All 5 views are defined in `database/02_views_and_procedures.sql`:

#### View 1: `vw_product_stock_overview`
Aggregates total physical, available, and reserved stock across all warehouses for each product, computes total monetary inventory value, and derives status flags.
```sql
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
```

#### View 2: `vw_low_stock_alerts`
Filters products whose total available stock is less than or equal to their defined reorder threshold, calculating the shortage deficit.
```sql
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
```

#### View 3: `vw_warehouse_utilization`
Computes the current space utilization percentage for each active warehouse by comparing current total items stored against nominal facility capacity.
```sql
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
```

#### View 4: `vw_supplier_order_summary`
Aggregates vendor performance, calculating total purchase orders, lifetime expenditure, average order value, pending orders, and completed orders.
```sql
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
```

#### View 5: `vw_recent_order_activity`
Combines customer order headers, order line item counts, and associated carrier shipment status.
```sql
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
```

---

### 2.4 Stored Procedures, Functions, and Triggers

- **Triggers**: **NOT PRESENT** in the codebase.
- **Functions**: **NOT PRESENT** in the codebase.
- **Stored Procedures**: Exactly **2** stored procedures exist in `database/02_views_and_procedures.sql`.
- **Java Code Execution**: **Neither stored procedure is invoked by the Java backend.** The Spring Boot application executes equivalent transactional workflows via Spring Data JPA services (`CustomerOrderService` and `PurchaseOrderService`) using `@Transactional` and `@Lock(LockModeType.PESSIMISTIC_WRITE)`. The stored procedures exist in the SQL repository for database-native administration and DBMS demonstration.

#### Procedure 1: `sp_reserve_stock_for_order`
- **Purpose**: Atomically validates stock availability across all order items in a warehouse, locks the matching inventory rows with `FOR UPDATE`, shifts stock from `quantity_available` to `quantity_reserved`, records audit entries, and confirms the order.
```sql
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
    
    DECLARE cur_items CURSOR FOR 
        SELECT product_id, quantity 
        FROM order_items 
        WHERE order_id = p_order_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 500;
        SET p_message = 'Database error occurred during stock reservation. Transaction rolled back.';
    END;

    START TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM customer_orders WHERE id = p_order_id AND status = 'PENDING') THEN
        ROLLBACK;
        SET p_status_code = 400;
        SET p_message = 'Order does not exist or is not in PENDING state.';
        LEAVE proc_label;
    END IF;

    OPEN cur_items;
    check_loop: LOOP
        FETCH cur_items INTO v_product_id, v_quantity_needed;
        IF v_done THEN
            LEAVE check_loop;
        END IF;

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

        INSERT INTO stock_transactions (
            product_id, warehouse_id, transaction_type, quantity, reference_id, description, created_by
        ) VALUES (
            v_product_id, p_warehouse_id, 'STOCK_RESERVATION', v_quantity_needed, 
            CONCAT('ORD-', p_order_id), CONCAT('Reserved for Order #', p_order_id), p_user_id
        );
    END LOOP;
    CLOSE cur_items;

    UPDATE customer_orders
    SET status = 'CONFIRMED'
    WHERE id = p_order_id;

    COMMIT;
    SET p_status_code = 200;
    SET p_message = 'Order successfully confirmed and stock reserved.';
END //
DELIMITER ;
```

#### Procedure 2: `sp_receive_purchase_order`
- **Purpose**: Atomically transitions a Purchase Order to `RECEIVED`, performs an upsert into `inventory` to add the received units to `quantity_available`, updates line item received quantities, logs `STOCK_IN` audit records, and commits the transaction.
```sql
DELIMITER //
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

        INSERT INTO inventory (product_id, warehouse_id, quantity_available, quantity_reserved)
        VALUES (v_product_id, v_warehouse_id, v_ordered_qty, 0)
        ON DUPLICATE KEY UPDATE 
            quantity_available = quantity_available + v_ordered_qty;

        UPDATE purchase_order_items
        SET received_quantity = v_ordered_qty
        WHERE purchase_order_id = p_po_id AND product_id = v_product_id;

        INSERT INTO stock_transactions (
            product_id, warehouse_id, transaction_type, quantity, reference_id, description, created_by
        ) VALUES (
            v_product_id, v_warehouse_id, 'STOCK_IN', v_ordered_qty,
            CONCAT('PO-', p_po_id), CONCAT('Stock received from PO #', p_po_id), p_user_id
        );
    END LOOP;
    CLOSE cur_po_items;

    UPDATE purchase_orders
    SET status = 'RECEIVED',
        received_date = CURRENT_TIMESTAMP
    WHERE id = p_po_id;

    COMMIT;
    SET p_status_code = 200;
    SET p_message = 'Purchase order received successfully and inventory updated.';
END //
DELIMITER ;
```

---

### 2.5 Normalization & Intentional Denormalization

#### Normal Form Compliance: **Third Normal Form (3NF)**
1. **First Normal Form (1NF)**: All attributes are atomic (no repeating groups, arrays, or comma-separated lists). Each table has a unique primary key.
2. **Second Normal Form (2NF)**: The schema is in 1NF and all non-key attributes are fully functionally dependent on the entire primary key. In composite junction tables (`supplier_product`, `inventory`), non-key attributes (e.g. `supplier_price`, `quantity_available`) depend on the whole composite pair `(supplier_id, product_id)` or `(product_id, warehouse_id)`.
3. **Third Normal Form (3NF)**: The schema is in 2NF and contains no transitive dependencies (no non-key attribute depends on another non-key attribute). For example, `products` contains `category_id`, but category descriptions are stored exclusively in `categories`.

#### Intentional Denormalization
1. **`order_items.unit_price` & `order_items.subtotal`**:
   - *Why*: While `unit_price` exists in `products`, the selling price at the moment an order is finalized must remain permanent even if the catalog price changes later. Storing `subtotal` prevents rounding discrepancies across historical reports.
2. **`customer_orders.total_amount` & `purchase_orders.total_amount`**:
   - *Why*: Storing the pre-aggregated order total on the parent record eliminates the need for expensive subquery joins when presenting list views, dashboard KPIs, and customer receipts.

---

### 2.6 Seed Data Samples (`database/03_seed_data.sql`)

- **Users**:
  - `admin` (ID 1, `ADMIN`)
  - `employee` (ID 2, `EMPLOYEE`)
- **Categories**:
  - ID 1: `Electronics & Scanners`
  - ID 2: `Warehouse Equipment`
  - ID 3: `Packaging Materials`
  - ID 4: `Raw Materials`
  - ID 5: `Safety & PPE`
- **Suppliers**:
  - ID 1: `TechLogix Global Supplies` (`sales@techlogix.com`)
  - ID 2: `Apex Industrial Machinery` (`contact@apexmachinery.com`)
  - ID 3: `Metro Pack & Ship Co.` (`orders@metropack.com`)
  - ID 4: `Vulcan Raw Metals Corp` (`info@vulcanmetals.com`)
- **Warehouses**:
  - ID 1: `Central Distribution Hub` (Chicago, IL, Capacity: 50,000)
  - ID 2: `West Coast Facility` (Seattle, WA, Capacity: 35,000)
  - ID 3: `East Coast Logistics Center` (Elizabeth, NJ, Capacity: 40,000)
- **Products**:
  - ID 1: `ELC-SCN-001` - Handheld 2D Barcode Scanner ($89.99, Reorder: 15)
  - ID 2: `ELC-PRN-002` - Industrial Thermal Label Printer ($249.50, Reorder: 10)
  - ID 3: `EQP-PLJ-001` - Heavy Duty Hydraulic Pallet Jack ($420.00, Reorder: 5)
  - ID 4: `EQP-LAD-002` - Rolling Warehouse Safety Ladder ($185.00, Reorder: 8)

---

## 3. HOW EACH NUMBER IS GENERATED

### 3.1 Purchase Order Number (`poNumber`)
- **File**: [PurchaseOrderService.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/service/PurchaseOrderService.java#L56-L57)
- **Exact Code**:
```java
PurchaseOrder po = new PurchaseOrder();
po.setPoNumber("PO-" + (System.currentTimeMillis() % 1000000));
```
- **How it works**: Uses the Java epoch timestamp in milliseconds modulo $1,000,000$ to produce a 6-digit pseudo-random incremental sequence prefixed with `PO-`.

### 3.2 Customer Order Number (`orderNumber`)
- **File**: [CustomerOrderService.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/service/CustomerOrderService.java#L53-L54)
- **Exact Code**:
```java
CustomerOrder order = new CustomerOrder();
order.setOrderNumber("ORD-" + (System.currentTimeMillis() % 1000000));
```
- **How it works**: Modulos current system time in milliseconds by $1,000,000$ and prepends the prefix `ORD-`.

### 3.3 Shipment / Tracking Number (`trackingNumber`)
- **File**: [ShipmentService.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/service/ShipmentService.java#L57-L58)
- **Exact Code**:
```java
Shipment shipment = new Shipment();
shipment.setTrackingNumber("TRK-" + (System.currentTimeMillis() % 1000000));
```
- **How it works**: Uses `System.currentTimeMillis() % 1000000` combined with prefix `TRK-` to create a 6-digit unique tracking code.

### 3.4 Product SKU (`sku`)
- **Backend File**: [ProductService.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/service/ProductService.java#L50-L65)
- **Frontend File**: [Products.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Products.jsx#L46-L58)
- **Frontend Generation Code**:
```javascript
const handleOpenAdd = () => {
  setEditingProduct(null);
  setFormData({
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    categoryId: categories[0]?.id || '',
    description: '',
    unitPrice: '',
    reorderLevel: 10
  });
  setError('');
  setIsModalOpen(true);
};
```
- **Backend Validation Code**:
```java
if (productRepository.existsBySku(request.getSku())) {
    throw new BusinessRuleException("Product with SKU '" + request.getSku() + "' already exists");
}
```
- **How it works**: The frontend modal auto-generates a suggested 4-digit code `SKU-XXXX` using JavaScript's `Math.random()`. The user can override this with any custom code. When submitted, the backend verifies uniqueness against the database table `products(sku)`.

---

## 4. BACKEND IMPLEMENTATION

### 4.1 API Endpoints Catalog

| HTTP Method | Route | Role Required | Controller & Method | Service Method | Tables Read / Written |
|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | Public | `AuthController.login` | `AuthService.login` | `users` (Read) |
| `GET` | `/api/auth/me` | Authenticated | `AuthController.getCurrentUser` | Direct Principal return | `users` (Read) |
| `GET` | `/api/dashboard/stats` | Authenticated | `DashboardController.getStats` | `DashboardService.getStats` | `products`, `inventory`, `customer_orders`, `shipments` (Read) |
| `GET` | `/api/dashboard/charts` | Authenticated | `DashboardController.getCharts` | `DashboardService.getChartData` | `customer_orders`, `order_items`, `products` (Read) |
| `GET` | `/api/categories` | Authenticated | `CategoryController.getAllCategories`| `CategoryService.getAllCategories` | `categories` (Read) |
| `GET` | `/api/categories/{id}` | Authenticated | `CategoryController.getCategoryById`| `CategoryService.getCategoryById` | `categories` (Read) |
| `POST` | `/api/categories` | `ADMIN` | `CategoryController.createCategory` | `CategoryService.createCategory` | `categories` (Write) |
| `PUT` | `/api/categories/{id}` | `ADMIN` | `CategoryController.updateCategory` | `CategoryService.updateCategory` | `categories` (Write) |
| `DELETE` | `/api/categories/{id}` | `ADMIN` | `CategoryController.deleteCategory` | `CategoryService.deleteCategory` | `categories` (Delete) |
| `GET` | `/api/products` | Authenticated | `ProductController.getAllProducts` | `ProductService.getAllProducts` | `products`, `categories` (Read) |
| `GET` | `/api/products/{id}` | Authenticated | `ProductController.getProductById` | `ProductService.getProductById` | `products`, `categories` (Read) |
| `GET` | `/api/products/low-stock` | Authenticated | `ProductController.getLowStockProducts`| `ProductService.getLowStockProducts` | `products`, `inventory` (Read) |
| `POST` | `/api/products` | `ADMIN` | `ProductController.createProduct` | `ProductService.createProduct` | `products` (Write) |
| `PUT` | `/api/products/{id}` | `ADMIN` | `ProductController.updateProduct` | `ProductService.updateProduct` | `products` (Write) |
| `DELETE` | `/api/products/{id}` | `ADMIN` | `ProductController.deleteProduct` | `ProductService.deleteProduct` | `products` (Delete) |
| `GET` | `/api/suppliers` | Authenticated | `SupplierController.getAllSuppliers` | `SupplierService.getAllSuppliers` | `suppliers` (Read) |
| `GET` | `/api/suppliers/{id}` | Authenticated | `SupplierController.getSupplierById` | `SupplierService.getSupplierById` | `suppliers` (Read) |
| `POST` | `/api/suppliers` | `ADMIN` | `SupplierController.createSupplier` | `SupplierService.createSupplier` | `suppliers` (Write) |
| `PUT` | `/api/suppliers/{id}` | `ADMIN` | `SupplierController.updateSupplier` | `SupplierService.updateSupplier` | `suppliers` (Write) |
| `DELETE` | `/api/suppliers/{id}` | `ADMIN` | `SupplierController.deleteSupplier` | `SupplierService.deleteSupplier` | `suppliers` (Delete) |
| `GET` | `/api/warehouses` | Authenticated | `WarehouseController.getAllWarehouses` | `WarehouseService.getAllWarehouses`| `warehouses` (Read) |
| `GET` | `/api/warehouses/{id}` | Authenticated | `WarehouseController.getWarehouseById` | `WarehouseService.getWarehouseById`| `warehouses` (Read) |
| `POST` | `/api/warehouses` | `ADMIN` | `WarehouseController.createWarehouse` | `WarehouseService.createWarehouse`| `warehouses` (Write) |
| `PUT` | `/api/warehouses/{id}` | `ADMIN` | `WarehouseController.updateWarehouse` | `WarehouseService.updateWarehouse`| `warehouses` (Write) |
| `DELETE` | `/api/warehouses/{id}` | `ADMIN` | `WarehouseController.deleteWarehouse` | `WarehouseService.deleteWarehouse`| `warehouses` (Delete) |
| `GET` | `/api/inventory` | Authenticated | `InventoryController.getAllInventory` | `InventoryService.getAllInventory` | `inventory`, `products`, `warehouses` (Read) |
| `POST` | `/api/inventory/adjust`| Authenticated | `InventoryController.adjustStock` | `InventoryService.adjustStock` | `inventory`, `stock_transactions` (Write) |
| `GET` | `/api/purchase-orders` | Authenticated | `PurchaseOrderController.getAllOrders` | `PurchaseOrderService.getAllPurchaseOrders` | `purchase_orders`, `purchase_order_items` (Read) |
| `GET` | `/api/purchase-orders/{id}` | Authenticated | `PurchaseOrderController.getOrderById` | `PurchaseOrderService.getPurchaseOrderById` | `purchase_orders`, `purchase_order_items` (Read) |
| `POST` | `/api/purchase-orders` | `ADMIN` | `PurchaseOrderController.createOrder` | `PurchaseOrderService.createPurchaseOrder` | `purchase_orders`, `purchase_order_items` (Write) |
| `PATCH`| `/api/purchase-orders/{id}/status` | Authenticated | `PurchaseOrderController.updateStatus` | `PurchaseOrderService.updateStatus` | `purchase_orders`, `inventory`, `stock_transactions` (Write) |
| `GET` | `/api/customer-orders` | Authenticated | `CustomerOrderController.getAllOrders` | `CustomerOrderService.getAllCustomerOrders` | `customer_orders`, `order_items` (Read) |
| `GET` | `/api/customer-orders/{id}` | Authenticated | `CustomerOrderController.getOrderById` | `CustomerOrderService.getCustomerOrderById` | `customer_orders`, `order_items` (Read) |
| `POST` | `/api/customer-orders` | Authenticated | `CustomerOrderController.createOrder` | `CustomerOrderService.createCustomerOrder` | `customer_orders`, `order_items` (Write) |
| `POST` | `/api/customer-orders/{id}/confirm` | Authenticated | `CustomerOrderController.confirmOrder` | `CustomerOrderService.confirmAndReserveStock` | `customer_orders`, `inventory` (Row Lock), `stock_transactions` (Write) |
| `POST` | `/api/customer-orders/{id}/cancel` | Authenticated | `CustomerOrderController.cancelOrder` | `CustomerOrderService.cancelOrder` | `customer_orders`, `inventory`, `stock_transactions` (Write) |
| `GET` | `/api/shipments` | Authenticated | `ShipmentController.getAllShipments` | `ShipmentService.getAllShipments` | `shipments`, `customer_orders` (Read) |
| `GET` | `/api/shipments/{id}` | Authenticated | `ShipmentController.getShipmentById` | `ShipmentService.getShipmentById` | `shipments` (Read) |
| `POST` | `/api/shipments` | Authenticated | `ShipmentController.createShipment` | `ShipmentService.createShipment` | `shipments`, `customer_orders` (Write) |
| `PATCH`| `/api/shipments/{id}/status` | Authenticated | `ShipmentController.updateStatus` | `ShipmentService.updateShipmentStatus` | `shipments`, `customer_orders`, `inventory`, `stock_transactions` (Write) |
| `GET` | `/api/stock-transactions` | Authenticated | `StockTransactionController.getTransactions` | `StockTransactionService.getRecentTransactions` | `stock_transactions` (Read) |

---

### 4.2 Complete Service Implementations

#### 1. `PurchaseOrderService.java`
```java
package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.PurchaseOrderRequest;
import com.inventory.smartinventory.entity.*;
import com.inventory.smartinventory.entity.enums.PurchaseOrderStatus;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryService inventoryService;

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAllByOrderByOrderDateDesc();
    }

    public PurchaseOrder getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request, User user) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleException("A purchase order must contain at least one product item");
        }

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + request.getWarehouseId()));

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber("PO-" + (System.currentTimeMillis() % 1000000));
        po.setSupplier(supplier);
        po.setWarehouse(warehouse);
        po.setStatus(PurchaseOrderStatus.PENDING);
        po.setCreatedBy(user);
        po.setOrderDate(LocalDateTime.now());
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseOrderItem> poItems = new ArrayList<>();

        for (PurchaseOrderRequest.PurchaseOrderItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDto.getProductId()));

            BigDecimal price = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : product.getUnitPrice();
            PurchaseOrderItem item = new PurchaseOrderItem(po, product, itemDto.getQuantity(), price);
            poItems.add(item);

            total = total.add(price.multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        po.setItems(poItems);
        po.setTotalAmount(total);

        return purchaseOrderRepository.save(po);
    }

    @Transactional(rollbackFor = Exception.class)
    public PurchaseOrder updateStatus(Long poId, PurchaseOrderStatus newStatus, User user) {
        PurchaseOrder po = getPurchaseOrderById(poId);

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot alter status of a " + po.getStatus() + " purchase order");
        }

        if (newStatus == PurchaseOrderStatus.RECEIVED) {
            for (PurchaseOrderItem item : po.getItems()) {
                item.setReceivedQuantity(item.getOrderedQuantity());
                inventoryService.addStock(
                        item.getProduct(), po.getWarehouse(), item.getOrderedQuantity(),
                        po.getPoNumber(), "Received from Purchase Order " + po.getPoNumber(), user
                );
            }
            po.setReceivedDate(LocalDateTime.now());
        }

        po.setStatus(newStatus);
        return purchaseOrderRepository.save(po);
    }
}
```

#### 2. `CustomerOrderService.java`
```java
package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.CustomerOrderRequest;
import com.inventory.smartinventory.entity.*;
import com.inventory.smartinventory.entity.enums.CustomerOrderStatus;
import com.inventory.smartinventory.entity.enums.TransactionType;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.InsufficientStockException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomerOrderService {

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StockTransactionService stockTransactionService;

    public List<CustomerOrder> getAllCustomerOrders() {
        return customerOrderRepository.findAllByOrderByOrderDateDesc();
    }

    public CustomerOrder getCustomerOrderById(Long id) {
        return customerOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with ID: " + id));
    }

    @Transactional
    public CustomerOrder createCustomerOrder(CustomerOrderRequest request, User user) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleException("Order must contain at least one product item");
        }

        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber("ORD-" + (System.currentTimeMillis() % 1000000));
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(CustomerOrderStatus.PENDING);
        order.setCreatedBy(user);
        order.setOrderDate(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (CustomerOrderRequest.CustomerOrderItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDto.getProductId()));

            BigDecimal subtotal = product.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            OrderItem item = new OrderItem(order, product, itemDto.getQuantity(), product.getUnitPrice(), subtotal);
            items.add(item);
            total = total.add(subtotal);
        }

        order.setItems(items);
        order.setTotalAmount(total);

        return customerOrderRepository.save(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public CustomerOrder confirmAndReserveStock(Long orderId, Long warehouseId, User user) {
        CustomerOrder order = getCustomerOrderById(orderId);
        if (order.getStatus() != CustomerOrderStatus.PENDING) {
            throw new BusinessRuleException("Only PENDING orders can be confirmed and reserved. Current status: " + order.getStatus());
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        for (OrderItem item : order.getItems()) {
            Inventory inv = inventoryRepository.lockByProductIdAndWarehouseId(item.getProduct().getId(), warehouseId)
                    .orElseThrow(() -> new InsufficientStockException("Product '" + item.getProduct().getName() + "' is not available in warehouse '" + warehouse.getName() + "'"));

            if (inv.getQuantityAvailable() < item.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product '" + item.getProduct().getName() + "'. Required: " + item.getQuantity() + ", Available: " + inv.getQuantityAvailable());
            }
        }

        for (OrderItem item : order.getItems()) {
            Inventory inv = inventoryRepository.lockByProductIdAndWarehouseId(item.getProduct().getId(), warehouseId).get();
            inv.setQuantityAvailable(inv.getQuantityAvailable() - item.getQuantity());
            inv.setQuantityReserved(inv.getQuantityReserved() + item.getQuantity());
            inventoryRepository.save(inv);

            stockTransactionService.recordTransaction(
                    item.getProduct(), warehouse, TransactionType.STOCK_RESERVATION,
                    item.getQuantity(), order.getOrderNumber(), "Reserved stock for Order " + order.getOrderNumber(), user
            );
        }

        order.setStatus(CustomerOrderStatus.CONFIRMED);
        return customerOrderRepository.save(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public CustomerOrder cancelOrder(Long orderId, Long warehouseId, User user) {
        CustomerOrder order = getCustomerOrderById(orderId);

        if (order.getStatus() == CustomerOrderStatus.DELIVERED || order.getStatus() == CustomerOrderStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot cancel an order that is already " + order.getStatus());
        }

        if (order.getStatus() == CustomerOrderStatus.CONFIRMED || order.getStatus() == CustomerOrderStatus.PROCESSING) {
            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

            for (OrderItem item : order.getItems()) {
                inventoryRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), warehouseId).ifPresent(inv -> {
                    int releaseQty = Math.min(inv.getQuantityReserved(), item.getQuantity());
                    inv.setQuantityReserved(inv.getQuantityReserved() - releaseQty);
                    inv.setQuantityAvailable(inv.getQuantityAvailable() + releaseQty);
                    inventoryRepository.save(inv);

                    stockTransactionService.recordTransaction(
                            item.getProduct(), warehouse, TransactionType.STOCK_RELEASE,
                            releaseQty, order.getOrderNumber(), "Released reserved stock due to order cancellation", user
                    );
                });
            }
        }

        order.setStatus(CustomerOrderStatus.CANCELLED);
        return customerOrderRepository.save(order);
    }
}
```

#### 3. `ShipmentService.java`
```java
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
```

#### 4. `InventoryService.java`
```java
package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.StockAdjustmentRequest;
import com.inventory.smartinventory.entity.Inventory;
import com.inventory.smartinventory.entity.Product;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.entity.Warehouse;
import com.inventory.smartinventory.entity.enums.TransactionType;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.InsufficientStockException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.InventoryRepository;
import com.inventory.smartinventory.repository.ProductRepository;
import com.inventory.smartinventory.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private StockTransactionService stockTransactionService;

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId);
    }

    public List<Inventory> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    public Optional<Inventory> getInventory(Long productId, Long warehouseId) {
        return inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId);
    }

    @Transactional
    public Inventory addStock(Product product, Warehouse warehouse, int quantity, String refId, String reason, User user) {
        Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElse(new Inventory(product, warehouse, 0, 0));

        inv.setQuantityAvailable(inv.getQuantityAvailable() + quantity);
        Inventory saved = inventoryRepository.save(inv);

        stockTransactionService.recordTransaction(product, warehouse, TransactionType.STOCK_IN, quantity, refId, reason, user);
        return saved;
    }

    @Transactional
    public Inventory adjustStock(StockAdjustmentRequest request, User user) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));

        Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElse(new Inventory(product, warehouse, 0, 0));

        int newAvailable = inv.getQuantityAvailable() + request.getAdjustmentQuantity();
        if (newAvailable < 0) {
            throw new InsufficientStockException("Inventory cannot become negative. Current available: " + inv.getQuantityAvailable() + ", adjustment: " + request.getAdjustmentQuantity());
        }

        inv.setQuantityAvailable(newAvailable);
        Inventory saved = inventoryRepository.save(inv);

        stockTransactionService.recordTransaction(
                product, warehouse, TransactionType.STOCK_ADJUSTMENT,
                request.getAdjustmentQuantity(), "ADJ-" + (System.currentTimeMillis() % 100000),
                request.getReason() != null ? request.getReason() : "Manual stock adjustment", user
        );
        return saved;
    }
}
```

#### 5. `StockTransactionService.java`
```java
package com.inventory.smartinventory.service;

import com.inventory.smartinventory.entity.Product;
import com.inventory.smartinventory.entity.StockTransaction;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.entity.Warehouse;
import com.inventory.smartinventory.entity.enums.TransactionType;
import com.inventory.smartinventory.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockTransactionService {

    @Autowired
    private StockTransactionRepository transactionRepository;

    @Transactional
    public StockTransaction recordTransaction(Product product, Warehouse warehouse, TransactionType type,
                                             int quantity, String referenceId, String description, User user) {
        StockTransaction tx = new StockTransaction(product, warehouse, type, quantity, referenceId, description, user);
        return transactionRepository.save(tx);
    }

    public List<StockTransaction> getRecentTransactions() {
        return transactionRepository.findTop50ByOrderByTransactionDateDesc();
    }

    public List<StockTransaction> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductId(productId);
    }

    public List<StockTransaction> getTransactionsByWarehouse(Long warehouseId) {
        return transactionRepository.findByWarehouseId(warehouseId);
    }
}
```

#### 6. `ProductService.java`
```java
package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.ProductRequest;
import com.inventory.smartinventory.entity.Category;
import com.inventory.smartinventory.entity.Product;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.CategoryRepository;
import com.inventory.smartinventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return productRepository.findAll();
        }
        return productRepository.searchProducts(query.trim());
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    @Transactional
    public Product createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BusinessRuleException("Product with SKU '" + request.getSku() + "' already exists");
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Product product = new Product(
                category,
                request.getSku(),
                request.getName(),
                request.getDescription(),
                request.getUnitPrice(),
                request.getReorderLevel()
        );
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        if (!product.getSku().equalsIgnoreCase(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new BusinessRuleException("Product with SKU '" + request.getSku() + "' already exists");
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        product.setCategory(category);
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setUnitPrice(request.getUnitPrice());
        product.setReorderLevel(request.getReorderLevel());

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        try {
            productRepository.delete(product);
        } catch (Exception e) {
            throw new BusinessRuleException("Cannot delete product as it has active inventory or order history.");
        }
    }
}
```

---

### 4.3 Status Enums & State Machine Lifecycles

#### 1. `PurchaseOrderStatus`
Allowed values: `PENDING`, `APPROVED`, `ORDERED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`
```
[PENDING] --------> [APPROVED] --------> [ORDERED] --------> [RECEIVED]
   |                    |                    |
   +--------------------+--------------------+-------------> [CANCELLED]
```
- **Code Enforcement**:
  - `PurchaseOrderService.createPurchaseOrder()` forces initial state to `PENDING`.
  - `PurchaseOrderService.updateStatus()` enforces: if status is `RECEIVED` or `CANCELLED`, throw `BusinessRuleException("Cannot alter status of a " + po.getStatus() + " purchase order")`.
  - Only when changing to `RECEIVED` does the method trigger inventory increment and `receivedDate` assignment.
  - Allowed forward transitions are guided by the UI buttons in `PurchaseOrders.jsx`.

#### 2. `CustomerOrderStatus`
Allowed values: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
```
[PENDING] --------> [CONFIRMED] --------> [PROCESSING] --------> [SHIPPED] --------> [DELIVERED]
   |                    |                      |
   +--------------------+----------------------+------------------------------------> [CANCELLED]
```
- **Code Enforcement**:
  - `CustomerOrderService.createCustomerOrder()` sets initial state to `PENDING`.
  - `CustomerOrderService.confirmAndReserveStock()` requires `order.getStatus() == PENDING`, locks rows, and moves status to `CONFIRMED`.
  - `ShipmentService.createShipment()` requires `order.getStatus() == CONFIRMED || PROCESSING`, transitioning status to `PROCESSING`.
  - `ShipmentService.updateShipmentStatus(DISPATCHED)` moves order to `SHIPPED`.
  - `ShipmentService.updateShipmentStatus(DELIVERED)` moves order to `DELIVERED`.
  - `CustomerOrderService.cancelOrder()` strictly forbids canceling `DELIVERED` or `CANCELLED` orders. If order is `CONFIRMED` or `PROCESSING`, it automatically restores reserved stock back to available stock before setting status to `CANCELLED`.

#### 3. `ShipmentStatus`
Allowed values: `PREPARING`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, `DELAYED`, `CANCELLED`
```
[PREPARING] --------> [DISPATCHED] --------> [IN_TRANSIT] / [DELAYED] --------> [DELIVERED]
     |
     +--------------> [CANCELLED] (reverts customer order from PROCESSING back to CONFIRMED)
```
- **Code Enforcement**:
  - `ShipmentService.createShipment()` initializes status to `PREPARING`.
  - `ShipmentService.updateShipmentStatus()` consumes reserved inventory and logs `STOCK_OUT` if and only if transitioning from `PREPARING` to `DISPATCHED`.
  - If a shipment in `PREPARING` is `CANCELLED`, line 98 of `ShipmentService` automatically reverts the corresponding customer order status from `PROCESSING` back to `CONFIRMED`.

---

### 4.4 Transaction Control and Row Locking

#### `@Transactional` Annotations
- **`PurchaseOrderService.createPurchaseOrder()`**: Ensures atomic insertion of the PO header and all child `PurchaseOrderItem` rows.
- **`PurchaseOrderService.updateStatus()` (`rollbackFor = Exception.class`)**: Ensures that looping over all order items, incrementing stock in `inventory`, writing audit rows into `stock_transactions`, and updating the PO status either fully succeed together or roll back completely on any error.
- **`CustomerOrderService.confirmAndReserveStock()` (`rollbackFor = Exception.class`)**: Wraps validation, pessimistic row lock acquisition, available stock deduction, reserved stock addition, and audit log generation in a single ACID database transaction.
- **`CustomerOrderService.cancelOrder()` (`rollbackFor = Exception.class`)**: Wraps reserved stock release and cancellation status updates in an atomic transaction.
- **`ShipmentService.updateShipmentStatus()` (`rollbackFor = Exception.class`)**: Protects the simultaneous deduction of `quantity_reserved` across multiple products and the recording of `STOCK_OUT` audit records upon dispatch.

#### Pessimistic Row Locking (`FOR UPDATE`)
In [InventoryRepository.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/repository/InventoryRepository.java#L17-L20):
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.warehouse.id = :warehouseId")
Optional<Inventory> lockByProductIdAndWarehouseId(@Param("productId") Long productId,
                                                 @Param("warehouseId") Long warehouseId);
```
- **Where it is used**: Inside `CustomerOrderService.confirmAndReserveStock()` (lines 93 and 102).
- **Why it is critical**: When multiple warehouse operators confirm different orders that request the same limited stock simultaneously, normal read-then-write operations cause **race conditions** (two requests see 5 units available, both deduct 5, resulting in negative stock). `LockModeType.PESSIMISTIC_WRITE` issues a native SQL `SELECT ... FOR UPDATE`, placing an exclusive row-level lock in InnoDB/H2 on that specific product-warehouse inventory row until the outer transaction commits. Any competing transaction is forced to wait in queue.

---

### 4.5 Error Handling Architecture

Centralized exception handling is implemented in [GlobalExceptionHandler.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/exception/GlobalExceptionHandler.java):

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse err = new ErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND.value());
        return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientStock(InsufficientStockException ex) {
        ErrorResponse err = new ErrorResponse(ex.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY.value());
        return new ResponseEntity<>(err, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(BusinessRuleException ex) {
        ErrorResponse err = new ErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", "Validation failed");
        body.put("errors", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse err = new ErrorResponse(
            ex.getMessage() != null ? ex.getMessage() : "Internal Server Error", 
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

| Exception Class | HTTP Status Code | Scenario Triggered |
|---|---|---|
| `ResourceNotFoundException` | `404 Not Found` | Entity with requested ID does not exist in repository |
| `InsufficientStockException` | `422 Unprocessable Entity` | Available quantity is lower than required order units, or manual adjustment would drop stock below zero |
| `BusinessRuleException` | `400 Bad Request` | Invalid status transition (e.g. canceling delivered order), duplicate SKU, empty order items list |
| `MethodArgumentNotValidException` | `400 Bad Request` | Jakarta Bean validation failure (`@NotNull`, `@Min`, `@FutureOrPresent`, etc.) |
| `Exception` | `500 Internal Server Error`| Unhandled database error or unexpected server failure |

---

### 4.6 Security & Authentication Workflow

```
Client (Browser)                 Backend Filter Chain                    Controllers
       |                                  |                                   |
       |--- POST /api/auth/login -------->| (Permitted by SecurityConfig)     |
       |    {username, password}          |                                   |
       |                                  |==========> AuthService ===========|
       |                                  |     1. Find user by username      |
       |                                  |     2. BCrypt.matches()           |
       |                                  |     3. JwtUtil.generateToken()    |
       |<-- 200 OK + JWT Token -----------|                                   |
       |                                  |                                   |
       |--- GET /api/products ----------->|                                   |
       |    Authorization: Bearer <jwt>   |                                   |
       |                                  |== JwtAuthenticationFilter ==      |
       |                                  |   1. Extract Bearer header        |
       |                                  |   2. Parse claims & expiration    |
       |                                  |   3. Build SecurityContext        |
       |                                  |      auth with ROLE_<ROLE>        |
       |                                  |                                   |
       |                                  |== @PreAuthorize("hasRole(...)") ==|
       |<-- 200 OK + JSON Response -------|                                   |
```

1. **Authentication**: Client submits credentials to `/api/auth/login`. [AuthService.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/service/AuthService.java) looks up user in `UserRepository`, checks `isActive`, and verifies password hash using Spring Security's `PasswordEncoder` (BCrypt).
2. **Token Generation**: [JwtUtil.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/config/JwtUtil.java) signs an HMAC-SHA256 JWT containing the username as subject and `role` claim, with a 24-hour expiration (`86400000` ms).
3. **Filter Interception**: [JwtAuthenticationFilter.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/config/JwtAuthenticationFilter.java) intercepts incoming HTTP requests. If an `Authorization: Bearer <token>` header is present, it validates the cryptographic signature and token expiration. Upon success, it instantiates a `UsernamePasswordAuthenticationToken` carrying the granted authority `ROLE_ADMIN` or `ROLE_EMPLOYEE` and attaches it to `SecurityContextHolder`.
4. **Method Security**: Controllers use `@PreAuthorize("hasRole('ADMIN')")` on mutation routes (e.g. creating products, categories, suppliers, warehouses, and drafting purchase orders). Non-admin users attempting to invoke these methods receive HTTP `403 Forbidden`.

---

## 5. FRONTEND ARCHITECTURE

### 5.1 Page Breakdown

| Page File | Purpose | Key API Calls | User Actions | Frontend Form Validations |
|---|---|---|---|---|
| [Login.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Login.jsx) | Authentication & session entry | `POST /api/auth/login` | Enter credentials, quick-fill demo buttons, submit login | Required `username` and `password` |
| [Dashboard.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Dashboard.jsx) | Operational KPI metrics & charts | `GET /api/dashboard/stats`<br>`GET /api/dashboard/charts` | View system health, inventory totals, pending orders | Read-only |
| [Products.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Products.jsx) | Catalog item catalog & reorder levels | `GET /api/products`<br>`GET /api/categories`<br>`POST /api/products`<br>`PUT /api/products/{id}`<br>`DELETE /api/products/{id}` | Search catalog, filter by category, Add Product (`ADMIN`), Edit (`ADMIN`), Delete (`ADMIN`) | Non-blank `sku`, `name`, `categoryId`, `unitPrice >= 0`, `reorderLevel >= 0` |
| [Categories.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Categories.jsx) | Catalog classification groups | `GET /api/categories`<br>`POST /api/categories`<br>`PUT /api/categories/{id}`<br>`DELETE /api/categories/{id}` | Search, Add (`ADMIN`), Edit (`ADMIN`), Delete (`ADMIN`) | Non-blank category `name` |
| [Inventory.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Inventory.jsx) | Multi-warehouse stock balances & adjustments | `GET /api/inventory`<br>`GET /api/warehouses`<br>`GET /api/products`<br>`POST /api/inventory/adjust` | Filter by warehouse/product, view available/reserved stock, Adjust Stock (positive or negative) | Non-blank `productId`, `warehouseId`, non-zero `adjustmentQuantity`, non-blank `reason` |
| [PurchaseOrders.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/PurchaseOrders.jsx) | Procurement orders from vendors | `GET /api/purchase-orders`<br>`GET /api/suppliers`<br>`GET /api/warehouses`<br>`GET /api/products`<br>`POST /api/purchase-orders`<br>`PATCH /api/purchase-orders/{id}/status` | Create PO (`ADMIN`), Approve (`ADMIN`), Order (`ADMIN`), Receive Goods (All authenticated users), Cancel (`ADMIN`) | `expectedDeliveryDate >= today` (`min={todayStr}`), valid `supplierId`, `warehouseId`, item line qty $\ge 1$, price $\ge 0$ |
| [CustomerOrders.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/CustomerOrders.jsx) | Sales order entry & fulfillment reservation | `GET /api/customer-orders`<br>`GET /api/products`<br>`GET /api/warehouses`<br>`POST /api/customer-orders`<br>`POST /api/customer-orders/{id}/confirm`<br>`POST /api/customer-orders/{id}/cancel` | Create Order with dynamic line items, Confirm & Reserve stock at selected warehouse, Cancel order | Valid email format, required name and address, line item qty $\ge 1$ |
| [Shipments.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Shipments.jsx) | Outbound carrier dispatches | `GET /api/shipments`<br>`GET /api/customer-orders`<br>`GET /api/warehouses`<br>`POST /api/shipments`<br>`PATCH /api/shipments/{id}/status` | Create Shipment for confirmed order, Update status (`DISPATCHED`, `DELIVERED`, `CANCELLED`) | Non-blank `carrier`, valid `orderId` and `warehouseId` |
| [StockTransactions.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/StockTransactions.jsx) | Audit trail of all stock movements | `GET /api/stock-transactions`<br>`GET /api/products`<br>`GET /api/warehouses` | Filter transaction ledger by product or warehouse, inspect movement types | Read-only |
| [Suppliers.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Suppliers.jsx) | Vendor directory & contact management | `GET /api/suppliers`<br>`POST /api/suppliers`<br>`PUT /api/suppliers/{id}`<br>`DELETE /api/suppliers/{id}` | Search, Add (`ADMIN`), Edit (`ADMIN`), Delete (`ADMIN`) | Non-blank `name`, valid `email`, valid `phone` |
| [Warehouses.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/Warehouses.jsx) | Storage facility configuration | `GET /api/warehouses`<br>`POST /api/warehouses`<br>`PUT /api/warehouses/{id}`<br>`DELETE /api/warehouses/{id}` | Search, Add (`ADMIN`), Edit (`ADMIN`), Delete (`ADMIN`) | Non-blank `name`, `location`, `capacity >= 1` |
| [ProfileSettings.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/ProfileSettings.jsx) | Operator profile & sign-out | `GET /api/auth/me` | View user profile details and sign out | Read-only |

### 5.2 Navigation, Routing, and Role-Based UI Guards

Defined in [App.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/App.jsx):
- **`PublicRoute`**: Accessible only when unauthenticated. If a logged-in user navigates to `/login`, they are redirected to `/`.
- **`ProtectedLayout`**: Verifies `user` in `AuthContext`. If missing, immediately redirects to `/login`. Wraps the page in the `Sidebar` and `Navbar`. Supports `adminOnly` prop to bounce non-administrators back to `/`.

#### Role-Based Button Visibility Matrix
- **`Categories.jsx`**: "Add Category" button, table "Actions" column, Edit and Delete buttons are rendered `{isAdmin && ...}`.
- **`Products.jsx`**: "Add Product" button, table "Actions" column, Edit and Delete buttons are rendered `{isAdmin && ...}`.
- **`Suppliers.jsx`**: "Add Supplier" button, table "Actions" column, Edit and Delete buttons are rendered `{isAdmin && ...}`.
- **`Warehouses.jsx`**: "Add Warehouse" button, table "Actions" column, Edit and Delete buttons are rendered `{isAdmin && ...}`.
- **`PurchaseOrders.jsx`**:
  - "Create Purchase Order" button rendered `{isAdmin && ...}`.
  - "Approve" button (`PENDING` state) rendered `{isAdmin && ...}`.
  - "Place Order" button (`APPROVED` state) rendered `{isAdmin && ...}`.
  - "Cancel" button rendered `{isAdmin && ...}`.
  - **"Receive Goods" button**: Available to **both** `ADMIN` and `EMPLOYEE`, enabling floor warehouse associates to accept incoming stock shipments.

---

## 6. COMPLETE END-TO-END SYSTEM FLOWS

### Flow A: Procurement Cycle (Purchase Order to Stock In)
1. **Creation**:
   - Operator fills out PO form in `PurchaseOrders.jsx` (Supplier, Warehouse, Expected Date, Line Items).
   - `POST /api/purchase-orders` invokes `PurchaseOrderService.createPurchaseOrder()`.
   - PO created with status `PENDING`, `totalAmount` calculated, child rows written to `purchase_order_items`. No inventory modified yet.
2. **Approval & Placement**:
   - Admin clicks "Approve": `PATCH /api/purchase-orders/{id}/status?status=APPROVED`. Status updates to `APPROVED`.
   - Admin clicks "Place Order": `PATCH /api/purchase-orders/{id}/status?status=ORDERED`. Status updates to `ORDERED`.
3. **Goods Acceptance (Stock In)**:
   - Floor associate clicks "Receive Goods": `PATCH /api/purchase-orders/{id}/status?status=RECEIVED`.
   - `PurchaseOrderService.updateStatus()` iterates through each item in `po.getItems()`.
   - Sets `item.setReceivedQuantity(item.getOrderedQuantity())`.
   - Calls `InventoryService.addStock()`:
     - Looks up row in `inventory` for `(product_id, warehouse_id)`. If missing, creates a new `Inventory` entity.
     - Increments `quantity_available = quantity_available + item.getOrderedQuantity()`.
     - Calls `StockTransactionService.recordTransaction()`: inserts a row into `stock_transactions` with `transaction_type = 'STOCK_IN'`, `reference_id = po.getPoNumber()`.
   - Updates `po.status = RECEIVED` and `po.receivedDate = NOW()`.

### Flow B: Order Fulfillment Cycle (Customer Order to Delivery)
1. **Order Creation**:
   - Operator creates order in `CustomerOrders.jsx` with customer contact and item line list.
   - `POST /api/customer-orders` invokes `CustomerOrderService.createCustomerOrder()`.
   - Calculates line subtotals and order `totalAmount`.
   - Inserts row into `customer_orders` (status `PENDING`) and child rows into `order_items`. Inventory is not modified.
2. **Stock Reservation**:
   - Operator clicks "Confirm Order", selecting a fulfillment warehouse.
   - `POST /api/customer-orders/{id}/confirm?warehouseId=X` invokes `CustomerOrderService.confirmAndReserveStock()`.
   - **Row Locking**: Service calls `inventoryRepository.lockByProductIdAndWarehouseId()` executing a pessimistic write lock (`SELECT ... FOR UPDATE`).
   - Verifies that `quantity_available >= item.getQuantity()`.
   - Modifies `inventory`:
     - `quantity_available = quantity_available - quantity`
     - `quantity_reserved = quantity_reserved + quantity`
   - Logs an audit row in `stock_transactions`: `transaction_type = 'STOCK_RESERVATION'`.
   - Updates `customer_orders.status = CONFIRMED`.
3. **Shipment Preparation**:
   - In `Shipments.jsx`, operator clicks "Create Shipment" for the confirmed order.
   - `POST /api/shipments` invokes `ShipmentService.createShipment()`.
   - Creates row in `shipments` with `trackingNumber = "TRK-..."` and `status = PREPARING`.
   - Automatically transitions `customer_orders.status = PROCESSING`.
4. **Carrier Dispatch (Stock Out)**:
   - Operator marks shipment as "Dispatch": `PATCH /api/shipments/{id}/status?status=DISPATCHED`.
   - `ShipmentService.updateShipmentStatus()` consumes the reserved stock:
     - Deducts `inventory.quantity_reserved = inventory.quantity_reserved - item.getQuantity()`.
     - Inserts row into `stock_transactions`: `transaction_type = 'STOCK_OUT'`.
   - Updates `shipments.shippedDate = NOW()`.
   - Transitions `customer_orders.status = SHIPPED`.
5. **Delivery**:
   - Carrier delivers goods: `PATCH /api/shipments/{id}/status?status=DELIVERED`.
   - Sets `shipments.deliveredDate = NOW()` and `customer_orders.status = DELIVERED`.

### Flow C: Order Cancellation
1. **Trigger**:
   - Operator clicks "Cancel" on an order in `CustomerOrders.jsx`.
   - `POST /api/customer-orders/{id}/cancel?warehouseId=X` invokes `CustomerOrderService.cancelOrder()`.
2. **State Validation**:
   - If order is `DELIVERED` or `CANCELLED`, throws `BusinessRuleException`.
3. **Stock Release**:
   - If order was in `CONFIRMED` or `PROCESSING` state, stock was previously reserved.
   - For each item, service looks up `inventory` row by `(product_id, warehouseId)`:
     - `quantity_reserved = quantity_reserved - releaseQty`
     - `quantity_available = quantity_available + releaseQty`
     - Inserts row into `stock_transactions`: `transaction_type = 'STOCK_RELEASE'`.
   - Updates `customer_orders.status = CANCELLED`.

### Flow D: Product Catalog Lifecycle (Add, Edit, Delete)
1. **Add**: Admin submits `ProductRequest`. Uniqueness of `sku` is validated. Product is saved in `products`.
2. **Edit**: Admin edits details. If SKU was modified, uniqueness check is rerun.
3. **Delete**: Admin clicks Delete. `ProductService.deleteProduct()` executes `productRepository.delete(product)`.
   - If product has associated foreign keys in `inventory`, `order_items`, `purchase_order_items`, or `stock_transactions`, foreign key constraint `ON DELETE RESTRICT` causes the DB to throw a constraint violation exception.
   - Caught by service and rethrown as `BusinessRuleException("Cannot delete product as it has active inventory or order history.")`.

### Flow E: Manual Stock Adjustment
1. Operator opens "Adjust Stock" modal in `Inventory.jsx` (Product, Warehouse, Quantity delta, Reason).
2. `POST /api/inventory/adjust` invokes `InventoryService.adjustStock()`.
3. Service calculates `newAvailable = inv.getQuantityAvailable() + delta`.
4. If `newAvailable < 0`, throws `InsufficientStockException` ("Inventory cannot become negative").
5. Saves new quantity in `inventory`.
6. Inserts row into `stock_transactions`: `transaction_type = 'STOCK_ADJUSTMENT'`, `quantity = delta`, `reference_id = 'ADJ-...'`.

### Flow F: User Authentication & Session Restore
1. Operator inputs username and password on `/login`.
2. `POST /api/auth/login` verifies BCrypt password against `users` table.
3. Backend returns signed JWT containing username and role.
4. Frontend `AuthContext` stores token and user metadata in `localStorage`.
5. Axios request interceptor attaches `Authorization: Bearer <token>` to all subsequent HTTP requests.
6. On page refresh, `AuthContext` reads token from `localStorage` and queries `GET /api/auth/me` to restore the user session.

---

## 7. COMPLETE FEATURE LIST

1. **Role-Based Authentication**: Secure login supporting `ADMIN` and `EMPLOYEE` roles with BCrypt hashing and stateless HMAC-SHA256 JWT tokens.
2. **Executive Operational Dashboard**: Real-time KPI summaries for total products, low-stock alerts, total available stock, total reserved stock, and pending orders.
3. **Category Catalog Management**: Hierarchical categorization of goods with full administrative CRUD and deletion protection.
4. **Product Directory & SKU Engine**: Comprehensive product registry tracking unit prices, descriptions, reorder thresholds, and SKU uniqueness.
5. **Real-Time Product Search**: Instant keyword search across product names, descriptions, and SKUs.
6. **Multi-Warehouse Stock Monitoring**: Per-facility inventory tracking with separate available, reserved, and total on-hand balances.
7. **Pessimistic Concurrency Stock Reservation**: Multi-user race condition protection using database row locking (`FOR UPDATE`) during order confirmation.
8. **Automated Low-Stock Deficit Detection**: Automated detection of products below safety reorder levels.
9. **Supplier Directory & Procurement**: Vendor relationship management tracking contact persons, emails, phone numbers, and operational statuses.
10. **Purchase Order Workflow**: Complete procurement lifecycle: drafting, administrative approval, vendor ordering, and one-click goods receipt.
11. **Automatic Stock-In on PO Receipt**: Automated inventory balance increment and PO item count fulfillment upon accepting vendor deliveries.
12. **Customer Sales Order Processing**: Multi-item sales order placement with customer address tracking and automatic line subtotal calculations.
13. **Warehouse-Specific Order Fulfillment**: Choice of dispatch warehouse during order confirmation with validation of warehouse-specific stock levels.
14. **Customer Order Cancellation & Stock Release**: Order cancellation with restoration of reserved items back to available inventory.
15. **Shipment Dispatch & Tracking**: Outbound carrier assignment, automated tracking number generation, and dispatch timestamps.
16. **Automatic Stock-Out on Dispatch**: Automated deduction of reserved inventory and status transition to `SHIPPED` upon carrier handover.
17. **Immutable Stock Audit Trail**: Append-only transaction ledger recording all inventory deltas with reference IDs, reasons, timestamps, and operator attribution.
18. **Manual Inventory Adjustments**: Audited manual stock reconciliations with negative inventory guards.
19. **Warehouse Facility Configuration**: Physical facility directory managing nominal unit storage capacity, address locations, and status.
20. **Responsive UI System**: Clean, responsive layout with modals, status badges, and role-restricted buttons.

---

## 8. KNOWN LIMITATIONS & CODE OBSERVATIONS

1. **Order Cancellation Warehouse Parameter Fallback**:
   - *File*: [CustomerOrderController.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/controller/CustomerOrderController.java#L53)
   - *Observation*: The cancel endpoint declares `@RequestParam(defaultValue = "1") Long warehouseId`. If a customer order was confirmed and reserved against Warehouse 2, but cancelled without explicitly passing `warehouseId`, the system attempts to release the reservation from Warehouse 1.
2. **Hardcoded Fallback JWT Secret**:
   - *File*: [JwtUtil.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/config/JwtUtil.java#L17)
   - *Observation*: The JWT secret contains a hardcoded fallback string in `@Value("${jwt.secret:...}")` in the source code. In production, this should always be injected via environment variables.
3. **Database Views and Stored Procedures Not Invoked by Java Backend**:
   - *Files*: [02_views_and_procedures.sql](file:///C:/Users/Shivam/Desktop/smart-inventory-system/database/02_views_and_procedures.sql)
   - *Observation*: The 5 database views and 2 stored procedures defined in the SQL scripts are not mapped to JPA repository `@NamedStoredProcedureQuery` or `@ViewEntity` annotations. The Spring Boot backend implements equivalent transactional logic in Java service classes.
4. **Single-Warehouse Fulfillment per Customer Order**:
   - *File*: [CustomerOrderService.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/service/CustomerOrderService.java#L83)
   - *Observation*: `confirmAndReserveStock` takes a single `warehouseId` for the entire order. Split shipments across different warehouses for a single multi-item order are not natively supported.

---

## 9. RECENT FIXES & CLEANUP LOG

1. **DTO Validation Annotations**:
   - Added `@Valid` to nested list fields in [CustomerOrderRequest.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/dto/CustomerOrderRequest.java) and [PurchaseOrderRequest.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/dto/PurchaseOrderRequest.java) to ensure child item fields (`productId`, `quantity`, `unitPrice`) are validated.
   - Added `@NotNull` and `@Min(value = 1)` to line item quantities.
   - Added `@FutureOrPresent` on `expectedDeliveryDate` in `PurchaseOrderRequest.java`.
2. **Frontend Date Guard**:
   - Added `min={todayStr}` to the expected delivery date input on the PO creation modal in [PurchaseOrders.jsx](file:///C:/Users/Shivam/Desktop/smart-inventory-system/frontend/src/pages/PurchaseOrders.jsx) to prevent selecting past dates.
3. **Pessimistic Concurrency Locking**:
   - Implemented `@Lock(LockModeType.PESSIMISTIC_WRITE)` in [InventoryRepository.java](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/src/main/java/com/inventory/smartinventory/repository/InventoryRepository.java) to prevent stock race conditions during concurrent order confirmations.
4. **Maven Compiler Plugin Parameter Flag**:
   - Added `<parameters>true</parameters>` to `maven-compiler-plugin` in [pom.xml](file:///C:/Users/Shivam/Desktop/smart-inventory-system/backend/pom.xml) ensuring Java reflection preserves request parameter names in Spring MVC.
5. **Feature Removals**:
   - **Reports**: Deleted `ReportController.java`, `ReportService.java`, and `Reports.jsx`. Removed all associated routes, sidebar links, and security matchers.
   - **User Management (Admin Screen)**: Deleted `UserController.java`, `UserService.java`, and `UserManagement.jsx`. Retained core `User` entity, `UserRepository`, and authentication infrastructure.
   - **Stock Transfer**: Removed the `/transfer` endpoint from `InventoryController.java`, removed `transferStock` from `InventoryService.java`, and removed the transfer modal from `Inventory.jsx` (while preserving `TransactionType.TRANSFER` in the audit enum for historical data).
