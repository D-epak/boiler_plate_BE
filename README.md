User Events API

This API allows you to manage user details and events, providing endpoints to save user data and event information.

API Endpoints
1. POST /saveuser/
Saves user details in the database.

Request:
Headers: None required.
Body:
{
  "appId": "string",
  "deviceId": "string",
  "userId": "string (optional)"
}

Response:
  . Success (200):
    {
      "message": "Details Save",
      "data": {
        "userId": "userXYZ",
        "appId": "sampleAppId",
        "deviceId": "sampleDeviceId"
      }
    }

  . Error (500):
    {
      "status": false,
      "message": "Error in inserting Data"
    }


2. POST /saveevents
Saves event details for a specific user. Requires user authentication.

Request:
Headers:
Authorization: Bearer <token>
Body:    
    {
      "userId": "string",
      "name": "string",
      "type": "string",
      "eventDetails": "object"
    }

. Response:
    - Success (200):
    {
      "message": "Save Events Successfully"
    }

    - Error (500):
    {
      "status": false,
      "message": "Error in inserting Data"
    }



- Save Event Details:

Route: /saveevents

Controller Logic:

Generates a unique eventId (e.g., eventXYZ).
Accepts event data (name, type, eventDetails, etc.).
Calls the dbservices.User.eventDetails to save the event in the database.
Database Operation:

Inserts the eventId, userId, name, type, and eventDetails into the eventData table.


- Notes
Ensure you pass the Authorization header for the /saveevents route.
For local development, configure the database connection in the .env file.




