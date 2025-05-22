### 📋 Summary

The **Charge Item** resource in the CARE system captures financial details associated with services rendered or products supplied to a patient. It serves as a self-contained record, detailing the origin of the charge, the amount, applied discounts, taxes, and other relevant financial information.

Charge Items are intrinsically linked to both an **Account** and an **Encounter**, ensuring accurate tracking and billing within the patient's financial records.

This resource aligns with FHIR's [ChargeItem](https://build.fhir.org/chargeitem.html) resource, facilitating interoperability and standardized billing practices.[FHIR Build](https://build.fhir.org/chargeitem.html?utm_source=chatgpt.com)

---

### 🎯 Key Purpose

- Document financial charges for services or products provided to patients.
- Enable automated billing processes by linking clinical activities to financial records.
- Support detailed breakdowns of charges, including taxes, discounts, and surcharges.
- Facilitate auditing and financial analysis within the healthcare facility.

---

### 🧱 Core Data Structure – Essential Fields

- **`id`**: Internal identifier for the charge item.
- **`definition`**: Reference to the associated Charge Item Definition.
- **`status`**: Current state of the charge item (e.g., planned, billable, billed).
- **`code`**: Billing code identifying the charge.
- **`patient`**: Reference to the patient associated with the charge.
- **`encounter`**: Reference to the encounter during which the charge was incurred.
- **`facility`**: Reference to the facility where the charge item was created.
- **`quantity`**: Quantity of the service or product provided.
- **`unitPriceComponent`**: Breakdown of the unit price, including base price, taxes, and discounts.
- **`totalPriceComponent`**: Breakdown of the total price, considering quantity and other factors.
- **`total_price`**: Total monetary amount charged.
- **`overrideReason`**: Reason for any manual override of the standard pricing.
- **`service`**: Reference to the service or product that prompted the charge.
- **`account`**: Reference to the patient's account for billing purposes.
- **`note`**: Additional comments or annotations about the charge item.
- **`supportingInformation`**: Additional references supporting the charge (e.g., prescriptions, orders).[FHIR Build+13FHIR Build+13NRCeS+13](https://build.fhir.org/chargeitem.html?utm_source=chatgpt.com)

---

### 🔗 Core Relationships

| Field        | Reference Resource                    | Description                                              |
| ------------ | ------------------------------------- | -------------------------------------------------------- |
| `definition` | ChargeItemDefinition                  | Defines the pricing rules and applicability.             |
| `patient`    | Patient                               | Patient associated with the charge.                      |
| `encounter`  | Encounter                             | Clinical encounter during which the charge was incurred. |
| `facility`   | Organization                          | Facility where the charge item was created.              |
| `service`    | Various (e.g., Medication, Procedure) | Service or product that prompted the charge.             |
| `account`    | Account                               | Patient's account for billing purposes.                  |

---

### 📄 Supported Fields

**Monetary Component:**

- **`type`**: Type of price component (e.g., base, surcharge, discount, tax, informational).
- **`code`**: Code differentiating kinds of taxes, surcharges, discounts, etc.
- **`factor`**: Factor used for calculating this component.
- **`amount`**: Monetary amount associated with this component, including value and currency.

---

### 🔁 Functional Workflow

1. **Charge Item Creation**: When a service is rendered or a product is supplied, a Charge Item is automatically generated, capturing all relevant financial details.
2. **Association with Encounter and Account**: The Charge Item is linked to the specific patient encounter and their billing account, ensuring accurate financial tracking.
3. **Pricing Calculation**: Using the associated Charge Item Definition, the system calculates the unit and total prices, factoring in any applicable taxes, discounts, or surcharges.
4. **Manual Overrides**: If necessary, authorized personnel can override standard pricing, with the reason documented in the `overrideReason` field.
5. **Billing and Invoicing**: Charge Items feed into the billing system, facilitating invoice generation and payment processing.
6. **Audit and Reporting**: Detailed records of Charge Items support financial audits and reporting requirements.
