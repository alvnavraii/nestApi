/*
    E-COMMERCE MULTIIDIOMA - SCRIPT COMPLETO
    =======================================
*/

-- Eliminación de objetos existentes
BEGIN
    -- 1. Primero eliminamos las vistas
    FOR r IN (SELECT view_name FROM user_views) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP VIEW ' || r.view_name;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;

    -- 2. Eliminamos los triggers
    FOR r IN (SELECT trigger_name FROM user_triggers) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TRIGGER ' || r.trigger_name;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;

    -- 3. Eliminamos los packages
    FOR r IN (SELECT object_name FROM user_objects WHERE object_type = 'PACKAGE') LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP PACKAGE ' || r.object_name;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;

    -- 4. Eliminamos las tablas que usan los tipos
    FOR table_name IN (
        SELECT table_name 
        FROM user_tables 
        WHERE table_name IN ('WAREHOUSES', 'ORDERS')
    ) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE ' || table_name.table_name || ' CASCADE CONSTRAINTS';
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;

    -- 5. Eliminamos el resto de tablas
    FOR table_name IN (
        SELECT table_name 
        FROM user_tables 
        WHERE table_name NOT IN ('WAREHOUSES', 'ORDERS')
    ) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE ' || table_name.table_name || ' CASCADE CONSTRAINTS';
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;

    -- 6. Eliminamos los tipos específicamente en orden
    BEGIN
        EXECUTE IMMEDIATE 'DROP TYPE address_type FORCE';
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        EXECUTE IMMEDIATE 'DROP TYPE product_attributes_type FORCE';
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END;
/

-- Tipos de datos personalizados
CREATE OR REPLACE TYPE address_type AS OBJECT (
    street VARCHAR2(100),
    city VARCHAR2(50),
    state VARCHAR2(50),
    postal_code VARCHAR2(10),
    country VARCHAR2(50)
);
/

CREATE OR REPLACE TYPE product_attributes_type AS OBJECT (
    name VARCHAR2(50),
    value VARCHAR2(200)
);
/

-- Package de utilidades (necesario para los triggers)
CREATE OR REPLACE PACKAGE util_pkg AS
    FUNCTION get_current_user_id RETURN NUMBER;
    FUNCTION is_valid_email(p_email IN VARCHAR2) RETURN BOOLEAN;
    FUNCTION generate_slug(p_text IN VARCHAR2) RETURN VARCHAR2;
END util_pkg;
/

CREATE OR REPLACE PACKAGE BODY util_pkg AS
    FUNCTION get_current_user_id RETURN NUMBER IS
    BEGIN
        RETURN NVL(TO_NUMBER(SYS_CONTEXT('USERENV', 'CLIENT_IDENTIFIER')), -1);
    END;
    
    FUNCTION is_valid_email(p_email IN VARCHAR2) RETURN BOOLEAN IS
        v_pattern VARCHAR2(255) := '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    BEGIN
        RETURN REGEXP_LIKE(p_email, v_pattern);
    END;
    
    FUNCTION generate_slug(p_text IN VARCHAR2) RETURN VARCHAR2 IS
        v_slug VARCHAR2(4000);
    BEGIN
        v_slug := LOWER(p_text);
        v_slug := REGEXP_REPLACE(v_slug, '[^a-z0-9]+', '-');
        v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '');
        RETURN v_slug;
    END;
END util_pkg;
/

-- 1. Primero creamos roles sin las FKs de auditoría
CREATE TABLE roles (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(50) NOT NULL UNIQUE,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER
);

-- 2. Luego creamos users con FK solo a roles (eliminado tax_id)
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id NUMBER NOT NULL,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    phone VARCHAR2(20),
    company_name VARCHAR2(200),
    website VARCHAR2(255),
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    last_login_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Insertamos el rol ADMIN sin validaciones de auditoría
INSERT INTO roles (code, name, description, created_by, updated_by) 
VALUES ('ADMIN', 'Administrador', 'Acceso total al sistema', NULL, NULL);

-- 4. Insertamos el usuario admin inicial
INSERT INTO users (
    role_id,
    first_name,
    last_name,
    email,
    password_hash,
    is_active,
    created_by,
    updated_by
) VALUES (
    (SELECT id FROM roles WHERE code = 'ADMIN'),
    'Admin',
    'System',
    'admin@system.com',
    'HASH_PENDIENTE_DE_GENERAR',
    1,
    NULL,
    NULL
);

