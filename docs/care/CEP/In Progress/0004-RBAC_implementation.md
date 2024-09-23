# RBAC support - CEP-4

RBAC (Role Based Access Control) allows fine-grained control of objects within care. Currently, care has some rudimentary 
version of RBAC implemented but this is not enough for the evolving requirements and its increasingly hard to keep track of 
increasing authorization scopes.  
A new updated version of RBAC is essential to ensure that care remains secure, stable and scalable.  

Requirements for new version :  
    - Adding permission for each action, this could be anything from `edit_patient` to `edit_patient_dob` ( Some relation can be maintained for this hierarchy )  
    - New implementation of roles which would be a combination of permissions and can be created on the fly and modifiable as necessary
    - A new library to perform authZ related actions, ie, this library can abstract permission checks like `can user X access resource Y`  

There should be some capability to override permissions based on attributes, like a DistAdmin type user would have access to X if the district attribute of X is the same as the users. 
This needs to be abstracted somehow. ( Even thou its not required, having a permission management system capable of this would be essential )

To allow AuthZ in listing, For resources that are unbounded like patient listing, there can be permissions that allow patient searches within a facility 
and if the user requesting the search passes the criteria they are allowed to search.

A user can also be given explicit permission over a resource, this needs to be handled separately. Since the permissions in care do not explicitly deny any user from an action, 
The most open permission can be used first.

Open searches without any contexts applied should be discouraged, Searching patients across without a facility limit for instance should be discouraged.

Permissions can be cached at any level, given that they are invalidated periodically or on a change in permission.

Superadmins may sometimes required to give access to resources to other users for a temporary duration, like a doctor viewing an old patient data without actually creating a consultation.
This needs to be accounted for in the system.

## Proposed Design:

### Approach 1 (Proposed): Abstract all Permissions to a separate app

A new app will be created to manage permissions, This app would abstract away every bit of logic that deals with permissions in general.
    
Application logic would still control all aspects of the resource, The permission module will use metadata of a resource to identify if a user has access to a resource.
ie. Application logic would record that a patient has an assigned doctor for a consultation, the permission controller would use that metadata to confirm access for the doctor.

Since some permission logic deals with queryset based filtering, the permission class would also be responsible to create filtered querysets based on requirements, 
ie, given a user x, build a queryset to access all facilities.  
A plug with a custom permission manager can override this logic to create his own logic to determine querysets.  

All permissions are to be abstracted to a class outside care's default `facilitiy` app, this class would be tasked with checking if a user has access to resource y with a given scope.

A single Permission manager class can encompass all permissions, it is also possible to create 

Permissions can either be abstract or be applied on a given facility, ie `view patients` can be applied on a facility X and only that facility. 

All views would invoke the permission manager to check if a user has permission to do a certain action, custom serializer logic can also call the permission manager to confirm authZ.

A repository of permissions to be maintained to manage permissions
