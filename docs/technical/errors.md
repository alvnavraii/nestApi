
# Error Handling

## Overview
This guide details the standard error responses and handling mechanisms in the E-commerce API.

## HTTP Status Codes

### Common Status Codes
| Code | Status | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side error |

## Error Response Format

### Standard Error Structure
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error type"
}
```

### Validation Error Structure
```json
{
  "statusCode": 422,
  "message": [
    "email must be an email",
    "password should not be empty"
  ],
  "error": "Unprocessable Entity"
}
```

## Common Error Types

### Authentication Errors

#### Invalid Credentials
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### Token Expired
```json
{
  "statusCode": 401,
  "message": "Token expired",
  "error": "Unauthorized"
}
```

### Authorization Errors

#### Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### Resource Errors

#### Not Found
```json
{
  "statusCode": 404,
  "message": "Resource with ID {id} not found",
  "error": "Not Found"
}
```

#### Validation Failed
```json
{
  "statusCode": 400,
  "message": ["property should not be empty"],
  "error": "Bad Request"
}
```

## Database Errors

### Connection Errors
```json
{
  "statusCode": 500,
  "message": "Database connection error",
  "error": "Internal Server Error"
}
```

### Constraint Violations
```json
{
  "statusCode": 400,
  "message": "Unique constraint violation",
  "error": "Bad Request"
}
```

## Error Handling Best Practices

### Client-Side Handling
1. **Always check status codes**
```typescript
try {
  const response = await fetch('/api/resource');
  if (!response.ok) {
    const error = await response.json();
    handleError(error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

2. **Token Refresh Flow**
```typescript
async function handleTokenExpiration() {
  try {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });
    if (response.ok) {
      const { access_token } = await response.json();
      // Update token and retry original request
    }
  } catch (error) {
    // Redirect to login
  }
}
```

### Server-Side Handling
1. **Use HTTP Exceptions**
```typescript
throw new HttpException('Message', HttpStatus.BAD_REQUEST);
```

2. **Custom Error Filters**
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        message: exception.message,
        timestamp: new Date().toISOString()
      });
  }
}
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Authentication Failed
1. Check if token is included in Authorization header
2. Verify token format and expiration
3. Ensure user credentials are correct

#### Permission Denied
1. Verify user role assignments
2. Check required permissions for endpoint
3. Ensure token contains correct role claims

#### Resource Not Found
1. Verify resource ID exists
2. Check if resource is soft-deleted
3. Confirm database connection

## Next Steps
- [API Documentation](../api/authentication.md)
- [Security Guide](security.md)
- [Database Structure](database.md) 