# 🌐 Country Translations

API for managing country translations in multiple languages.

## 📝 Endpoints

### Get All Translations

```http
GET /countries-trad
```

**Allowed Roles:** ADMIN, USER

**Successful Response:**
```json
[
  {
    "id": 5,
    "name": "Spain",
    "language": {
      "id": 1,
      "isoCode": "en_US",
      "name": "English",
      "isActive": true,
      "isDefault": true
    },
    "country": {
      "id": 1,
      "isoCode": "ES",
      "isoCode3": "ESP",
      "isActive": true,
      "isDefault": false
    },
    "audit": {
      "createdAt": "9/3/2025, 16:33:27",
      "updatedAt": null
    }
  }
]
```

### Get Inactive Translations

```http
GET /countries-trad/inactive
```

**Allowed Roles:** ADMIN

**Successful Response:**
```json
[
  {
    "id": 10,
    "name": "Ireland",
    "language": {
      "id": 1,
      "isoCode": "en_US",
      "name": "English",
      "isActive": true,
      "isDefault": true
    },
    "country": {
      "id": 21,
      "isoCode": "IE",
      "isoCode3": "IRL",
      "isActive": true,
      "isDefault": false
    },
    "audit": {
      "createdAt": "9/3/2025, 17:10:20",
      "updatedAt": "9/3/2025, 16:12:54"
    }
  }
]
```

### Get a Translation

```http
GET /countries-trad/:id
```

**Allowed Roles:** ADMIN, USER

**Parameters:**
- `id`: Translation ID (number)

**Successful Response:**
```json
{
  "id": 5,
  "name": "Spain",
  "language": {
    "id": 1,
    "isoCode": "en_US",
    "name": "English",
    "isActive": true,
    "isDefault": true
  },
  "country": {
    "id": 1,
    "isoCode": "ES",
    "isoCode3": "ESP",
    "isActive": true,
    "isDefault": false
  },
  "audit": {
    "createdAt": "9/3/2025, 16:33:27",
    "updatedAt": null
  }
}
```

### Create a Translation

```http
POST /countries-trad
```

**Allowed Roles:** ADMIN

**Request Body:**
```json
{
  "name": "Spain",
  "countryId": 1,
  "languageId": 1
}
```

**Successful Response:**
```json
{
  "id": 5,
  "name": "Spain",
  "language": {
    "id": 1,
    "isoCode": "en_US",
    "name": "English"
  },
  "country": {
    "id": 1,
    "isoCode": "ES",
    "isoCode3": "ESP"
  },
  "audit": {
    "createdAt": "9/3/2025, 16:33:27",
    "updatedAt": null
  }
}
```

### Update a Translation

```http
PATCH /countries-trad/:id
```

**Allowed Roles:** ADMIN

**Parameters:**
- `id`: Translation ID (number)

**Request Body:**
```json
{
  "name": "Updated Spain"
}
```

**Successful Response:**
```json
{
  "id": 5,
  "name": "Updated Spain",
  "language": {
    "id": 1,
    "isoCode": "en_US",
    "name": "English"
  },
  "country": {
    "id": 1,
    "isoCode": "ES",
    "isoCode3": "ESP"
  },
  "audit": {
    "createdAt": "9/3/2025, 16:33:27",
    "updatedAt": "9/3/2025, 17:00:00"
  }
}
```

### Deactivate a Translation

```http
DELETE /countries-trad/:id
```

**Allowed Roles:** ADMIN

**Parameters:**
- `id`: Translation ID (number)

**Successful Response:**
```json
{
  "id": 5,
  "name": "Spain",
  "language": {
    "id": 1,
    "isoCode": "en_US",
    "name": "English"
  },
  "country": {
    "id": 1,
    "isoCode": "ES",
    "isoCode3": "ESP"
  },
  "audit": {
    "createdAt": "9/3/2025, 16:33:27",
    "updatedAt": "9/3/2025, 17:15:00"
  }
}
```

## ⚠️ Error Responses

- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: User doesn't have the required role
- `404 Not Found`: Translation not found
- `500 Internal Server Error`: Server error
