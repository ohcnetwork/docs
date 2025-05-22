### Summary

`SpecimenDefinition` defines the **template or blueprint for specimen types** used in the laboratory. Instead of repeatedly defining the properties of commonly collected specimens (like blood, urine, or sputum), CARE uses `SpecimenDefinition` to maintain a central, reusable registry of specimen kinds that can be instantiated when needed.

When a specimen is collected during a diagnostic workflow, it is linked to its `SpecimenDefinition`. The instance retains a **snapshot** of the original definition to ensure **data integrity** and **historical traceability**, even if the definition changes later.

This resource enables structured specimen management aligned with the FHIR specification and supports integration with `ActivityDefinition` for test planning.

### Core Relationships

| Related Resource     | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `ActivityDefinition` | Specifies which specimens are required for a test |
| `Specimen`           | Concrete instance created from this definition    |
| `Facility`           | Scope of usage for definition                     |

### Supported Fields

| Field                   | Description                                 | Example                        |
| ----------------------- | ------------------------------------------- | ------------------------------ |
| `id`                    | Internal identifier                         | `spec-blood-001`               |
| `version`               | Version number of the definition            | `"1"`                          |
| `title`                 | Human-readable label                        | `"Venous Blood"`               |
| `slug`                  | Unique internal name                        | `"venous-blood"`               |
| `derived_from_uri`      | Reference to external source or standard    | `"http://hl7.org/specs/blood"` |
| `status`                | Lifecycle status (`draft`, `active`, etc.)  | `"active"`                     |
| `facility`              | Facility where this definition applies      | `Facility/medicity`            |
| `description`           | Narrative explanation of this specimen type | `"Standard blood draw"`        |
| `type_collected`        | Type of specimen (bound to HL7 valuesets)   | `"venous blood"`               |
| `patient_preparation[]` | Pre-collection instructions (e.g., fasting) | `["SNOMED/20430005"]`          |
| `collection`            | Collection procedure (e.g., venipuncture)   | `"SNOMED/73761001"`            |

### Substructure (Container Info)

| Subfield                            | Description                                               | Example                          |
| ----------------------------------- | --------------------------------------------------------- | -------------------------------- |
| `is_derived`                        | Whether specimen is primary or derived                    | `false`                          |
| `preference`                        | Preferred or alternate                                    | `"preferred"`                    |
| `container.description`             | Label for the container                                   | `"Vacutainer with EDTA"`         |
| `container.capacity.value`          | Capacity amount                                           | `5`                              |
| `container.capacity.unit`           | Unit of measure                                           | `"mL"`                           |
| `container.minimum_volume_quantity` | Minimum acceptable volume                                 | `{ "value": 2, "unit": "mL" }`   |
| `container.cap`                     | Container cap type (bound to FHIR container-cap valueset) | `"red"`                          |
| `container.preparation`             | Special handling for the container                        | `"Sterile, vacuum sealed"`       |
| `requirement`                       | Transport/handling requirements                           | `"Keep at 4–8°C"`                |
| `retention_time`                    | How long specimen should be retained                      | `{ "value": 3, "unit": "days" }` |
| `single_use`                        | Whether container is single-use                           | `true`                           |

### Functional Workflow

1. **Admin defines a SpecimenDefinition** for common sample types (e.g., venous blood).
2. **Linked via ActivityDefinition** to relevant lab tests.
3. When a lab test is initiated, **specimen instances are created** from these definitions via a dedicated API.
4. Specimen instances store a **snapshot** of definition fields to preserve traceability.

### Schema Definition?

```jsx
{
  "id" : "<str>", // Internal Identifier
  "version" : "<string>", // Version of the SpecimenDefinition
  "title" : "<string>", // Name for this SpecimenDefinition (Human friendly)
  "slug" : "<string>", // Some internal Name
  "derived_from_uri" : "<uri>", // Based on external definition
  "status" : "<str>", // R!  draft | active | retired | unknown
  "facility" : "<id|fk>", // Facility where this Account is created
  "description" : "<markdown>", // Natural language description of the SpecimenDefinition
  "type_collected" : "<code>", // Bound to Hl7 Valueset ( Unbounded )
  "patient_preparation" : ["<code>" , "<code>"], // Patient preparation for collection, Bound to Snomed
  "collection" : "<code>", // Specimen collection procedure, Bound to Snomed
  "type_tested" : { // Specimen in container intended for testing by lab
    "is_derived" : "<boolean>", // Primary or secondary specimen
    "preference" : "<string>", // preferred | alternate
    "container" : { // The specimen's container
      "description" : "<markdown>", // The description of the kind of container
      "capacity" : { "value" : "<value>" , "unit" : "<code>" }, // The capacity of this kind of container
      // minimumVolume[x]: Minimum volume. One of these 2:
      "minimum_volume_quantity" : { "value" : "<value>" , "unit" : "<code>" },
      "minimum_volume_string" : "<string>",
      "cap" : "<code>" // Maps to https://build.fhir.org/valueset-container-cap.html
      "preparation" : "<markdown>" // Special processing applied to the container for this specimen type
    },
    "requirement" : "<markdown>", // Requirements for specimen delivery and special handling
    "retention_time" : { DurationSpec }, // The usual time for retaining this kind of specimen
    "single_use" : "<boolean>", // Specimen for single use only
  }
}
```
