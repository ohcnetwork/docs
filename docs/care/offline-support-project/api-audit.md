# Backend API audit for offline support

This document lists the standard workflows that will be supported offline.  
Each workflow has an associated markdown table that defines the structure, HTTP method, and other important information about the API endpoints involved.

In the tables, backend API endpoints are clearly distinguished based on whether they will be **cached** or **stored and later synced via IndexedDB (for write operations).**

These  tables give us idea about which  dynamic data need to be cached for offlien support   and help to avoid store unnecessary data.
---

## Standard Workflows

- [1. Patient Registration and Search Patient Workflow](#1-patient-registration-and-search-patient-workflow)  
- [2. Encounter Management and Questionnaire Filling](#2-encounter-management-and-questionnaire-filling)  
- [3. Patient Profile management](#3-patient-profile-management)  
- [4. Appointments Management](#4-appointments-management)

---

## 1. Patient Registration and Search Patient Workflow
Patient registration and search patient workflow include add new patient and search patient by its mobile number.After click on one of the search patient ,user go to page from where they can create encounter,schedule appointments,see encounters list of that patient.This table mainly include endpoints regarding add patient and search patient only . create encounter,list encounter come under the encounter management and schedule appointment come under the appointment management.

 pattern of Read only Api that going to be cached :
 1. URL starts with `/api/v1/getcurrentuser`          
 2. URL starts with `/api/v1/organization`          
 3. URL matches `/api/v1/facility/:facilityId/`       


  Note: (3,4) are the post type read only api so we need to store them into indexed when user hit them during online. and (8) is the write operation api.
 

| #  | API Endpoint                                                      | Method | Purpose                                                    | Offline Handling                  | Notes                                                         |
|:--:|:------------------------------------------------------------------|:------:|:-----------------------------------------------------------|:----------------------------------|:--------------------------------------------------------------|
| 1  | `/api/v1/users/getcurrentuser/`                                   | GET    | Fetch current logged-in user info (global)                 | Cache (SW)                        | Used in every workflow. precaching will be best for this |
| 2  | `/api/v1/facility/{facility_id}/`                                 | GET    | Fetch details for a selected facility                      | Cache (SW)                        | Cache per facility. workbox on-demand caching will be used                  |
| 3  | `/api/v1/patient/search/`                                         | POST   | Search patients by phone number                            | cache in IndexedDB whenever user's hit it .so that data coming from this can load on the ui during offline                    | Keyed by phone; store results + timestamp                     |
| 4  | `/api/v1/patient/search_retrieve/`                                | POST   | Retrieve full patient record after selecting from search   | cache in IndexedDB during online so that data coming from this can load on the ui during offline                        | Keyed by patient.id;            |
| 5  | `/api/v1/encounter/?patient={patient_id}&live=false`              | GET    | List all encounters for a specific patient                 | Cache (SW)                        | workbox on-demand caching will be used             |
| 6  | `/api/v1/organization/?org_type=govt&parent=&limit=200`           | GET    | Fetch top-level government organization list               | Cache (SW)                        |workbox on-demand caching will be used                            |
| 7  | `/api/v1/organization/?org_type=govt&parent={parent_id}&limit=200`| GET    | Fetch child organizations under a given parent (dynamic)   | Cache (SW)                        | Same pattern as #6; cache per parent query.                    |
| 8  | `/api/v1/patient/`                                                 | POST   | Create a new patient record                                |store in  IndexedDB and  will sync on reconnect to internet                   | Store new record with `dirty=true`; sync and clear flag later |



## 2. Encounter Management and Questionnaire Filling  

This workflow include list down encounters on the encounter page , create/update  encounter. It include  filling questionnair available on encounter page . user can see  allregies,symptoms,diagnones and medication statements. 

pattern of Read only Api that going to be cached:
 1. URL starts with `/api/v1/encounter`                       
 2. URL matches `/api/v1/facility/:facilityId/organizations`  
 3. URL starts with `/api/v1/valueset`                        
 4. URL starts with `/api/v1/questionnaire`                 
 5. URL matches `/api/v1/patient/:patientId/symptom/`
 6. URL matches `/api/v1/patient/:patientId/diagnosis/`
 7. URL matches `/api/v1/patient/:patientId/allergy_intolerance/`
 8. URL matches `/api/v1/patient/:patientId/medication-statement/`
 9. URL matches `/api/v1/patient/:patientId/questionnaire_response/`
 10. URL starts with `/api/v1/role/`                       



| Step | User Action                                           | Method | Endpoint                            | Offline Handling             | Notes                                                         |
|:----:|:------------------------------------------------------|:-------|:------------------------------------|:-----------------------------|:--------------------------------------------------------------|
| 1    | List recent encounters for a facility                | GET    | `/api/v1/encounter?facility={facilityId}&...`                         | Cache (Service Worker)       | Main encounter list                                           |
| 2    | Create a new encounter                               | POST   | `/api/v1/encounter/`                                                    | Store & Sync (IndexedDB)     | Adds a new encounter                                          |
| 3    | Fetch specific encounter detail                      | GET    | `/api/v1/encounter/{encounterId}/?facility={facilityId}`              | Cache (Service Worker)       | View full encounter                                           |
| 5    | Load facility organizations by parent                | GET    | `/api/v1/facility/{facilityId}/organizations?parent={orgParentId}&...`| Cache (Service Worker)       | Child organizations dropdown                                  |
| 6    | Load root facility organizations                     | GET    | `/api/v1/facility/{facilityId}/organizations?parent=&...`             | Cache (Service Worker)       | Root organizations list                                       |
| 7    | Load patient allergy history                         | GET    | `/api/v1/patient/{patientId}/allergy_intolerance?&...`                | Cache (Service Worker)       | Allergy records                                               |
| 8    | Load current-encounter symptoms                      | GET    | `/api/v1/patient/{patientId}/symptom?encounter={encounterId}&...`     | Cache (Service Worker)       | Symptoms tied to this encounter                               |
| 9    | Load full symptom history                            | GET    | `/api/v1/patient/{patientId}/symptom?limit=100&...`                    | Cache (Service Worker)       | “History” view                                                |
| 10   | Load current-encounter diagnoses                     | GET    | `/api/v1/patient/{patientId}/diagnosis?encounter={encounterId}&...`   | Cache (Service Worker)       | Diagnosis for this encounter                                  |
| 11   | Load full diagnosis history                          | GET    | `/api/v1/patient/{patientId}/diagnosis?limit=100&...`                  | Cache (Service Worker)       | “History” view                                                |
| 12   | List questionnaire responses for this encounter      | GET    | `/api/v1/patient/{patientId}/questionnaire_response?encounter={encounterId}&...` | Cache (Service Worker)       | Already-filled forms                                          |
| 13   | Fetch encounter-specific questionnaires              | GET    | `/api/v1/questionnaire?tag_slug=encounter_actions&...`                | Cache (Service Worker)       | Which forms can be added                                      |
| 14   | Fetch all active questionnaires                      | GET    | `/api/v1/questionnaire?status=active&...`                              | Cache (Service Worker)       | General form listings                                         |
| 15   | Fetch  questionnaires with subject type 'encounter'            | GET    | `/api/v1/questionnaire?subject_type=encounter&status=active&...`      | Cache (Service Worker)       | Encounter-scoped forms                                        |
| 16   | Load a questionnaire definition                      | GET    | `/api/v1/questionnaire/{questionnaireSlug}/`                          | Cache (Service Worker)       | Full form schema                                              |
| 17   | Load valueset favourites                             | GET    | `/api/v1/valueset/{slug}/favourites/`                                  | Cache (Service Worker)       | Speeds up include/exclude lookups                             |
| 18   | Load valueset recent views                           | GET    | `/api/v1/valueset/{slug}/recent_views/`                                | Cache (Service Worker)       | Speeds up include/exclude lookups                             |
| 19   | Expand valueset to retrieve items                    | POST   | `/api/v1/valueset/{slug}/expand/`                                      | Cache results (Service Worker) | Lookup codes for pick-lists                                   |
| 20   | Batch create/update encounter-related data           | POST   | `/api/v1/batch_requests/`                                              | Store & Sync (IndexedDB)     | Batch create or update of symptoms, diagnoses, allergies, questionnaire responses, etc. |

## 3. Patient Profile Management  
This workflow include  access patient profile and including appointments, encounters, health data, resources, users.  


pattern of Read only Api that going to be cached:
 1. URL starts with `/api/v1/users/`                        
 2. URL matches `/api/v1/patient/:patientId/`               
 3. URL matches `/api/v1/patient/:patientId/get_users/`
 4. URL matches `/api/v1/patient/:externalId/get_appointments/`
 5. URL starts with `/api/v1/patient`                         
 6. URL starts with `/api/v1/resource`                      
 7. URL starts with `/api/v1/getallfacilities`              

 


| Step | User Action                                   | Method | Endpoint                                                           | Offline Handling             | Notes                                               |
|:----:|:----------------------------------------------|:-------|:-------------------------------------------------------------------|:-----------------------------|:----------------------------------------------------|
| 1    | View patient detail                           | GET    | `/api/v1/patient/{patientId}/`                                     | Cache (Service Worker)       | Load full patient record                            |
| 2    | List patients in context                      | GET    | `/api/v1/patient?limit...`                                         | Cache (Service Worker)       | Patient cards on Patient tab                        |
| 3    | View organization detail                      | GET    | `/api/v1/organization/{organizationId}/`                           | Cache (Service Worker)       | Parent organization                                 |
| 4    | List child organizations                      | GET    | `/api/v1/organization?parent={organizationId}&...`                 | Cache (Service Worker)       | Fetch children from parent organization             |
| 7    | Search patient by phone                       | POST   | `/api/v1/patient/search/`                                          | Store in IndexedDB           | Indexed by phone number                             |
| 8    | Update patient details                        | PUT    | `/api/v1/patient/{patientId}/`                                     | Store & Sync (IndexedDB)     | Save edited profile                                 |
| 9    | List patient appointments                     | GET    | `/api/v1/appointments?patient={patientId}&...`                     | Cache (Service Worker)       | Appointments tab                                    |
| 10   | List recent encounters for patient            | GET    | `/api/v1/encounter?patient={patientId}&...`                        | Cache (Service Worker)       | Encounter tab                                       |
| 11   | List health profile: medications              | GET    | `/api/v1/patient/{patientId}/medication/statement?limit...`        | Cache (Service Worker)       | Medications history                                 |
| 12   | List health profile: allergies                | GET    | `/api/v1/patient/{patientId}/allergy_intolerance?limit...`         | Cache (Service Worker)       | Allergy history                                     |
| 13   | List health profile: symptoms                 | GET    | `/api/v1/patient/{patientId}/symptom?limit...`                     | Cache (Service Worker)       | Symptom history                                     |
| 14   | List health profile: diagnoses                | GET    | `/api/v1/patient/{patientId}/diagnosis?category...&limit...`       | Cache (Service Worker)       | Diagnosis history                                   |
| 15   | List patient questionnaire responses          | GET    | `/api/v1/patient/{patientId}/questionnaire_response?subject_type=patient&...` | Cache (Service Worker)       | Patient forms                                       |
| 16   | List resources related to patient             | GET    | `/api/v1/resource?related_patient={patientId}&...`                 | Cache (Service Worker)       | Request tab                                         |
| 17   | List all facilities                           | GET    | `/api/v1/getallfacilities?limit...`                                | Cache (Service Worker)       | Facility lookup                                     |
| 18   | Create resource                               | POST   | `/api/v1/resource/`                                                | Store & Sync (IndexedDB)     | Add new resource                                    |
| 19   | Get users list                                | GET    | `/api/v1/users?limit...&search_text...`                            | Cache (Service Worker)       | For user assignment                                 |
| 20   | List resources                                | GET    | `/api/v1/resource?status=pending&...`                              | Cache (Service Worker)       | Filtered resource list                              |
| 21   | Fetch specific resource detail                | GET    | `/api/v1/resource/{resourceid}/`                                   | Cache (Service Worker)       | Resource detail view                                |
| 22   | List assignable users                         | GET    | `/api/v1/patient/{patientId}/get_users/`                           | Cache (Service Worker)       | Add user to patient                                 |
| 23   | List roles                                    | GET    | `/api/v1/role/`                                                    | Cache (Service Worker)       | For user assignment                                 |
| 24   | Assign user to patient                        | POST   | `/api/v1/patient/{patientId}/add_user/`                            | Store & Sync (IndexedDB)     | Add user to patient                                 |

## 4. Appointments Management 
It include View, create, and manage appointments for a facility.
1. url start with (`api/v1/facility/{fac:id}/appointments`)
2. url start with (`api/v1/facility/{fac:id}/slots`)

| Step | User Action                                           | Method | Endpoint                                                        | Offline Handling             | Notes                                                       |
|:----:|:------------------------------------------------------|:-------|:----------------------------------------------------------------|:-----------------------------|:------------------------------------------------------------|
| 1    | Fetch details for a selected facility                                | GET    | `/api/v1/facility/{facilityId}/`                                | Cache (Service Worker)       | Cache per facility. workbox on-demand caching will be                                       |
| 2    | List “in consultation” appointments                   | GET    | `/api/v1/facility/{facilityId}/appointments?status=in_consultation&...` | Cache (Service Worker)       | data coming from these api will be cached on req from server by sw(workbox) during online and then this data will available ofline                                    |
| 3    | List “fulfilled” appointments                         | GET    | `/api/v1/facility/{facilityId}/appointments?status=fulfilled&...`      | Cache (Service Worker)       |    same as 2                                                           |
| 4    | List “no-show” appointments                           | GET    | `/api/v1/facility/{facilityId}/appointments?status=noshow&...`         | Cache (Service Worker)       |    same as 2                                                          |
| 5    | List “booked” (upcoming) appointments                 | GET    | `/api/v1/facility/{facilityId}/appointments?status=booked&...`         | Cache (Service Worker)       |       same as 2                                                       |
| 6    | List “checked in” appointments                        | GET    | `/api/v1/facility/{facilityId}/appointments?status=checked_in&...`     | Cache (Service Worker)       |      same as 2        |
| 7    | Fetch available users(practitioner) for appointments                | GET    | `/api/v1/facility/{facilityId}/appointments/available_users/`          | Cache (Service Worker)       |  sw(workbox) will handle caching of dynamic data comig from this api                                   |
| 8    | Get aggregated slot availability stats                | POST   | `/api/v1/facility/{facilityId}/slots/availability_stats/`              | Store & Sync (IndexedDB)     | Keyed by `{from_date,to_date,user}`; for charts             |
| 9    | Get detailed slots for a specific day                 | POST   | `/api/v1/facility/{facilityId}/slots/get_slots_for_day/`               | Store & Sync (IndexedDB)     | Keyed by `{day,user}`; for slot picker                      |
| 10   | Create a new appointment on a slot                    | POST   | `/api/v1/facility/{facilityId}/slots/{slotId}/create_appointment/`     | Store & Sync (IndexedDB)     | Stored locally and sync later                |
| 11   | Fetch details of a specific appointment               | GET    | `/api/v1/facility/{facilityId}/appointments/{appointmentId}/`          | Cache (Service Worker)       | Keyed by `appointmentId`; for detail view                   |
| 12   | Reschedule an existing appointment                    | POST   | `/api/v1/facility/{facilityId}/appointments/{appointmentId}/reschedule/` | Store & Sync (IndexedDB)     | Queue reschedule request locally and will sync later                           |
| 13   | Update appointment details (status, notes, etc.)      | PUT    | `/api/v1/facility/{facilityId}/appointments/{appointmentId}/`          | Store & Sync (IndexedDB)     | Queue update locally and will sync later                   |
| 14   | Cancel an appointment                                 | POST   | `/api/v1/facility/{facilityId}/appointments/{appointmentId}/cancel/`   | Store & Sync (IndexedDB)     | Queue cancel request locally and will sync later            | 
| 15   | Get list of appointments of a patient                 | GET    | `/api/v1/facility/{facilityid}/appointments/?patient={patientid}&limit=100`     | cache(SW)                    | sw(workbox) will handle caching of dynamic data comig from this api     |



# Approaches for Caching Read-Only APIs and Syncing Write Operations

When we talk about adding offline functionality to our apps, there are several methods to achieve this. Each approach is implemented differently, but they all share one common goal: caching read-only API data locally so the UI can operate offline.

The approaches discussed here focus primarily on caching API responses. Our UI shell is already cached by default since CARE is a PWA.

Below, we outline some of the approaches we can use to achieve offline functionality for the workflows we’ve discussed.

---

### 1. Using TanStack Query Cache with Persistence

This approach plays around using TanStack Query to cache the API responses and sync write operations once the app comes back online. Persistence, in this context, here means to store the cached data into some local DB (e.g., IndexedDB). Since CARE already uses TanStack Query for fetch and write operations, integrating persistence and offline syncing becomes relatively straightforward. This approach leverages existing infrastructure, reducing the need for additional caching logic or custom data handling. Now let's discuss what configuration needs to be implemented for this approach.

#### 1. Persister:
It is the mechanism that defines how and where the data is saved/restored. TanStack provides some persisters like `createSyncStoragePersister` for mainly localStorage and `createAsyncStoragePersister` for AsyncStorage. It also provides a method to create a custom persister. We will create a custom persister for IndexedDB(via dexie.js) for our use case.

#### 2. cacheTime:
For persist to work properly, we  have to  pass `QueryClient` a `cacheTime`. `cacheTime` should be set as the same value or higher than `persistQueryClient`'s `maxAge` option.

#### 3. Cache Busting:
It is a mechanism to forcefully invalidate old cached data, typically after app updates or changes to data structure. By setting a unique buster string (like a version ID), previously persisted caches without the matching string are discarded. This ensures users always get fresh data after critical changes.

#### 4. PersistQueryClientProvider:
`PersistQueryClientProvider` is a React wrapper around our normal `QueryClientProvider` that automatically restores persisted cache on mount and keeps it in sync through subscribe/unsubscribe. It prevents our queries from fetching until the cache is hydrated, ensuring a smooth offline‑first experience.


Reference for technical implementation: [TanStack Docs](https://tanstack.com/query/v4/docs/framework/react/plugins/persistQueryClient)

---

### 2. Using Service Worker (Workbox) with Manual Sync for Offline Functionality

This approach uses a Service Worker powered by Workbox to cache GET requests and store write operations locally (e.g., in IndexedDB). Write operations are manually synced only when the web application is active and the network is available. This gives full control over when syncs are triggered, avoiding unnecessary background processes. Now let's discuss what configuration needs to be implemented for this approach.

#### 1. Workbox Routing:
It provides utilities to intercept and handle network requests in the service worker. We have to define routing logic based on request methods and URLs. Above API tables provide info about which types of URLs we have to intercept to store them in cache storage. GET responses are stored in cache storage instead of storage like IndexedDB.  
Each route should be registered with an appropriate caching strategy using `registerRoute()`.

#### 2. Caching Strategies:
Workbox provides many strategies that define how responses should be handled for intercepted requests. A few common strategies that Workbox provides are:

- **Stale-while-revalidate:**  
  The stale-while-revalidate pattern allows you to respond to the request as quickly as possible with a cached response if available, falling back to the network request if it's not cached. The network request is then used to update the cache.

- **Cache first:**  
  If there is a Response in the cache, the Request will be fulfilled using the cached response and the network will not be used at all. If there isn't a cached response, the Request will be fulfilled by a network request and the response will be cached so that the next request is served directly from the cache.

- **Network first:**  
  For requests that are updating frequently, the network first strategy is the ideal solution. By default, it will try to fetch the latest response from the network. If the request is successful, it'll put the response in the cache. If the network fails to return a response, the cached response will be used.

#### 3. IndexedDB (via Dexie.js):
It will be used to store write operations (like form submissions) that fail due to network issues. We will manually store these requests and later retrieve them for syncing. And we are going to use the Dexie.js wrapper that is built on top of IndexedDB to reduce complexity. Each queued request should include all relevant data (URL, method, headers, body) needed to retry the operation later.

#### 4. Manual Sync Logic:
Instead of using Workbox’s `BackgroundSyncPlugin`, write sync logic that checks `navigator.onLine` and retries queued requests only when:

- The app is open (user is active and logged in)
- The network is restored

If we use manual sync logic, we can use existing API routes that are already defined in the codebase using TanStack Query.




       



