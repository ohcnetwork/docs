### Workflow Summary for `OHC Network - Zoom Drive`


### `OHC Network - Zoom Drive.yml`

The `OHC Network - Zoom Drive.yml` workflow is designed to automate the management of Zoom meeting recordings by downloading them from the Zoom cloud and uploading them to Google Drive. This workflow is scheduled to run weekly, with optional manual triggering.

1. **Trigger**:
   - **Scheduled Trigger**: Runs every Sunday at 12:00 AM UTC.
   - **Manual Trigger (`workflow_dispatch`)**: Allows the workflow to be manually triggered with customizable inputs:
     - **`lookback_days`**: Specifies how many days' worth of Zoom meeting recordings to keep.
     - **`end_date`**: Defines the end date for the recordings to retain.
     - **`delete_on_success`**: Option to delete recordings from Zoom after they have been successfully uploaded to Google Drive.

2. **Main Job**: `zoomdrive`
   - **Runs-on**: `ubuntu-latest`
   - **Environment**: Open Healthcare Network
   - **Job Name**: Download Zoom recordings and upload to Google Drive
   - **Steps**:
     - **Download and Upload**:
       - **Action**: Utilizes the `coronasafe/zoomdrive@main` GitHub Action.
       - **Inputs**:
         - **Zoom Account Credentials**:
           - `zoom_account_id`, `zoom_client_id`, `zoom_client_secret`: These secrets are used to authenticate and access the Zoom API.
         - **Parameters**:
           - `lookback_days`: Specifies the number of days to look back for Zoom recordings (defaults to 7 days if not provided).
           - `end_date`: Sets the end date for the recordings to keep.
           - `delete_on_success`: Controls whether recordings are deleted from Zoom after uploading (defaults to `true` if not provided).
         - **Google Drive Credentials**:
           - `gsa_credentials`: Google Service Account credentials used for uploading files to Google Drive.
           - `meeting_gdrive_folder_map`: A mapping of Zoom meeting IDs to Google Drive folder IDs, ensuring recordings are uploaded to the correct locations.
