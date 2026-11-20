# 02 — Project Report

> Written for a student who knows programming but is new to DBMS. Every claim is derived from the current source code only.

---

## 1. Overview

### What the System Does

The Smart Inventory and Supply Chain Management System is a web application that lets a business track its products, manage stock across multiple warehouses, raise purchase orders to restock from suppliers, and fulfil customer sales orders with shipment tracking. When a purchase order is received, stock in the target warehouse goes up automatically. When a customer order is confirmed, the matching stock is locked ("reserved") so it cannot be sold twice. The full history of every stock movement is recorded in an immutable audit log.

### Roles

| Role | What they can do |
|---|---|
| **ADMIN** | Everything: create products, categories, warehouses, suppliers, purchase orders (and change their status), manage inventory adjustments, plus everything an EMPLOYEE can do |
| **EMPLOYEE** | Read all data; create customer orders; confirm/cancel customer orders; create/update shipments; view stock transactions |

Role enforcement works at two levels:
1. **HTTP level** — `@PreAuthorize("hasRole('ADMIN')")` on specific controller methods (create/edit/delete product, category, warehouse, supplier; create purchase order)
2. **Frontend level** — `ProtectedLayout` in `App.jsx` redirects non-admin users away from admin-only routes

### Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Backend language | Java | 21 |
| Backend framework | Spring Boot | 3.3.5 |
| ORM | Hibernate / Spring Data JPA | (included in Spring Boot 3.3.5) |
| Security | Spring Security + JJWT | 0.12.6 |
| Dev database | H2 in-memory | (auto-included) |
| Prod database target | MySQL | 8.0 |
| Build tool | Apache Maven | 3.9.6 (bundled at `tools/`) |
| Frontend framework | React | 18.3.1 |
| Frontend router | React Router DOM | 6.27.0 |
| HTTP client | Axios | 1.7.7 |
| Icon library | Lucide React | 0.454.0 |
| Frontend build | Vite | 5.4.10 |

### Exact Run Commands

```powershell
# Terminal 1 — Backend (H2 development profile, port 8085)
cd backend
..\tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"

# Terminal 2 — Frontend dev server (port 5173, proxies /api to localhost:8085)
cd frontend
npm run dev
```

Navigate to: `http://localhost:5173`  
Login: `admin` / `admin123` or `employee` / `employee123`

### Folder Tree

```
smart-inventory-system/
├── backend/
│   ├── pom.xml                              # Maven build file, dependency versions
│   └── src/main/java/com/inventory/smartinventory/
│       ├── SmartInventoryApplication.java   # Spring Boot entry point
│       ├── config/
│       │   ├── DataInitializer.java         # Seeds H2 database on startup
│       │   ├── JwtAuthenticationFilter.java # Reads Bearer token, sets SecurityContext
│       │   ├── JwtUtil.java                 # Signs/validates JWT tokens (HMAC-SHA256)
│       │   └── SecurityConfig.java          # CORS, stateless sessions, route rules
│       ├── controller/                      # REST endpoints (11 controllers)
│       │   ├── AuthController.java          # POST /api/auth/login, GET /api/auth/me
│       │   ├── CategoryController.java      # CRUD /api/categories
│       │   ├── CustomerOrderController.java # CRUD + confirm + cancel /api/customer-orders
│       │   ├── DashboardController.java     # GET /api/dashboard/stats, /charts
│       │   ├── InventoryController.java     # GET /api/inventory, POST /api/inventory/adjust
│       │   ├── ProductController.java       # CRUD + search + low-stock /api/products
│       │   ├── PurchaseOrderController.java # CRUD + status update /api/purchase-orders
│       │   ├── ShipmentController.java      # CRUD + status update /api/shipments
│       │   ├── StockTransactionController.java # GET /api/stock-transactions
│       │   ├── SupplierController.java      # CRUD /api/suppliers
│       │   └── WarehouseController.java     # CRUD /api/warehouses
│       ├── dto/                             # Request/response shapes (validated)
│       │   ├── ApiResponse.java             # Uniform {success, message, data} wrapper
│       │   ├── AuthResponse.java            # {token, user}
│       │   ├── CustomerOrderRequest.java    # Create order payload
│       │   ├── DashboardStatsResponse.java  # Dashboard numbers
│       │   ├── LoginRequest.java            # {username, password}
│       │   ├── ProductRequest.java          # Create/update product payload
│       │   ├── PurchaseOrderRequest.java    # Create PO payload
│       │   ├── ShipmentRequest.java         # Create shipment payload
│       │   ├── StockAdjustmentRequest.java  # Manual stock adjust payload
│       │   ├── SupplierRequest.java         # Create/update supplier payload
│       │   └── WarehouseRequest.java        # Create/update warehouse payload
│       ├── entity/                          # JPA @Entity classes (13 tables)
│       ├── entity/enums/                    # Java enums for status fields
│       ├── exception/                       # Custom exceptions + global handler
│       ├── repository/                      # Spring Data JPA interfaces
│       └── service/                         # Business logic (11 services)
│   └── src/main/resources/
│       ├── application.properties           # MySQL profile (default)
│       └── application-h2.properties        # H2 dev profile (port 8085, create-drop)
├── database/
│   ├── 01_schema.sql                        # MySQL CREATE TABLE statements (reference)
│   ├── 02_views_and_procedures.sql          # 5 MySQL views + 2 stored procedures (reference)
│   └── 03_seed_data.sql                     # MySQL INSERT seed data (reference)
├── frontend/
│   ├── package.json                         # npm dependencies and scripts
│   ├── vite.config.js                       # Vite config: proxy /api → localhost:8085
│   └── src/
│       ├── App.jsx                          # Router, ProtectedLayout, all routes
│       ├── context/AuthContext.jsx          # Global auth state, login/logout logic
│       ├── components/
│       │   ├── Navbar.jsx                   # Top bar: role badge + user avatar
│       │   └── Sidebar.jsx                  # Left nav with all page links
│       └── pages/
│           ├── Login.jsx                    # Login form
│           ├── Dashboard.jsx                # Stats cards + charts
│           ├── Products.jsx                 # Product list, create, edit, delete
│           ├── Categories.jsx               # Category CRUD
│           ├── Suppliers.jsx                # Supplier CRUD
│           ├── Warehouses.jsx               # Warehouse CRUD
│           ├── Inventory.jsx                # Inventory view + stock adjustment
│           ├── PurchaseOrders.jsx           # PO list, create, status change
│           ├── CustomerOrders.jsx           # Order list, create, confirm, cancel
│           ├── Shipments.jsx                # Shipment list, create, status update
│           └── ProfileSettings.jsx          # User profile view + logout
├── tools/apache-maven-3.9.6/               # Bundled Maven (no install needed)
├── start_all.bat                            # Windows batch: starts backend + frontend
└── start_backend.bat                        # Windows batch: starts backend only
```

