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

A care plan would be manageable from the patient dashboard. The user can see all the current active care plans listed here. Additionally, the user can filter and see completed/expired plans. The page would have a “Create” button as well, taking them to the care plan form.

The form would contain basic details of the CarePlan model, followed by a form to add goals. Once done, the user would be able to create a new care plan with new goals.

Clicking on a care plan would take you to the Plan Dashboard. It will contain notes and other details. It will also include time series graphs of the goal updates to help determine progress for the goals. The user will be able to add new goals, update previous goals, and add goal updates through the plan dashboard. There will be options to create new tasks, medication requests, and service requests associated with the plan. These and their progress will also be tracked through the Care Plan dashboard.

Once a goal or plan is nearing its due date, alerts will be issued. If the due date is crossed before reaching targets, the plan and goals’ statuses will change to “not-reached.”
