<link rel="stylesheet" href="../styles/website.css">
<script src="../scripts/theme.js"></script>

# Categories API

## Overview
The Categories API provides endpoints for managing hierarchical category structures.

## Endpoints

### Get All Categories
**GET** `/categories`

Returns all categories in a tree structure.

#### Authorization
- Required roles: `ADMIN`, `USER`

#### Response
```json
[
    {
        "id": 1,
        "name": "Electronics",
        "description": "Electronic products",
        "imageUrl": "https://example.com/electronics.jpg",
        "isActive": true,
        "displayOrder": 1,
        "children": [],
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

### Get Category by ID
**GET** `/categories/{id}`

Returns a specific category and its children.

#### Authorization
- Required roles: `ADMIN`, `USER`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Category ID |

#### Response
```json
{
    "id": 1,
    "name": "Electronics",
    "description": "Electronic products",
    "imageUrl": "https://example.com/electronics.jpg",
    "isActive": true,
    "displayOrder": 1,
    "children": [],
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

### Create Category
**POST** `/categories`

Creates a new category.

#### Authorization
- Required role: `ADMIN`

#### Request Body
```json
{
    "name": "Electronics",
    "description": "Electronic products",
    "imageUrl": "https://example.com/electronics.jpg",
    "isActive": true,
    "parent_id": null
}
```

#### Response
Returns the created category with audit information.

### Update Category
**PATCH** `/categories/{id}`

Updates an existing category.

#### Authorization
- Required role: `ADMIN`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Category ID |

#### Request Body
```json
{
    "name": "Updated Electronics",
    "description": "Updated description",
    "isActive": true
}
```

### Delete Category
**DELETE** `/categories/{id}`

Soft deletes a category by setting isActive to false.

#### Authorization
- Required role: `ADMIN`

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| id   | number | Category ID |

## Error Responses

### Not Found
```json
{
    "statusCode": 404,
    "message": "Category with ID {id} not found"
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