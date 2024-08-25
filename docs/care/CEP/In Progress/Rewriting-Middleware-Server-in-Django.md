# Rewriting Middleware Server in Django

## Update Observations

#### Requirements/Motive 

The current Implementation of the middleware is such that we store the same observation data in different variables in different data structures for different scenarios 
for example 

```javascript 
export var staticObservations: StaticObservation[] = [];
var activeDevices: string[] = [];
var lastRequestData = {};
var logData: {
  dateTime: string;
  data: Observation[][];
}[] = [];
var statusData: ObservationStatus[] = [];
var lastObservationData: LastObservationData = {};
let observationData: { time: Date; data: Observation[][] }[] = [];
```

The structure of others defined here are  as follows 

```javascript 

export interface StaticObservation {
  device_id: string;
  observations: Record<ObservationType, Observation[]>;
  last_updated: Date;
}

export type LastObservationData = {
  [observation_id in ObservationTypeWithWaveformTypes]?: {
    [device_id: string]: Observation;
  };
}

export interface ObservationStatus {
  time: string;
  status: {
    [device_id: string]: "up" | "down";
  };
}

```
We need to come up with an efficient solution so that we do not store redundant data and can populate the required data as and when required.

### Usages 
#### staticObservations
  - Structure - Static observation is a list of type StaticObservation
    ``` javascript 
      export interface StaticObservation {
        device_id: string;
        observations: Record<ObservationType, Observation[]>;
        last_updated: Date;
            }

      export var staticObservations: StaticObservation[] = [];
      ```
  - how is it populated
    - we update ```staticObservations``` when we get the cns data
    - we update the array related to the  observation type and in the array we just keep the last n number of data (n = DEFAULT_LISTING_LIMIT) and append the latest observation to it .
    - we update  ```last_updated``` value when we update any of the observation type related to the device id.
    - we also do check if the device id is in active devices but we don't really use this value which is a redundant check as we do not remove any device from active devices.
  
  - where is it used?
    - ```/get_observations``` endpoint where we return the observations related to the device id passed in the request
    - Automated daily rounds 
      - here we just fetch all the observations related to a particular device id 

#### activeDevices
  - Structure - active devices is just a list of strings
    ``` javascript 
      var activeDevices: string[] = [];
      ```
  - how is it populated
    - we update ```activeDevices``` when we get the cns data.
    - we just put the device_id when we get the cns data.
  - where is it used?
    - the actual data in ```activeDevices``` is not used as such we just use it as a check while updating static observations but regardless of the check we do add the observation in ```staticObservations```.


#### lastRequestData
  - Structure 
    ``` javascript 
    var lastRequestData = {};
    ```
    - how is it populated 
      -  we populate it with just assigning the latest data every time we receive it from cns as it is without any flattening or calculations.
    - where is it used?
      - ```/get_last_request_data``` endpoint where we just return ```lastRequestData``` as it is.

#### lastObservationData
  - Structure
    ```javascript
    export type LastObservationData = {
      [observation_id in ObservationTypeWithWaveformTypes]?: {
        [device_id: string]: Observation;
      };
    };
    var lastObservationData: LastObservationData = {};
    ```
    - how is it populated 
      - we update it when we get the cns data.
      -  we populate it when ```observation.value, observation.data``` is present  and ``` observation.status === final ```
    - where is it used?
      - in ```updateLastObservationData``` we just use ```lastObservationData["blood-pressure"]``` other then this we don't use this data anywhere.


#### logData 
  - Structure 
     ```javascript 
        var logData: {
          dateTime: string;
          data: Observation[][];
        }[] = [];
      ```
    - how is it populated 
      - we update ```logData``` every time we get the cns data
      - we just keep the last n entries  (n = DEFAULT_LISTING_LIMIT) 
      - we add current timestamp to the received data and push it to the log data 
    - where is it used?
      - in  ```/get_log_data``` endpoint we return logData as it is. 

