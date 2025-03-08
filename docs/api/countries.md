<link rel="stylesheet" href="../styles/website.css">
<script src="../scripts/theme.js"></script>

# Countries API

## Overview
The Countries API provides endpoints for managing country information in the system.

## Endpoints

### Get All Countries
**GET** `/countries`

Returns all countries.

#### Authorization
- Required roles: `ADMIN`, `USER`

#### Response
```json
[
    {
        "id": 1,
        "name": "Spain",
        "code": "ES",
        "isActive": true,
        "audit": {
            "createdAt": "2024-01-01T10:00:00",
            "updatedAt": "2024-01-01T10:00:00",
            "createdBy": {
                "id": 1,
                "firstName": "John",
                "lastName": "Doe"
            },
            "updatedBy": null
        }
    }
]
```

### Get Active Countries
**GET** `/countries/active`

Returns only active countries.

#### Authorization
- Required roles: `ADMIN`, `USER`

### Get Inactive Countries
**GET** `/countries/inactive`

Returns only inactive countries.

#### Authorization
- Required roles: `ADMIN`, `USER`

### Get Country by ID
**GET** `/countries/{id}`

Returns a specific country.

#### Authorization
- Required roles: `ADMIN`, `USER`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Country ID |

#### Response
```json
{
    "id": 1,
    "name": "Spain",
    "code": "ES",
    "isActive": true,
    "audit": {
        "createdAt": "2024-01-01T10:00:00",
        "updatedAt": "2024-01-01T10:00:00",
        "createdBy": {
            "id": 1,
            "firstName": "John",
            "lastName": "Doe"
        },
        "updatedBy": null
    }
}
```

### Create Country
**POST** `/countries`

Creates a new country.

#### Authorization
- Required role: `ADMIN`

#### Request Body
```json
{
    "name": "Spain",
    "code": "ES",
    "isActive": true
}
```

### Update Country
**PATCH** `/countries/{id}`

Updates an existing country.

#### Authorization
- Required role: `ADMIN`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Country ID |

#### Request Body
```json
{
    "name": "España",
    "isActive": false
}
```

### Delete Country
**DELETE** `/countries/{id}`

Soft deletes a country by setting isActive to false.

#### Authorization
- Required role: `ADMIN`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Country ID |

## Error Responses

### Not Found
```json
{
    "statusCode": 404,
    "message": "Country with ID {id} not found"
}
```

### Unauthorized
```json
{
    "statusCode": 401,
    "message": "Unauthorized"
}
```

### Forbidden
```json
{
    "statusCode": 403,
    "message": "Forbidden resource"
}
```

### Validation Error
```json
{
    "statusCode": 400,
    "message": ["code must be 2 characters", "name should not be empty"],
    "error": "Bad Request"
}
``` 