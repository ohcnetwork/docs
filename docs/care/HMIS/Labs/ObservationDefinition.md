### Summary

`ObservationDefinition` is used to define the structure and expectations of a **clinical observation or lab result**, such as "Hemoglobin level" or "Blood glucose." These definitions describe the unit, valid value range, data type, and measurement method — forming a **template** for the actual `Observation` instances recorded during diagnostics.

In CARE, this ensures consistency across lab results and helps maintain standards for how observations are displayed, interpreted, and validated.

### Core Relationships

| Related Resource     | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `ActivityDefinition` | Links expected observations for a test                     |
| `Observation`        | Actual instance of a result captured using this definition |
| `SpecimenDefinition` | May define specimen type required for this observation     |

### Supported Fields

| Field Name                  | Description                                                | Example                               |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------- |
| `id`                        | Internal identifier                                        | `obsdef-hb`                           |
| `version`                   | Versioning control                                         | `1`                                   |
| `title`                     | Human-readable name of the observation                     | `Hemoglobin`                          |
| `slug`                      | Unique internal reference name                             | `hb-level`                            |
| `status`                    | Lifecycle status (`draft`, `active`, etc.)                 | `active`                              |
| `facility`                  | Facility where the definition is applicable                | `Facility/medicity`                   |
| `description`               | Clinical context or explanation                            | `"Hemoglobin concentration in blood"` |
| `code`                      | LOINC/SNOMED or internal code                              | `"718-7"`                             |
| `method`                    | Measurement technique (e.g., Spectrophotometry)            | `"Spectrophotometry"`                 |
| `preferred_report_name`     | Label to be used in reports and UIs                        | `"Hemoglobin"`                        |
| `permitted_data_type[]`     | Allowed result types (`Quantity`, `CodeableConcept`, etc.) | `["Quantity"]`                        |
| `unit`                      | Measurement unit                                           | `"g/dL"`                              |
| `normal_range_low`          | Lower limit of reference range                             | `12.0`                                |
| `normal_range_high`         | Upper limit of reference range                             | `17.5`                                |
| `category`                  | Clinical category                                          | `laboratory`                          |
| `abnormal_interpretation[]` | Qualitative meanings (e.g., `L`, `H`, `A`)                 | `["L", "H"]`                          |
| `critical_range_low`        | Critical alert thresholds (optional)                       | `7.0`                                 |
| `critical_range_high`       |                                                            | `22.0`                                |

### Functional Workflow

1. Admin defines the **observation format** for a test (e.g., Hemoglobin).
2. Links this definition to the appropriate **ActivityDefinition**.
3. When test results are recorded, the system:
   - Enforces data type (e.g., Quantity)
   - Validates result range
   - Uses the `preferred_report_name` for display

### Schema Definition?

```jsx
{
  "id" : "<string>", // Internal identifier
  "facility" : "<reference>" // Reference to facility if present, if not present, defenition is instance wide
  "version" : "<string>", // Automatically assigned version number
  "slug" : "<string>" // To maintain uniqueness in a given facility
  "title" : "<string>", // Name for this ObservationDefinition (human friendly)
  "status" : "<code>", // Options  draft | active | retired | unknown
  "description" : "<markdown>", // Natural language description of the ObservationDefinition
  "derivedFromUri" : "<uri>", // Is this observation defenition created based on an external URI
  "category" : "<code>", // Code for observation type
  "code" : "<code>", // Code for observation, ie what is being observed
  "permittedDataType" : "<code>", // From Questionnaire
  "bodySite" : "<code>", // Body part to be observed
  "method" : "<code>", // Method used to produce the observation
  "permittedUnit" : "<code>", // Unit for quantitative results
  "component" : [{ // Component results
    "code" : "<code>", // What is being observed
    "permittedDataType" : "<code>", // From Questionnaire
    "permittedUnit" : "<code>", // I Unit for quantitative results
  }]
}
```
