# CEP 9: Pharmacy Management

## Motive

CARE already includes prescription management and doctor prescription creation. This enhancement aims to extend the existing functionality to include robust pharmacy-specific features, improving medication dispensing, inventory control, and overall pharmacy operations.

## FHIR Resources

- **[InventoryItem](https://hl7.org/fhir/inventoryitem.html)**
- **[InventoryReport](https://hl7.org/fhir/inventoryreport.html)**
- **[SupplyRequest](https://hl7.org/fhir/R4/supplyrequest.html)**
- **[SupplyDelivery](https://hl7.org/fhir/R4/supplydelivery.html)**
- **[Transport](https://hl7.org/fhir/transport.html)**
- **[MedicationRequest](https://hl7.org/fhir/R4/medicationrequest.html)**
- **[MedicationDispense](https://hl7.org/fhir/R4/medicationdispense.html)**

## Requirements

### 1. Store Management

- Support multiple main stores (warehouses) and multiple substores (stocking points) within a facility
- Implement hierarchical structure for stores (warehouses -> substores)
- Allow each store (main store or substore) to have a specific location associated with it
- Support identifiers to track where medicine is stored within a store (e.g., shelf number, bin location)
- Enable inventory tracking across all stores and substores
- Allow stock transfers between stores with logging
- Implement stock transfers from main store to substores based on intents/requests from substores
- Enable transfer of non-medical items to corresponding departments and track in their inventory
- Support inventory management for all hospital consumables (e.g., detergents, chairs, bins, bed sheets) in the main store
- Support medicine take-back procedures and tracking

#### Implementation Details
- Stores, substores and warehouses will be registered as [Location](https://hl7.org/fhir/location.html)
- Specific location of items will also be registered as [Location](https://hl7.org/fhir/location.html)
- Sotck transfers will be managed using [SupplyRequest](https://hl7.org/fhir/R4/supplyrequest.html) and [SupplyDelivery](https://hl7.org/fhir/R4/supplydelivery.html) models, this adds support for transport of consumables as well
- Consumables will be implemented using [InventoryItem](https://hl7.org/fhir/inventoryitem.html) model
- Medicine takeback procedures will be implemented using [Transport](https://hl7.org/fhir/transport.html)

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
- Implement data analysis for each substore and main store to suggest optimum inventory levels
- Track and analyze high-value inventory consumption rates and areas
- Support real-time consumption tracking for items not directly charged to patients (e.g., cotton)
- Implement a notification system for drugs that need refrigeration (e.g., vaccines and some IV antibiotics)

#### Implementation Details

- Inventory items will be stored in db with base unit of measurement (l, ml, g, kg), other uom will be calculated as needed
- [InventoryItem](https://hl7.org/fhir/inventoryitem.html) stores the expiration date and quantity of items within a batch
- Inventory items count will be calculated using [InventoryReport](https://hl7.org/fhir/inventoryreport.html)
- Periodic tasks will be run to check for expiration dates and minimum stock levels and raise alerts for the same
- Dashboarding tools can be used to analyze consumption rates and suggest optimum inventory levels

### 3. Batch Management

- Assign unique identifiers to each product batch
- Track batch details: manufacturer, production date, expiration date, quantity
- Support procurement of products from suppliers, broken up by batches with their expiry dates

#### Implementation Details

- Covered by the [InventoryItem](https://hl7.org/fhir/inventoryitem.html) model

### 4. Order Management

- Create and manage purchase orders for restocking
- Track order status (placed, in transit, received, etc.)
- Support partial order receipts and backorders
- Implement a two-level approval system for high-value item purchases
- Future: Allow creation of intent for purchase orders based on usage trends and stock levels

#### Implementation Details

- The [Transport](https://hl7.org/fhir/transport.html) model will be used to track order status
- Transport model also supports partial order receipts, backorders and intent for purchase orders
- The SupplyRequest can be extended to support two-level approval system based on the item

### 5. Supplier Management

- Maintain a database of approved suppliers
- Suppliers are facility level
- Manage vendor/supplier information
- Implement a vendor addition process that captures product information and source of vendor introduction

#### Implementation Details

- Supplier information will be stored in the [HealthcareService](https://hl7.org/fhir/healthcareservice.html) model
- Approved suppliers will will be a many to many relation with the facility

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

- Add dispenseRequest state to the existing Medicine model to store the current dispense states, refer to [MedicationRequest](https://hl7.org/fhir/R4/medicationrequest.html)
- [MedicationDispense](https://hl7.org/fhir/R4/medicationdispense.html) will be used to track the dispense state transitions


### 7. Dispensing

- Record full or partial dispensing of medications
- Update prescription states and inventory upon dispensing
- Generate medication labels with instructions
- Implement alerts for similar sounding/looking medicines
- Display allergy and drug interaction warnings during the dispensing process
- Support barcode scanning for medication identification
- Automatic reduction in stock of product batch quantities when patient pays for the invoice consisting of products (via the billing function)

#### Implementation Details

- [MedicationDispense](https://hl7.org/fhir/R4/medicationdispense.html) will be used to track the dispense state transitions


### 8. Billing and Payments

- Integrate with the planned billing system for medication charges
- Process returns and refunds, updating inventory accordingly
- Apply GST (Goods and Services Tax) to billing as required
- Implement controls to prevent unauthorized discounting of bills
- Flag unusual billing patterns or discrepancies for review


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

### 10. User Management and Security

- Extend existing user roles to include pharmacy-specific permissions
- Implement audit trails for all pharmacy-related actions
- Implement strict controls on discount application, limiting it to admin-level users

### 11. Environmental Controls

- Implement a system to track and manage medications requiring special storage conditions (e.g., refrigeration)
- Set up alerts and notifications for temperature-sensitive medications

## Reviewed By

- Dr. Athul Joseph Manuel
- Dr. George Tukalan
- Dr. Sachin Suresh