---

## 2. What Changed (from git diff and source code)

Git log shows two commits: `initial_commit` and `Date Bug Fixed. Clean Version`. The working tree has many unstaged modifications relative to the initial commit. Here is what changed:

### Removed
| Item | Where | What was there before |
|---|---|---|
| SKU (Stock Keeping Unit) field | `Product.java`, `ProductRequest.java`, `ProductService.java`, `ProductRepository.java`, `DataInitializer.java`, `01_schema.sql`, `03_seed_data.sql`, all frontend pages | Products used to have a unique `sku` VARCHAR column |
| "Stock Transactions" sidebar tab | `Sidebar.jsx` | There was a nav link to `/stock-transactions` |
| `ReportController.java` | Deleted | A reports API controller existed |
| `ReportService.java` | Deleted | A reports service existed |
| `UserController.java` | Deleted | A user management API controller existed |
| `UserService.java` | Deleted | A user management service existed |
| `Reports.jsx` (frontend) | Deleted | A Reports page existed |
| `UserManagement.jsx` (frontend) | Deleted | A User Management page existed |
| "Auth Token Scheme" row | `ProfileSettings.jsx` | Was shown in the profile card |
| RBAC matrix table | `ProfileSettings.jsx` | A table showing role permissions existed |
| "Architecture & DBMS" card | `ProfileSettings.jsx` | A card showing tech stack details existed |
| Search bar | `Navbar.jsx` | A search input was in the top navigation bar |

### Updated
| Item | File | Before | After |
|---|---|---|---|
| PO number generation | `PurchaseOrderService.java` | Random timestamp-based string | `PO-N` auto-increment (`PO-1`, `PO-2`, ...) |
| Order number generation | `CustomerOrderService.java` | Random timestamp-based string | `ORD-DDMMYYYY-N` per-day auto-increment |
| Tracking number generation | `ShipmentService.java` | Random string like `TRK-839201-BD` | `TRK-N` global auto-increment |
| Stock confirmation logic | `CustomerOrderService.java` | Checked each order line item individually (caused negative stock bug when same product added twice) | Aggregates quantities per product first, validates total, then deducts once per product |
| Seed order numbers | `DataInitializer.java` | `ORD-2026-1001`, `ORD-2026-1002` | `ORD-19112026-1`, `ORD-19112026-2` |
| Seed tracking number | `DataInitializer.java` | `TRK-FX-99882201` | `TRK-1` |

---

## 3. Feature List

| Feature | Notes |
|---|---|
| JWT login / logout | POST `/api/auth/login` returns a 24-hour Bearer token |
| View current user profile | GET `/api/auth/me` |
| Product CRUD | Create, read, update, delete products (Admin only for write operations) |
| Category CRUD | Full CRUD, Admin-only writes |
| Supplier CRUD | Full CRUD, Admin-only writes |
| Warehouse CRUD | Full CRUD, Admin-only writes |
| Inventory view | View all stock levels, filter by warehouse or product |
| Manual stock adjustment | Positive or negative quantity adjustment with reason text; prevents going below zero |
| Low-stock product list | Returns products where any warehouse's available stock ≤ reorder_level |
| Product search | Server-side text search by name or description |
| Purchase order creation | Admin only; generates `PO-N` number; supports multiple line items |
| Purchase order status lifecycle | PENDING → APPROVED → ORDERED → RECEIVED (triggers stock increment) or CANCELLED |
| Customer order creation | Any authenticated user; generates `ORD-DDMMYYYY-N` number |
| Customer order confirmation | Validates total stock (aggregated per product across line items), applies pessimistic row lock, deducts available and increments reserved; generates `STOCK_RESERVATION` audit rows |
| Customer order cancellation | Releases reserved stock back to available if order was CONFIRMED/PROCESSING |
| Shipment creation | Requires CONFIRMED or PROCESSING order; generates `TRK-N` tracking number |
| Shipment status update | PREPARING → DISPATCHED (triggers STOCK_OUT, marks shipped_date) → DELIVERED (marks delivered_date) or CANCELLED |
| Stock transaction audit log | Immutable log of every stock movement; filterable by product or warehouse |
| Dashboard statistics | Total products, suppliers, warehouses, pending orders, reserved stock, etc. |
| Dashboard charts | Category distribution, order status breakdown, stock level trends |

### Frontend Pages and Routes

| Route | Page Component | Description |
|---|---|---|
| `/login` | `Login.jsx` | Public login form |
| `/` | `Dashboard.jsx` | Stats cards, charts |
| `/products` | `Products.jsx` | Product table, create/edit/delete modals |
| `/categories` | `Categories.jsx` | Category table, CRUD modals |
| `/suppliers` | `Suppliers.jsx` | Supplier table, CRUD modals |
| `/warehouses` | `Warehouses.jsx` | Warehouse table, CRUD modals |
| `/inventory` | `Inventory.jsx` | Stock table, adjustment modal |
| `/purchase-orders` | `PurchaseOrders.jsx` | PO table, create modal, status buttons |
| `/customer-orders` | `CustomerOrders.jsx` | Order table, create modal, confirm/cancel buttons |
| `/shipments` | `Shipments.jsx` | Shipment table, create modal, status buttons |
| `/profile` | `ProfileSettings.jsx` | User profile card (email, role, status) + logout button |
| `/settings` | `ProfileSettings.jsx` | Same component, alternate route |
| `/*` | — | Redirects to `/` |

---

## 4. API Table

