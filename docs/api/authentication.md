
# Authentication API

## Overview
The authentication API provides endpoints for user authentication and token management.

## Endpoints

### Login
**POST** `/auth/login`

Authenticates a user and returns a JWT token.

#### Request
```http
POST /auth/login
Content-Type: application/json
```

#### Request Body
```json
{
    "email": "user@example.com",
    "password": "password"
}
```

#### Response
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Response Codes
| Code | Description |
|------|-------------|
| 200  | Success. Returns JWT token |
| 401  | Invalid credentials |
| 422  | Validation error |

### Refresh Token
**POST** `/auth/refresh`

Refreshes an existing JWT token.

#### Request
```http
POST /auth/refresh
Authorization: Bearer <token>
```

#### Response
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Error Responses

### Invalid Credentials
```json
{
    "statusCode": 401,
    "message": "Invalid credentials",
    "error": "Unauthorized"
}
```

### Validation Error
```json
{
    "statusCode": 422,
    "message": ["email must be an email", "password should not be empty"],
    "error": "Unprocessable Entity"
}
``` 