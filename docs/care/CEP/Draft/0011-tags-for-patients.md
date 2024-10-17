# CEP-11: Patient Tagging System in CARE

## Motive
Care is being used in various healthcare environments for managing patient information and care delivery. A flexible and robust patient tagging system is essential for efficient patient categorization, filtering, and management. This system will enable healthcare providers to quickly identify patients with specific characteristics, conditions, or care requirements, enhancing the overall quality of care and operational efficiency.

## Requirements

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
- Care should have a default set of tags at the instance level.
- Instance admins should be able to seed tags at the instance level.
- The system shall allow for custom tag attributes to be defined at the facility level.
- The architecture shall be flexible to allow future extensions, such as automated tag assignment based on clinical data.

## Implementation Details

### Backend Implementation
1. Database Schema:
   - Create new tables: `Tags`, `PatientTags`, `TagAssignmentLogs`
   - Update existing tables: `Users`, `Facilities`, `Patients`

2. API Endpoints:
   - POST /api/tags - Create a new tag
   - GET /api/tags - Retrieve all tags for a facility
   - PUT /api/tags/:id - Update a tag
   - DELETE /api/tags/:id - Delete a tag
   - POST /api/patients/:id/tags - Assign a tag to a patient
   - DELETE /api/patients/:id/tags/:tagId - Remove a tag from a patient
   - GET /api/patients - Include tag filtering in patient search

3. Business Logic:
   - Implement tag uniqueness validation within a facility
   - Implement access control for tag management and assignment
   - Implement logging for tag assignments and removals

### Frontend Implementation
1. User Interface:
   - Add a "Tags" section to the patient profile page
   - Create a tag management interface for facility administrators
   - Update the patient search interface to include tag filtering

2. State Management:
   - Add tags to the global state management system (e.g., Redux)
   - Implement actions and reducers for tag-related operations

3. Components:
   - Create reusable components for tag display, selection, and management

### Testing
1. Unit Tests:
   - Backend: Test tag creation, assignment, removal, and filtering logic
   - Frontend: Test tag-related components and state management

2. Integration Tests:
   - Test the complete flow of tag creation, assignment, and filtering

3. User Acceptance Testing:
   - Conduct UAT with healthcare providers to ensure the system meets their needs

### Deployment
1. Database Migration:
   - Create a migration script for the new tables and schema changes

2. Feature Flags:
   - Implement feature flags to gradually roll out the tagging system

3. Documentation:
   - Update user documentation to include instructions on using the new tagging system

## Timeline
- Week 1-2: Backend implementation
- Week 3-4: Frontend implementation
- Week 5: Testing and bug fixes
- Week 6: Documentation and preparation for deployment

## Risks and Mitigations
- Risk: Performance impact of tag filtering on large patient datasets
  Mitigation: Implement database indexing and optimize queries

- Risk: User confusion with the new tagging system
  Mitigation: Provide in-app tutorials and tooltips to guide users

## Conclusion
The Patient Tagging System will significantly enhance Care's capabilities in patient management and care delivery. By implementing this feature, we aim to improve efficiency and patient care quality across all facilities using Care.
