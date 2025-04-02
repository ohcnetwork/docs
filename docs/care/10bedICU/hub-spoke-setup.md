# Hub Doctors Setup Guide in CARE

### Step 0: Admin Login
Admin privileges are required. Log in using admin credentials.

### Step 1: Navigate to the Spoke Facility
- **Action:** 
  - Go to the specific spoke facility where you want to initiate the setup. 
  - Go the facility settings page
  - Next, go to the departments tab.

### Step 2: Create a User Management Department
- **Action:** Establish a dedicated department for managing users (e.g., TeleICU or 10BedICU).
- **Purpose:** Organizes and segregates users based on facility requirements.

### Step 3: Add Home Users to the Department
- **Action:** 
  - Enter the newly created department and add home users using:
    - **"Add User"** for new users.
    - **"Link User"** for existing users.
- **Role Assignment:** Assign the default roles such as doctor, nurse, staff, or admin accordingly.

### Step 4: Add Hub Users via a Team
- **Action:** 
  - Create a team titled **"Hub Users."**
  - Enter the team and add hub users using:
    - **"Add User"** for new users.
    - **"Link User"** for existing users.
- **Role Assignment:** Assign a custom role for hub doctors with reduced privileges *(Note: This feature of creating a custom is currently not available but will be available soon. Use the default role till then.)*

### Important Note on Encounters
When creating encounters, select the TeleICU department and then the Hub user team. This ensures that users in the hub user team, along with their parent teams and departments, have permission to access the encounters.

## Demo Video
For a visual walkthrough of the entire setup process, please refer to the demo video:
[Demo Video](https://drive.google.com/file/d/1TN0DsykLKVsCUgfyZPE0ZRIyMQ7CECJ_/view?usp=sharing)
