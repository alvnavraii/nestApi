<link rel="stylesheet" href="../styles/website.css">
<script src="../scripts/theme.js"></script>

# Configuration Guide

## Overview
This guide details the configuration steps needed to set up the E-commerce API, including database, JWT, and application settings.

## Environment Configuration

### Basic Setup
**Create .env File**
Create a `.env` file in the root directory with the following structure:
```properties
# Database Configuration
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE_NAME=xe
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Environment Variables

#### Database Settings
| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | Oracle database host | localhost |
| DB_PORT | Oracle database port | 1521 |
| DB_SERVICE_NAME | Oracle service name | xe |
| DB_USER | Database username | ecommerce |
| DB_PASSWORD | Database password | your_password |

#### JWT Settings
| Variable | Description | Example |
|----------|-------------|---------|
| JWT_SECRET | Secret key for JWT | generated_secret_key |
| JWT_EXPIRATION_TIME | Token expiration time | 24h |

## Database Configuration

### Oracle Setup
**Create Database User**
```sql
CREATE USER ecommerce IDENTIFIED BY your_password;
GRANT CONNECT, RESOURCE TO ecommerce;
GRANT CREATE SESSION TO ecommerce;
GRANT UNLIMITED TABLESPACE TO ecommerce;
```

### Run Migrations
```bash
npm run typeorm:run-migrations
```

### Verify Database Connection
```bash
npm run start:dev
```

Expected output:
```shell
[Nest] 1234  - MM/DD/YYYY, HH:mm:ss AM     LOG [TypeOrmModule] Database connection established
```

## Security Configuration

### JWT Setup
**Generate Secret Key**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CORS Configuration
Edit `src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
});
```

## Error Handling

### Common Configuration Issues

#### Database Connection Failed
**Error**
```shell
TypeORM connection error: ORA-12541: TNS:no listener
```

**Solution**
1. Verify Oracle service is running
```bash
lsnrctl status
```
2. Check connection settings in .env
3. Verify database user permissions

#### JWT Configuration Error
**Error**
```shell
Error: JWT_SECRET is not defined
```

**Solution**
1. Generate new JWT secret
2. Update .env file
3. Restart application

## Audit Configuration

### Enable Audit Logging
The system automatically tracks:
- Creation date/time
- Last update date/time
- Created by user
- Last updated by user

### Timezone Configuration
Default timezone is set to 'Europe/Madrid'. To modify:

```typescript
extra: {
  timezone: 'Europe/Madrid',
  formatOptions: {
    useNativeDate: true,
  },
}
```

## Next Steps
- [Quick Start Guide](quickstart.md)
- [API Documentation](../api/authentication.md)
- [Error Handling](../technical/errors.md) 