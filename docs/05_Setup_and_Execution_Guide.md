# Smart Inventory and Supply Chain Management System
## End-to-End Setup, Configuration & Execution Manual

---

### 1. Project Directory Structure

```text
smart-inventory-system/
├── backend/                               # Spring Boot 3.3.5 Backend (Java 25)
│   ├── src/main/java/com/inventory/smartinventory/
│   │   ├── config/                        # SecurityConfig, JwtFilter, DataInitializer
│   │   ├── controller/                    # 13 REST Controllers
│   │   ├── dto/                           # Request & Response Payload DTOs
│   │   ├── entity/                        # 13 JPA Entities + Enums
│   │   ├── exception/                     # GlobalExceptionHandler, Custom Exceptions
│   │   ├── repository/                    # 13 Spring Data JPA Repositories
│   │   └── service/                       # Business Logic & ACID Transactional Services
│   ├── src/main/resources/
│   │   ├── application.properties         # MySQL Production Configuration
│   │   └── application-h2.properties      # In-Memory Demo / Testing Profile
│   └── pom.xml                            # Maven Dependencies & Build Config
│
├── frontend/                              # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/                    # Navbar, Sidebar, Modal, StatCard
│   │   ├── context/                       # AuthContext (JWT Authentication State)
│   │   ├── pages/                         # 14 Full Management Modules
│   │   ├── services/                      # Axios Instance with JWT Interceptor
│   │   ├── App.jsx                        # Route Hierarchy & RBAC Protection Guards
│   │   ├── index.css                      # Complete Modern Responsive Design System
│   │   └── main.jsx                       # Application Root
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/                              # MySQL 8.0 Database Scripts
│   ├── 01_schema.sql                      # 13 Normalized Tables, Constraints, Indexes
│   ├── 02_views_and_procedures.sql        # 5 SQL Views + 2 Stored Procedures
│   ├── 03_seed_data.sql                   # Realistic Enterprise Seed Records
│   └── setup_database.sql                 # Master Execution Script
│
└── docs/                                  # College Capstone Documentation
    ├── Phase1_Design_and_Architecture.md
    ├── Phase2_Database_Design_and_DBMS_Proof.md
    ├── 03_Data_Flow_and_Sequence_Diagrams.md
    ├── 04_DBMS_Viva_Mastery_and_Defense_Guide.md
    └── 05_Setup_and_Execution_Guide.md
```

---

### 2. System Prerequisites

Ensure the following tools are installed on your machine:
- **Java Development Kit (JDK):** Version 25 LTS or newer. Verify with:
  ```bash
  java -version
  ```
- **Node.js & npm:** Node.js v18+ and npm v9+ (tested on Node 24.11.1). Verify with:
  ```bash
  node -v
  npm -v
  ```
- **Apache Maven:** 3.8+ (portable binary included at `scratch/maven/apache-maven-3.9.6`).
- **MySQL Server:** MySQL 8.0+ (running on port `3306`).

---

### 3. Database Setup (MySQL 8.0)

#### Option A: Running the Master Database Script
Open PowerShell or Command Prompt and execute the master setup script:
```bash
mysql -u root -p < database/setup_database.sql
```
*(Enter your MySQL root password when prompted)*

This automatically:
1. Creates the `smart_inventory_db` database with `utf8mb4` encoding.
2. Creates all 13 normalized tables with foreign keys and unique indexes.
3. Creates the 5 SQL reporting views (`vw_product_stock_overview`, `vw_low_stock_alerts`, etc.).
4. Creates the 2 stored procedures (`sp_reserve_stock_for_order`, `sp_receive_purchase_order`).
5. Populates realistic seed records for categories, products, warehouses, suppliers, inventory, orders, and shipments.

#### Option B: Automated JPA Auto-DDL (Zero Manual DB Setup)
If MySQL is running, Spring Boot's `spring.jpa.hibernate.ddl-auto=update` and `DataInitializer.java` will automatically create tables and seed default users on application startup.

---

### 4. Running the Backend (Spring Boot 3.3.5)

#### Method 1: Running with MySQL (Production Mode)
In your terminal, navigate to the `backend` directory:
```bash
cd backend

# If your MySQL root password is 'root':
..\..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run

# If your MySQL root password is custom (e.g., 'mypassword'):
$env:DB_PASSWORD="mypassword"
..\..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
The backend starts on `http://localhost:8080`.

#### Method 2: Running with In-Memory H2 Profile (Instant Viva / Offline Demo)
If you want to run the full application without setting up or configuring MySQL:
```bash
cd backend
..\..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dspring-boot.run.profiles=h2
```
This automatically boots an in-memory MySQL-compatible database, initializes tables, seeds demo data, and enables the H2 Web Console at `http://localhost:8080/h2-console`.

---

### 5. Running the Frontend (React 18 + Vite)

In a new terminal window, navigate to the `frontend` directory:
```bash
cd frontend

# Install dependencies (already pre-installed)
npm.cmd install

# Start development server
npm.cmd run dev
```
Open your browser and navigate to:
```text
http://localhost:5173
```

---

### 6. Default Demo User Accounts

The application is pre-seeded with two operational accounts:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **ROLE_ADMIN** | `admin` | `admin123` | Full access across all 14 modules including User Management |
| **ROLE_EMPLOYEE** | `employee` | `emp123` | Operational access for day-to-day stock transfers, POs, and orders |

*Note: The login screen contains one-click "Quick Login as Admin" and "Quick Login as Employee" buttons for swift demonstration.*

---

### 7. Step-by-Step Live Demonstration Walkthrough

Follow this 7-step sequence during your project evaluation or presentation:

1. **Authentication:**
   - Go to `http://localhost:5173/login`.
   - Click **Quick Login as Admin** -> inspect JWT token stored in browser session.
2. **Dashboard Overview:**
   - Observe live KPI cards (Total Products, Low Stock Alerts, Warehouses, Active Orders).
   - View visual capacity utilization bars and the real-time stock activity feed.
3. **Product Catalog & Low Stock Alert:**
   - Go to **Products**.
   - Note products flagged with red "Low Stock" warning badges (stock < reorder level).
4. **Supply Chain Replenishment (Purchase Order):**
   - Go to **Purchase Orders** -> Click **+ Create Purchase Order**.
   - Select Supplier (e.g. *TechDistributors India*), Warehouse (e.g. *Central Hub*), and add items.
   - Click **Approve** on the new PO.
   - Click **Receive Goods** -> Observe the backend executing an ACID transaction that increments available stock and writes a `STOCK_IN` record to the audit ledger.
5. **Customer Sales Order & Stock Reservation:**
   - Go to **Customer Orders** -> Click **+ New Sales Order**.
   - Select items and quantities.
   - Click **Confirm & Reserve Stock** -> Notice available stock decreases and reserved stock increases (protected by pessimistic row-level locking).
6. **Logistics Dispatch (Shipment):**
   - Go to **Shipments** -> Click **Create Shipment** for the confirmed order.
   - Click **Dispatch** -> Status transitions to `DISPATCHED`, deducted reserved stock is released as `STOCK_OUT`.
   - Click **Mark Delivered** -> Final delivery timestamp recorded.
7. **Audit Ledger & Reports:**
   - Go to **Stock Transactions** -> Inspect the immutable chronological ledger of all movements (`STOCK_IN`, `RESERVATION`, `STOCK_OUT`).
   - Go to **Executive Reports** -> Review total inventory asset valuation (in ₹ INR), critical deficits, and click **Print / Export PDF**.
