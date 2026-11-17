# Smart Inventory and Supply Chain Management System
## Data Flow Diagrams (DFD) & UML Sequence Diagrams

---

### 1. Data Flow Diagram (DFD) Level 0 — Context Level Diagram

The Level 0 DFD illustrates the overall system boundaries, external entities interacting with the platform, and primary bidirectional data flows.

```mermaid
graph TD
    subgraph External_Entities
        Admin["System Administrator"]
        Employee["Warehouse Operator / Employee"]
        Supplier["Supplier / Vendor (External Entity)"]
        Customer["Customer / Retail Outlet (External Entity)"]
    end

    subgraph System_Boundary ["Smart Inventory & Supply Chain System"]
        SystemCore(Central Management Platform)
    end

    Admin -->|"User Config, Warehouse Specs, Catalog CRUD"| SystemCore
    SystemCore -->|"System Logs, Performance Metrics, Executive Reports"| Admin

    Employee -->|"Stock Audits, PO Goods Receipt, Picking/Dispatch"| SystemCore
    SystemCore -->|"Stock Alerts, Pick Lists, Task Assignments"| Employee

    SystemCore -->|"Purchase Orders (PO Number, Item Quantities)"| Supplier
    Supplier -->|"Shipment Invoices, Delivery Manifests"| SystemCore

    Customer -->|"Sales Orders (Products, Quantities, Delivery Address)"| SystemCore
    SystemCore -->|"Order Confirmation, Tracking Number, Invoices"| Customer
```

---

### 2. Data Flow Diagram (DFD) Level 1 — Process Decomposition

The Level 1 DFD decomposes the system into discrete operational sub-processes interacting with the database data stores.

```mermaid
graph TD
    %% Entities
    User[Administrator / Operator]
    Supp[Supplier]
    Cust[Customer]

    %% Processes
    P1["1.0 Authentication & RBAC Control"]
    P2["2.0 Product & Category Catalog Management"]
    P3["3.0 Warehouse & Inventory Allocation"]
    P4["4.0 Purchase Order & Goods Receipt Processing"]
    P5["5.0 Customer Order & Stock Reservation Engine"]
    P6["6.0 Outbound Shipment & Logistics Dispatch"]
    P7["7.0 Reporting & Audit Ledger Analytics"]

    %% Data Stores
    D1[("D1: Users Store")]
    D2[("D2: Catalog & Categories Store")]
    D3[("D3: Warehouses & Inventory Store")]
    D4[("D4: Purchase Orders Store")]
    D5[("D5: Customer Orders Store")]
    D6[("D6: Shipments Store")]
    D7[("D7: Stock Transactions Audit Ledger")]

    %% Authentication Flow
    User -->|"Credentials"| P1
    P1 <-->|"Verify User & Role"| D1
    P1 -->|"Auth Token (JWT)"| User

    %% Catalog Flow
    User -->|"Manage Products"| P2
    P2 <-->|"CRUD Operations"| D2

    %% Purchase Order & Goods Receipt Flow
    User -->|"Issue PO"| P4
    P4 -->|"PO Transmitted"| Supp
    Supp -->|"Deliver Consignment"| P4
    P4 -->|"Update PO Status"| D4
    P4 -->|"Increment Available Stock"| D3
    P4 -->|"Log STOCK_IN Transaction"| D7

    %% Customer Order & Reservation Flow
    Cust -->|"Place Order"| P5
    P5 <-->|"Check Stock & Reserve"| D3
    P5 -->|"Persist Order & OrderItems"| D5
    P5 -->|"Log RESERVATION Transaction"| D7

    %% Shipment & Dispatch Flow
    User -->|"Create Shipment & Dispatch"| P6
    P6 <-->|"Fetch Confirmed Orders"| D5
    P6 -->|"Deduct Reserved Stock"| D3
    P6 -->|"Create Shipment Record"| D6
    P6 -->|"Log STOCK_OUT Transaction"| D7
    P6 -->|"Tracking Info"| Cust

    %% Inventory Transfer / Adjustment Flow
    User -->|"Stock Adjustment / Transfer"| P3
    P3 <-->|"Update Quantities"| D3
    P3 -->|"Log TRANSFER/ADJUSTMENT"| D7

    %% Reports Flow
    User -->|"Query Reports & Views"| P7
    P7 <-->|"Aggregate Metrics"| D2
    P7 <-->|"Aggregate Quantities & Valuation"| D3
    P7 <-->|"Fetch Audit Trail"| D7
```

