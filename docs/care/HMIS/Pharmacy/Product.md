### Summary

In the CARE system, a **Product** refers to any item that can be purchased from the facility. This encompasses:

- [Medications](https://build.fhir.org/medication.html)
- [Nutritional Products](https://build.fhir.org/nutritionproduct.html)
- Consumables

These items can be requested for a patient through a Medication Request. Although the terminology might seem counterintuitive, this design choice was made to streamline the ordering process.

Requested products are dispensed via the Medication Dispense process.

The **Product** resource in CARE is a culmination of multiple FHIR resource references. While it deviates from FHIR's standard structure, it maintains the capability to create individual FHIR resources when necessary.

A **Product** is an instantiation of **Product Knowledge**. All pertinent details are housed within the Product Knowledge resource, whereas the Product resource captures data unique to a specific batch, such as batch number and expiry date.

Additionally, a Product is linked to a Charge Item Definition, facilitating the creation of Charge Items whenever the product is billed.

---

### Key Purpose

- Represent purchasable items within the facility.
- Differentiate between general product information (Product Knowledge) and batch-specific details.
- Integrate with billing systems through Charge Item Definitions.
- Ensure compatibility with FHIR resources for interoperability.

---

### Core Data Structure – Essential Fields

- **`product_knowledge`**: Reference to the Product Knowledge resource containing general information about the product.
- **`batch_number`**: The specific batch number of the product.
- **`expiry_date`**: The expiration date of the product batch.
- **`charge_item_definition`**: Reference to the Charge Item Definition associated with the product.
- **`status`**: Current status of the product (e.g., active, inactive).

---

### Core Relationships

| Field                    | Reference Resource   | Description                                  |
| ------------------------ | -------------------- | -------------------------------------------- |
| `product_knowledge`      | ProductKnowledge     | General information about the product.       |
| `charge_item_definition` | ChargeItemDefinition | Billing details associated with the product. |

---

### Supported Fields

| Field Name               | Type      | Description                                             |
| ------------------------ | --------- | ------------------------------------------------------- |
| `product_knowledge`      | Reference | Link to the general product information.                |
| `batch_number`           | string    | Unique identifier for the product batch.                |
| `expiry_date`            | date      | Expiration date of the product batch.                   |
| `charge_item_definition` | Reference | Link to the billing definition for the product.         |
| `status`                 | code      | Current status of the product (e.g., active, inactive). |

---

### Functional Workflow

1. **Product Knowledge Creation**: General information about a product is entered into the Product Knowledge resource.
2. **Product Instantiation**: For each batch received, a Product resource is created, referencing the Product Knowledge and including batch-specific details.
3. **Billing Integration**: The Product resource links to a Charge Item Definition, ensuring accurate billing when the product is dispensed.
4. **Dispensing Process**: Products are dispensed to patients through the Medication Dispense process, with all relevant information captured.

---
