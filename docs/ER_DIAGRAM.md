# Smart Inventory & Supply Chain Management System
## Entity-Relationship Diagram and Process Flowcharts

---

## 1. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ purchase_orders : "creates"
    users ||--o{ customer_orders : "creates"
    users ||--o{ stock_transactions : "executes"
    
    categories ||--o{ products : "categorizes"
    
    products ||--o{ inventory : "stocked_in"
    warehouses ||--o{ inventory : "holds"
    
    suppliers ||--o{ supplier_product : "supplies"
    products ||--o{ supplier_product : "supplied_by"
    
    suppliers ||--o{ purchase_orders : "fulfills"
    warehouses ||--o{ purchase_orders : "destined_for"
    purchase_orders ||--|{ purchase_order_items : "contains"
    products ||--o{ purchase_order_items : "itemized_in"
    
    customer_orders ||--|{ order_items : "contains"
    products ||--o{ order_items : "ordered_in"
    
    customer_orders ||--o{ shipments : "shipped_via"
    warehouses ||--o{ shipments : "dispatched_from"
    
    products ||--o{ stock_transactions : "audits"
    warehouses ||--o{ stock_transactions : "audited_at"

    users {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR full_name
        ENUM role
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    categories {
        BIGINT id PK
        VARCHAR name UK
        TEXT description
        TIMESTAMP created_at
    }

    products {
        BIGINT id PK
        BIGINT category_id FK
        VARCHAR sku UK
        VARCHAR name
        TEXT description
        DECIMAL unit_price
        INT reorder_level
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    suppliers {
        BIGINT id PK
        VARCHAR name
        VARCHAR contact_person
        VARCHAR email UK
        VARCHAR phone
        TEXT address
        ENUM status
        TIMESTAMP created_at
    }

    warehouses {
        BIGINT id PK
        VARCHAR name UK
        VARCHAR location
        INT capacity
        VARCHAR contact_number
        ENUM status
        TIMESTAMP created_at
    }

    inventory {
        BIGINT id PK
        BIGINT product_id FK
        BIGINT warehouse_id FK
        INT quantity_available
        INT quantity_reserved
        TIMESTAMP last_updated
    }

    supplier_product {
        BIGINT id PK
        BIGINT supplier_id FK
        BIGINT product_id FK
        DECIMAL supplier_price
        INT lead_time_days
    }

    purchase_orders {
        BIGINT id PK
        VARCHAR po_number UK
        BIGINT supplier_id FK
        BIGINT warehouse_id FK
        ENUM status
        DECIMAL total_amount
        BIGINT created_by FK
        TIMESTAMP order_date
        DATE expected_delivery_date
        TIMESTAMP received_date
    }

    purchase_order_items {
        BIGINT id PK
        BIGINT purchase_order_id FK
        BIGINT product_id FK
        INT ordered_quantity
        INT received_quantity
        DECIMAL unit_price
    }

    customer_orders {
        BIGINT id PK
        VARCHAR order_number UK
        VARCHAR customer_name
        VARCHAR customer_email
        VARCHAR customer_phone
        TEXT shipping_address
        ENUM status
        DECIMAL total_amount
        BIGINT created_by FK
        TIMESTAMP order_date
    }

    order_items {
        BIGINT id PK
        BIGINT order_id FK
        BIGINT product_id FK
        INT quantity
        DECIMAL unit_price
        DECIMAL subtotal
    }

    shipments {
        BIGINT id PK
        VARCHAR tracking_number UK
        BIGINT order_id FK
        BIGINT warehouse_id FK
        VARCHAR carrier
        ENUM status
        TIMESTAMP shipped_date
        DATE estimated_delivery_date
        TIMESTAMP delivered_date
    }

    stock_transactions {
        BIGINT id PK
        BIGINT product_id FK
        BIGINT warehouse_id FK
        ENUM transaction_type
        INT quantity
        VARCHAR reference_id
        TEXT description
        BIGINT created_by FK
        TIMESTAMP transaction_date
    }
```

---

## 2. Plain-English Description of Every Relationship

1. **`users` -> `purchase_orders` (1:N)**:
   - One user (creator) can author many purchase orders.
   - Each purchase order records the exact employee or admin who generated it (`created_by`).
   - If a user is referenced in purchase orders, deleting the user is prevented (`ON DELETE RESTRICT`).

2. **`users` -> `customer_orders` (1:N)**:
   - One user can register multiple customer sales orders.
   - Each customer order records the operator ID in `created_by`. Deleting the user is prevented (`ON DELETE RESTRICT`).

3. **`users` -> `stock_transactions` (1:N)**:
   - One user can execute multiple inventory modifications.
   - Every immutable stock transaction audit log links directly to the responsible user account in `created_by`.

4. **`categories` -> `products` (1:N)**:
   - One category groups zero, one, or many products.
   - Every product points to its parent category via `category_id`.
   - Categories containing products cannot be deleted (`ON DELETE RESTRICT`).

5. **`products` -> `inventory` (1:N) & `warehouses` -> `inventory` (1:N)**:
   - A single product can be distributed across multiple warehouses.
   - A single warehouse stores inventory records for multiple products.
   - The `inventory` table acts as the composite balance entity, with a unique constraint on `(product_id, warehouse_id)`.
   - Deleting a product or warehouse cascades to delete its balance record (`ON DELETE CASCADE`).

6. **`suppliers` <-> `products` (M:N via `supplier_product`)**:
   - One supplier can supply multiple products at agreed contractual prices.
   - One product can be sourced from multiple competing suppliers.
   - `supplier_product` is the junction table that stores `supplier_price` and `lead_time_days` for the unique pair `(supplier_id, product_id)`.

7. **`suppliers` -> `purchase_orders` (1:N)**:
   - One supplier can receive many purchase orders over time.
   - Deleting an active supplier that has existing purchase orders is prohibited (`ON DELETE RESTRICT`).

8. **`warehouses` -> `purchase_orders` (1:N)**:
   - One warehouse serves as the destination receiving facility for multiple purchase orders (`warehouse_id`).

9. **`purchase_orders` -> `purchase_order_items` (1:N)**:
   - One purchase order contains one or more line items detailing goods ordered.
   - Deleting a purchase order cascades to delete all its line item rows (`ON DELETE CASCADE`).

10. **`products` -> `purchase_order_items` (1:N)**:
    - A product can appear as a line item across multiple purchase orders.
    - Products referenced in procurement history cannot be deleted (`ON DELETE RESTRICT`).

11. **`customer_orders` -> `order_items` (1:N)**:
    - One customer sales order contains one or more individual product line items.
    - Deleting the parent customer order cascades to delete all child line items (`ON DELETE CASCADE`).

12. **`products` -> `order_items` (1:N)**:
    - A product can be purchased across many different customer orders.
    - Products with sales order history cannot be deleted from the catalog (`ON DELETE RESTRICT`).

13. **`customer_orders` -> `shipments` (1:N)**:
    - One customer order is fulfilled through a shipment dispatch record (`order_id`).

14. **`warehouses` -> `shipments` (1:N)**:
    - One warehouse acts as the dispatch origin point for multiple carrier shipments (`warehouse_id`).

15. **`products` -> `stock_transactions` (1:N) & `warehouses` -> `stock_transactions` (1:N)**:
    - Every stock adjustment, transfer, receipt, reservation, or release writes an audit entry recording the `product_id` and `warehouse_id`.

---

## 3. Order Lifecycle Flowchart (Customer Order & Shipment)

```mermaid
flowchart TD
    Start(["Customer Places Order"]) --> CreateOrder["Create Customer Order<br/>(status: PENDING)"]
    
    CreateOrder --> CheckStock{"Available Stock Check<br/>(Pessimistic Row Lock)"}
    
    CheckStock -- Insufficient Stock --> Fail["Rejection / Wait for Restock<br/>(HTTP 422)"]
    
    CheckStock -- Sufficient Stock --> ConfirmOrder["Confirm Order & Reserve Stock<br/>(status: CONFIRMED)<br/>• quantity_available -= Qty<br/>• quantity_reserved += Qty<br/>• Log STOCK_RESERVATION"]
    
    ConfirmOrder --> CreateShipment["Create Shipment<br/>(Shipment: PREPARING)<br/>(Customer Order: PROCESSING)"]
    
    ConfirmOrder -. Cancel Order .-> CancelOrder["Cancel Order<br/>(status: CANCELLED)<br/>• quantity_reserved -= Qty<br/>• quantity_available += Qty<br/>• Log STOCK_RELEASE"]
    
    CreateShipment --> Dispatch["Carrier Pick Up / Dispatch<br/>(Shipment: DISPATCHED)<br/>(Customer Order: SHIPPED)<br/>• quantity_reserved -= Qty<br/>• Log STOCK_OUT"]
    
    CreateShipment -. Cancel Shipment .-> CancelShipment["Cancel Shipment<br/>(Shipment: CANCELLED)<br/>(Customer Order: CONFIRMED)"]
    
    Dispatch --> InTransit["In Transit / Delayed<br/>(Shipment: IN_TRANSIT / DELAYED)"]
    
    InTransit --> Deliver["Delivery Confirmed<br/>(Shipment: DELIVERED)<br/>(Customer Order: DELIVERED)"]
    
    Deliver --> Done(["Fulfillment Completed"])
    CancelOrder --> Terminated(["Order Cancelled"])
```

---

## 4. Purchase Order Procurement Lifecycle Flowchart

```mermaid
flowchart TD
    StartPO(["Procurement Need Identified"]) --> DraftPO["Create Purchase Order<br/>(status: PENDING)<br/>• Calculate total_amount<br/>• Save purchase_order_items"]
    
    DraftPO --> ApprovePO["Admin Reviews & Approves<br/>(status: APPROVED)"]
    
    DraftPO -. Cancel .-> CancelPO["Cancel PO<br/>(status: CANCELLED)"]
    ApprovePO -. Cancel .-> CancelPO
    
    ApprovePO --> PlaceOrder["Issue Order to Supplier<br/>(status: ORDERED)"]
    
    PlaceOrder -. Supplier Cannot Fulfill .-> CancelPO
    
    PlaceOrder --> ReceiveGoods["Goods Arrive at Warehouse<br/>(Operator clicks 'Receive Goods')<br/>(status: RECEIVED)<br/>• received_quantity = ordered_quantity<br/>• received_date = CURRENT_TIMESTAMP<br/>• quantity_available += Qty<br/>• Log STOCK_IN in stock_transactions"]
    
    ReceiveGoods --> EndPO(["Procurement Fulfilled & Stock Available"])
    CancelPO --> Closed(["PO Terminated"])
```