---

### 3. UML Sequence Diagram: Customer Order Stock Reservation (ACID Locking)

This sequence diagram illustrates the pessimistic locking flow preventing race conditions and overselling during simultaneous checkout attempts.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend Client (React)
    participant Ctrl as CustomerOrderController
    participant Svc as CustomerOrderService
    participant Repo as InventoryRepository
    participant DB as MySQL 8.0 (InnoDB)
    participant TxRepo as StockTransactionRepository

    Client->>Ctrl: POST /api/customer-orders/{id}/confirm
    Note over Ctrl,DB: @Transactional (READ COMMITTED)
    Ctrl->>Svc: confirmAndReserveOrder(orderId, currentUser)
    Svc->>DB: SELECT * FROM customer_orders WHERE id = ?
    
    loop For each OrderItem in Order
        Svc->>Repo: findByWarehouseIdAndProductIdForUpdate(whId, prodId)
        Repo->>DB: SELECT * FROM inventory WHERE warehouse_id = ? AND product_id = ? FOR UPDATE
        Note over DB: Acquires Exclusive (X) Row Lock on Inventory Record
        DB-->>Svc: Return locked Inventory entity
        
        alt quantity_available < requested_quantity
            Note over Svc,DB: Stock deficit detected! Rollback triggered.
            Svc-->>Ctrl: throw InsufficientStockException("Insufficient stock...")
            Ctrl-->>Client: HTTP 400 Bad Request (Order remains PENDING)
        else Sufficient stock available
            Note over Svc: quantity_available = quantity_available - requested_qty<br/>quantity_reserved = quantity_reserved + requested_qty
            Svc->>Repo: save(inventory)
            Svc->>TxRepo: save(StockTransaction: RESERVATION)
        end
    end

    Note over Svc: order.setStatus(ORDER_CONFIRMED)
    Svc->>DB: UPDATE customer_orders SET status = 'CONFIRMED'
    Note over DB: COMMIT Transaction & Release Row Locks
    DB-->>Svc: Transaction Committed
    Svc-->>Ctrl: Return updated CustomerOrder
    Ctrl-->>Client: HTTP 200 OK (Stock Reserved Successfully)
```

---

### 4. UML Sequence Diagram: Purchase Order Goods Receipt (Stock-In)

This sequence diagram outlines the receiving of supplier consignments and updating warehouse inventory.

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Warehouse Receiver
    participant UI as React UI (PurchaseOrders.jsx)
    participant API as PurchaseOrderController
    participant Svc as PurchaseOrderService
    participant InvRepo as InventoryRepository
    participant TxRepo as StockTransactionRepository
    participant DB as MySQL Database

    Operator->>UI: Click "Receive Goods" on Approved PO
    UI->>API: PATCH /api/purchase-orders/{id}/status?status=RECEIVED
    Note over API,DB: @Transactional Boundary
    API->>Svc: updatePOStatus(id, RECEIVED, operatorUser)
    Svc->>DB: SELECT * FROM purchase_orders WHERE id = ?
    
    loop For each PurchaseOrderItem
        Svc->>InvRepo: findByWarehouseIdAndProductId(whId, prodId)
        alt Inventory Record Exists
            Note over Svc: quantity_available += received_quantity
            Svc->>InvRepo: save(existingInventory)
        else First time stocking product in warehouse
            Note over Svc: Create new Inventory record (qty = received_quantity)
            Svc->>InvRepo: save(newInventory)
        end
        
        Note over Svc: Record Audit Trail Entry
        Svc->>TxRepo: save(StockTransaction: STOCK_IN, qty, ref="PURCHASE_ORDER", poId)
    end

    Note over Svc: po.setStatus(RECEIVED)
    Svc->>DB: UPDATE purchase_orders SET status = 'RECEIVED'
    Note over DB: COMMIT Transaction
    DB-->>Svc: Transaction Success
    Svc-->>API: Return updated PO
    API-->>UI: HTTP 200 OK ("Purchase order marked as RECEIVED")
    UI-->>Operator: Displays updated stock and success notification
```
