
# Installation Guide

## Overview
This guide provides step-by-step instructions for installing and setting up the E-commerce API.

## Prerequisites

### Required Software
- Node.js (v18 or higher)
- npm (v9 or higher)
- Oracle Database (19c or higher)
- Git

### Oracle Client Installation

#### Windows
**Download and Install**
1. Visit [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html)
2. Download Basic Package
3. Extract to `C:\oracle\instantclient_19_20`
4. Add to PATH:
```shell
setx PATH "%PATH%;C:\oracle\instantclient_19_20"
```

#### Linux
**Install Dependencies**
```bash
sudo apt-get update
sudo apt-get install libaio1
```

**Configure Oracle Client**
```bash
sudo sh -c "echo /opt/oracle/instantclient_19_20 > /etc/ld.so.conf.d/oracle-instantclient.conf"
sudo ldconfig
```

#### MacOS
**Using Homebrew**
```bash
brew install instantclient-basic
brew install instantclient-sdk
```

## Installation Steps

### Clone Repository
**HTTPS**
```bash
git clone https://github.com/yourusername/e-commerce-api
cd e-commerce-api
```

**SSH**
```bash
git clone git@github.com:yourusername/e-commerce-api.git
cd e-commerce-api
```

### Install Dependencies
```bash
npm install
```

### Configure Environment
Create `.env` file in root directory:
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

### Run Database Migrations
```bash
npm run typeorm:run-migrations
```

### Start Application
**Development Mode**
```bash
npm run start:dev
```

**Production Mode**
```bash
npm run build
npm run start:prod
```

## Verification

### Health Check
**GET** `/health`

Verifies if the application is running correctly.

#### Response
```json
{
    "status": "ok",
    "timestamp": "2024-03-14T12:00:00.000Z"
}
```

## Common Issues

### Oracle Client Not Found
**Error**
```shell
DPI-1047: Cannot locate an Oracle Client library
```

**Solution**
1. Verify Oracle Client installation
2. Check PATH environment variable
3. Restart terminal/IDE

### Database Connection Failed
**Error**
```shell
ORA-12541: TNS:no listener
```

**Solution**
1. Verify database is running
2. Check connection settings in .env
3. Test connection with SQL*Plus

### Port Already in Use
**Error**
```shell
EADDRINUSE: address already in use :::3000
```

**Solution**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

## Next Steps
- [Configuration Guide](configuration.md)
- [Quick Start Guide](quickstart.md)
- [API Documentation](../api/authentication.md) 