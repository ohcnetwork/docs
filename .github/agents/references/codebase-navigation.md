# CARE Codebase Navigation Guide

Pre-verified map of both repositories. Use these paths and grep patterns directly —
do NOT re-analyze how RBAC, i18n, shortcuts, or routing work.

Repository roots, cloned as siblings of the docs repository:

- Backend: `../care` (Django 6 + DRF, Python 3.13)
- Frontend: `../care_fe` (React 19 + TypeScript + Vite, raviger, TanStack Query)

---

## Backend (`care/`)

### Permissions (RBAC)

- **Definitions:** `care/security/permissions/{domain}.py` — one file per domain
  (`patient.py`, `encounter.py`, `facility.py`, `questionnaire.py`, ...). Each file has an
  enum class like `PatientPermissions` whose members follow `can_<action>_<resource>`
  (e.g., `can_create_patient`, `can_list_patients`).
- Each member is a `Permission` dataclass: display name, description, `PermissionContext`
  (GENERIC | FACILITY | PATIENT | QUESTIONNAIRE | ORGANIZATION | FACILITY_ORGANIZATION |
  ENCOUNTER), and the list of roles that hold it. **The first argument is the
  human-readable permission name to use in docs** (e.g., `"Can Create Patient"`).
- `Permission` / `PermissionContext` classes: `care/security/permissions/constants.py`
- Aggregator: `care/security/permissions/base.py`

### Roles

- Predefined roles: `care/security/roles/role.py` — `DOCTOR_ROLE`, `NURSE_ROLE`,
  `STAFF_ROLE`, `VOLUNTEER_ROLE`, `PHARMACIST_ROLE`, `ADMINISTRATOR`,
  `FACILITY_ADMIN_ROLE`, `ADMIN_ROLE`, plus `ROLE_ORGANIZATION_*` variants.
- Role→permission mapping: each `Permission` definition lists its roles inline.

### Authorization flow (how to find which permission gates an action)

1. Open the domain viewset: `care/emr/api/viewsets/{domain}.py`
   (e.g., `patient.py` → `PatientViewSet`).
2. Find the `authorize_create` / `authorize_update` / `authorize_destroy` /
   `authorize_retrieve` overrides. Base mixins (`EMRCreateMixin` etc.) that call these
   hooks live in `care/emr/api/viewsets/base.py`.
3. Each hook calls `AuthorizationController.call("can_<action>_<resource>", user, obj)`.
4. The handler method lives in `care/security/authorization/{domain}.py`
   (e.g., `PatientAccess.can_create_patient`). Controller base:
   `care/security/authorization/base.py`.
5. Map the permission slug back to its display name in
   `care/security/permissions/{domain}.py`.

```bash
grep -rn "authorize_" care/emr/api/viewsets/<domain>.py
grep -rn "def can_" care/security/authorization/<domain>.py
grep -rn "can_<slug>" care/security/permissions/
```

### Models, resource specs, enums

- Django models: `care/emr/models/{domain}.py`
- Pydantic resource specs (field definitions, validation):
  `care/emr/resources/{domain}/spec.py` — classes extend `EMRResource`
  (`care/emr/resources/base.py`), `__model__` points to the Django model.
- Status/choice enums: `care/emr/resources/{domain}/constants.py` or inside `spec.py`.
  Example: `StatusChoices` in `care/emr/resources/encounter/constants.py`
  (`planned`, `in_progress`, `on_hold`, `discharged`, `completed`, `cancelled`, ...).
- Backend display names for some enums: `care/emr/resources/{domain}/enum_display_names.py`
  (e.g., `get_admit_source_display`). Prefer frontend i18n labels (see below) for
  user-facing terms; fall back to these.
- FHIR alignment: valuesets in `care/emr/resources/{domain}/valueset.py` and
  `care/emr/registries/` (SNOMED CT `http://snomed.info/sct`, FHIR valuesets).

```bash
grep -rn "class .*Choices" care/emr/resources/<domain>/
grep -rn "__model__" care/emr/resources/<domain>/
```

### Configuration that changes behavior

- Business config: `config/settings/config.py`. Known flags:
  - `PATIENT_GLOBAL_EDIT_ACCESS_ENABLED` — patient edit scope
  - `MAINTAIN_PATIENT_NAME_IDENTIFIER`, `MAINTAIN_PATIENT_PHONE_NUMBER_IDENTIFIER`,
    `MAINTAIN_FACILITY_PATIENT_NAME_IDENTIFIER`, `PATIENT_NAME_MAX_LENGTH`
  - Limits: `MAX_APPOINTMENTS_PER_PATIENT`,
    `MAX_ACTIVE_ENCOUNTERS_PER_PATIENT_IN_FACILITY`, `ENCOUNTER_RESTART_TIME_LIMIT_HOURS`
  - Billing: `TAX_CODES`, `DISCOUNT_CODES`, `INVOICE_FREE_CANCEL_PERIOD_MINUTES`
