# CEP 9: Pharmacy Management

## Motive

CARE already includes prescription management and doctor prescription creation.
This enhancement aims to extend the existing functionality to include robust
pharmacy-specific features, improving medication dispensing, inventory control,
and overall pharmacy operations.

## FHIR Resources

<!-- Link references to FHIR resources -->

[fhir_location]: https://hl7.org/fhir/R5/location.html
[fhir_inventoryitem]: https://hl7.org/fhir/R5/inventoryitem.html
[fhir_inventoryreport]: https://hl7.org/fhir/R5/inventoryreport.html
[fhir_supplyrequest]: https://hl7.org/fhir/R5/supplyrequest.html
[fhir_supplydelivery]: https://hl7.org/fhir/R5/supplydelivery.html
[fhir_transport]: https://hl7.org/fhir/R5/transport.html
[fhir_medicationrequest]: https://hl7.org/fhir/R5/medicationrequest.html
[fhir_medicationdispense]: https://hl7.org/fhir/R5/medicationdispense.html
[fhir_healthcareservice]: https://hl7.org/fhir/R5/healthcareservice.html
[fhir_chargeitem]: https://hl7.org/fhir/R5/chargeitem.html
[fhir_invoice]: https://hl7.org/fhir/R5/invoice.html
[fhir_paymentreconciliation]: https://hl7.org/fhir/R5/paymentreconciliation.html

- **[Location][fhir_location]**
- **[InventoryItem][fhir_inventoryitem]**
- **[InventoryReport][fhir_inventoryreport]**
- **[SupplyRequest][fhir_supplyrequest]**
- **[SupplyDelivery][fhir_supplydelivery]**
- **[Transport][fhir_transport]**
- **[MedicationRequest][fhir_medicationrequest]**
- **[MedicationDispense][fhir_medicationdispense]**
- **[HealthcareService][fhir_healthcareservice]**
- **[ChargeItem][fhir_chargeitem]**
- **[Invoice][fhir_invoice]**
- **[PaymentReconciliation][fhir_paymentreconciliation]**

## Requirements

### 1. Store Management

- Support multiple main stores (warehouses) and multiple sub-stores (stocking points) within a facility
- Implement hierarchical structure for stores (warehouses -> sub-stores)
- Allow each store (main store or sub-store) to have a specific location associated with it
- Support identifiers to track where medicine is stored within a store (e.g., shelf number, bin location)
- Enable inventory tracking across all stores and sub-stores
- Allow stock transfers between stores with logging
- Implement stock transfers from main store to sub-stores based on intents/requests from sub-stores
- Enable transfer of non-medical items to corresponding departments and track in their inventory
- Support inventory management for all hospital consumables (e.g., detergents, chairs, bins, bed sheets) in the main store
- Support medicine take-back procedures and tracking

#### Implementation Details

- Stores, sub-stores and warehouses will be registered as [Location][fhir_location]
- Specific location of items will also be registered as [Location][fhir_location]
- Stock transfers will be managed using [SupplyRequest][fhir_supplyrequest] and
  [SupplyDelivery][fhir_supplydelivery] models, this adds support for transport of consumables as well
- Consumables will be implemented using [InventoryItem][fhir_inventoryitem] model
- Medicine take-back procedures will be implemented using [Transport][fhir_transport]

##### permissions

- Staff

  - List all stores
  - View store details

- Pharmacist

  - List all stores
  - View store details
  - Transfer stock between stores

- Admin
  - List all stores
  - View store details
  - Transfer stock between stores
  - Add new store
  - Update store details
  - Delete store
  - Link sub-stores to main store
  - Approve stores for Facility

##### Required FHIR Resources

- [Location][fhir_location]
- [SupplyRequest][fhir_supplyrequest]
- [SupplyDelivery][fhir_supplydelivery]
- [InventoryItem][fhir_inventoryitem]
- [Transport][fhir_transport]

### 2. Inventory Management