> All endpoints require `Authorization: Bearer <token>` header except `/api/auth/login`.  
> `ADMIN` = requires `hasRole('ADMIN')` via `@PreAuthorize`. `ANY` = any authenticated user.

| Method | URL | Role | Controller Method | Service Method | Tables Read / Written |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | Public | `AuthController.login` | `AuthService.login` | R: users |
| GET | `/api/auth/me` | ANY | `AuthController.getCurrentUser` | — | R: users (from token) |
| GET | `/api/categories` | ANY | `CategoryController.getAllCategories` | `CategoryService.getAllCategories` | R: categories |
| GET | `/api/categories/{id}` | ANY | `CategoryController.getCategoryById` | `CategoryService.getCategoryById` | R: categories |
| POST | `/api/categories` | ADMIN | `CategoryController.createCategory` | `CategoryService.createCategory` | W: categories |
| PUT | `/api/categories/{id}` | ADMIN | `CategoryController.updateCategory` | `CategoryService.updateCategory` | RW: categories |
| DELETE | `/api/categories/{id}` | ADMIN | `CategoryController.deleteCategory` | `CategoryService.deleteCategory` | RW: categories |
| GET | `/api/products` | ANY | `ProductController.getAllProducts` | `ProductService.getAllProducts` / `getProductsByCategory` / `searchProducts` | R: products, categories |
| GET | `/api/products/{id}` | ANY | `ProductController.getProductById` | `ProductService.getProductById` | R: products |
| GET | `/api/products/low-stock` | ANY | `ProductController.getLowStockProducts` | `ProductService.getLowStockProducts` | R: products, inventory |
| POST | `/api/products` | ADMIN | `ProductController.createProduct` | `ProductService.createProduct` | W: products |
| PUT | `/api/products/{id}` | ADMIN | `ProductController.updateProduct` | `ProductService.updateProduct` | RW: products |
| DELETE | `/api/products/{id}` | ADMIN | `ProductController.deleteProduct` | `ProductService.deleteProduct` | RW: products |
| GET | `/api/suppliers` | ANY | `SupplierController.getAllSuppliers` | `SupplierService.getAllSuppliers` | R: suppliers |
| GET | `/api/suppliers/{id}` | ANY | `SupplierController.getSupplierById` | `SupplierService.getSupplierById` | R: suppliers |
| POST | `/api/suppliers` | ADMIN | `SupplierController.createSupplier` | `SupplierService.createSupplier` | W: suppliers |
| PUT | `/api/suppliers/{id}` | ADMIN | `SupplierController.updateSupplier` | `SupplierService.updateSupplier` | RW: suppliers |
| DELETE | `/api/suppliers/{id}` | ADMIN | `SupplierController.deleteSupplier` | `SupplierService.deleteSupplier` | RW: suppliers |
| GET | `/api/warehouses` | ANY | `WarehouseController.getAllWarehouses` | `WarehouseService.getAllWarehouses` | R: warehouses |
| GET | `/api/warehouses/{id}` | ANY | `WarehouseController.getWarehouseById` | `WarehouseService.getWarehouseById` | R: warehouses |
| POST | `/api/warehouses` | ADMIN | `WarehouseController.createWarehouse` | `WarehouseService.createWarehouse` | W: warehouses |
| PUT | `/api/warehouses/{id}` | ADMIN | `WarehouseController.updateWarehouse` | `WarehouseService.updateWarehouse` | RW: warehouses |
| DELETE | `/api/warehouses/{id}` | ADMIN | `WarehouseController.deleteWarehouse` | `WarehouseService.deleteWarehouse` | RW: warehouses |
| GET | `/api/inventory` | ANY | `InventoryController.getAllInventory` | `InventoryService.getAllInventory` / `getInventoryByWarehouse` / `getInventoryByProduct` | R: inventory, products, warehouses |
| POST | `/api/inventory/adjust` | ANY | `InventoryController.adjustStock` | `InventoryService.adjustStock` | RW: inventory; W: stock_transactions |
| GET | `/api/purchase-orders` | ANY | `PurchaseOrderController.getAllOrders` | `PurchaseOrderService.getAllPurchaseOrders` | R: purchase_orders, purchase_order_items |
| GET | `/api/purchase-orders/{id}` | ANY | `PurchaseOrderController.getOrderById` | `PurchaseOrderService.getPurchaseOrderById` | R: purchase_orders |
| POST | `/api/purchase-orders` | ADMIN | `PurchaseOrderController.createOrder` | `PurchaseOrderService.createPurchaseOrder` | R: suppliers, warehouses, products; W: purchase_orders, purchase_order_items |
| PATCH | `/api/purchase-orders/{id}/status` | ANY | `PurchaseOrderController.updateStatus` | `PurchaseOrderService.updateStatus` | RW: purchase_orders, purchase_order_items; RW: inventory; W: stock_transactions |
| GET | `/api/customer-orders` | ANY | `CustomerOrderController.getAllOrders` | `CustomerOrderService.getAllCustomerOrders` | R: customer_orders, order_items |
| GET | `/api/customer-orders/{id}` | ANY | `CustomerOrderController.getOrderById` | `CustomerOrderService.getCustomerOrderById` | R: customer_orders |
| POST | `/api/customer-orders` | ANY | `CustomerOrderController.createOrder` | `CustomerOrderService.createCustomerOrder` | R: products; W: customer_orders, order_items |
| POST | `/api/customer-orders/{id}/confirm` | ANY | `CustomerOrderController.confirmOrder` | `CustomerOrderService.confirmAndReserveStock` | R+LOCK: inventory; RW: inventory, customer_orders; W: stock_transactions |
| POST | `/api/customer-orders/{id}/cancel` | ANY | `CustomerOrderController.cancelOrder` | `CustomerOrderService.cancelOrder` | RW: inventory, customer_orders; W: stock_transactions |
| GET | `/api/shipments` | ANY | `ShipmentController.getAllShipments` | `ShipmentService.getAllShipments` | R: shipments |
| GET | `/api/shipments/{id}` | ANY | `ShipmentController.getShipmentById` | `ShipmentService.getShipmentById` | R: shipments |
| POST | `/api/shipments` | ANY | `ShipmentController.createShipment` | `ShipmentService.createShipment` | R: customer_orders, warehouses; W: shipments; RW: customer_orders |
| PATCH | `/api/shipments/{id}/status` | ANY | `ShipmentController.updateStatus` | `ShipmentService.updateShipmentStatus` | RW: shipments, customer_orders; RW: inventory; W: stock_transactions |
| GET | `/api/stock-transactions` | ANY | `StockTransactionController.getTransactions` | `StockTransactionService.getRecentTransactions` / `getTransactionsByProduct` / `getTransactionsByWarehouse` | R: stock_transactions |
| GET | `/api/dashboard/stats` | ANY | `DashboardController.getStats` | `DashboardService.getStats` | R: products, suppliers, warehouses, customer_orders, inventory |
| GET | `/api/dashboard/charts` | ANY | `DashboardController.getCharts` | `DashboardService.getChartData` | R: products, categories, customer_orders, inventory |

