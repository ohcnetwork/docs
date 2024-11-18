# CEP-12 Care Plan

### References

- [https://ohcnetwork.notion.site/Care-Plan-12ae6e667ece80e8b1abfdc82b3450f2](https://ohcnetwork.notion.site/Care-Plan-12ae6e667ece80e8b1abfdc82b3450f2)
- [https://www.hl7.org/fhir/careplan.html](https://www.hl7.org/fhir/careplan.html)

## Implementation Overview

> A Care Plan is a coordinated map of healthcare activities designed to address specific patient health concerns. At its core, it's an organized collection of intended activities that healthcare providers plan to perform, are performing, or have performed for a patient.

To visualize better, lets create a django model for care plan

```py
class CarePlan(BaseModel):
    status = Int(choices) # draft|active|completed|on-hold|cancelled|entered-in-error|unknown
    intent = Int(choices) # proposal|plan|order|option|directive
    title = CharField()
    description = TextField()
    start_date = DateField()
    end_date = DateField()
    subject/patient = FK(Patient) # wont use if we use encounter
    encounter = FK(Consultation) # not sure if consultations will stay.
    custodian/faciliy = FK(Facility) # wont use if we use encounter
    addresses = FK(ICD11Diagnoses) #or SNOMED going forward
    notes = TextField()
```

SNOMED-CT is not yet implemented with care, so we would default to using ICD 11 diagnosis until SNOMED is configured.

The care plan will have activities associated with it. These will be done to accomplish the goals in a care plan.

```py
class CarePlanActivity(BaseModel): # or just Activity if it is generic
    performed = BooleanField()
    activity_task = FK(Task)
    activity_medication_request = FK(MedicationRequest)
    activity_service_request = FK(ServiceRequest)
```

I am not very sure about how the Task, MedicationRequest and ServiceRequest would look like. We can directly connect these models to the care plan instead of having the Activity model if it is more feasible.

A goal will be used to track the targets that must be achieved for the duration of the care plan.

> A Goal in health care services delivery is generally an expressed desired health state to be achieved by a subject of care (or family/group) over a period or at a specific point of time. This desired target health state may be achieved as a result of health care intervention(s) or resulting from natural recovery over time.

```py
class Goal(BaseModel):
    care_plan = FK(CarePlan)
    created_by = FK(User)
    lifecycle_status = IntegerField(choices=GoalLifeCycle.choices) #proposed | planned | accepted | active | on-hold | completed | cancelled | entered-in-error | rejected
    achievement_status = Int(choices) # in-progress | improving | worsening | no-change | achieved | sustaining | not-achieved | no-progress | not-attainable
    is_continuous = BooleanField()
    priority = IntegerField(choices=Priority.choices) # low | medium | high
    description = TextField()
    start_date = DateField()
    requested_by_patient = BooleanField()
    notes = FK(Annotation[]) or TextField # No idea what to use here
    outcome = FK(Observation[]) # I think we are already working on observations?
    targets = JSONfield([
        # will hold array of objects of the parameters of the patient we want to achieve, and what type of achievement it will be ("ratio", "range", "exact", etc.)
    ])
    permitted_groups = ArrayField(choices=PermissionGroups) # to specify if certian groups (like nurses) can update the goal or not.

```

Now, a goal would also need status checks. Status checks will be just updates to a singular goal across time and would be done by the assigned physician/nurse.

```py
class GoalUpdate(BaseModel):
    created_by = FK(User)
    goal = FK(Goal)
    target_values = JsonDict()
    notes = TextField()

    def save ():
    # the save method will check values, compare it with the last update, and then determine the parent Goal's achievement_status.
```

The goal update will smartly update the goal’s status depending on the measured values. If this is not optimal, we can default to manually setting the goal status. Setting a goal to “not-attainable” will mean the goal should not have any updates done to it. If a goal update value matches the required goal target, the goal status changes to “achieved”. If the target is not met before the due date, the status becomes “not-achieved.” Similarly, other statuses can be smartly determined by comparing the latest updates with previous ones.

These models will help us better visualize and form a base understanding of how this will be integrated into CARE.

# User Story: Managing a Patient's Care Plan for Fever

**As a** doctor,  
**I want to** create and manage a comprehensive care plan for a patient with fever,  
**so that** the patient's condition can be effectively monitored, treated, and resolved.

### 1. Care Plan Creation

- The doctor creates a "Fever Management Plan" to address the patient's condition.
- The care plan includes:
  - Prescription for medication.
  - Regular monitoring of vital signs (e.g., temperature).
  - Ordering necessary lab tests.
  - Establishing a goal for recovery.

### 2. Setting a Goal

- The doctor sets a goal for the care plan, such as:
  - "Reduce patient temperature to below 37°C within 48 hours."
- The goal is added to the care plan and linked to relevant activities.

### 3. Goal Updates

- The doctor tracks progress toward the goal by recording updates based on patient metrics (e.g., temperature readings).
- Each update includes:
  - Date and time.
  - Current value of the metric (e.g., "Temperature: 38.5°C").
  - Comments, if necessary.
- The goal's progress is automatically visualized.

### 4. Visualizing Goal Progress

- The doctor views a time-series graph showing the patient's progress toward the goal:
  - X-axis: Time (e.g., hours since care plan creation).
  - Y-axis: Goal metric (e.g., temperature in °C).
- The graph provides a clear view of whether the goal is being achieved.

### 5. Medication Prescription

- The doctor prescribes Paracetamol for fever management.
- The care plan records this as a planned activity under `MedicationRequest`.

### 6. Vitals Monitoring Task

- The doctor initiates a task for temperature monitoring.
- This is added to the care plan as a planned activity under `Task`.

### 7. Lab Test Request

- The doctor orders a blood test to investigate underlying causes.
- This is recorded as a planned activity under `ServiceRequest` in the care plan.

### 8. Executing Activities

- **Medication Administration:**
  - The doctor starts the prescribed medication regimen.
  - The `MedicationRequest` status is updated to `active`.
  - Administration details, such as dosage and frequency, are recorded in the patient's progress.
- **Temperature Monitoring:**
  - The doctor begins temperature monitoring.
  - The `Task` status is updated to `in-progress`.
  - Recorded temperature readings are added to the patient's progress.
- **Lab Test:**
  - The doctor ensures the blood test is performed.
  - The `ServiceRequest` status is updated to `in-progress`.
  - Completion of the test (e.g., blood sample collection) is recorded in the patient's progress.

### 9. Completing Activities

- The doctor marks the medication course as completed in the care plan.
- Temperature monitoring is concluded, and the `Task` status is updated.
- Lab test results are received, and the `ServiceRequest` is marked as completed.

### 10. Printing the Care Plan

- The doctor can generate a print-friendly version of the care plan.
- The printed care plan includes:
  - The list of activities.
  - The patient's progress.
  - Goals and goal updates.
  - Final status of the care plan.

### 11. Finalizing the Care Plan

- The doctor reviews all activities to ensure they have been executed successfully.
- The care plan's overall status is updated to `completed`, reflecting the resolution of the patient's condition.

### Outcome

- The care plan effectively coordinates medication, monitoring, and diagnostic activities to ensure comprehensive treatment of the fever.
- Goals and progress tracking provide clear milestones and insights into the patient's recovery.
- The doctor has access to a visualized timeline of progress and a print-ready document for recordkeeping or sharing with the patient.

## Nurse Flow

**As a** nurse,  
**I want to** view the care plan's goals and update progress toward them, as well as update the status of assigned tasks,  
**so that** I can ensure accurate tracking of the patient’s recovery and contribute to effective care delivery.

### 1. Viewing Goals

- The nurse can access the care plan to view all created goals.
- Each goal displays:
  - Goal description (e.g., "Reduce patient temperature to below 37°C within 48 hours").
  - Current progress (e.g., "Temperature: 38.2°C").
  - Visualization of progress (time-series graph).
  - Status (e.g., `on track`, `at risk`, or `achieved`).

### 2. Adding Goal Updates

- The nurse can add updates to goals based on patient assessments.
- Each update includes:
  - Date and time of the update.
  - Updated metric value (e.g., "Temperature: 37.8°C").
  - Optional comments (e.g., "Patient responded well to medication").
- The update automatically:
  - Updates the goal's progress tracking.
  - Refreshes the time-series graph with the new data point.
- The system validates updates to ensure they align with the goal's metrics.

### 3. Viewing Assigned Tasks

- The nurse can view all tasks associated with the care plan.
- Each task displays:
  - Task name (e.g., "Temperature Monitoring").
  - Current status (e.g., `not started`, `in progress`, `completed`).
  - Task details, such as:
    - Scheduled start and end times.
    - Instructions or steps for completion.

### 4. Adding Task Updates

- The nurse can update the status of a task as work progresses:
  - Update options include:
    - `Start Task` (changes status to `in progress`).
    - `Complete Task` (changes status to `completed`).
    - Add a comment or observation related to the task (e.g., "Temperature reading recorded").
- For tasks requiring data entry (e.g., temperature monitoring):
  - The nurse records the relevant data (e.g., "Temperature: 37.5°C").
  - Data is automatically linked to both the task and the relevant goal.

### 5. Reviewing Progress

- The nurse can view a summary of:
  - Recent goal updates.
  - Recent task updates.
- This provides a quick overview of the patient’s current status.

### 6. Communication with the Doctor

- The nurse can flag specific updates or issues for the doctor to review, such as:
  - Metrics not improving as expected.
  - Challenges in completing assigned tasks.
- Notifications are sent to the doctor for flagged items.

### Outcome

- The nurse can efficiently track and update patient goals and tasks, ensuring accurate and timely information is available in the care plan.
- Goal updates and task statuses contribute to a complete picture of the patient’s recovery progress.
- Clear communication and data sharing between the nurse and doctor enhance the quality of care.
