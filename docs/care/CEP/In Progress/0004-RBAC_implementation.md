# RBAC support - CEP-4

RBAC (Role Based Access Control) allows fine-grained control of objects within care. Currently, care has some rudimentary 
version of RBAC implemented but this is not enough for the evolving requirements and its increasingly hard to keep track of 
increasing authorization scopes.  
A new updated version of RBAC is essential to ensure that care remains secure and stable.  

Requirements for new version : 
    - Adding permission for each action, this could be anything from `edit_patient` to `edit_patient_dob` ( Some relation can be maintained for this hierarchy )
    - New implementation of a role which would be a combination of permissions
    - A new library to perform authZ related actions, ie, this library can abstract permission checks like `can user X access resource Y`
    - Creating new users with combined permissions on the fly, ie create a new user with roles A and B

There should be some capability to override permissions based on attributes, like a DistAdmin type user would have access to X if the district attribute of X is the same as the users. 
This needs to be abstracted somehow.

To allow AuthZ in listing, For resources that are unbounded like patient listing, there can be permissions that allow patient searches within a facility 
and if the user requesting the search passes the criteria they are allowed to search.

A user can also be given explicit permission over a resource, this needs to be handled separately. Since the permissions in care do not explicitly deny any user from an action, 
The most open permission can be used first.

Open searches without any contexts applied should be discourages, Searching patients across all instances for instance should be discouraged.

Permissions can be cached at any level, given that they are invalidated periodically or on a change in permission.

## Proposed Designs:

### Using Django Roles-Permissions:
    - TBD
