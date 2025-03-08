<link rel="stylesheet" href="../styles/website.css">
<script src="../scripts/theme.js"></script>

# Quick Start Guide

## Overview
This guide will help you get started with the E-commerce API, including authentication, basic CRUD operations, and common use cases.

## Authentication

### Create Admin User
**POST** `/auth/registro`

Create your first admin user to manage the system.

#### Request
```bash
curl -X POST http://localhost:3000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password",
    "firstName": "Admin",
    "lastName": "User",
    "roleId": 1
  }'
```

### Login
**POST** `/auth/login`

Obtain an authentication token.

#### Request
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

#### Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Basic Operations

### Categories Management

#### Create Category
**POST** `/categories`
```bash
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic products",
    "isActive": true
  }'
```

#### Get Categories
**GET** `/categories`
```bash
curl -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer your_token"
```

### Languages Management

#### Add Language
**POST** `/languages`
```bash
curl -X POST http://localhost:3000/languages \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "English",
    "code": "EN",
    "isDefault": true,
    "isActive": true
  }'
```

### Countries Management

#### Add Country
**POST** `/countries`
```bash
curl -X POST http://localhost:3000/countries \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "isoCode": "ES",
    "isoCode3": "ESP",
    "isActive": 1,
    "isDefault": 1
  }'
```

## Role-Based Access Control

### Available Roles
| Role ID | Name  | Description |
|---------|-------|-------------|
| 1       | ADMIN | Full system access |
| 0       | USER  | Read-only access |

### Endpoints by Role

#### Admin Access
- Create/Update/Delete Categories
- Manage Languages
- Manage Countries
- User Management

#### User Access
- View Categories
- View Languages
- View Countries

## Error Handling

### Common Error Responses

#### Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

#### Validation Error
```json
{
  "statusCode": 400,
  "message": ["property should not be empty"]
}
```

## Best Practices

### Authentication
- Always include the JWT token in the Authorization header
- Tokens expire after 24 hours
- Store tokens securely

### API Requests
- Use appropriate HTTP methods
- Include Content-Type header
- Handle errors appropriately
- Validate input data

## Next Steps
- Review [API Documentation](../api/authentication.md)
- Learn about [Database Structure](../technical/database.md)
- Explore [Error Handling](../technical/errors.md) 