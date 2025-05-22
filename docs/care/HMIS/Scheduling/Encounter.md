### Summary

In CARE, an **Encounter** represents a specific interaction between a patient and healthcare provider(s) for the purpose of providing healthcare services or assessing the patient's health status. This concept aligns with FHIR's Encounter resource, which is used to record information about the actual activities that occur during a healthcare event.

### Design Philosophy

- **FHIR Alignment**: Utilize FHIR's `Encounter` resource to represent actual patient-provider interactions.
- **Integration with Appointments**: Link encounters to `Appointment` resources to trace the scheduling and fulfillment process.
- **Comprehensive Documentation**: Capture detailed information about the encounter, including participants, locations, reasons, and diagnoses.
- **Lifecycle Management**: Track the status of encounters through various stages, such as planned, in-progress, and completed.

### Core Relationships

| CARE Concept            | FHIR Resource      | Purpose                                                     |
| ----------------------- | ------------------ | ----------------------------------------------------------- |
| Patient                 | `Patient`          | Represents the individual receiving care                    |
| Healthcare Provider     | `Practitioner`     | Represents the individual providing care                    |
| Provider Role           | `PractitionerRole` | Defines the provider's role and association with a facility |
| Appointment Reservation | `Appointment`      | Represents the booked appointment leading to the encounter  |
| Encounter Record        | `Encounter`        | Captures the details of the patient-provider interaction    |
| Location                | `Location`         | Specifies where the encounter took place                    |
| Service Request         | `ServiceRequest`   | Indicates the request that initiated the encounter          |
| Diagnostic Report       | `DiagnosticReport` | Contains findings resulting from the encounter              |

### Supported Fields (Encounter)

| Field Name        | Description                                                   | Example                                          |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| `id`              | Unique identifier for the encounter                           | `encounter-001`                                  |
| `status`          | The current status of the encounter                           | `in-progress`                                    |
| `class`           | Classification of the encounter (e.g., inpatient, outpatient) | `outpatient`                                     |
| `type`            | Specific type of encounter                                    | `Consultation`                                   |
| `serviceType`     | Specific type of service provided                             | `General Practice`                               |
| `subject`         | Reference to the patient involved in the encounter            | `Patient/patient-001`                            |
| `participant`     | List of participants involved in the encounter                | See participant details below                    |
| `appointment`     | Reference to the associated appointment                       | `Appointment/appointment-001`                    |
| `period`          | The start and end time of the encounter                       | `2025-06-15T09:00:00Z` to `2025-06-15T09:30:00Z` |
| `reasonCode`      | Reason for the encounter                                      | `Routine check-up`                               |
| `diagnosis`       | List of diagnoses relevant to the encounter                   | `Hypertension`                                   |
| `location`        | List of locations where the patient has been                  | `Clinic Room 1`                                  |
| `serviceProvider` | The organization responsible for the encounter                | `Organization/clinic-001`                        |

**Participant Details:**

Each participant includes:

- `type`: Role of the participant (e.g., primary performer)
- `individual`: Reference to the participant (e.g., Practitioner)
- `period`: Time period during which the participant was involved
- `status`: Participation status (e.g., accepted)

---

### Functional Workflow

1. **Initiate Encounter**: When a patient arrives for a scheduled appointment, an `Encounter` resource is created to document the interaction.
2. **Record Details**: Capture information such as participants, reasons, diagnoses, and locations associated with the encounter.
3. **Update Status**: As the encounter progresses, update the `status` field to reflect its current state (e.g., in-progress, completed).
4. **Link to Outcomes**: Associate the encounter with resulting resources like `DiagnosticReport` or `Observation` to maintain a comprehensive record.