---

## 5. Status Lifecycles

### Purchase Order Status

```
PENDING → APPROVED → ORDERED → RECEIVED
   ↘         ↘        ↘
 CANCELLED CANCELLED CANCELLED
              (also PARTIALLY_RECEIVED exists in SQL enum but is NOT used in Java code)
```

**Allowed transitions enforced in:** `PurchaseOrderService.updateStatus`  
(`backend/src/main/java/com/inventory/smartinventory/service/PurchaseOrderService.java`, lines 94–115)

| Transition | Enforced? | Code |
|---|---|---|
| Any → RECEIVED or CANCELLED | BLOCKED if already RECEIVED or CANCELLED | `if (po.getStatus() == RECEIVED \|\| == CANCELLED) throw BusinessRuleException` |
| → RECEIVED triggers stock in | YES | Calls `inventoryService.addStock(...)` for each PO item |
| Any other transition | NOT ENFORCED | Any status can be set freely if not already terminal |

> **Note:** `PARTIALLY_RECEIVED` exists in `PurchaseOrderStatus` enum in Java but is never set by any service method.

---

### Customer Order Status

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↘          ↘            ↘
 CANCELLED  CANCELLED   CANCELLED
```

**Transition enforcement locations:**

| Transition | Enforced? | Code Location |
|---|---|---|
| PENDING → CONFIRMED | YES — only PENDING orders can be confirmed | `CustomerOrderService.confirmAndReserveStock` line 99 |
| CONFIRMED → PROCESSING | YES — set automatically when a shipment is created | `ShipmentService.createShipment` line 74 |
| PROCESSING → SHIPPED | YES — set when shipment status → DISPATCHED | `ShipmentService.updateShipmentStatus` line 88 |
| SHIPPED → DELIVERED | YES — set when shipment status → DELIVERED | `ShipmentService.updateShipmentStatus` line 105 |
| Any → CANCELLED | BLOCKED if already DELIVERED or CANCELLED | `CustomerOrderService.cancelOrder` line 135 |
| CONFIRMED/PROCESSING → CANCELLED | Releases reserved stock | `CustomerOrderService.cancelOrder` lines 139–155 |

---

### Shipment Status

```
PREPARING → DISPATCHED → DELIVERED
       ↘
    CANCELLED
```

> `IN_TRANSIT` and `DELAYED` exist in SQL ENUM and Java enum but are **never set by any service method**. They could only be set via direct API call.

**Transition enforcement in:** `ShipmentService.updateShipmentStatus`  
(`backend/src/main/java/com/inventory/smartinventory/service/ShipmentService.java`, lines 80–115)

| Transition | Side Effects |
|---|---|
| PREPARING → DISPATCHED | Sets `shippedDate = now()`; sets order status → SHIPPED; deducts `quantityReserved` from inventory; writes `STOCK_OUT` transaction |
| Any → DELIVERED | Sets `deliveredDate = now()`; sets order status → DELIVERED |
| Any → CANCELLED | If order is PROCESSING, reverts it to CONFIRMED; NO stock release (limitation — see section 10) |

---

## 6. Number Generation

### PO Number — `PurchaseOrderService.generateNextPoNumber()`

```java
// File: backend/src/main/java/com/inventory/smartinventory/service/PurchaseOrderService.java
private synchronized String generateNextPoNumber() {
    Long maxId = purchaseOrderRepository.findMaxId();
    long nextNum = (maxId != null) ? maxId + 1 : 1;
    while (purchaseOrderRepository.findByPoNumber("PO-" + nextNum).isPresent()) {
        nextNum++;
    }
    return "PO-" + nextNum;
}
```

**How it works:** Queries the maximum `id` in the `purchase_orders` table. The next PO number is `max_id + 1`. A `while` loop increments if that number is already taken (guards against gaps from deletions). Returns `PO-1`, `PO-2`, etc.

**Weakness:** `synchronized` only prevents race conditions within a single JVM. If two app instances run simultaneously (clustered deployment), both could generate the same number. The database `UNIQUE` constraint on `po_number` would catch this and throw an exception, but there is no retry logic.

---

### Order Number — `CustomerOrderService.generateOrderNumber()`

```java
// File: backend/src/main/java/com/inventory/smartinventory/service/CustomerOrderService.java
private synchronized String generateOrderNumber() {
    String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
    String prefix = "ORD-" + datePart + "-";
    long count = customerOrderRepository.countByOrderNumberPrefix(prefix);
    long seq = count + 1;
    // Ensure uniqueness in case of gaps/duplicates
    while (customerOrderRepository.findByOrderNumber(prefix + seq).isPresent()) {
        seq++;
    }
    return prefix + seq;
}
```

**How it works:** Gets today's date formatted as `ddMMyyyy` (e.g., `19112026`). Counts existing orders whose `order_number` starts with `ORD-19112026-`. The sequence starts at count+1. The `while` loop handles gaps. On a new date, count is 0, so it starts at 1.

**Repository query used:**
```java
// CustomerOrderRepository.java
@Query("SELECT COUNT(o) FROM CustomerOrder o WHERE o.orderNumber LIKE :prefix%")
Long countByOrderNumberPrefix(@Param("prefix") String prefix);
```

**Weakness:** Same single-JVM race condition as PO number. Additionally, if orders are deleted, `count` will be lower than the highest existing sequence, potentially causing the while-loop to run extra iterations.

---

### Tracking Number — `ShipmentService.generateTrackingNumber()`

```java
// File: backend/src/main/java/com/inventory/smartinventory/service/ShipmentService.java
private synchronized String generateTrackingNumber() {
    Long maxId = shipmentRepository.findMaxId();
    long nextNum = (maxId != null) ? maxId + 1 : 1;
    while (shipmentRepository.findByTrackingNumber("TRK-" + nextNum).isPresent()) {
        nextNum++;
    }
    return "TRK-" + nextNum;
}
```

**Repository query used:**
```java
// ShipmentRepository.java
@Query("SELECT MAX(s.id) FROM Shipment s")
Long findMaxId();
```

**How it works:** Gets the max `id` in the shipments table (uses max id, not count, so deletions don't create false conflicts). Returns `TRK-1`, `TRK-2`, etc.

**Weakness:** Same single-JVM race condition. When the seeded `TRK-1` exists (id=1), the next created shipment gets id=2, so tracking becomes `TRK-2`, which is correct.

**SKU:** NOT PRESENT — SKU was removed from the system entirely.

---

## 7. Key Service Source Code

### PurchaseOrderService

```java
// backend/src/main/java/com/inventory/smartinventory/service/PurchaseOrderService.java

