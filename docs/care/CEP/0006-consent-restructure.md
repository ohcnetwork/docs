# CEP-6: Reimagining storing consents

## Preface

When consents were added to the patient consultation model, they were added based on the following assumptions:

- A patient (per consultation) can have multiple consents
- Each consent would have a type (e.g. consnent for admission, patient code status, consent for procedure)
- if type is patient code status, then the consent would have a sub type (e.g. DNR, DNH, Active Treatment)
- Each consent can have multiple files attached to it
- These files can be archived
- This form should be present in the consultation form

Looking at these requirements, a new JSON field was added to the patient consultation model with the following schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": [
    {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "number" },
        "patient_code_status": { "type": "number" },
        "deleted": { "type": "boolean" }
      },
      "additionalProperties": false,
      "required": ["id", "type"]
    }
  ]
}
```

Our initial UI allowed consents groups to be made, and each consent group had its own file manager. Different file manager due to the fact that files were stored associative to the consent id, and there was already a file manager component that could be reused.

![Initial UI](./assets/0006/initial-ui.png)

However, this did not have it's desired result on the field. Consents were not easily accessible and having a different file manager for each consent group was not intuitive.

The new requirement was to have a seperate page for consents, accessible from the patient consultation page.
In the consent page, files should be managed in a single file manager, and consents should be grouped by type.

Although the UI reason was logical, our current handling of consents did not fit with this. Hacks and workarounds were used to ship the new page, but it is clear that the current implementation is not sustainable.

![New UI](./assets/0006/new-ui.png)

## Proposal

I have two proposals for restructuring the way we handle consents

### P1. **Playing by files** (personal choice)

We don't create a new table for consents, but instead update the `FileUpload` model to include a schema'd `meta` field. This field would store the consent data. The file upload model already stores info on creator and archiver. Files would be linked to the current consultation through `associating_id`. This would not require defining a new API view and only one `GET` call will be made from the client. Our goal will be achieved in the least amount of time and effort, and would make the least amount of API calls. The meta field can be utilized for other future requirements as well.

```ts
type FileUploadMeta = {
  consent?: {
    type: ConsentType;
    patient_code_status?: PatientCodeStatus;
  };
};
```

```
/files/?file_type=CONSENT_RECORDS&associating_id=consultation-12345
```

We can update the file upload serializer to allow edits to the meta field.

In the case of archiving a whole consent type (e.g. when a new patient code status is needed), we add a new endpoint to archive multiple files. The endpoint checks for permissions and then archives the files.

```
POST /files/archive

{
  "reason" : "Patient has a new code status",
  "files" :
    [
      "file-12345",
      "file-12346"
    ]
}
```

### P2. **New Model**

We create a new model `PatientConsent`

```python
class PatientConsent(BaseModel):
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE)
    type = models.IntegerField(choices=ConsentType.choices)
    patient_code_status = models.IntegerField(choices=PatientCodeStatus.choices)
    archived = models.BooleanField(default=False)
    files = models.ManyToManyField(FileUpload, related_name="consents")
```

`BaseModel` handles creator, editor and time stamps.

No changes made to the file upload model.

New APIs for CRUD operations on `PatientConsent`

```
{consultation_id}/patient-consents/
```

We fetch files by filtering on the `associating_id` field.

```
/files/?file_type=CONSENT_RECORDS&associating_id=patient-consent-12345
```

But this would need to fetch multiple times from the client for each consent, thus we update the `associating_id` filter to accept multiple ids.

```
/files/?file_type=CONSENT_RECORDS&associating_id=patient-consent-12345,patient-consent-12346
```

So on the client side, we first fetch the consents, and then fetch the files, and then group them.

If a new patient code status is needed, we archive the consent through a `PATCH` request, which triggers a cascade archive of the files.
