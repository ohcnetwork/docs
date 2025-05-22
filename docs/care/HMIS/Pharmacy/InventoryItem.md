### Summary

The **InventoryItem** resource represents the availability of a specific product at a given location. It is primarily used for inventory management within healthcare facilities, ensuring accurate tracking of stock levels for medications and other products.

Inventory items are automatically created and updated, typically when a supply delivery is marked as completed.

An inventory item can be marked as inactive to indicate that it is no longer actively dispensed by the pharmacy, possibly due to damage or other concerns.

---

### Key Purpose

- Track the availability and quantity of products at specific locations.
- Facilitate inventory management and auditing processes.
- Support automated updates based on supply deliveries.
- Indicate the active or inactive status of inventory items.

---

### Core Data Structure – Essential Fields

- **`product`**: Reference to the product being tracked.
- **`status`**: Current status of the inventory item (e.g., active, inactive).
- **`location`**: Location where the product is stored.
- **`net_content`**: Quantity of the product available at the specified location.

---

### Supported Status Values

The `status` field can have the following values:

- **`active`**: The item is active and can be referenced.
- **`inactive`**: The item is presently inactive; there may be references to it, but it is not expected to be used.
- **`entered-in-error`**: The item record was entered in error.
- **`unknown`**: The item status has not been determined.[FHIR Build+1HL7 Terminology+1](https://build.fhir.org/codesystem-inventoryitem-status.html?utm_source=chatgpt.com)

_Source: FHIR InventoryItem Status Codes_

---

### Core Relationships

| Field      | Reference Resource | Description                                 |
| ---------- | ------------------ | ------------------------------------------- |
| `product`  | Product            | The product being tracked in the inventory. |
| `location` | Location           | The location where the product is stored.   |

---

### Supported Fields

| Field Name    | Type      | Description                                        |
| ------------- | --------- | -------------------------------------------------- |
| `product`     | Reference | Reference to the product being tracked.            |
| `status`      | code      | Current status of the inventory item.              |
| `location`    | Reference | Location where the product is stored.              |
| `net_content` | Quantity  | Quantity of the product available at the location. |

---

### Functional Workflow

1. **Supply Delivery Completion**: When a supply delivery is marked as completed, corresponding inventory items are automatically created or updated to reflect the new stock levels.
2. **Inventory Updates**: Any changes in stock levels, such as dispensing or receiving products, result in automatic updates to the inventory items.
3. **Status Management**: Inventory items can be marked as inactive to indicate that they are no longer actively dispensed, possibly due to damage or other concerns.
4. **Inventory Auditing**: Regular audits can be conducted by reviewing the inventory items, their statuses, and quantities to ensure accurate stock management.