#### statusData 
  - structure 
    ``` javascript 

    export interface ObservationStatus {
      time: string;
      status: {
        [device_id: string]: "up" | "down";
      };
    }

    var statusData: ObservationStatus[] = [];
    ```
  - how is it populated  
    - we update it every time we get the cns data
    - we create a status type object from the data and we truncate the minutes and seconds from it.
    - if the next data arrives in the same minute we just replace it with the current one else we push a new entry in the array.
    - and we only consider data for the last 30 mins 
  - where is it used?
      - in  ```/devices/status``` endpoint where we return the status data of last 30 mins 
#### observationData 
  - structure 
    ``` javascript 
    export let observationData: { time: Date; data: Observation[][] }[] = [];
    ```
  - how is it populated  
    - its same as we populate log data i.e add timestamp to the received data from cns and then push it to an array
    - even the structure for log data and observationData is same 
  - where is it used?
    - it is used in ```getVitalsFromObservationsForAccuracy``` and ```observationsS3Dump``` 

### latestObservation
  - structure
    ``` javascript 
    #observations: Record<string, any> = {};
    ``` 
    
  - how is it populated  
    - we set the latest data for each device
  - where is it used?
    - it is used in an endpoint getLatestVitals other than that we do not use it.

### Problem 
  we store the same data in different/similar formats which can be reduced so that the data is stored efficiently and we can populate the data based on requirement 

### Implementation
  - Observations 
    - we need some sort of data structure which can be used here so that any data which is required can be calculated on the go.
    - we can also delegate the task of storing the variables to redis instead of storing it in django's memory.
    - active devices list is not needed.
    - logData and observationData are exactly the same.
    - if we can just store the previous values for blood pressure per device then we can completely remove the usage of ```lastObservationData``` as its only used for ```blood-pressure```
    - we can remove latestObservation as it is not used for anything that cant be calculated
    - the function updateLastObservationData can be removed as we are not using lastObservationData
    - for status api we just need the status of each device for past minute
    - in automated daily rounds we need data related to last one hour 
    - As we just need last one hour data for automated daily rounds we can dump the rest of the data
    - we do not have to store static observations  as it is used in automated daily rounds only we can just calculate it when needed

  - Solution 
    - optimization for updateObservations
      - we store the observations as it is on redis, we will just flatten it into a list
      - while getting the data to middleware we add a new field to all the observations taken_at which is the current time so we do not have to add current time separately
      - we will not store static observations separately, we will calculate it during automated daily rounds
      - we we will make a local variable for blood pressure which will be of type dict to store the last blood pressure value for a particular device
      ``` python 
      blood_pressure_data: Dict[DeviceID, Observation] = {}
      ```
    - optimizations for automated daily rounds
      - in static observations we now call a function which will generate the static observations for us
      - it will get the observations and then return only those observations which are within the required time frame (1 hour) and also belongs to a particular device

  - further optimizations 
    - pydantic
      - we have use pydantic models instead of serializers
      - it has helped us reduce a lot of code  refer https://github.com/coronasafe/teleicu_middleware_backend/pull/1/commits/e6eb7247baf0d5af1aad47a7da570d2cc54c07eb
      - we can also use pydantic classes for typing 
        - due to this we can use observations with properties instead of dicts
      - can create aliases to parse and serialize specific fields
    - Re-writing observations class 


## Camera

#### Requirements/Motive 
  we wanted the new middleware to have all the necessary endpoints that were present in the already existing middleware but apart from that
  we wanted to make the camera endpoints synchronous and were not able to find a package which gives us these functionalities out of the box 


  