- Support multiple units of measurement for products
- Capture and track the quantity of each medication in corresponding units (e.g., 30ml or 100ml for syrup bottles)
- Track expiration dates for all products
- Automatically choose the first-to-expire batch for each product to dispense from (FEFO)
- Provide real-time inventory visibility across all stores
- Track medication and other supplies inventory at the batch level
- Ability to view the current stock levels by product
- Support baseline stock maintenance levels for each store
- Enable automatic reorder alerts based on configurable thresholds
- Implement minimum stock alerts for each product
- Generate alerts for approaching expiration dates
- Implement data analysis for each sub-store and main store to suggest optimum inventory levels
- Track and analyze high-value inventory consumption rates and areas
- Support real-time consumption tracking for items not directly charged to patients (e.g., cotton)
- Implement a notification system for drugs that need refrigeration (e.g., vaccines and some IV antibiotics)

#### Implementation Details

- Inventory items will be stored in db with base unit of measurement (l, ml, g, kg), other uom will be calculated as needed
- [InventoryItem][fhir_inventoryitem] stores the expiration date and quantity of items within a batch
- Inventory items count will be calculated using [InventoryReport][fhir_inventoryreport]
- Periodic tasks will be run to check for expiration dates and minimum stock levels and raise alerts for the same
- Analytics tools can be used to analyze consumption rates and suggest optimum inventory levels

##### permissions

- Staff

  - View inventory levels
  - View expiration dates
  - View batch details

- Pharmacist

  - View inventory levels
  - View expiration dates
  - View batch details
  - Create Update Batch/inventory items
  - Update inventory levels
  - Update expiration dates
  - Update batch details

- Admin
  - View inventory levels
  - View expiration dates
  - View batch details
  - Create Update Delete Batch/inventory items
  - Update inventory levels
  - Update expiration dates
  - Update batch details

##### Required FHIR Resources

- [InventoryItem][fhir_inventoryitem]
- [InventoryReport][fhir_inventoryreport]

### 3. Batch Management

- Assign unique identifiers to each product batch
- Track batch details: manufacturer, production date, expiration date, quantity
- Support procurement of products from suppliers, broken up by batches with their expiry dates

#### Implementation Details

- Covered by the [InventoryItem][fhir_inventoryitem] model

##### permissions

- Staff

  - View batch details

- Pharmacist

  - View batch details
  - Create Update batch details

- Admin
  - View batch details
  - Create Update Delete batch details

##### Required FHIR Resources

- [InventoryItem][fhir_inventoryitem]

### 4. Order Management

- Create and manage purchase orders for restocking
- Track order status (placed, in transit, received, etc.)
- Support partial order receipts and back-orders
- Implement a two-level approval system for high-value item purchases
- Future: Allow creation of intent for purchase orders based on usage trends and stock levels

#### Implementation Details

- The [Transport][fhir_transport] model will be used to track order status
- Transport model also supports partial order receipts, back-orders and intent for purchase orders
- The SupplyRequest can be extended to support two-level approval system based on the item

##### permissions

- Staff

  - List Create Update Purchase Orders
  - View Purchase Order details

- Pharmacist

  - List Create Update Purchase Orders
  - View Purchase Order details
  - Approve Purchase Orders

- Admin
  - List Create Update Delete Purchase Orders
  - View Purchase Order details
  - Approve Purchase Orders

##### Required FHIR Resources

- [Transport][fhir_transport]
- [SupplyRequest][fhir_supplyrequest]

### 5. Supplier Management

- Maintain a database of approved suppliers
- Suppliers are facility level
- Manage vendor/supplier information
- Implement a vendor addition process that captures product information and source of vendor introduction

#### Implementation Details

- Supplier information will be stored in the [HealthcareService][fhir_healthcareservice] model
- Approved suppliers will will be a many to many relation with the facility

##### permissions

- Staff
  - List suppliers
  - View supplier details

- Pharmacist
  - List suppliers
  - View supplier details
  - Create Update supplier

- Admin
  - List suppliers
  - View supplier details
  - Create Update Delete supplier

##### Required FHIR Resources

- [HealthcareService][fhir_healthcareservice]

### 6. Prescription Management

- Extend existing prescription model to include pharmacy-relevant states
  (e.g., Prescribed, Verified, Partially Dispensed, Fully Dispensed, Cancelled)
