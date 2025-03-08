
# Response Format

## Overview
This document details the standard response format used across the E-commerce API.

## Standard Response Structure

### Success Response
```json
{
  "data": {
    "id": 1,
    "name": "Example",
    "audit": {
      "createdAt": "14/03/2024, 12:00:00",
      "updatedAt": "14/03/2024, 12:00:00",
      "createdBy": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "updatedBy": null
    }
  }
}
```

### List Response
```json
{
  "data": [
    {
      "id": 1,
      "name": "Example 1",
      "audit": {
        "createdAt": "14/03/2024, 12:00:00",
        "updatedAt": "14/03/2024, 12:00:00",
        "createdBy": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe"
        },
        "updatedBy": null
      }
    }
  ]
}
```

## Audit Information

### Audit Fields
All responses include an `audit` object with:
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `createdBy`: User who created the record
- `updatedBy`: User who last updated the record

### Date Format
Dates are formatted according to the Spanish locale:
```typescript
new Date().toLocaleString('es-ES')
// Output: "14/03/2024, 12:00:00"
```

## Transform Interceptor

### Implementation
```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private formatDate(date: Date | string | null): string | null {
    if (!date) return null;
    return new Date(date).toLocaleString('es-ES');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data) return null;
        return this.transformItem(data);
      }),
    );
  }
}
```

### Usage
```typescript
@Controller('resource')
@UseInterceptors(TransformInterceptor)
export class ResourceController {
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error type"
}
```

### Validation Error Format
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

## Response Examples

### Categories Response
```json
{
  "id": 1,
  "name": "Electronics",
  "description": "Electronic products",
  "imageUrl": null,
  "isActive": true,
  "displayOrder": 1,
  "children": [],
  "audit": {
    "createdAt": "14/03/2024, 12:00:00",
    "updatedAt": "14/03/2024, 12:00:00",
    "createdBy": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    },
    "updatedBy": null
  }
}
```

### Countries Response
```json
{
  "id": 1,
  "isoCode": "ES",
  "isoCode3": "ESP",
  "isActive": 1,
  "isDefault": 1,
  "audit": {
    "createdAt": "14/03/2024, 12:00:00",
    "updatedAt": "14/03/2024, 12:00:00",
    "createdBy": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    },
    "updatedBy": null
  }
}
```

### Languages Response
```json
{
  "id": 1,
  "name": "English",
  "code": "EN",
  "isDefault": true,
  "isActive": true,
  "audit": {
    "createdAt": "14/03/2024, 12:00:00",
    "updatedAt": "14/03/2024, 12:00:00",
    "createdBy": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    },
    "updatedBy": null
  }
}
```

## Next Steps
- [Error Handling](errors.md)
- [Database Structure](database.md)
- [Security Documentation](security.md) 