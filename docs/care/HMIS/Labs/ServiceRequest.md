### Summary

In FHIR, a `ServiceRequest` represents an order or proposal to perform a clinical or non-clinical action for a patient. It can lead to the creation of related resources like `Procedure`, `Observation`, `Specimen`, or `DiagnosticReport`, though these are optional and context-dependent.

CARE supports a minimal subset of FHIR’s ServiceRequest features to keep implementation simple. As complexity and demand grow, additional features may be added.

While FHIR allows multi-organization coordination, CARE currently restricts `ServiceRequest` handling within a single facility — cross-facility dispatch must be managed manually.

Access control is managed via roles and permissions assigned at the organization level, with each ServiceRequest linked to one or more organizations. An audit trail is required to track user actions on each request.

### **Schema Definition?**

```jsx
{
"id" : "<str>", // Internal Identifier
"status" : "<string>", // R!  draft | active | on-hold | entered-in-error | ended | completed | revoked | unknown
"intent" : "<string>", // R!  proposal | plan | directive | order +
"category" : "<code>", // Bound to https://build.fhir.org/valueset-servicerequest-category.html
"priority" : "<string>", // routine | urgent | asap | stat
"do_not_perform" : "<boolean>", // True if service/procedure should not be performed
"activity_definition" : "<id|fk>", // Points to Activity Definition if created from one
"patient" : "id|fk" , // Reference to patient
"encounter" : "id|fk", // Encounter in which the request was created
"locations" : ["<id|fk>"], // Fk to location
"specimens" : ["id|fk"], // FK to Specimen
"bodySite" : "<code>", // Coded location on Body
"note" : "<string>", // Comments
"occurance" : "<datetime>" // Time at which this SR should take place
"patient_instruction" : "<string>" // Instructions to the patient
}
```

### **Core Data Structure**

**Essential Fields**

| Field        | Type              | Required | Description                                   | Example                      |
| ------------ | ----------------- | -------- | --------------------------------------------- | ---------------------------- |
| `id`         | `string`          | Yes      | Unique identifier for the ServiceRequest      | `SR-2025-0001`               |
| `status`     | `code`            | Yes      | Request state: `draft`, `active`, `completed` | `active`                     |
| `intent`     | `code`            | Yes      | Always set to `order` in CARE                 | `order`                      |
| `code`       | `CodeableConcept` | Yes      | Reference to test via `ActivityDefinition`    | `CBC - Complete Blood Count` |
| `subject`    | `Reference`       | Yes      | The patient for whom the request is made      | `Patient/1234`               |
| `encounter`  | `Reference`       | Yes      | Clinical context                              | `Encounter/5678`             |
| `authoredOn` | `dateTime`        | Yes      | When the request was created                  | `2025-05-21T10:00:00+05:30`  |
| `requester`  | `Reference`       | Yes      | Practitioner making the request               | `Practitioner/DrAnjali`      |
| `note`       | `Annotation[]`    | Optional | Any additional notes                          | `"Fasting sample preferred"` |

### Supported Status Values

| Status      | Meaning                                   |
| ----------- | ----------------------------------------- |
| `draft`     | Incomplete and not actionable             |
| `active`    | Ready for specimen collection and testing |
| `completed` | Results recorded and linked               |
| `cancelled` | Cancelled before lab action               |
