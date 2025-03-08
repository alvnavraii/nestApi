
# Database Structure

## Overview
The E-commerce API uses Oracle Database with a well-defined schema structure.

## Schema: ECOMMERCE

### Tables

#### Categories
```sql
CREATE TABLE categories (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id NUMBER,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    image_url VARCHAR2(255),
    is_active NUMBER(1) DEFAULT 1,
    display_order NUMBER,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_parent_category FOREIGN KEY (parent_id) REFERENCES categories(id),
    CONSTRAINT fk_category_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_category_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

#### Users
```sql
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    first_name VARCHAR2(100),
    last_name VARCHAR2(100),
    role_id NUMBER NOT NULL,
    is_active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_user_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_user_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

#### Languages
```sql
CREATE TABLE languages (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    code VARCHAR2(2) NOT NULL UNIQUE,
    is_default NUMBER(1) DEFAULT 0,
    is_active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_language_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_language_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

#### Countries
```sql
CREATE TABLE countries (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    iso_code VARCHAR2(2) NOT NULL UNIQUE,
    iso_code3 VARCHAR2(3) NOT NULL UNIQUE,
    is_active NUMBER(1) DEFAULT 1,
    is_default NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_country_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_country_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

## Audit Fields
All tables include standard audit fields:
- `created_at`: Timestamp of record creation
- `updated_at`: Timestamp of last update
- `created_by`: Reference to user who created the record
- `updated_by`: Reference to user who last updated the record

## Relationships

### Category Hierarchy
- Self-referential relationship through `parent_id`
- Allows unlimited nesting levels
- Maintains tree structure integrity

### User Roles
- Each user has one role
- Roles determine access permissions
- Default roles: ADMIN (1), USER (0)

## Indexes

### Categories
```sql
CREATE INDEX idx_category_parent ON categories(parent_id);
CREATE INDEX idx_category_active ON categories(is_active);
```

### Users
```sql
CREATE UNIQUE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role_id);
```

### Languages
```sql
CREATE UNIQUE INDEX idx_language_code ON languages(code);
CREATE INDEX idx_language_active ON languages(is_active);
```

### Countries
```sql
CREATE UNIQUE INDEX idx_country_iso ON countries(iso_code);
CREATE UNIQUE INDEX idx_country_iso3 ON countries(iso_code3);
```

## Next Steps
- [Security Documentation](security.md)
- [Error Handling](errors.md)
- [API Documentation](../api/authentication.md) 