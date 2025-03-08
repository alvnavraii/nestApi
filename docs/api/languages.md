<link rel="stylesheet" href="../styles/website.css">
<script src="../scripts/theme.js"></script>

# Languages API

## Overview
The Languages API provides endpoints for managing system languages and localization.

## Endpoints

### Get All Languages
**GET** `/languages`

Returns all languages in the system.

#### Authorization
- Required roles: `ADMIN`, `USER`

#### Response
```json
[
    {
        "id": 1,
        "name": "English",
        "code": "EN",
        "isDefault": true,
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

### Get Active Languages
**GET** `/languages/active`

Returns only active languages.

#### Authorization
- Required roles: `ADMIN`, `USER`

### Get Language by ID
**GET** `/languages/{id}`

Returns a specific language.

#### Authorization
- Required roles: `ADMIN`, `USER`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Language ID |

#### Response
```json
{
    "id": 1,
    "name": "English",
    "code": "EN",
    "isDefault": true,
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

### Create Language
**POST** `/languages`

Creates a new language.

#### Authorization
- Required role: `ADMIN`

#### Request Body
```json
{
    "name": "English",
    "code": "EN",
    "isDefault": true,
    "isActive": true
}
```

### Update Language
**PATCH** `/languages/{id}`

Updates an existing language.

#### Authorization
- Required role: `ADMIN`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Language ID |

#### Request Body
```json
{
    "name": "Updated English",
    "isActive": false
}
```

### Delete Language
**DELETE** `/languages/{id}`

Soft deletes a language by setting isActive to false.

#### Authorization
- Required role: `ADMIN`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Language ID |

## Error Responses

### Not Found
```json
{
    "statusCode": 404,
    "message": "Language with ID {id} not found"
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