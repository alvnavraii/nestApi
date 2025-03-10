# 🌐 Traducciones de Países

API para gestionar las traducciones de países en múltiples idiomas.

## 📝 Endpoints

### Obtener Todas las Traducciones

```http
GET /countries-trad
```

**Roles permitidos:** ADMIN, USER

**Respuesta exitosa:**
```json
[
  {
    "id": 5,
    "name": "España",
    "language": {
      "id": 1,
      "isoCode": "es_ES",
      "name": "Español",
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

### Obtener Traducciones Inactivas

```http
GET /countries-trad/inactive
```

**Roles permitidos:** ADMIN

**Respuesta exitosa:**
```json
[
  {
    "id": 10,
    "name": "Irlanda",
    "language": {
      "id": 1,
      "isoCode": "es_ES",
      "name": "Español",
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

### Obtener una Traducción

```http
GET /countries-trad/:id
```

**Roles permitidos:** ADMIN, USER

**Parámetros:**
- `id`: ID de la traducción (número)

**Respuesta exitosa:**
```json
{
  "id": 5,
  "name": "España",
  "language": {
    "id": 1,
    "isoCode": "es_ES",
    "name": "Español",
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

### Crear una Traducción

```http
POST /countries-trad
```

**Roles permitidos:** ADMIN

**Cuerpo de la solicitud:**
```json
{
  "name": "España",
  "countryId": 1,
  "languageId": 1
}
```

**Respuesta exitosa:**
```json
{
  "id": 5,
  "name": "España",
  "language": {
    "id": 1,
    "isoCode": "es_ES",
    "name": "Español"
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

### Actualizar una Traducción

```http
PATCH /countries-trad/:id
```

**Roles permitidos:** ADMIN

**Parámetros:**
- `id`: ID de la traducción (número)

**Cuerpo de la solicitud:**
```json
{
  "name": "España actualizado"
}
```

**Respuesta exitosa:**
```json
{
  "id": 5,
  "name": "España actualizado",
  "language": {
    "id": 1,
    "isoCode": "es_ES",
    "name": "Español"
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

### Desactivar una Traducción

```http
DELETE /countries-trad/:id
```

**Roles permitidos:** ADMIN

**Parámetros:**
- `id`: ID de la traducción (número)

**Respuesta exitosa:**
```json
{
  "message": "Traducción eliminada correctamente",
  "deleted": {
    "id": 5,
    "name": "España",
    "language": {
      "id": 1,
      "isoCode": "es_ES",
      "name": "Español"
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
}
```

## ⚠️ Códigos de Error

- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: Token de autenticación no proporcionado o inválido
- `403 Forbidden`: El rol del usuario no tiene permisos para esta operación
- `404 Not Found`: Traducción no encontrada
- `500 Internal Server Error`: Error interno del servidor