-- 5. Ahora podemos añadir las FKs de auditoría
ALTER TABLE roles ADD CONSTRAINT fk_roles_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE roles ADD CONSTRAINT fk_roles_updated_by 
    FOREIGN KEY (updated_by) REFERENCES users(id);

ALTER TABLE users ADD CONSTRAINT fk_users_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE users ADD CONSTRAINT fk_users_updated_by 
    FOREIGN KEY (updated_by) REFERENCES users(id);

-- 6. Actualizamos el rol ADMIN y usuario admin con las referencias correctas
UPDATE roles 
SET created_by = (SELECT id FROM users WHERE email = 'admin@system.com')
WHERE code = 'ADMIN';

UPDATE users 
SET created_by = id
WHERE email = 'admin@system.com';

-- 7. Ahora podemos insertar el resto de roles
INSERT INTO roles (code, name, description, created_by) 
VALUES ('CUSTOMER', 'Cliente', 'Usuario final que realiza compras',
    (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO roles (code, name, description, created_by) 
VALUES ('VENDOR', 'Proveedor', 'Proveedor de productos',
    (SELECT id FROM users WHERE email = 'admin@system.com'));

COMMIT;

-- Categorías
CREATE TABLE categories (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id NUMBER,
    category_code VARCHAR2(50) NOT NULL UNIQUE,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id),
    CONSTRAINT fk_categories_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_categories_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Productos
CREATE TABLE products (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku VARCHAR2(50) NOT NULL UNIQUE,
    name VARCHAR2(200) NOT NULL,
    description CLOB,
    base_price NUMBER(10,2) NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_products_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Relación productos-categorías
CREATE TABLE product_categories (
    product_id NUMBER,
    category_id NUMBER,
    is_primary NUMBER(1) DEFAULT 0,
    display_order NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT pk_product_categories PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_pc_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_pc_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Almacenes
CREATE TABLE warehouses (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    address address_type,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_warehouses_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_warehouses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Inventario
CREATE TABLE inventory (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    warehouse_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    quantity NUMBER DEFAULT 0 NOT NULL,
    min_stock NUMBER DEFAULT 0,
    max_stock NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_inventory UNIQUE (warehouse_id, product_id),
    CONSTRAINT fk_inventory_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_inventory_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_inventory_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Movimientos de inventario
CREATE TABLE inventory_movements (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inventory_id NUMBER NOT NULL,
    movement_type VARCHAR2(20) NOT NULL,
    quantity NUMBER NOT NULL,
    reference_type VARCHAR2(20),
    reference_id NUMBER,
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_inv_mov_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    CONSTRAINT fk_inv_mov_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_inv_mov_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Órdenes
CREATE TABLE orders (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR2(20) NOT NULL,
    shipping_address address_type,
    billing_address address_type,
    subtotal NUMBER(10,2) NOT NULL,
    shipping_cost NUMBER(10,2) DEFAULT 0,
    tax_amount NUMBER(10,2) DEFAULT 0,
    total_amount NUMBER(10,2) NOT NULL,
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_orders_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Items de orden
CREATE TABLE order_items (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    quantity NUMBER NOT NULL,
    unit_price NUMBER(10,2) NOT NULL,
    discount_amount NUMBER(10,2) DEFAULT 0,
    total_amount NUMBER(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_order_items_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_order_items_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Carrito de compras
CREATE TABLE shopping_carts (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    session_id VARCHAR2(100),
    status VARCHAR2(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_cart_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_cart_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Items del carrito
CREATE TABLE cart_items (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    quantity NUMBER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES shopping_carts(id),
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_cart_items_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_cart_items_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Vistas
CREATE OR REPLACE VIEW vw_product_inventory AS
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.base_price,
    i.warehouse_id,
    w.name AS warehouse_name,
    i.quantity,
    i.min_stock,
    i.max_stock
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN warehouses w ON i.warehouse_id = w.id;

CREATE OR REPLACE VIEW vw_order_details AS
SELECT 
    o.id AS order_id,
    o.order_date,
    o.status,
    o.total_amount,
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email AS customer_email,
    oi.product_id,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price,
    oi.total_amount AS item_total
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;

-- Procedimiento para crear triggers de auditoría para todas las tablas
CREATE OR REPLACE PROCEDURE create_audit_triggers IS
    v_sql VARCHAR2(4000);
BEGIN
    FOR r IN (
        SELECT table_name 
        FROM user_tables 
        WHERE table_name NOT LIKE 'VW_%'
        ORDER BY table_name  -- Añadido orden para consistencia
    ) LOOP
        v_sql := '
        CREATE OR REPLACE TRIGGER trg_' || LOWER(r.table_name) || '_biu
            BEFORE INSERT OR UPDATE ON ' || r.table_name || '
            FOR EACH ROW
        BEGIN
            IF INSERTING THEN
                :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
                :NEW.created_at := LOCALTIMESTAMP;
            ELSIF UPDATING THEN
                :NEW.updated_at := LOCALTIMESTAMP;
                :NEW.updated_by := util_pkg.get_current_user_id();
            END IF;
        END;';
        
        EXECUTE IMMEDIATE v_sql;
    END LOOP;
END;
/

-- Ejecutar creación de triggers (movido después de todas las tablas)
BEGIN
    create_audit_triggers;
END;
/

-- Datos de ejemplo
-- Categorías
INSERT INTO categories (category_code, parent_id, created_by) 
VALUES ('ELECTRONICS', NULL, (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO categories (category_code, parent_id, created_by) 
VALUES ('CLOTHING', NULL, (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO categories (category_code, parent_id, created_by) 
VALUES ('PHONES', 
    (SELECT id FROM categories WHERE category_code = 'ELECTRONICS'),
    (SELECT id FROM users WHERE email = 'admin@system.com'));

-- Productos
INSERT INTO products (sku, name, description, base_price, created_by) 
VALUES ('PHONE001', 'Smartphone X', 'Último modelo de smartphone', 699.99,
    (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO products (sku, name, description, base_price, created_by) 
VALUES ('SHIRT001', 'Camisa Casual', 'Camisa de algodón 100%', 29.99,
    (SELECT id FROM users WHERE email = 'admin@system.com'));

-- Almacén
INSERT INTO warehouses (name, address, created_by) 
VALUES ('Almacén Principal', 
    address_type('Calle Principal 123', 'Ciudad', 'Estado', '12345', 'País'),
    (SELECT id FROM users WHERE email = 'admin@system.com'));

-- Inventario inicial
INSERT INTO inventory (warehouse_id, product_id, quantity, min_stock, max_stock, created_by)
SELECT w.id, p.id, 100, 10, 200, (SELECT id FROM users WHERE email = 'admin@system.com')
FROM warehouses w, products p
WHERE w.name = 'Almacén Principal'
AND p.sku IN ('PHONE001', 'SHIRT001');

COMMIT;

-- Tablas para gestión de impuestos
CREATE TABLE tax_zones (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(50) NOT NULL UNIQUE,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_tax_zones_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_tax_zones_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE tax_types (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(50) NOT NULL UNIQUE,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    percentage NUMBER(5,2) NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_tax_types_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_tax_types_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE product_tax_rates (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id NUMBER NOT NULL,
    tax_zone_id NUMBER NOT NULL,
    tax_type_id NUMBER NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_ptr_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_ptr_tax_zone FOREIGN KEY (tax_zone_id) REFERENCES tax_zones(id),
    CONSTRAINT fk_ptr_tax_type FOREIGN KEY (tax_type_id) REFERENCES tax_types(id),
    CONSTRAINT fk_ptr_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_ptr_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT uk_product_tax_zone UNIQUE (product_id, tax_zone_id, valid_from)
);

-- Datos de ejemplo para zonas fiscales y tipos de impuestos
INSERT INTO tax_zones (code, name, description, created_by) 
VALUES ('ES-PEN', 'España Península', 'Territorio fiscal de España peninsular',
    (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO tax_zones (code, name, description, created_by) 
VALUES ('ES-CAN', 'Islas Canarias', 'Territorio fiscal de las Islas Canarias',
    (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO tax_types (code, name, description, percentage, created_by) 
VALUES ('IVA-GEN', 'IVA General', 'IVA general para península', 21.00,
    (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO tax_types (code, name, description, percentage, created_by) 
VALUES ('IVA-RED', 'IVA Reducido', 'IVA reducido para productos básicos', 10.00,
    (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO tax_types (code, name, description, percentage, created_by) 
VALUES ('IGIC-GEN', 'IGIC General', 'IGIC general para Canarias', 7.00,
    (SELECT id FROM users WHERE email = 'admin@system.com'));

-- Ejemplo de asignación de impuestos a productos
INSERT INTO product_tax_rates (
    product_id, 
    tax_zone_id, 
    tax_type_id, 
    valid_from, 
    created_by
) 
SELECT 
    p.id,
    (SELECT id FROM tax_zones WHERE code = 'ES-PEN'),
    (SELECT id FROM tax_types WHERE code = 'IVA-GEN'),
    TRUNC(SYSDATE),
    (SELECT id FROM users WHERE email = 'admin@system.com')
FROM products p
WHERE p.sku = 'PHONE001';

INSERT INTO product_tax_rates (
    product_id, 
    tax_zone_id, 
    tax_type_id, 
    valid_from, 
    created_by
) 
SELECT 
    p.id,
    (SELECT id FROM tax_zones WHERE code = 'ES-CAN'),
    (SELECT id FROM tax_types WHERE code = 'IGIC-GEN'),
    TRUNC(SYSDATE),
    (SELECT id FROM users WHERE email = 'admin@system.com')
FROM products p
WHERE p.sku = 'PHONE001';

COMMIT;

-- Tabla de idiomas
CREATE TABLE languages (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(5) NOT NULL UNIQUE,
    name VARCHAR2(50) NOT NULL,
    is_default NUMBER(1) DEFAULT 0 NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_languages_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_languages_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Traducciones para categorías
CREATE TABLE category_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    slug VARCHAR2(150) NOT NULL,
    meta_title VARCHAR2(100),
    meta_description VARCHAR2(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_cat_trans_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_cat_trans_language FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_cat_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_cat_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT uk_category_lang_slug UNIQUE (language_id, slug)
);

-- Traducciones para productos
CREATE TABLE product_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(200) NOT NULL,
    description CLOB,
    slug VARCHAR2(250) NOT NULL,
    meta_title VARCHAR2(100),
    meta_description VARCHAR2(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_prod_trans_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_prod_trans_language FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_prod_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_prod_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT uk_product_lang_slug UNIQUE (language_id, slug)
);

-- Atributos de productos con traducciones
CREATE TABLE product_attributes (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id NUMBER NOT NULL,
    attribute_code VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_prod_attr_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_prod_attr_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_prod_attr_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT uk_product_attribute UNIQUE (product_id, attribute_code)
);

CREATE TABLE product_attribute_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attribute_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    value CLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_attr_trans_attribute FOREIGN KEY (attribute_id) REFERENCES product_attributes(id),
    CONSTRAINT fk_attr_trans_language FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_attr_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_attr_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT uk_attribute_translation UNIQUE (attribute_id, language_id)
);

-- Datos de ejemplo para idiomas
INSERT INTO languages (code, name, is_default, created_by) 
VALUES ('es_ES', 'Español', 1, (SELECT id FROM users WHERE email = 'admin@system.com'));

INSERT INTO languages (code, name, is_default, created_by) 
VALUES ('en_US', 'English', 0, (SELECT id FROM users WHERE email = 'admin@system.com'));

-- Modificar la vista de productos para incluir traducciones
CREATE OR REPLACE VIEW vw_product_details AS
SELECT 
    p.id AS product_id,
    p.sku,
    pt.name AS product_name,
    pt.description AS product_description,
    pt.slug AS product_slug,
    p.base_price,
    l.code AS language_code,
    c.category_code,
    ct.name AS category_name,
    ct.slug AS category_slug
FROM products p
JOIN product_translations pt ON p.id = pt.product_id
JOIN languages l ON pt.language_id = l.id
LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = 1
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language_id = l.id;

-- Package de funciones y procedimientos para el e-commerce
CREATE OR REPLACE PACKAGE pkg_ecommerce AS
    -- Funciones y procedimientos para productos
    FUNCTION get_product_stock(p_product_id IN NUMBER) RETURN NUMBER;
    FUNCTION get_product_revenue(p_product_id IN NUMBER, p_start_date IN DATE DEFAULT NULL, p_end_date IN DATE DEFAULT NULL) RETURN NUMBER;
    PROCEDURE update_product_price(p_product_id IN NUMBER, p_new_price IN NUMBER);
    
    -- Funciones y procedimientos para órdenes
    FUNCTION create_order(
        p_user_id IN NUMBER,
        p_shipping_address IN address_type,
        p_billing_address IN address_type
    ) RETURN NUMBER;
    
    PROCEDURE add_order_item(
        p_order_id IN NUMBER,
        p_product_id IN NUMBER,
        p_quantity IN NUMBER,
        p_unit_price IN NUMBER DEFAULT NULL
    );
    
    PROCEDURE update_order_status(
        p_order_id IN NUMBER,
        p_status IN VARCHAR2
    );
    
    -- Funciones y procedimientos para carrito
    FUNCTION create_cart(
        p_user_id IN NUMBER,
        p_session_id IN VARCHAR2 DEFAULT NULL
    ) RETURN NUMBER;
    
    PROCEDURE add_to_cart(
        p_cart_id IN NUMBER,
        p_product_id IN NUMBER,
        p_quantity IN NUMBER DEFAULT 1
    );
    
    -- Funciones y procedimientos para inventario
    PROCEDURE update_inventory(
        p_product_id IN NUMBER,
        p_warehouse_id IN NUMBER,
        p_quantity_change IN NUMBER,
        p_movement_type IN VARCHAR2,
        p_reference_type IN VARCHAR2 DEFAULT NULL,
        p_reference_id IN NUMBER DEFAULT NULL
    );
    
    FUNCTION get_available_stock(
        p_product_id IN NUMBER,
        p_warehouse_id IN NUMBER DEFAULT NULL
    ) RETURN NUMBER;
END pkg_ecommerce;
/

CREATE OR REPLACE PACKAGE BODY pkg_ecommerce AS
    -- Implementación get_product_stock
    FUNCTION get_product_stock(p_product_id IN NUMBER) RETURN NUMBER IS
        v_stock NUMBER := 0;
    BEGIN
        SELECT NVL(SUM(quantity), 0)
        INTO v_stock
        FROM inventory
        WHERE product_id = p_product_id;
        
        RETURN v_stock;
    END;
    
    -- Implementación get_product_revenue
    FUNCTION get_product_revenue(p_product_id IN NUMBER, p_start_date IN DATE DEFAULT NULL, p_end_date IN DATE DEFAULT NULL) 
    RETURN NUMBER IS
        v_revenue NUMBER := 0;
    BEGIN
        SELECT NVL(SUM(oi.total_amount), 0)
        INTO v_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = p_product_id
        AND (p_start_date IS NULL OR o.order_date >= p_start_date)
        AND (p_end_date IS NULL OR o.order_date <= p_end_date);
        
        RETURN v_revenue;
    END;
    
    -- Implementación update_product_price
    PROCEDURE update_product_price(p_product_id IN NUMBER, p_new_price IN NUMBER) IS
    BEGIN
        UPDATE products
        SET base_price = p_new_price
        WHERE id = p_product_id;
        
        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'Producto no encontrado');
        END IF;
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
    
    -- Implementación create_order
    FUNCTION create_order(
        p_user_id IN NUMBER,
        p_shipping_address IN address_type,
        p_billing_address IN address_type
    ) RETURN NUMBER IS
        v_order_id NUMBER;
    BEGIN
        INSERT INTO orders (
            user_id,
            status,
            shipping_address,
            billing_address,
            subtotal,
            total_amount
        ) VALUES (
            p_user_id,
            'PENDING',
            p_shipping_address,
            p_billing_address,
            0,
            0
        ) RETURNING id INTO v_order_id;
        
        RETURN v_order_id;
    END;
    
    -- Implementación add_order_item
    PROCEDURE add_order_item(
        p_order_id IN NUMBER,
        p_product_id IN NUMBER,
        p_quantity IN NUMBER,
        p_unit_price IN NUMBER DEFAULT NULL
    ) IS
        v_unit_price NUMBER;
        v_total_amount NUMBER;
    BEGIN
        -- Obtener precio si no se especifica
        IF p_unit_price IS NULL THEN
            SELECT base_price INTO v_unit_price
            FROM products
            WHERE id = p_product_id;
        ELSE
            v_unit_price := p_unit_price;
        END IF;
        
        v_total_amount := v_unit_price * p_quantity;
        
        -- Insertar item
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_amount
        ) VALUES (
            p_order_id,
            p_product_id,
            p_quantity,
            v_unit_price,
            v_total_amount
        );
        
        -- Actualizar totales de la orden
        UPDATE orders
        SET subtotal = subtotal + v_total_amount,
            total_amount = total_amount + v_total_amount
        WHERE id = p_order_id;
        
        -- Actualizar inventario
        update_inventory(
            p_product_id => p_product_id,
            p_warehouse_id => NULL, -- Se tomará el primer almacén disponible
            p_quantity_change => -p_quantity,
            p_movement_type => 'ORDER',
            p_reference_type => 'ORDER',
            p_reference_id => p_order_id
        );
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
    
    -- Implementación update_order_status
    PROCEDURE update_order_status(
        p_order_id IN NUMBER,
        p_status IN VARCHAR2
    ) IS
    BEGIN
        UPDATE orders
        SET status = p_status
        WHERE id = p_order_id;
        
        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'Orden no encontrada');
        END IF;
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
    
    -- Implementación create_cart
    FUNCTION create_cart(
        p_user_id IN NUMBER,
        p_session_id IN VARCHAR2 DEFAULT NULL
    ) RETURN NUMBER IS
        v_cart_id NUMBER;
    BEGIN
        INSERT INTO shopping_carts (
            user_id,
            session_id,
            status
        ) VALUES (
            p_user_id,
            p_session_id,
            'ACTIVE'
        ) RETURNING id INTO v_cart_id;
        
        RETURN v_cart_id;
    END;
    
    -- Implementación add_to_cart
    PROCEDURE add_to_cart(
        p_cart_id IN NUMBER,
        p_product_id IN NUMBER,
        p_quantity IN NUMBER DEFAULT 1
    ) IS
        v_existing_quantity NUMBER;
    BEGIN
        -- Verificar si el producto ya está en el carrito
        BEGIN
            SELECT quantity
            INTO v_existing_quantity
            FROM cart_items
            WHERE cart_id = p_cart_id
            AND product_id = p_product_id;
            
            -- Actualizar cantidad existente
            UPDATE cart_items
            SET quantity = quantity + p_quantity
            WHERE cart_id = p_cart_id
            AND product_id = p_product_id;
            
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                -- Insertar nuevo item
                INSERT INTO cart_items (
                    cart_id,
                    product_id,
                    quantity
                ) VALUES (
                    p_cart_id,
                    p_product_id,
                    p_quantity
                );
        END;
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
    
    -- Implementación update_inventory
    PROCEDURE update_inventory(
        p_product_id IN NUMBER,
        p_warehouse_id IN NUMBER,
        p_quantity_change IN NUMBER,
        p_movement_type IN VARCHAR2,
        p_reference_type IN VARCHAR2 DEFAULT NULL,
        p_reference_id IN NUMBER DEFAULT NULL
    ) IS
        v_warehouse_id NUMBER := p_warehouse_id;
        v_inventory_id NUMBER;
    BEGIN
        -- Si no se especifica almacén, usar el primero disponible
        IF v_warehouse_id IS NULL THEN
            SELECT MIN(warehouse_id)
            INTO v_warehouse_id
            FROM inventory
            WHERE product_id = p_product_id
            AND quantity >= ABS(p_quantity_change);
            
            IF v_warehouse_id IS NULL THEN
                RAISE_APPLICATION_ERROR(-20003, 'No hay stock suficiente');
            END IF;
        END IF;
        
        -- Actualizar inventario
        UPDATE inventory
        SET quantity = quantity + p_quantity_change
        WHERE warehouse_id = v_warehouse_id
        AND product_id = p_product_id
        RETURNING id INTO v_inventory_id;
        
        -- Registrar movimiento
        INSERT INTO inventory_movements (
            inventory_id,
            movement_type,
            quantity,
            reference_type,
            reference_id
        ) VALUES (
            v_inventory_id,
            p_movement_type,
            p_quantity_change,
            p_reference_type,
            p_reference_id
        );
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
    
    -- Implementación get_available_stock
    FUNCTION get_available_stock(
        p_product_id IN NUMBER,
        p_warehouse_id IN NUMBER DEFAULT NULL
    ) RETURN NUMBER IS
        v_stock NUMBER := 0;
    BEGIN
        SELECT NVL(SUM(quantity), 0)
        INTO v_stock
        FROM inventory
        WHERE product_id = p_product_id
        AND (p_warehouse_id IS NULL OR warehouse_id = p_warehouse_id);
        
        RETURN v_stock;
    END;
    
END pkg_ecommerce;
/

COMMIT;

