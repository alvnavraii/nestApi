# 🛍️ E-commerce API

Modern RESTful API for e-commerce management, built with NestJS and Oracle Database.

## 🌟 Features

- 🔐 JWT Authentication
- 👥 User and role management
- 📁 Hierarchical category management
- 🌐 Multi-language support
- 📝 Complete audit trail
- 🔍 Optimized queries

## 🚀 Endpoints

### Authentication

POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}

### Categories

GET /categories
GET /categories/:id
POST /categories
PATCH /categories/:id
DELETE /categories/:id

Example of category creation:
{
  "name": "Electronics",
  "description": "Electronic products",
  "isActive": true,
  "parent_id": null
}

### Languages

GET /language
GET /language/:id

## 🔒 Security

The API uses several security levels:
- JWT Authentication
- User roles (ADMIN, USER)
- Custom guards
- Transform interceptors

## 📝 Response Structure

All responses include audit information:

{
  "id": 1,
  "name": "Example",
  "audit": {
    "createdAt": "1/3/2024, 10:30:00",
    "updatedAt": "2/3/2024, 15:45:00",
    "createdBy": {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User"
    },
    "updatedBy": null
  }
}

## 🛠️ Technologies

- NestJS
- TypeORM
- Oracle Database
- JWT
- TypeScript
- Class Validator
- Class Transformer

## 📦 Installation

1. Clone repository
git clone [repository-url]

2. Install dependencies
npm install

3. Configure environment variables
cp .env.example .env

4. Start application
npm run start:dev

## 🔧 Configuration

Create a `.env` file with the following variables:

BD_HOST=localhost
BD_PORT=1521
BD_SERVICE_NAME=xe
BD_USER=user
BD_PASSWORD=password
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION_TIME=24h

## 📄 License

[MIT](LICENSE)

## 👥 Contributing

Contributions are welcome. Please open an issue or pull request for suggestions.

## 📚 Additional Documentation

### Database Structure

Main tables include:
- USERS: User management
- CATEGORIES: Hierarchical categories
- LANGUAGES: Multi-language support

### Usage Examples

#### Authentication

// Login
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { access_token } = await response.json();

#### Get Categories

// Get all categories
const response = await fetch('/categories', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const categories = await response.json();

### Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

### Pagination

For endpoints that return lists, pagination can be used:
GET /categories?page=1&limit=10

### Filters

Some endpoints support filters:
GET /categories?isActive=true
GET /categories?parent_id=1

## 🤝 Support

For support, please contact [email@example.com](mailto:email@example.com)