### Implementation
  The camera endpoints are straight forward and are written in an easy to understand format. The camera module has 3 parts to it 
    1) The abstract class 
    2) The implementation of the abstract class 
    3) views created using the implemented classes methods


  - abstract class 
    - We have created an abstract class AbstractCameraController to list all the necessary methods for an ONVIF class to be supported
    - if we plan to use another python package which supports ONVIF methods then this class needs to be implemented

  - OnvifZeepCameraController
    - This is the class which implements AbstractCameraController and defines all the methods using onvif-zeep package

  - CameraViewSet
    - This is the viewset which creates necessary objects of class OnvifZeepCameraController and sends the appropriate responses 

  For adding synchronous support we have created a new decorator `wait_for_movement_completion` which is used for movement related camera functions  

  - wait_for_movement_completion
    - in the wrapper we first perform the function which was called and then we keep checking if the movement status for pantilt and zoom are ideal or not 
    - if they both are idea we then return from the function and the response is returned 
    - if not we keep keep checking until this condition is met every 0.5 secs
    
  - locking camera 
    - we also support the mechanism of locking camera when required 
    - we have 2 methods lock_camera and unlock_camera used to lock and unlock cameras
    - we store a key when we lock the camera in redis the key will have a prefix lock:camera_id_ (which is configurable from env) followed by an ip address
    - we can also set an expiry for the key which is also configurable from env
    - we also have a method is_camera_locked to check if the camera is locked or not 


## Device / camera status endpoints 

#### Requirements/Motive 
  - In the existing implementation we have 2 endpoints which are used for the statuses of monitors and camera devices.
  - These endpoints are called from our care backend to know if a device was up or down to show in the dashboard. 
  - These 2 endpoints had the response body very similar but the implementation was very complex and different for each one 
  - we had to centralize and simplify the change so the we do not repeat a lot of code when the end result was same for both the endpoints 

### Implementation
We solved this problem with the help of a class `RedisManager` 


