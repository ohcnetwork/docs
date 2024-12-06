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

## User Stories

### Patient Dashboard Management

A care plan is manageable from the patient dashboard, which serves as the central hub for all patient-related activities. On this dashboard, users can view a comprehensive list of all current active care plans.

### Filtering and Retrospective Analysis

In addition to viewing active care plans, users can filter and view completed or expired plans. This filtering capability allows healthcare providers to efficiently manage and review past care plans, facilitating better continuity of care and enabling retrospective analysis of patient outcomes.

### Creating a New Care Plan

The patient dashboard features a prominent “Create” button, designed to streamline the process of initiating a new care plan. Upon clicking this button, users are directed to a dedicated care plan form. This form is intuitively organized to first capture the basic details of the CarePlan model, such as the plan's title, description, and relevant dates. Following this, users are prompted to add specific goals, which are essential components of the care plan. These goals are clearly defined and measurable, providing a structured framework for patient care.

### Integration and Monitoring

Once the form is completed, users have the capability to create a new care plan, complete with its associated goals. This new care plan is then integrated into the patient dashboard, where it can be actively managed and monitored.

### Plan Dashboard Overview

Clicking on a specific care plan navigates the user to the Plan Dashboard. This specialized dashboard provides a detailed overview of the selected care plan, including comprehensive notes and other pertinent details. It also features time series graphs of the goal updates, offering a visual representation of progress over time. These graphs are instrumental in helping healthcare providers assess the effectiveness of the care plan and make informed decisions about any necessary adjustments.

### Dynamic Goal Management

Within the Plan Dashboard, users have the flexibility to add new goals, update existing goals, and record goal updates. This functionality ensures that care plans remain dynamic and responsive to the evolving needs of the patient. Additionally, there are options to create new tasks, medication requests, and service requests associated with the care plan. The progress of these tasks and requests is meticulously tracked through the Care Plan dashboard, providing a holistic view of the patient's care journey.

### Printing and Alerts

There is a "Print Report" option that allows users to directly print the report from the dashboard. As a goal or care plan approaches its due date, the system automatically issues alerts to notify healthcare providers. These alerts serve as reminders to review the plan's progress and take any necessary actions. If the due date is surpassed without achieving the set targets, the statuses of the plan and its goals are updated to “not-reached.” This status change prompts a re-evaluation of the care plan, ensuring that patient care remains proactive and goal-oriented.

## Optional features

### Goal Chat

In the Plan Dashboard, healthcare providers, including nurses and doctors, will have access to a dedicated chat feature associated with each goal. This Goal Chat will facilitate real-time communication and collaboration among the care team members, ensuring that everyone involved in the patient's care is aligned and informed.

The Goal Chat will also serve as a record of communication, allowing team members to review past discussions and decisions. This historical context will be valuable for understanding the evolution of the care plan and for making informed adjustments as needed.