@Service
public class PurchaseOrderService {

    @Autowired private PurchaseOrderRepository purchaseOrderRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryService inventoryService;

    private synchronized String generateNextPoNumber() {
        Long maxId = purchaseOrderRepository.findMaxId();
        long nextNum = (maxId != null) ? maxId + 1 : 1;
        while (purchaseOrderRepository.findByPoNumber("PO-" + nextNum).isPresent()) {
            nextNum++;
        }
        return "PO-" + nextNum;
    }

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
        po.setPoNumber(generateNextPoNumber());
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

---

### CustomerOrderService

```java
// backend/src/main/java/com/inventory/smartinventory/service/CustomerOrderService.java

@Service
public class CustomerOrderService {

    @Autowired private CustomerOrderRepository customerOrderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private StockTransactionService stockTransactionService;

    public List<CustomerOrder> getAllCustomerOrders() {
        return customerOrderRepository.findAllByOrderByOrderDateDesc();
    }

    public CustomerOrder getCustomerOrderById(Long id) {
        return customerOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with ID: " + id));
    }

    private synchronized String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
        String prefix = "ORD-" + datePart + "-";
        long count = customerOrderRepository.countByOrderNumberPrefix(prefix);
        long seq = count + 1;
        while (customerOrderRepository.findByOrderNumber(prefix + seq).isPresent()) {
            seq++;
        }
        return prefix + seq;
    }

    @Transactional
    public CustomerOrder createCustomerOrder(CustomerOrderRequest request, User user) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleException("Order must contain at least one product item");
        }
        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber(generateOrderNumber());
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

        // Aggregate total required quantity per product (handles duplicate line items for same product)
        Map<Long, Integer> requiredQtyByProduct = new java.util.HashMap<>();
        for (OrderItem item : order.getItems()) {
            requiredQtyByProduct.merge(item.getProduct().getId(), item.getQuantity(), Integer::sum);
        }

        // Validate aggregated quantities against available stock before making any changes
        for (Map.Entry<Long, Integer> entry : requiredQtyByProduct.entrySet()) {
            Long productId = entry.getKey();
            int totalRequired = entry.getValue();
            Inventory inv = inventoryRepository.lockByProductIdAndWarehouseId(productId, warehouseId)
                    .orElseThrow(() -> new InsufficientStockException("Product is not available in warehouse '" + warehouse.getName() + "'"));
            if (inv.getQuantityAvailable() < totalRequired) {
                throw new InsufficientStockException("Insufficient stock for product '" + inv.getProduct().getName() + "'. Required: " + totalRequired + ", Available: " + inv.getQuantityAvailable());
            }
        }

        // Deduct aggregated quantities per product (single save per product, prevents double-deduction)
        for (Map.Entry<Long, Integer> entry : requiredQtyByProduct.entrySet()) {
            Long productId = entry.getKey();
            int totalRequired = entry.getValue();
            Inventory inv = inventoryRepository.lockByProductIdAndWarehouseId(productId, warehouseId).get();
            inv.setQuantityAvailable(inv.getQuantityAvailable() - totalRequired);
            inv.setQuantityReserved(inv.getQuantityReserved() + totalRequired);
            inventoryRepository.save(inv);
        }

        // Record stock transactions per order line item (for detailed audit trail)
        for (OrderItem item : order.getItems()) {
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

---

### ShipmentService

```java
// backend/src/main/java/com/inventory/smartinventory/service/ShipmentService.java

@Service
public class ShipmentService {

    @Autowired private ShipmentRepository shipmentRepository;
    @Autowired private CustomerOrderRepository customerOrderRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private StockTransactionService stockTransactionService;

