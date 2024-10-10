# CEP-11: Patient Tagging System in CARE

### Motive

Care is being used in various healthcare environments for managing patient information and care delivery. A flexible and robust patient tagging system is essential for efficient patient categorization, filtering, and management. This system will enable healthcare providers to quickly identify patients with specific characteristics, conditions, or care requirements, enhancing the overall quality of care and operational efficiency.

### Requirements

### 1. Tag Creation and Management

- The system shall allow authorized users (nurses and doctors) to create tags at the facility level.
- Tags shall have a name and an optional description.
- Tags shall be unique within a facility.
- The system shall provide functionality to edit and delete existing tags.

### 2. Tag Assignment

- Authorized users shall be able to assign tags to patients.
- Multiple tags can be assigned to a single patient.
- The system shall maintain a log of tag assignments and removals, including the user who performed the action and the timestamp in event logs.

### 3. Tag Visibility and Access Control

- Tags shall be visible on the patient's profile.
- Tags shall be facility-specific and not visible to other facilities.

### 4. Filtering and Searching

- The system shall provide functionality to filter patients by one or multiple tags.
- Advanced search capabilities shall be implemented to find patients with specific tag combinations.

### 5. Customization and Extensibility

- Care should have a default set of tags instance level.
- Instance admins should be able able to seed tags instance level.
- The system shall allow for custom tag attributes to be defined at the facility level.
- The architecture shall be flexible to allow future extensions, such as automated tag assignment based on clinical data.
