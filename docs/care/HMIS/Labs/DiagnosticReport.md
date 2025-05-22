### Summary

A `DiagnosticReport` in CARE provides a structured summary of the findings, interpretations, and outcomes derived from diagnostic activities such as lab tests. While the **clinical measurements themselves are stored as `Observation` resources**, the `DiagnosticReport` acts as a **wrapper** or **summary document**, linking together those observations in a meaningful context.

In the CARE MVP, diagnostic reports are generated **only from `ServiceRequest` resources**, but the system is designed to support reports generated from other clinical contexts in future.

### Core Relationships

| Related Resource | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `ServiceRequest` | Origin of the diagnostic request                      |
| `Observation[]`  | Measured values linked to this report                 |
| `Patient`        | Patient for whom the report was generated             |
| `Encounter`      | Visit or session in which the test was performed      |
| `Specimen[]`     | Specimens used for testing (currently ignored in MVP) |

### Supported Fields

| Field Name        | Description                                         | Example                                        |
| ----------------- | --------------------------------------------------- | ---------------------------------------------- |
| `id`              | Internal identifier                                 | `drpt-00123`                                   |
| `service_request` | Reference to the original `ServiceRequest`          | `ServiceRequest/1002`                          |
| `status`          | Current lifecycle status of the report              | `final`                                        |
| `category`        | Type of diagnostic service (e.g., lab, pathology)   | `laboratory`                                   |
| `code`            | Test/report type (same as SR code)                  | `CBC Report`                                   |
| `patient`         | Patient associated with the report                  | `Patient/1234`                                 |
| `encounter`       | Encounter during which the diagnostic was ordered   | `Encounter/5678`                               |
| `specimen[]`      | Specimen IDs referenced (not used functionally yet) | `["Specimen/blood-2025-01"]`                   |
| `result[]`        | IDs of associated `Observation` resources           | `["Observation/100", "Observation/101"]`       |
| `note`            | Additional commentary on the report                 | `"Repeat testing advised if symptoms persist"` |
| `conclusion`      | Summary interpretation of results                   | `"All parameters within normal range"`         |

### File Uploads & DICOM Support

- CARE supports **uploading attachments** to diagnostic reports (PDF, images).
- **DICOM imaging support** is planned as a plugin integration with external PACS (Picture Archiving and Communication Systems) for radiology or cardiology use cases.

### Status Lifecycle

| Status Code        | Meaning                                      |
| ------------------ | -------------------------------------------- |
| `registered`       | Report is created but not yet populated      |
| `partial`          | Some results available                       |
| `preliminary`      | Early results shared before verification     |
| `final`            | Completed and verified report                |
| `amended`          | Updates applied to a previously final report |
| `cancelled`        | Report was voided                            |
| `entered-in-error` | Report was created in error                  |
