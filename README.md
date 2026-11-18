# Smart Inventory and Supply Chain Management System

A full-stack, enterprise-grade enterprise resource planning (ERP) web application engineered for centralized inventory, multi-facility warehouse operations, supplier procurement, customer sales order fulfillment, outbound logistics, and immutable audit logging.

Developed with a strong focus on **Database Management Systems (DBMS)**, **Relational Normalization (3NF)**, **ACID Transactions**, and **System Design**.

---

## 🚀 Key Highlights & Architecture

- **Frontend:** React 18, Vite, React Router v6, Axios with JWT interceptors, Lucide Icons, pure modern CSS design system.
- **Backend:** Java 25 LTS, Spring Boot 3.3.5, Spring Data JPA, Hibernate ORM, Spring Security with stateless JWT (HMAC-SHA256) and BCrypt hashing.
- **Relational Database:** MySQL 8.0 (InnoDB) with 13 fully normalized tables (3NF), 5 SQL analytical views, 2 ACID stored procedures with row-level locking, and secondary B+Tree indexes.
- **Dual Runtime Profiles:**
  - `mysql` (Default production mode connecting to MySQL 8.0 on port 3306).
  - `h2` (In-memory standalone demo mode for instant offline viva demonstrations).
- **Auditability:** Complete chronological, immutable audit ledger for every physical inventory movement (`STOCK_IN`, `STOCK_OUT`, `TRANSFER`, `ADJUSTMENT`, `RESERVATION`, `RELEASE`).

---

## 📦 System Modules (14 Total)

1. **Dashboard:** Real-time KPI summary cards, warehouse storage utilization meters, critical low-stock alert widgets, and live audit feed.
2. **Products:** Product catalog with SKU identifiers, category associations, pricing, and reorder levels.
3. **Categories:** Category taxonomy and product classification hierarchy.
4. **Suppliers:** Vendor master directory, lead time tracking, and contact management.
5. **Warehouses:** Storage facility locations, maximum capacity constraints, and current stock volumes.
6. **Inventory:** Multi-warehouse stock levels, physical stock audits, manual adjustments, and inter-facility stock transfers.
7. **Purchase Orders:** Supplier procurement lifecycle (Draft $\to$ Approved $\to$ Received) with automated goods receipt stock incrementation.
8. **Customer Orders:** Sales order management (Pending $\to$ Confirmed $\to$ Processing $\to$ Completed) with pessimistic row-locking stock reservation.
9. **Shipments:** Outbound logistics tracking, carrier selection (BlueDart, FedEx, DTDC, DHL), tracking number generation, and dispatch status transitions.
10. **Stock Transactions:** Chronological, immutable audit ledger filterable by product, warehouse, and transaction type.
11. **User Management:** Administrator RBAC console to review accounts and toggle active status.
12. **Executive Reports:** Inventory valuation (in ₹ INR), critical stock replenishment deficits, and printable summary exports.
13. **Profile & Settings:** Active operator credentials, session token details, and RBAC privilege matrix.
14. **Authentication:** Secure JWT-based login with quick-fill demo buttons for `Admin` and `Employee`.

---

## 🛠️ Quick Start Guide

### 1. Backend Startup

#### Option A: Run with MySQL (Production)
```bash
cd backend
..\..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
*(By default connects to MySQL on `localhost:3306` with database `smart_inventory_db`)*

#### Option B: Run with In-Memory H2 (Instant Viva / Offline Mode)
```bash
cd backend
..\..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dspring-boot.run.profiles=h2
```
Backend will start on: **`http://localhost:8080`**  
*(H2 Console available at `http://localhost:8080/h2-console`)*

---

### 2. Frontend Startup
```bash
cd frontend
npm.cmd install
npm.cmd run dev
```
Frontend will start on: **`http://localhost:5173`**

---

## 🔑 Default Credentials

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | Full access across all 14 modules + User Management |
| **Warehouse Operator** | `employee` | `emp123` | Operational access for orders, shipments, and inventory |

---

## 📚 Project Documentation

Comprehensive academic documentation is located in the `docs/` folder:
- [Phase 1: Design & Architecture Specification](docs/Phase1_Design_and_Architecture.md)
- [Phase 2: Database Schema & Normalization Proof](docs/Phase2_Database_Design_and_DBMS_Proof.md)
- [03: Data Flow Diagrams (DFD Level 0 & Level 1) & UML Sequence Diagrams](docs/03_Data_Flow_and_Sequence_Diagrams.md)
- [04: DBMS Viva Mastery & Comprehensive Defense Guide (30+ Q&As)](docs/04_DBMS_Viva_Mastery_and_Defense_Guide.md)
- [05: Setup & Execution Manual](docs/05_Setup_and_Execution_Guide.md)
