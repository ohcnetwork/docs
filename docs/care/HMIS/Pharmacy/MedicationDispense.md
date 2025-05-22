### Summary

The **MedicationDispense** resource in FHIR records the details of medications that have been dispensed to a patient. It serves as both a completion to the workflow initiated by a MedicationRequest and as a tool for inventory management within a healthcare setting.

In inpatient (IP) settings, items may be dispensed and maintained in the patient's room and refilled as needed. In outpatient (OP) settings, dispensing typically occurs after an encounter has been completed.

A **ChargeItem** can be associated with each dispense. By default, the **ChargeItemDefinition** is used to create this ChargeItem.

---

### Key Purpose

- Document the supply of medications to patients.
- Complete the medication workflow initiated by a MedicationRequest.
- Support inventory management within healthcare facilities.
- Facilitate billing through associated ChargeItems.

---

### Core Data Structure – Essential Fields

- **`product`**: Reference to the product being dispensed.
- **`status`**: Current status of the dispense (e.g., preparation, in-progress, completed).
- **`not_performed_reason`**: Reason why the dispense was not performed.
- **`status_history`**: History of status changes for auditing purposes.
- **`category`**: Type of medication dispense (e.g., IP, OP, Home).
- **`patient`**: Reference to the patient receiving the medication.
- **`encounter`**: Reference to the encounter during which the dispense occurred.
- **`location`**: Location where the dispense took place.
- **`authorizing_prescription`**: Reference to the MedicationRequest that authorized the dispense.
- **`dispense_type`**: Type of dispensing event performed.
- **`quantity`**: Amount of medication dispensed.
- **`days_supply`**: Number of days the supply is intended to last.
- **`when_prepared`**: Time when the medication was prepared.
- **`when_handed_over`**: Time when the medication was handed over to the patient.
- **`note`**: Additional information about the dispense.
- **`dosage_instruction`**: Instructions on how the medication should be used.
- **`substitution`**: Details about any substitution made during dispensing.
- **`charge_item`**: Reference to the associated charge item.

---

### Supported Status Values

The `status` field can have the following values:

- **`preparation`**: The core event has not started yet, but some staging activities have begun (e.g., initial compounding or packaging of medication).
- **`in-progress`**: The dispensed product is ready for pickup.
- **`cancelled`**: The dispensed product was not and will never be picked up by the patient.
- **`on-hold`**: The dispense process is paused while waiting for an external event to reactivate the dispense.
- **`completed`**: The dispensed product has been picked up.
- **`entered-in-error`**: The dispense was entered in error and therefore nullified.
- **`stopped`**: Actions implied by the dispense have been permanently halted, before all of them occurred.
- **`declined`**: The dispense was declined and not performed.
- **`unknown`**: The authoring system does not know which of the status values applies for this medication dispense.

---

### Core Relationships

| Field                      | Reference Resource | Description                                       |
| -------------------------- | ------------------ | ------------------------------------------------- |
| `product`                  | Product            | The product being dispensed.                      |
| `patient`                  | Patient            | The individual receiving the medication.          |
| `encounter`                | Encounter          | The encounter during which the dispense was made. |
| `location`                 | Location           | The location where the dispense occurred.         |
| `authorizing_prescription` | MedicationRequest  | The prescription that authorized the dispense.    |
| `charge_item`              | ChargeItem         | The associated charge for the dispensed item.     |

---

### Supported Fields

| Field Name                 | Type            | Description                                              |
| -------------------------- | --------------- | -------------------------------------------------------- |
| `product`                  | Reference       | Reference to the product being dispensed.                |
| `status`                   | code            | The current status of the dispense.                      |
| `not_performed_reason`     | CodeableConcept | Reason why the dispense was not performed.               |
| `status_history`           | List            | History of status changes for auditing purposes.         |
| `category`                 | CodeableConcept | Type of medication dispense (e.g., IP, OP, Home).        |
| `patient`                  | Reference       | The patient receiving the medication.                    |
| `encounter`                | Reference       | The encounter associated with the dispense.              |
| `location`                 | Reference       | The location where the dispense occurred.                |
| `authorizing_prescription` | Reference       | The prescription that authorized the dispense.           |
| `dispense_type`            | CodeableConcept | Type of dispensing event performed.                      |
| `quantity`                 | Quantity        | Amount of medication dispensed.                          |
| `days_supply`              | Quantity        | Number of days the supply is intended to last.           |
| `when_prepared`            | dateTime        | Time when the medication was prepared.                   |
| `when_handed_over`         | dateTime        | Time when the medication was handed over to the patient. |
| `note`                     | Annotation      | Additional information about the dispense.               |
| `dosage_instruction`       | Dosage          | Instructions on how the medication should be used.       |
| `substitution`             | BackboneElement | Details about any substitution made during dispensing.   |
| `charge_item`              | Reference       | Reference to the associated charge item.                 |

---

### Functional Workflow

1. **Initiation**: A MedicationRequest is created for a patient.
2. **Dispensing**: Based on the request, a MedicationDispense is recorded when the medication is prepared and handed over.
3. **Status Tracking**: The status of the dispense is updated throughout the process (e.g., from `preparation` to `completed`).
4. **Inventory Management**: The dispense record aids in managing inventory levels within the healthcare facility.
5. **Billing**: A ChargeItem is associated with the dispense for billing purposes.

---

### Substructure (Container Info)

- **`substitution`**: Indicates whether a substitution was made during dispensing, the type of substitution, and the reason for it.