- RedisManager
  - The `RedisManager` class provides methods to interact with Redis, allowing you to push items to Redis with a specific expiry and retrieve items from Redis based on a queue name

  - The redis manager has 2 methods `push_to_redis` and `get_redis_items`

    - ### Methods

      - `push_to_redis(queue_name, item, expiry=60 * 30, curr_time=None)`
        - **Parameters:**
          - `queue_name` (str): The name of the queue to which the item is pushed.
          - `item` (any): The item to be pushed to Redis.
          - `expiry` (int): The expiration time for the Redis key in seconds. Defaults to `60 * 30` (30 minutes).
          - `curr_time` (str, optional): A timestamp to be used in the Redis key. If not provided, the current truncated UTC time is used. (we used truncated time where we truncate the secs and mili secs from the timestamp as we just required the time till mins )

        - **Usage:**
          - this function stores the key in redis with the queue name and the current time stamp 
          - we use this to store observations, monitors and cameras
          - we pass the key stores the item passed to the function 
          - it will basically overwrite the current timestamp if the timestamp is already present in redis as we create truncated time stamp while calling it to store camera and monitors statuses
      - `get_redis_items(queue_name)`
        - **Parameters:**
          - `queue_name` (str): The name of the queue from which to retrieve items.
        - **Usage:**
          - It performs some steps in the following order 
            1) Search for Matching Keys
            2) Sort Keys by Timestamp
            3) Retrieve Data from Redis
            4) Build the Response List
          - The response list for camera as well as monitors is like below 
          - ``` 
            {
            "time": "2024-08-24T23:24:00.000Z",
              "status": {
                  "192.168.1.13": "up",
                  "192.168.1.20": "up",
                  "192.168.1.19": "down",
                  "192.168.1.12": "down",
                  "192.168.1.18": "up",
                  "192.168.1.17": "up",
                  "192.168.1.16": "up",
                  "192.168.1.15": "up",
                  "192.168.1.11": "down",
                  "192.168.1.14": "up"
                }
            }
        - This implementation centralized the changes and made the code look clean and easy to understand how statuses are generated 
        - For monitors we form and send the data when we get the mock csn data from update_observations endpoint 
        - For cameras we run a celery task which goes through all the camera assets and fetches the statues and passes it to  `push_to_redis` to store the statuses in redis 

## Authentication  
  We have implemented 3 types of authentication 
  1) authentication for requests received from care
  2) support for authenticating request gone from middelware to care
  3) websocket authentication


  ### Implementation 
    #### CareAuthentication
      - `CareAuthentication` class is used for authenticating requests from care
      - whenever a request is made to the middleware it hits the care endpoint to get the actual public key 
      - Once the key has been received, it decodes it verifies it.
    
    #### Authentication for middleware requests
      - just like how we have implemented CareAuthentication the care backend also has this open id authentication implemented 
      - we have an endpoint `.well-known/openid-configuration/` which points to a view which shares the public key through which care can get middleware's public key and verify the request when needed

    #### Websocket Authentication 
      - For websocket requests we have an endpoint which generates jwt token when a care token is passed 
      - front-end needs to hit the endpoint `verify_token`.
      - this endpoint will verify the token with care backend and then generate a jwt and it needs to set the token in the websocket url whenever it needs  to connect to our websocket 
      - during a websocket connection the class `TokenAuthMiddleware` will take care of extracting the token from the request and verifying it 
      - if the token is verified we accept the connection but if it is not appropriate or expired it will not accept the websocket connection. 


        
## Schedule

### 27th May - 1st June
- [x] Creating Model
  - [x] Implementation strategy for database changes 
  - [x] Ensuring data consistency and integrity.
  - [x] Discuss approach with mentor.
  - [x] Create Django migrations to modify existing database tables to align with Django model.


### 1st June - 10th June
- [ ] Rewriting existing controllers in Django
  - [x] Rewrite update_observations api end to end.
  - [x] test update_observations from care_fe
  - [x] Rewrite automated daily_rounds function
  - [x] Rewrite retrieve assets_config function
  - [x] Rewrite camera endpoints  
  
  
### 11th June - 14th June
- [x] Rewriting existing routers in Django
  - [x] Test controllers.
  - [x] Write tests for controllers.
  - [x] Create APIs for the controllers.
  - [x] Add tests for the APIs.

### 15th June - 19th June
- [x] WebSockets Using Django Channels
  - [x] Specify the approach for implementing WebSockets. 
  - [x] Implement WebSockets.
  - [x] calling necessary functions on app startup 
  - [x] Improve directory structure
 
### 20th June - 27th June
- Authentication for websocket and requests
  - [x] Authentication for Requests 
  - [x] Specify the approach for implementing authentication.
  - [x] Finalize approach for authentication.
  - [x] authenticate request from care to middleware
  - [x] authenticate request from middleware to care
  - [x] Ensure authentication works for connections from the CARE and CARE_FE applications.
  - [x] Manually test authentication with tools like Postman.
  - [x]  Authentication for Websocket

### 28th June - 5th July
- [x] Rewriting exceptions and rewriting remaining components
  - [x] Implement celery and celery Beat (basic structure)
  - [x] Store observation in redis
  - [x] Cron job for retrieving asset configs
  - [x] Cron job for automated daily rounds
  - [x] Handle exceptions and write custom exceptions for better exception handling.
  - [x] Write tests related to exceptions.
  - [x] Rewrite remaining parts from TypeScript to the new Django project. 
  - [x] Create Dockerfile for middleware

### 6th July - 14th July
- [x] Rewriting utils and automation in Django
  - [x] Discuss various approaches to optimize update observations
  - [x] Optimize update observations
  - [x] Replacing serializers with pydantic models
  - [x] write new util functions for generating static observations
  - [x] Rewrite utility functions like camera utils.
  - [x] Rewrite existing automation (uploading observations of Medical Equipment Data on AWS S3).

### 15th July - 22nd July
- [x] Rewriting validators and ensuring typing
  - [x] Implement type annotations throughout the Django middleware codebase.
  - [x] Implement commit hooks to ensure maintainability.
  - [x] Add validators to validate data wherever necessary.

### 23rd July - 31st July
- [x] Connecting CARE (backend) to the new middleware
  - [x] Test the middleware with the existing backend.
  - [x] Thoroughly test the changes.
  - [x] Ensure results are as expected.

### 1st Aug - 14th Aug
- [x] Writing e2e tests
  - [x] Write tests for happy flows.
  - [x] Write tests for edge cases.
  - [x] Ensure everything works as expected.

### 15th Aug - 18th Aug
- [x] Final Testing

### 19th Aug - 26th Aug
- [x] Submit final work product