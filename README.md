# BLOGGING API 📝

## Description
Blogging API is a fully functional RESTful API. Anyone can consume the `/blogs` endpoint and `GET` paginated results of all our published blogs. Published blogs can also be fetched individually by anyone via the `/blogs/:id` endpoint, where *id* is the unique identifier of the blog.
Curious about all this API has to offer? [Go to API Reference](#api-reference).

Built as a project at [Altschool Africa School of Engineering - Node.js track](https://www.altschoolafrica.com/schools/engineering)

## Tech Stack
### 1. Main Dependencies
 * **node.js** and **express** as the JavaScript runtime environment and server framework
 * **mongodb** as our database of choice
 * **mongoose** as an ODM library of choice
 * **passport** for authentication. This API uses the JWT strategy
 * **jsonwebtoken** for signing and verifying JWTs
 * **bcrypt** to hash + salt passwords and compare.

## Main Files: Project Structure

  ```sh
  ├── README.md
  ├── package.json *** The dependencies to be installed with "npm install"
  ├── server.js
  ├── app.js
  ├── config
  │   ├── db.js
  ├── routes
  │   ├── authRoutes.js
  │   ├── blogRoutes.js
  │   ├── userRoutes.js
  ├── controllers
  │   ├── authController.js
  │   ├── blogController.js
  │   ├── userController.js
  ├── models
  │   ├── blogModel.js
  │   ├── userModel.js
  ├── tests
  │   ├── auth.route.test.js *** contains code for testing the `/auth` endpoints.
  │   ├── blogs.route.test.js *** contains code for testing the `/blogs` endpoints.
  │   ├── users.route.test.js *** contains code for testing the `/users` endpoints.
  └──  utils
  │   ├── apiFeatures.js
  └── └── emailSender.js
```

## Getting Started Locally

### Prerequisites & Installation
To be able to get this application up and running, ensure to have [node](https://nodejs.org/en/download/) installed on your device.

### Development Setup
1. **Download the project locally by forking this repo and then clone or just clone directly via:**
```bash
git clone https://github.com/omobolajisonde/Blogging-app.git
```
2. **Set up the Database**
   - Create 2 MongoDB databases (main and test) on your local MongoDB server or in the cloud (Atlas)
   - Copy the connection strings and assign it to the `DATABASE_URI` and `TEST_DATABASE_URL` environment variables each.
   - On connection to these databases, two collections - `users` and `blogs` will be created.
## Models
---

### User
| field  |  data_type | constraints  |
|---|---|---|
|  id |  ObjectId |  auto_generated  |
|  firstName | String  |  required|
|  lastName  |  String |  required  |
|  email     | String  |  required |
|  password |   String |  required  |
|  confirmPassword |   String |  required  |
|  createdAt |   Date |  default_value  |


### Blog
| field  |  data_type | constraints  |
|---|---|---|
|  id |  ObjectId |  auto_generated  |
|  title |  String |  required & unique |
|  author | String  |  dynamically_assigned |
|  author_id  |  ObjectId |  dynamically_assigned  |
|  description     | String  |  optional |
|  state |   String |  required  |
|  createdAt |  Date |  default_value |
|  lastUpdatedAt |  Date |  default_value |
|  readCount |  Number |  default_value |
|  tags |  Array <str> |  optional |
|  readingTime |  Number |  dynamically_assigned |

3. **Install the dependencies** from the root directory, in terminal run:
```
npm install
```

4. **Run the development server:**
```bash
npm run dev
```
5. **At this point, your server should be up and running** at [http://127.0.0.1:8000/](http://127.0.0.1:8000/) or [http://localhost:8080](http://localhost:8080)

---

## Testing
In order to run tests, navigate to the root directory and run the following commands:
``` bash
npm test
```
>**Note** - All tests are in the `tests` folder.

# API REFERENCE

### Getting Started
- Base URL: https://blog-cm7d.onrender.com/api/v1

- Authentication: Protected routes, requires a valid JWT to be sent along with the request as a Bearer Token authentication header.
Valid tokens can be gotten on `signup` or `signin`.

### Error Handling
- Format: Just as response to all requests are in JSON format, response to failed ones are also returned in JSON (JavaScript Object Notation) format.
```json
{
    "status": "failed",
    "message": "error message"
}
```
---
### Endpoints
## `/auth`
`POST '/auth/signup'`

Sends a `POST` request to register a user
- Request Body (url-encoded):

| KEY  |  VALUE |
|---|---|
|  firstName |  Omobolaji |
|  lastName |  Sonde |
|  email | omobolajisonde@gmail.com |
|  password  |  qwerty |
|  confirmPassword  |  qwerty |

- Request Body (JSON):
```json
{
    "firstName": "Omobolaji",
    "lastName": "Sonde",
    "email": "omobolajisonde@gmail.com",
    "password": "qwerty",
    "confirmPassword": "qwerty"
}
```
- Response (JSON)

Success
```json
{
    "status": "success",
    "token": "<token>",
    "data": {
        "user": {
            "firstName": "Omobolaji",
            "lastName": "Sonde",
            "email": "omobolajisonde@gmail.com",
            "createdAt": "2022-11-06T10:39:47.077Z",
            "active": true,
            "_id": "6367a84845e5893038a55bf1"
        }
    }
}
```

`POST '/auth/signin'`

Sends a `POST` request to login a user.

- Request Body (url-encoded):
  
| KEY  |  VALUE |
|---|---|
|  email | omobolajisonde@gmail.com
|  password  |  qwerty

- Request Body (JSON):
```json
{
    "email": "omobolajisonde@gmail.com",
    "password": "qwerty",
}
```
- Response (JSON)

Success
```json
{
    "status": "success",
    "token": "<token>",
    "data": {
        "user": {
            "_id": "6367a84845e5893038a55bf1",
            "firstName": "Omobolaji",
            "lastName": "Sonde",
            "email": "omobolajisonde@gmail.com",
            "createdAt": "2022-11-06T10:39:47.077Z"
        }
    }
}
```

`POST '/auth/forgotPassword'`

Sends a password reset link to the email the user provided.

- Request Body (url-encoded):

| KEY  |  VALUE |
|---|---|
|  email | omobolajisonde@gmail.com |

- Request Body (JSON):
```json
{
    "email": "omobolajisonde@gmail.com",
}
```
- Response (JSON)

Success
```json
{
    "status": "success",
    "message": "Check your email inbox, a link to reset your password has been sent."
}
```

`POST '/auth/resetPassword/<reset-token>'`

Password reset link sent to user provided email inbox. Updates user password to newly provided password.
>**Note** - `<reset-token>` expires 10 minutes after issuing.


- Request Body (url-encoded):

| KEY  |  VALUE |
|---|---|
|  password | 123456 |
|  confirmPassword | 123456 |

- Request Body (JSON):
```json
{
    "password": "123456",
    "confirmPassword": "123456"
}
```
- Response (JSON)

Success
```json
{
    "status": "success",
    "token": "<token>",
    "data": {
        "user": {
            "_id": "6367a84845e5893038a55bf1",
            "firstName": "Omobolaji",
            "lastName": "Sonde",
            "email": "omobolajisonde@gmail.com",
            "createdAt": "2022-11-06T10:39:47.077Z",
            "__v": 0
        }
    }
}
```
---

## `/blogs`
`GET '/blogs'`

Sends a `GET` request to get all published blogs on a page.

- Query params: 
    - page (default: 1)
    - limit (default: 20)
    - sort (options: read_count | reading_time | createdAt, default: -createdAt) *value alone implies `asc` order while - before value implies `desc` order*
    - author
    - title
    - tags

- Request Body: None
- Response (JSON)
```json
{
    "status": "success",
    "results": 6,
    "page": 1,
    "data": {
        "blogs": [
            {
                "_id": "6367356ac6c0c86dbf0eb120",
                "title": "Test Blog title",
                "author": "Omobolaji Sonde",
                "author_id": "6367a84845e5893038a55bf1",
                "description": "Test Blog description...",
                "body": "Lorem ipsum dolor sit amet, consectetur adipisicing",
                "state": "published",
                "createdAt": "2022-11-06T04:16:34.964Z",
                "lastUpdatedAt": "2022-11-06T04:32:12.341Z",
                "readCount": 2,
                "tags": [
                    "test",
                    "jest"
                ],
                "readingTime": 0.065,
                "formattedReadingTime": "0min 4sec read",
                "id": "6367356ac6c0c86dbf0eb120"
            },
            .
            .
            .
        ]
    }
}
```

`GET '/blogs/my'`

Sends a `GET` request to get all blogs (published or draft) on a page belonging to the user associated with the token.

- Header:
    - Authorization: Bearer {token}
  
- Query params: 
    - page (default: 1)
    - limit (default: 20)
    - sort (options: read_count | reading_time | createdAt, default: -createdAt) *value alone implies `asc` order while - before value implies `desc` order*
    - author
    - title
    - tags
    - state

- Request Body: None
- Response (JSON)

Success
```json
{
    "status": "success",
    "results": 6,
    "page": 1,
    "data": {
        "blogs": [
            {
                "_id": "6367356ac6c0c86dbf0eb120",
                "title": "Test Blog title",
                "author": "Omobolaji Sonde",
                "author_id": "6367a84845e5893038a55bf1",
                "description": "Test Blog description...",
                "body": "Lorem ipsum dolor sit amet, consectetur adipisicing",
                "state": "draft",
                "createdAt": "2022-11-06T04:16:34.964Z",
                "lastUpdatedAt": "2022-11-06T04:32:12.341Z",
                "readCount": 2,
                "tags": [
                    "test",
                    "jest"
                ],
                "readingTime": 0.065,
                "formattedReadingTime": "0min 4sec read",
                "id": "6367356ac6c0c86dbf0eb120"
            }
        ]
    }
}
```

`GET '/blogs/:id'`

Sends a `GET` request to get a published blog with `<id>`.

- Request Body: None
- Response (JSON)

Success
```json
{
    "status": "success",
    "data": {
        "blog": {
            "_id": "6367356ac6c0c86dbf0eb120",
            "title": "Test Blog title",
            "author": "Omobolaji Sonde",
            "author_id": {
                "_id": "6367a84845e5893038a55bf1",
                "firstName": "Omobolaji",
                "lastName": "Sonde",
                "email": "omobolajisonde@gmail.com",
                "createdAt": "2022-11-06T10:39:47"
            },
            "description": "Test Blog description...",
                "body": "Lorem ipsum dolor sit amet, consectetur adipisicing",
                "state": "published",
                "createdAt": "2022-11-06T04:16:34.964Z",
                "lastUpdatedAt": "2022-11-06T04:32:12.341Z",
                "readCount": 2,
                "tags": [
                    "test",
                    "jest"
                ],
                "readingTime": 0.065,
                "formattedReadingTime": "0min 4sec read",
                "id": "6367356ac6c0c86dbf0eb120"
        }
    }
}
```
`POST '/blogs'`

Sends a `POST` request to create a blog.

- Header:
    - Authorization: Bearer {token}

- Request Body (JSON):
```json
{
    "title": "Test blog title",
    "description": "Test blog description",
    "body": "Lorem ipsum dolor sit amet, consectetur adipisicing",
    "tags": ["jest", "test"]
}
```
- Response (JSON)

Success
```json
{
    "status": "success",
    "data": {
        "blog": {
            "title": "Test blog title",
            "author": "Omobolaji Sonde",
            "author_id": "6367a84845e5893038a55bf1",
            "description": "Test blog description",
            "body": "Lorem ipsum dolor sit amet, consectetur adipisicing",
            "state": "draft",
            "createdAt": "2022-11-06T13:07:45.365Z",
            "lastUpdatedAt": "2022-11-06T13:07:45.365Z",
            "readCount": 0,
            "tags": [
                "jest",
                "test"
            ],
            "readingTime": 0.065,
            "_id": "6367356ac6c0c86dbf0eb120",
            "__v": 0,
            "formattedReadingTime": "0min 4sec read",
            "id": "6367356ac6c0c86dbf0eb120"
        }
    }
}
```

`PATCH '/blogs/:id'`

Sends a `PATCH` request to update a blog.

- Header:
    - Authorization: Bearer {token}

- Request Body (JSON):
```json
{
    "state": "published",
}
```
- Response (JSON)

Success
```json
{
    "status": "success",
    "data": {
        "blog": {
            "title": "Test blog title",
            "author": "Omobolaji Sonde",
            "author_id": "6367a84845e5893038a55bf1",
            "description": "Test blog description",
            "body": "Lorem ipsum dolor sit amet, consectetur adipisicing",
            "state": "published",
            "createdAt": "2022-11-06T13:07:45.365Z",
            "lastUpdatedAt": "2022-11-06T13:07:45.365Z",
            "readCount": 0,
            "tags": [
                "jest",
                "test"
            ],
            "readingTime": 0.065,
            "_id": "6367356ac6c0c86dbf0eb120",
            "__v": 0,
            "formattedReadingTime": "0min 4sec read",
            "id": "6367356ac6c0c86dbf0eb120"
        }
    }
}
```

`DELETE '/blogs/:id'`

Sends a `DELETE` request to delete a blog with `<id>`.

- Header:
    - Authorization: Bearer {token}

- Request Body: None
- Response (JSON):

Success
```json
{}
```

---

## `/users`

`GET '/users'`

Sends a `GET` request to get all users on a page.
- Query params: 
    - page (default: 1)
    - limit (default: 20)
    - sort (default: -createdAt) *value alone implies `asc` order while - before value implies `desc` order*

- Request Body: None
- Response (JSON)

Success
```json
{
    "status": "success",
    "results": 1,
    "page": 1,
    "data": {
        "users": [
            {
                "_id": "6367a84845e5893038a55bf1",
                "firstName": "Bolaji",
                "lastName": "Sonde",
                "email": "omobolajisonde@gmail.com",
                "createdAt": "2022-11-06T13:07:45.259Z"
            }
        ]
    }
}
```

`GET '/user/:id'`

Sends a `GET` request to get a user with `<id>`.

- Request Body: None
- Response (JSON)

Success
```json
{
    "status": "success",
    "data": {
        "user": {
            "_id": "6367a84845e5893038a55bf1",
            "firstName": "Omobolaji",
            "lastName": "Sonde",
            "email": "omobolajisonde@gmail.com",
            "createdAt": "2022-11-06T13:07:45.259Z",
            "__v": 0
        }
    }
}
```


`PATCH '/users/updateMe'`

Sends a `PATCH` request to update the user associated with the <token> info.
>**Note** - This endpoint is used to update user info other than the user's password. Use `/users/updateMyPassword` to update user password.

- Header:
    - Authorization: Bearer {token}

- Request Body (JSON):
```json
{
    "firstName": "Bolaji",
}
```
- Response (JSON)

Success
```json
{
    "status": "success",
    "data": {
        "user": {
            "_id": "6367a84845e5893038a55bf1",
            "firstName": "Bolaji",
            "lastName": "Sonde",
            "email": "omobolajisonde@gmail.com",
            "createdAt": "2022-11-06T13:07:45.259Z",
            "__v": 0
        }
    }
}
```

`PATCH '/users/updateMyPassword'`

Sends a `PATCH` request to update the user associated with the <token> password.
>**Note** - This endpoint is used to update user password only. Use `/users/updateMe` to update other user info other than password.

- Header:
    - Authorization: Bearer {token}

- Request Body (JSON):
```json
{
    "currentPassword": "qwerty",
    "password": "123456",
    "confirmPassword": "123456"
}
```
- Response (JSON)

Success
```json
{
    "status": "success",
    "token": "<token>",
    "data": {
        "user": {
            "_id": "6367a84845e5893038a55bf1",
            "firstName": "Omobolaji",
            "lastName": "Sonde",
            "email": "omobolajisonde@gmail.com",
            "createdAt": "2022-11-06T13:07:45.259Z",
            "passwordModifiedAt": "2022-11-06T15:02:47.270Z"
        }
    }
}
```

`DELETE '/users/deleteMe'`
Sends a `DELETE` request to delete the user associated with the <token>.

- Header:
    - Authorization: Bearer {token}

- Request Body: None
- Response (JSON):

Success
```json
{}
```
---

## Deployment
https://blog-cm7d.onrender.com/api/v1

## Authors
[Sonde Omobolaji](https://github.com/omobolajisonde) 

## Acknowledgements 
The awesome team at Altschool.