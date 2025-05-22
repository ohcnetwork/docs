### Summary

A [**MedicationRequest**](https://hl7.org/fhir/medicationrequest.html) is an order or request for both the supply of medication and instructions for its administration to a patient. It represents the prescriber's intent for a medication to be supplied and/or administered.

---

### Key Purpose

- Create and track medication orders/prescriptions
- Document medication instructions and dosage requirements
- Facilitate regular and PRN (as needed) medications[Wikipedia+7Flexpa+7ExecuteCommands+7](https://www.flexpa.com/docs/fhir/medication-request?utm_source=chatgpt.com)

---

### Core Components

- Medication details (drug, form, strength)
- Dosage instructions
- Timing and frequency
- Route of administration
- Quantity/duration
- Patient and prescriber information

---

### Supported Status Values

- **active**: The prescription is active and should be fulfilled.
- **on-hold**: The prescription is temporarily suspended.
- **ended**: The prescription is no longer active, and the medication should not be taken.
- **stopped**: The prescription was stopped before completion.
- **completed**: The prescription has been fully completed.
- **cancelled**: The prescription was cancelled before any administration.
- **entered-in-error**: The prescription was entered in error.
- **draft**: The prescription is in draft status and not yet active.
- **unknown**: The status of the prescription is unknown.

---

### Core Relationships

| Field        | Reference Resource | Description                                              |
| ------------ | ------------------ | -------------------------------------------------------- |
| `subject`    | Patient            | The patient for whom the medication is prescribed.       |
| `encounter`  | Encounter          | The encounter during which the prescription was created. |
| `medication` | Medication         | The medication being prescribed.                         |
| `requester`  | Practitioner       | The individual who initiated the prescription.           |

---

### Supported Fields

| Field Name          | Type            | Description                                              |
| ------------------- | --------------- | -------------------------------------------------------- |
| `identifier`        | Identifier      | Unique identifier for the prescription.                  |
| `status`            | code            | The current status of the prescription.                  |
| `statusReason`      | string          | Reason for the current status.                           |
| `intent`            | code            | The intent of the prescription (e.g., order).            |
| `priority`          | code            | Priority of the prescription.                            |
| `doNotPerform`      | boolean         | Indicates if the medication should not be given.         |
| `category`          | code            | Category of the prescription (e.g., outpatient).         |
| `medication`        | CodeableConcept | The medication being prescribed.                         |
| `subject`           | Reference       | The patient for whom the medication is prescribed.       |
| `encounter`         | Reference       | The encounter during which the prescription was created. |
| `authoredOn`        | dateTime        | When the prescription was authored.                      |
| `dosageInstruction` | Dosage          | Instructions on how the medication should be taken.      |
| `note`              | string          | Additional notes about the prescription.                 |

---

### Functional Workflow

1. **Prescription Creation**: A healthcare provider creates a MedicationRequest during a patient encounter.
2. **Review and Approval**: The prescription is reviewed and approved as per facility protocols.
3. **Dispensing**: The pharmacy dispenses the medication as per the prescription details.
4. **Administration and Monitoring**: The patient administers the medication, and adherence is monitored.
5. **Status Updates**: The status of the MedicationRequest is updated based on the medication's lifecycle (e.g., completed, stopped).
