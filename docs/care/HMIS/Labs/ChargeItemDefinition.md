### Summary

The `ChargeItemDefinition` in CARE specifies **how clinical activities (like lab tests or medications) are priced**. It allows each `ActivityDefinition`, `Medication`, or other healthcare service to be tied to a dynamic billing rule that governs how much a service costs under specific conditions.

CARE’s billing model works behind the scenes: **as practitioners record data (ServiceRequests, MedicationRequests, etc.), billing objects are automatically created** using the relevant `ChargeItemDefinition`.

### Core Relationships

| Related Resource       | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `ActivityDefinition`   | Resource whose execution will generate this charge |
| `Medication`           | Medication product that incurs a cost              |
| `Encounter`, `Patient` | Used in condition evaluation for dynamic pricing   |

### Supported Fields

| Field Name        | Description                                               | Example                                |
| ----------------- | --------------------------------------------------------- | -------------------------------------- |
| `id`              | Internal identifier                                       | `charge-cbc`                           |
| `version`         | Version number                                            | `"1"`                                  |
| `title`           | Name for human readability                                | `"CBC Test Standard Rate"`             |
| `slug`            | Unique internal reference                                 | `"cbc-charge"`                         |
| `derivedFromUri`  | Canonical URL reference if derived from standard          | `"http://example.org/rates/cbc"`       |
| `status`          | Lifecycle status (`draft`, `active`, etc.)                | `"active"`                             |
| `facility`        | The facility where this pricing applies                   | `Facility/medicity`                    |
| `description`     | Free-text description of the charge definition            | `"Pricing for CBC including lab work"` |
| `purpose`         | Rationale for the charge                                  | `"Used to generate automated bills"`   |
| `code`            | Internal or external billing/product code                 | `"CBC01"`                              |
| `instance[]`      | List of linked resources (ActivityDefinition, Medication) | `[ActivityDefinition/cbc]`             |
| `propertyGroup[]` | Array of pricing conditions and breakdowns                | See below                              |

### Property Groups & Dynamic Pricing

Each `propertyGroup` contains:

- **Applicability conditions**: Expressions that evaluate whether a price component should apply (e.g., “patient is above 60 years”).
- **Price components**: The base price, surcharges, discounts, or taxes applicable under those conditions.

### Example Fields (within `propertyGroup`)

| Field                     | Description                                             | Example              |
| ------------------------- | ------------------------------------------------------- | -------------------- |
| `applicability.condition` | Boolean expression for pricing applicability            | `"patient.age > 60"` |
| `priceComponent[]`        | Breakdown of charge (see below for `MonetaryComponent`) | See next section     |

### MonetaryComponent Specification

```json
json
CopyEdit
{
  "type": "base", // base | surcharge | discount | tax | informational
  "code": "CBC01-BASIC",
  "factor": 1.0,
  "amount": {
    "value": 200.00,
    "currency": "INR"
  }
}

```

| Field             | Description                                                 | Example         |
| ----------------- | ----------------------------------------------------------- | --------------- |
| `type`            | Type of price item (`base`, `surcharge`, `discount`, `tax`) | `"base"`        |
| `code`            | Identifier for pricing rule or sub-component                | `"CBC01-BASIC"` |
| `factor`          | Multiplier applied to the amount                            | `1.0`           |
| `amount.value`    | Monetary value (final after applying factor)                | `200.00`        |
| `amount.currency` | ISO 4217 code                                               | `"INR"`         |

### Billing Workflow in CARE

1. Practitioner creates a `ServiceRequest` for CBC.
2. The system checks the associated `ActivityDefinition` and its linked `ChargeItemDefinition`.
3. Based on patient and encounter details (age, location, tags), applicable pricing rules are evaluated.
4. A **charge item is instantiated** and added to the patient’s bill automatically.
5. Taxes and discounts are computed, total is stored with a detailed breakdown.

### Schema Definition?

```jsx
{
  "id" : "<str>", // Internal Identifier
  "version" : "<string>", // Version
  "title" : "<string>", // Name for this charge item definition
  "slug" : "<string>" //
  "derivedFromUri" : "<uri>", // Was this from a URL
  "status" : "<string>", // Bound to draft | active | retired | unknown
  "facility" : "<id|fk>", // Facility where this Charge Item Definition is created
  "description" : "<markdown>", // Natural language description of the charge item definition
  "purpose" : "<markdown>", // Why this charge item definition is defined
  "code" : "<code>", // Billing code or product type this definition applies to, No valueset for now
  "instance" : [{ ActivityDefinition|Medication }], // Through some M2M Table, needs to be indexed.
  "propertyGroup" : [{ // Group of properties which are applicable under the same conditions
    "applicability" : [{ // Whether or not the billing code is applicable
    "condition" : { Expression }, // Boolean-valued expression
  }], // Conditions under which the priceComponent is applicable
    "priceComponent" : [{ MonetaryComponent }] // Components of total line item price
  }]
}
```
