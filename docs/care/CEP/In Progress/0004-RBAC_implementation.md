# RBAC support - CEP-4

RBAC (Role Based Access Control) allows fine-grained control of objects within care. Currently, care has some rudimentary 
version of RBAC implemented but this is not enough for the evolving requirements and its increasingly hard to keep track of 
increasing authorization scopes.  
A new updated version of RBAC is essential to ensure that care remains secure and stable.  

Requirements for new version : 
    - Adding permission for each action, this could be anything from `edit_patient` to `edit_patient_dob`
    - New implementation of a role which would be a combination of permissions
    - A new library to perform authZ related actions, ie, this library can abstract permission checks like `can user X access resource Y`
    - Creating new users with combined permissions on the fly, ie create a new user with roles A and B

## Proposed Designs:

### Using Django Roles-Permissions:
    - 