    public List<Shipment> getAllShipments() { return shipmentRepository.findAll(); }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));
    }

    private synchronized String generateTrackingNumber() {
        Long maxId = shipmentRepository.findMaxId();
        long nextNum = (maxId != null) ? maxId + 1 : 1;
        while (shipmentRepository.findByTrackingNumber("TRK-" + nextNum).isPresent()) {
            nextNum++;
        }
        return "TRK-" + nextNum;
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
        shipment.setTrackingNumber(generateTrackingNumber());
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

---

### InventoryService

```java
// backend/src/main/java/com/inventory/smartinventory/service/InventoryService.java

@Service
public class InventoryService {

    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private StockTransactionService stockTransactionService;

    public List<Inventory> getAllInventory() { return inventoryRepository.findAll(); }
    public List<Inventory> getInventoryByWarehouse(Long warehouseId) { return inventoryRepository.findByWarehouseId(warehouseId); }
    public List<Inventory> getInventoryByProduct(Long productId) { return inventoryRepository.findByProductId(productId); }
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
            throw new InsufficientStockException("Inventory cannot become negative. Current available: "
                    + inv.getQuantityAvailable() + ", adjustment: " + request.getAdjustmentQuantity());
        }
        inv.setQuantityAvailable(newAvailable);
        Inventory saved = inventoryRepository.save(inv);
        stockTransactionService.recordTransaction(
                product, warehouse, TransactionType.STOCK_ADJUSTMENT,
                request.getAdjustmentQuantity(),
                "ADJ-" + (System.currentTimeMillis() % 100000),
                request.getReason() != null ? request.getReason() : "Manual stock adjustment",
                user
        );
        return saved;
    }
}
```

---

### StockTransactionService

```java
// backend/src/main/java/com/inventory/smartinventory/service/StockTransactionService.java

@Service
public class StockTransactionService {

    @Autowired private StockTransactionRepository transactionRepository;

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

---

## 8. Validation and Safety

### DTO Validation Annotations

| DTO | Field | Annotation | Rule |
|---|---|---|---|
| `ProductRequest` | `categoryId` | `@NotNull` | Required |
| `ProductRequest` | `name` | `@NotBlank` | Required, non-empty |
| `ProductRequest` | `unitPrice` | `@NotNull`, `@DecimalMin("0.0")` | Required, ≥ 0 |
| `ProductRequest` | `reorderLevel` | `@NotNull`, `@Min(0)` | Required, ≥ 0 |
| `CustomerOrderRequest` | `customerName` | `@NotBlank` | Required |
| `CustomerOrderRequest` | `customerEmail` | `@NotBlank` | Required |
| `CustomerOrderRequest` | `shippingAddress` | `@NotBlank` | Required |
| `CustomerOrderRequest` | `items` | `@NotEmpty`, `@Valid` | At least 1 item; validates nested DTOs |
| `CustomerOrderRequest.CustomerOrderItemDto` | `productId` | `@NotNull` | Required |
| `CustomerOrderRequest.CustomerOrderItemDto` | `quantity` | `@NotNull`, `@Min(1)` | Required, ≥ 1 |
| `PurchaseOrderRequest` | `supplierId` | `@NotNull` | Required |
| `PurchaseOrderRequest` | `warehouseId` | `@NotNull` | Required |
| `PurchaseOrderRequest` | `expectedDeliveryDate` | `@FutureOrPresent` | Cannot be in the past |
| `PurchaseOrderRequest` | `items` | `@NotEmpty`, `@Valid` | At least 1 item |
| `PurchaseOrderRequest.PurchaseOrderItemDto` | `productId` | `@NotNull` | Required |
| `PurchaseOrderRequest.PurchaseOrderItemDto` | `quantity` | `@NotNull`, `@Min(1)` | ≥ 1 |
| `PurchaseOrderRequest.PurchaseOrderItemDto` | `unitPrice` | `@NotNull`, `@DecimalMin("0.0")` | ≥ 0 |
| `StockAdjustmentRequest` | `productId` | `@NotNull` | Required |
| `StockAdjustmentRequest` | `warehouseId` | `@NotNull` | Required |
| `StockAdjustmentRequest` | `adjustmentQuantity` | `@NotNull` | Required (can be negative) |

### Service-Level Checks

| Check | Service | Method |
|---|---|---|
| Order must have at least one item | `CustomerOrderService` | `createCustomerOrder` |
| Order must have at least one item | `PurchaseOrderService` | `createPurchaseOrder` |
| Only PENDING orders can be confirmed | `CustomerOrderService` | `confirmAndReserveStock` |
| Total stock (aggregated per product) must cover total ordered quantity | `CustomerOrderService` | `confirmAndReserveStock` |
| Cannot cancel DELIVERED or CANCELLED orders | `CustomerOrderService` | `cancelOrder` |
| Cannot alter RECEIVED or CANCELLED purchase orders | `PurchaseOrderService` | `updateStatus` |
| Shipment requires CONFIRMED or PROCESSING order | `ShipmentService` | `createShipment` |
| Manual adjustment cannot make stock go below 0 | `InventoryService` | `adjustStock` |
| Product deletion blocked if FK references exist | `ProductService` | `deleteProduct` (catches exception) |

### Database CHECK Constraints (SQL file — enforced only on MySQL)

| Table | Constraint | Rule |
|---|---|---|
| `products` | `chk_product_unit_price` | `unit_price >= 0` |
| `products` | `chk_product_reorder_level` | `reorder_level >= 0` |
| `warehouses` | `chk_warehouse_capacity` | `capacity > 0` |
| `inventory` | `chk_inv_qty_avail` | `quantity_available >= 0` |
| `inventory` | `chk_inv_qty_reserved` | `quantity_reserved >= 0` |
| `supplier_product` | `chk_sp_price` | `supplier_price >= 0` |
| `supplier_product` | `chk_sp_lead_time` | `lead_time_days >= 0` |
| `purchase_orders` | `chk_po_total_amount` | `total_amount >= 0` |
| `purchase_order_items` | `chk_poi_ordered_qty` | `ordered_quantity > 0` |
| `purchase_order_items` | `chk_poi_received_qty` | `received_quantity >= 0` |
| `purchase_order_items` | `chk_poi_unit_price` | `unit_price >= 0` |
| `customer_orders` | `chk_co_total_amount` | `total_amount >= 0` |
| `order_items` | `chk_oi_quantity` | `quantity > 0` |
| `order_items` | `chk_oi_unit_price` | `unit_price >= 0` |
| `order_items` | `chk_oi_subtotal` | `subtotal >= 0` |

> **In H2 mode (dev):** These CHECK constraints are **NOT created** (Hibernate `create-drop` from JPA entities; entities have no `@Check` annotations). Enforcement relies entirely on service-layer code.

### `@Transactional` Usage

| Method | Class | Rollback rule |
|---|---|---|
| `createPurchaseOrder` | `PurchaseOrderService` | default (RuntimeException) |
| `updateStatus` (PO) | `PurchaseOrderService` | `rollbackFor = Exception.class` |
| `createCustomerOrder` | `CustomerOrderService` | default |
| `confirmAndReserveStock` | `CustomerOrderService` | `rollbackFor = Exception.class` |
| `cancelOrder` | `CustomerOrderService` | `rollbackFor = Exception.class` |
| `createShipment` | `ShipmentService` | default |
| `updateShipmentStatus` | `ShipmentService` | `rollbackFor = Exception.class` |
| `addStock` | `InventoryService` | default |
| `adjustStock` | `InventoryService` | default |
| `recordTransaction` | `StockTransactionService` | default |
| `createProduct` | `ProductService` | default |
| `updateProduct` | `ProductService` | default |
| `deleteProduct` | `ProductService` | default |

### Row Locking

`InventoryRepository.lockByProductIdAndWarehouseId` applies `@Lock(LockModeType.PESSIMISTIC_WRITE)`:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.warehouse.id = :warehouseId")
Optional<Inventory> lockByProductIdAndWarehouseId(@Param("productId") Long productId,
                                                  @Param("warehouseId") Long warehouseId);
```

This translates to `SELECT ... FOR UPDATE` at the database level. It is used **only** in `CustomerOrderService.confirmAndReserveStock` — during both the validation loop and the deduction loop — to prevent two concurrent confirmations from both seeing the same available stock.

### Auth / JWT Flow

1. Client sends `POST /api/auth/login` with `{username, password}`
2. `AuthService.login` loads the user from DB, verifies BCrypt password, then calls `JwtUtil.generateToken(username, role)`
3. `JwtUtil` creates a JWT signed with HMAC-SHA256 using the 256-bit secret from `application.properties`. Claims include `sub` (username), `role`, `iat`, `exp` (24 hours)
4. Token is returned to the client in the `AuthResponse`
5. Client stores the token and sends it as `Authorization: Bearer <token>` on every subsequent request
6. `JwtAuthenticationFilter` (extends `OncePerRequestFilter`) intercepts every request, extracts the token, calls `JwtUtil.isTokenValid`, loads the `User` entity from the DB, and sets it into Spring Security's `SecurityContextHolder`
7. Controllers access the authenticated user via `@AuthenticationPrincipal User user`
8. `@PreAuthorize("hasRole('ADMIN')")` checks the authority string `ROLE_ADMIN` set by the filter

---

## 9. Flows Step by Step

### (a) Create PO → Approve → Order → Receive

**Step 1 — Create:** `POST /api/purchase-orders`  
- `PurchaseOrderService.createPurchaseOrder` runs in `@Transactional`
- Reads: `suppliers`, `warehouses`, `products`  
- Calls `generateNextPoNumber()` → reads `MAX(id)` from `purchase_orders`
- Creates `PurchaseOrder` with `status=PENDING`, inserts `PurchaseOrderItem` rows
- Writes: `purchase_orders` (1 row), `purchase_order_items` (N rows)
- **Before:** no PO exists; **After:** PO row with `status=PENDING`, items inserted

**Step 2 — Approve:** `PATCH /api/purchase-orders/{id}/status?status=APPROVED`  
- `PurchaseOrderService.updateStatus` — no special side effects for APPROVED
- Writes: `purchase_orders.status = 'APPROVED'`

**Step 3 — Order:** `PATCH /api/purchase-orders/{id}/status?status=ORDERED`  
- Same as above, no side effects
- Writes: `purchase_orders.status = 'ORDERED'`

**Step 4 — Receive:** `PATCH /api/purchase-orders/{id}/status?status=RECEIVED`  
- For each `PurchaseOrderItem`: calls `InventoryService.addStock(product, warehouse, orderedQty, poNumber, reason, user)`
  - `addStock` reads inventory for (product, warehouse); if no row exists, creates one with qty=0; adds `orderedQty` to `quantityAvailable`; saves inventory row; calls `StockTransactionService.recordTransaction` → inserts `STOCK_IN` row in `stock_transactions`
- Sets `item.receivedQuantity = item.orderedQuantity`
- Sets `po.receivedDate = now()`, `po.status = RECEIVED`
- **Before:** `inventory.quantity_available = X`; **After:** `inventory.quantity_available = X + orderedQty`; `stock_transactions` has a new `STOCK_IN` row

---

### (b) Create Customer Order → Confirm/Reserve → Shipment → Dispatch → Deliver

**Step 1 — Create Order:** `POST /api/customer-orders`
- `CustomerOrderService.createCustomerOrder` in `@Transactional`
- Reads: `products` (for each item, to get current unit_price)
- Generates `ORD-DDMMYYYY-N` order number
- Writes: `customer_orders` (status=PENDING), `order_items` (N rows)
- **Before:** no order; **After:** order with status=PENDING, items recorded

**Step 2 — Confirm & Reserve:** `POST /api/customer-orders/{id}/confirm?warehouseId=1`
- `CustomerOrderService.confirmAndReserveStock` in `@Transactional(rollbackFor=Exception.class)`
- Checks order is PENDING — else throws `BusinessRuleException`
- Aggregates required quantities per product into `Map<productId, totalQty>`
- For each unique product: `inventoryRepository.lockByProductIdAndWarehouseId` (PESSIMISTIC_WRITE lock) → checks `quantityAvailable >= totalRequired` — else throws `InsufficientStockException`
- For each unique product: deducts `totalRequired` from `quantityAvailable`, adds to `quantityReserved`, saves
- For each order line item: writes a `STOCK_RESERVATION` row in `stock_transactions`
- Sets `order.status = CONFIRMED`
- **Before:** `qty_available=45, qty_reserved=5`; **After:** `qty_available=45-N, qty_reserved=5+N`

**Step 3 — Create Shipment:** `POST /api/shipments`
- `ShipmentService.createShipment` in `@Transactional`
- Checks order is CONFIRMED or PROCESSING — else throws `BusinessRuleException`
- Generates `TRK-N` tracking number
- Sets `order.status = PROCESSING`
- Writes: `shipments` (status=PREPARING), updates `customer_orders.status = PROCESSING`

**Step 4 — Dispatch:** `PATCH /api/shipments/{id}/status?status=DISPATCHED`
- `ShipmentService.updateShipmentStatus` in `@Transactional(rollbackFor=Exception.class)`
- Sets `shipment.shippedDate = now()`
- Sets `order.status = SHIPPED`
- For each order item: finds inventory, `consumeQty = min(quantityReserved, itemQty)`, deducts from `quantityReserved`, saves inventory, writes `STOCK_OUT` transaction
- **Before:** `qty_reserved=N`; **After:** `qty_reserved=0` (stock has physically left)

**Step 5 — Deliver:** `PATCH /api/shipments/{id}/status?status=DELIVERED`
- Sets `shipment.deliveredDate = now()`
- Sets `order.status = DELIVERED`
- No inventory changes (stock was already reduced at dispatch)

---

### (c) Cancel Order

`POST /api/customer-orders/{id}/cancel?warehouseId=1`
- `CustomerOrderService.cancelOrder` in `@Transactional(rollbackFor=Exception.class)`
- Throws if order is already DELIVERED or CANCELLED
- If order is CONFIRMED or PROCESSING: for each order item, finds inventory for the given warehouse, computes `releaseQty = min(quantityReserved, itemQty)`, adds back to `quantityAvailable`, subtracts from `quantityReserved`, writes `STOCK_RELEASE` transaction
- Sets `order.status = CANCELLED`
- **Before:** `qty_available=X, qty_reserved=N`; **After:** `qty_available=X+N, qty_reserved=0`

---

### (d) Add / Edit / Delete Product

**Add:** `POST /api/products` (ADMIN only)
- `ProductService.createProduct` reads `categories` by `categoryId`, creates `Product` entity, writes to `products` table. No inventory row is created (stock starts at 0, inventory row appears only when stock is added via PO receive or manual adjustment).

**Edit:** `PUT /api/products/{id}` (ADMIN only)
- `ProductService.updateProduct` loads existing product, updates all fields, saves. The `@PreUpdate` lifecycle method on `Product` automatically sets `updatedAt = now()`.

**Delete:** `DELETE /api/products/{id}` (ADMIN only)
- `ProductService.deleteProduct` attempts to delete. If FK constraints exist (e.g., `order_items.product_id` references this product with RESTRICT), the database throws an exception which is caught and re-thrown as `BusinessRuleException("Cannot delete product as it has active inventory or order history.")`.

---

### (e) Manual Stock Adjustment

`POST /api/inventory/adjust`  
Body: `{productId, warehouseId, adjustmentQuantity, reason}`

- `InventoryService.adjustStock` in `@Transactional`
- Validates product and warehouse exist
- Loads or creates inventory row
- Computes `newAvailable = quantityAvailable + adjustmentQuantity` (adjustmentQuantity can be negative)
- If `newAvailable < 0` → throws `InsufficientStockException`
- Saves inventory row with new quantity
- Writes `STOCK_ADJUSTMENT` row in `stock_transactions` with the adjustment quantity (positive or negative) and the reason
- **Before:** `qty_available=10`; **After** (e.g., -3 adjustment): `qty_available=7`; audit trail records quantity=-3

---

## 10. Known Limitations

| # | Limitation | File Reference |
|---|---|---|
| 1 | **Shipment CANCELLED does not release reserved stock.** When a shipment is cancelled, the order reverts from PROCESSING to CONFIRMED, but the reserved inventory is never returned to available. The stock stays "stuck" as reserved. | `ShipmentService.java` lines 107–112 — no inventory release code in the CANCELLED branch |
| 2 | **Number generation is not cluster-safe.** `synchronized` on PO, order, and tracking number generators only protects against races within a single JVM. Under multiple app instances, duplicate numbers could be attempted (the UNIQUE constraint would catch it, but there is no retry logic). | `PurchaseOrderService.java:36`, `CustomerOrderService.java:49`, `ShipmentService.java:45` |
| 3 | **Cancel order stock release is per-line-item, not aggregated.** If the same product appears in two line items on a confirmed order, the cancel logic releases them separately via `ifPresent`. Because the fix for the negative stock bug only aggregated during confirm, the cancel path could double-release if `quantityReserved < 2 * itemQty`. The `Math.min(inv.getQuantityReserved(), item.getQuantity())` guard partially protects against this, but it may release less than expected. | `CustomerOrderService.java` lines 143–155 |
| 4 | **`PARTIALLY_RECEIVED` status defined but never used.** The enum value exists and is in the SQL ENUM, but no code path ever sets it. | `PurchaseOrderStatus.java` enum, `PurchaseOrderService.java` |
| 5 | **`IN_TRANSIT` and `DELAYED` shipment statuses defined but never set.** These can be set via raw API call but no service logic handles them specifically. | `ShipmentStatus.java` enum |
| 6 | **Shipment CANCELLED Java enum value not in SQL ENUM.** `ShipmentStatus.CANCELLED` exists in Java but not in the MySQL ENUM definition. Setting a shipment to CANCELLED would fail on a MySQL deployment. Works in H2 since H2 stores ENUM as VARCHAR. | `database/01_schema.sql` line 197, `ShipmentStatus.java` |
| 7 | **Stored procedures not called by Java.** `sp_reserve_stock_for_order` and `sp_receive_purchase_order` exist in the SQL file but all business logic is handled exclusively in Java services. The procedures also still have the pre-fix per-item (non-aggregated) stock check. | `database/02_views_and_procedures.sql` |
| 8 | **No email validation format check.** `CustomerOrderRequest.customerEmail` is marked `@NotBlank` but not `@Email`, so any non-empty string passes. | `CustomerOrderRequest.java` line 15 |
| 9 | **Stock adjustment reference ID uses `System.currentTimeMillis() % 100000`**, which can collide over time and is not globally unique. It is cosmetic (audit trail only) but can cause confusion. | `InventoryService.java` line 85 |
| 10 | **`DataInitializer` seeds only 2 products and 2 suppliers** in H2 mode (much less than the 10 products / 4 suppliers in the SQL seed file). PO creation from the UI is limited to these seeded suppliers. | `DataInitializer.java` lines 111–108 |
| 11 | **H2 database is in-memory (`create-drop`).** All data is lost every time the backend restarts. This is by design for development but means nothing persists across restarts. | `application-h2.properties` line 8 |
| 12 | **No pagination on any list endpoint.** All GETs return the full table. As data grows, `GET /api/stock-transactions` (which returns top 50 by date) is the only partial mitigation. | All controllers — no `Pageable` parameters |