- Patient identifier config model: `PatientIdentifierConfig` in `care/emr/models/patient.py`,
  spec in `care/emr/resources/patient/spec.py`, authz in
  `care/security/authorization/patient_identifier_config.py`.
- Plugin system: `plug_config.py` (root).

Always check whether a flow's behavior depends on these before writing "Note:" lines.

### API routing and fixtures

- Endpoint registration: `config/api_router.py`
- Fixtures (example data, behavior reference): `care/fixtures/` —
  `base.py` (`create_*` helpers), `scripts/default_fixtures.py`, `fixtures.md`.

---

## Frontend (`care_fe/`)

### i18n and enum display labels (CRITICAL for user-facing terms)

- All English strings: `public/locale/en.json`
- Enum display keys follow `{PREFIX}__{value}`:
  - `encounter_status__in_progress` → "In Progress"
  - `GENDER__male` → "Male"
  - `BLOOD_GROUP_LONG__AB_positive` → "AB Positive"
- To find the label for a coded value:

```bash
grep -n "__<enum_value>" public/locale/en.json
grep -n "\"<field_label_key>\"" public/locale/en.json
```

Docs MUST use these labels, never codebase literals.

### Keyboard shortcuts

- Registry: `src/config/keyboardShortcuts.json` — entries per context
  (e.g., `facility:patient:home`) with `key`, `action`, `description`, `when`.
- Runtime: `src/context/ShortcutContext.tsx`, `src/hooks/useKeyboardShortcuts.ts`,
  helpers in `src/Utils/keyboardShortcutUtils.ts`.
- Form submit shortcut is the `submit-action` entry (currently `Shift+Enter`).
  **Always check the JSON — do not assume Ctrl+Enter.**

```bash
grep -n "<action-or-key>" src/config/keyboardShortcuts.json
```

### Routes and navigation

- Route files: `src/Routers/routes/*Routes.tsx`
  (`FacilityRoutes.tsx`, `PatientRoutes.tsx`, `ConsultationRoutes.tsx`, ...),
  combined in `src/Routers/AppRouter.tsx`.
- Sidebar/left-nav items (names, order, permission gating):
  `src/components/ui/sidebar/facility/facility-nav.tsx` (facility),
  dispatcher `src/components/ui/sidebar/app-sidebar.tsx`,
  renderer `src/components/ui/sidebar/nav-main.tsx`.
- Use these to write accurate "Steps": nav label → route → page component.

### Forms (fields, required/optional, sections)

- Pattern: react-hook-form + zod. Example: patient registration in
  `src/components/Patient/PatientRegistration.tsx` — `getFormSchema()` defines
  required (`.nonempty(...)`) vs optional (`.optional()`) vs conditional fields.
- Deployment config affecting forms: `care.config.ts` (root) — e.g.,
  `patientRegistration.minimalPatientRegistration`,
  `openScheduleAfterPatientRegistration`, `encounterClasses`
  (from `REACT_ALLOWED_ENCOUNTER_CLASSES`). Check this file for every flow.

### API layer

- Route definitions: `src/types/{domain}/{domain}Api.ts`
  (e.g., `src/types/emr/patient/patientApi.ts`) — typed path/method/TBody/TRes objects.
- Wrappers: `src/Utils/request/query.ts` and `src/Utils/request/mutate.ts`.
- Use these to confirm which backend endpoint a UI action calls.

### Frontend enums and styling

- Enum constants + badge colors/icons: `src/types/emr/{domain}/{domain}.ts`
  (e.g., `EncounterStatus`, `ENCOUNTER_STATUS_COLORS` in
  `src/types/emr/encounter/encounter.ts`).

### Frontend permission checks

- `src/context/PermissionContext.tsx` — `usePermissions()` / `useHasPermission("<slug>")`.
- Used in sidebar `visibility` props and page actions. Cross-check with backend
  permission slugs to confirm what the UI hides vs what the API enforces.

---

## FHIR R5 references

- Base URL: `https://build.fhir.org/`
- Resource pages: `https://build.fhir.org/<resource>.html`
  (patient, encounter, observation, questionnaire, medicationrequest,
  servicerequest, location, appointment, careplan, ...)
- Link the FHIR resource on first mention of the concept in every concept doc.