- Implement workflow for prescription state transitions
- Let staff in pharmacy with specific permission to update medicine and count
- Generate printable prescriptions with all necessary details
- Create secure, time-limited public links for prescription access
- Clearly mark medicines on prescriptions that are not available in-store and add note to buy from outside
- Implement allergy and drug interaction warnings
- Implement a token system for dispensing

#### Implementation Details

- Add dispenseRequest state to the existing Medicine model to store the current dispense states, refer to [MedicationRequest][fhir_medicationrequest]
- [MedicationDispense][fhir_medicationdispense] will be used to track the dispense state transitions

##### Required FHIR Resources

- [MedicationRequest][fhir_medicationrequest]
- [MedicationDispense][fhir_medicationdispense]

### 7. Dispensing

- Record full or partial dispensing of medications
- Update prescription states and inventory upon dispensing
- Generate medication labels with instructions
- Implement alerts for similar sounding/looking medicines
- Display allergy and drug interaction warnings during the dispensing process
- Support barcode scanning for medication identification
- Automatic reduction in stock of product batch quantities when patient pays for the invoice consisting of products (via the billing function)

#### Implementation Details

- [MedicationDispense][fhir_medicationdispense] will be used to track the dispense state transitions
- All transactions will be recorded as [InventoryReport][fhir_inventoryreport] InventoryReport keeps track of the quantity of items, it can also record partial dispenses, InventoryReport does not overlap with Dispense: Dispense carries the 'clinical' meaning that a product has been assigned to a patient. The InventoryReport captures the logistic aspect.

##### permissions

- Staff
  - View dispense details

- Pharmacist
  - View dispense details
  - Create Update dispense Details

- Admin
  - View dispense details
  - Create Update Delete dispense Details

##### Required FHIR Resources

- [MedicationDispense][fhir_medicationdispense]
- [InventoryReport][fhir_inventoryreport]

### 8. Billing and Payments

- Integrate with the planned billing system for medication charges
- Process returns and refunds, updating inventory accordingly
- Apply GST (Goods and Services Tax) to billing as required
- Implement controls to prevent unauthorized discounting of bills
- Flag unusual billing patterns or discrepancies for review

#### Implementation Details

- The [ChargeItem][fhir_chargeitem] model will be used to track the billing information of the items
- The ChargeItem will then be used to generate the [Invoice][fhir_invoice] for the patient, which can be paid directly or as part of [PaymentReconciliation][fhir_paymentreconciliation]

##### permissions

- Staff
  - View billing details

- Pharmacist
  - View billing details
  - Create Update billing Details

- Admin
  - View billing details
  - Create Update Delete billing Details
  - Create Update Delete Tax/discount details

##### Required FHIR Resources

- [ChargeItem][fhir_chargeitem]
- [Invoice][fhir_invoice]
- [PaymentReconciliation][fhir_paymentreconciliation]

### 9. Reporting and Analytics

- Generate reports on:
  a. Sales, discounts, and credits
  b. Purchases
  c. Stock movement
  d. Inventory status
  e. Fast-moving and slow-moving medicines
- Provide financial reports including sales, claims, and profit margins
- Track and report on batch utilization and expiry
- Implement metrics on rate of usage across medicines
- Implement red flagging or alerts for abnormal consumption rates or low/high billing values
- Generate reports on real-time consumption of items not directly charged to patients

#### Implementation Details

##### Required FHIR Resources

### 10. User Management and Security

- Extend existing user roles to include pharmacy-specific permissions
- Implement audit trails for all pharmacy-related actions
- Implement strict controls on discount application, limiting it to admin-level users

#### Implementation Details

##### Required FHIR Resources

### 11. Environmental Controls

- Implement a system to track and manage medications requiring special storage conditions (e.g., refrigeration)
- Set up alerts and notifications for temperature-sensitive medications

#### Implementation Details

##### Required FHIR Resources

## Reviewed By

- Dr. Athul Joseph Manuel
- Dr. George Tukalan
- Dr. Sachin Suresh
