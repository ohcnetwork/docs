# CEP 9: Pharmacy Management

## Motive

CARE already includes prescription management and doctor prescription creation. This enhancement aims to extend the existing functionality to include robust pharmacy-specific features, improving medication dispensing, inventory control, and overall pharmacy operations.

## Requirements

### 1. Store Management

- Support multiple main stores (warehouses) and multiple substores (stocking points) within a facility
- Implement hierarchical structure for stores (warehouses -> stocking points)
- Enable inventory tracking across all stores and substores
- Allow stock transfers between stores with logging
- Support identifiers to track where medicine is stored within a store (e.g., shelf number, bin location)

### 2. Inventory Management

- Track medication and other supplies inventory at the batch level
- Support multiple units of measurement for products
- Enable automatic reorder alerts based on configurable thresholds
- Provide real-time inventory visibility across all stores
- Implement minimum stock alerts for each product
- Support baseline stock maintenance levels for each store
- Track expiration dates for all products
- Generate alerts for approaching expiration dates
- Support medicine take-back procedures and tracking
- Automatically choose the first-to-expire batch for each product to dispense from (FEFO)
- Ability to view the current stock levels by product
- Implement a notification system for drugs that need refrigeration (e.g., vaccines and some IV antibiotics)

### 3. Batch Management

- Assign unique identifiers to each product batch
- Track batch details: manufacturer, production date, expiration date, quantity
- Support procurement of products from suppliers, broken up by batches with their expiry dates

### 4. Order Management

- Create and manage purchase orders for restocking
- Track order status (placed, in transit, received, etc.)
- Support partial order receipts and backorders
- Future: Allow creation of intent for purchase orders based on usage trends and stock levels

### 5. Supplier Management

- Maintain a database of approved suppliers
- Suppliers are facility level
- Manage vendor/supplier information

### 6. Prescription Management

- Extend existing prescription model to include pharmacy-relevant states
  (e.g., Prescribed, Verified, Partially Dispensed, Fully Dispensed, Cancelled)
- Implement workflow for prescription state transitions
- Generate printable prescriptions with all necessary details
- Create secure, time-limited public links for prescription access
- Clearly mark medicines on prescriptions that are not available in-store and add note to buy from outside
- Let staff in pharmacy with specific permission to update medicine and count
- Implement allergy and drug interaction warnings

### 7. Dispensing

- Record full or partial dispensing of medications
- Generate medication labels with instructions
- Update prescription states and inventory upon dispensing
- Support barcode scanning for medication identification
- Automatic reduction in stock of product batch quantities when patient pays for the invoice consisting of products (via the billing function)
- Display allergy and drug interaction warnings during the dispensing process

### 8. Billing and Payments

- Integrate with the planned billing system for medication charges
- Process returns and refunds, updating inventory accordingly
- Apply GST (Goods and Services Tax) to billing as required

### 9. Reporting and Analytics

- Generate reports on:
  a. Sales, discounts, and credits
  b. Purchases
  c. Stock movement
  d. Inventory status
  f. Fast-moving and slow-moving medicines
- Provide financial reports including sales, claims, and profit margins
- Track and report on batch utilization and expiry
- Implement metrics on rate of usage across medicines

### 10. User Management and Security

- Extend existing user roles to include pharmacy-specific permissions
- Implement audit trails for all pharmacy-related actions

### 11. Environmental Controls

- Implement a system to track and manage medications requiring special storage conditions (e.g., refrigeration)
- Set up alerts and notifications for temperature-sensitive medications

## Reviewed By

- Dr. Athul Joseph Manuel
- Dr. George Tukalan
