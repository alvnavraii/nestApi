/*
    E-COMMERCE MULTIIDIOMA - SCRIPT COMPLETO
    =======================================
    
    Incluye:
    - Estructura completa de la base de datos
    - Triggers de auditoría
    - Datos de ejemplo
*/

-- Eliminación de objetos existentes
DECLARE
    v_count NUMBER;
    PROCEDURE drop_if_exists(p_type VARCHAR2, p_name VARCHAR2) IS
    BEGIN
        EXECUTE IMMEDIATE 'DROP ' || p_type || ' ' || p_name ||
        CASE p_type 
            WHEN 'TABLE' THEN ' CASCADE CONSTRAINTS'
            ELSE ''
        END;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
BEGIN
    FOR r IN (SELECT trigger_name FROM user_triggers) LOOP
        drop_if_exists('TRIGGER', r.trigger_name);
    END LOOP;
    
    FOR r IN (SELECT view_name FROM user_views) LOOP
        drop_if_exists('VIEW', r.view_name);
    END LOOP;
    
    FOR r IN (SELECT table_name FROM user_tables) LOOP
        drop_if_exists('TABLE', r.table_name);
    END LOOP;
    
    FOR r IN (SELECT object_name FROM user_objects WHERE object_type = 'PACKAGE') LOOP
        drop_if_exists('PACKAGE', r.object_name);
    END LOOP;
END;
/

-- Package de utilidades modificado
CREATE OR REPLACE PACKAGE util_pkg AS
    -- Constante para usuario del sistema
    c_system_user_id CONSTANT NUMBER := -1;
    
    -- Procedimiento para establecer el usuario actual en la sesión
    PROCEDURE set_current_user(p_user_id IN NUMBER);
    
    -- Función para obtener el usuario actual
    FUNCTION get_current_user_id RETURN NUMBER;
    
    FUNCTION is_valid_email(p_email IN VARCHAR2) RETURN BOOLEAN;
    FUNCTION generate_slug(p_text IN VARCHAR2) RETURN VARCHAR2;
END util_pkg;
/

CREATE OR REPLACE PACKAGE BODY util_pkg AS
    -- Establece el ID de usuario en el contexto de la sesión
    PROCEDURE set_current_user(p_user_id IN NUMBER) IS
    BEGIN
        DBMS_SESSION.SET_IDENTIFIER(TO_CHAR(p_user_id));
    END;
    
    -- Obtiene el ID de usuario del contexto de la sesión
    FUNCTION get_current_user_id RETURN NUMBER IS
        v_user_id NUMBER;
    BEGIN
        -- Intenta obtener el ID de usuario de la sesión
        BEGIN
            v_user_id := TO_NUMBER(SYS_CONTEXT('USERENV', 'CLIENT_IDENTIFIER'));
        EXCEPTION
            WHEN OTHERS THEN
                v_user_id := NULL;
        END;
        
        -- Si no hay usuario en la sesión, devuelve el usuario del sistema
        RETURN NVL(v_user_id, c_system_user_id);
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

-- Tablas base del sistema

-- Usuarios y autenticación
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    phone VARCHAR2(20),
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER
);

ALTER TABLE users ADD CONSTRAINT fk_users_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE users ADD CONSTRAINT fk_users_updated_by 
    FOREIGN KEY (updated_by) REFERENCES users(id);

CREATE TABLE users_auth (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    last_login TIMESTAMP,
    user_type VARCHAR2(20) CHECK (user_type IN ('ADMIN', 'CUSTOMER', 'VENDOR')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_users_auth_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_users_auth_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_users_auth_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Idiomas
CREATE TABLE languages (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(5) NOT NULL UNIQUE,
    name VARCHAR2(50) NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    is_default NUMBER(1) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_languages_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_languages_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Países y direcciones
CREATE TABLE countries (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    iso_code VARCHAR2(2) NOT NULL UNIQUE,
    iso_code3 VARCHAR2(3) NOT NULL UNIQUE,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_countries_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_countries_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE country_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_country_trans UNIQUE (country_id, language_id),
    CONSTRAINT fk_country_trans_country FOREIGN KEY (country_id) REFERENCES countries(id),
    CONSTRAINT fk_country_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_country_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_country_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE regions (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id NUMBER NOT NULL,
    region_code VARCHAR2(10) NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_region_code UNIQUE (country_id, region_code),
    CONSTRAINT fk_regions_country FOREIGN KEY (country_id) REFERENCES countries(id),
    CONSTRAINT fk_regions_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_regions_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE region_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    region_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_region_trans UNIQUE (region_id, language_id),
    CONSTRAINT fk_region_trans_region FOREIGN KEY (region_id) REFERENCES regions(id),
    CONSTRAINT fk_region_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_region_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_region_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE cities (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    region_id NUMBER NOT NULL,
    city_code VARCHAR2(10) NOT NULL,
    postal_code_pattern VARCHAR2(20),
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_city_code UNIQUE (region_id, city_code),
    CONSTRAINT fk_cities_region FOREIGN KEY (region_id) REFERENCES regions(id),
    CONSTRAINT fk_cities_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_cities_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE city_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    city_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_city_trans UNIQUE (city_id, language_id),
    CONSTRAINT fk_city_trans_city FOREIGN KEY (city_id) REFERENCES cities(id),
    CONSTRAINT fk_city_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_city_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_city_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE address_types (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(20) NOT NULL UNIQUE,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_addr_types_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_addr_types_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE address_type_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    address_type_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_addr_type_trans UNIQUE (address_type_id, language_id),
    CONSTRAINT fk_addr_type_trans_type FOREIGN KEY (address_type_id) REFERENCES address_types(id),
    CONSTRAINT fk_addr_type_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_addr_type_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_addr_type_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE addresses (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    city_id NUMBER NOT NULL,
    address_type_id NUMBER NOT NULL,
    street VARCHAR2(200) NOT NULL,
    postal_code VARCHAR2(20) NOT NULL,
    additional_info VARCHAR2(200),
    is_default NUMBER(1) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_addresses_city FOREIGN KEY (city_id) REFERENCES cities(id),
    CONSTRAINT fk_addresses_type FOREIGN KEY (address_type_id) REFERENCES address_types(id),
    CONSTRAINT fk_addresses_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_addresses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Marcas
CREATE TABLE brands (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(50) NOT NULL UNIQUE,
    name VARCHAR2(100) NOT NULL,
    logo_url VARCHAR2(500),
    website_url VARCHAR2(500),
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_brands_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_brands_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE brand_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    brand_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    description CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_brand_trans UNIQUE (brand_id, language_id),
    CONSTRAINT fk_brand_trans_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
    CONSTRAINT fk_brand_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_brand_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_brand_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- SEO Metadata
CREATE TABLE seo_metadata (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    entity_type VARCHAR2(50) NOT NULL,
    entity_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    meta_title VARCHAR2(200),
    meta_description VARCHAR2(500),
    og_title VARCHAR2(200),
    og_description VARCHAR2(500),
    og_image VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_seo_metadata UNIQUE (entity_type, entity_id, language_id),
    CONSTRAINT fk_seo_language FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_seo_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_seo_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Unidades de medida
CREATE TABLE measurement_units (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(20) NOT NULL UNIQUE,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_measure_units_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_measure_units_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE measurement_unit_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    unit_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    symbol VARCHAR2(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_measure_unit_trans UNIQUE (unit_id, language_id),
    CONSTRAINT fk_measure_unit_trans FOREIGN KEY (unit_id) REFERENCES measurement_units(id),
    CONSTRAINT fk_measure_unit_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_measure_unit_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_measure_unit_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Almacenes
CREATE TABLE warehouses (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR2(50) NOT NULL UNIQUE,
    address_id NUMBER NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_warehouse_address FOREIGN KEY (address_id) REFERENCES addresses(id),
    CONSTRAINT fk_warehouses_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_warehouses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE warehouse_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    warehouse_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_warehouse_trans UNIQUE (warehouse_id, language_id),
    CONSTRAINT fk_warehouse_trans_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_warehouse_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_warehouse_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_warehouse_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Categorías y productos
CREATE TABLE categories (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id NUMBER,
    code VARCHAR2(50) NOT NULL UNIQUE,
    name VARCHAR2(100) NOT NULL,
    is_default NUMBER(1) DEFAULT 0 NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id),
    CONSTRAINT fk_categories_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_categories_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE category_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_category_trans UNIQUE (category_id, language_id),
    CONSTRAINT fk_category_trans_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_category_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_category_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_category_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE products (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    brand_id NUMBER NOT NULL,
    sku VARCHAR2(50) NOT NULL UNIQUE,
    base_price NUMBER(10,2) NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
    CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_products_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE product_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(200) NOT NULL,
    description CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_product_trans UNIQUE (product_id, language_id),
    CONSTRAINT fk_product_trans_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_product_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_product_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_product_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE product_categories (
    product_id NUMBER NOT NULL,
    category_id NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by NUMBER,
    CONSTRAINT pk_product_categories PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_prod_cat_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_prod_cat_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_prod_cat_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Atributos y variantes
CREATE TABLE attributes (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attribute_code VARCHAR2(50) NOT NULL UNIQUE,
    attribute_type VARCHAR2(20) NOT NULL,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_attributes_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_attributes_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE attribute_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attribute_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_attribute_trans UNIQUE (attribute_id, language_id),
    CONSTRAINT fk_attribute_trans_attr FOREIGN KEY (attribute_id) REFERENCES attributes(id),
    CONSTRAINT fk_attribute_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_attribute_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_attribute_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE attribute_values (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attribute_id NUMBER NOT NULL,
    value_code VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_attr_value_code UNIQUE (attribute_id, value_code),
    CONSTRAINT fk_attr_values_attr FOREIGN KEY (attribute_id) REFERENCES attributes(id),
    CONSTRAINT fk_attr_values_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_attr_values_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE attribute_value_translations (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    value_id NUMBER NOT NULL,
    language_id NUMBER NOT NULL,
    value_name VARCHAR2(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_attr_value_trans UNIQUE (value_id, language_id),
    CONSTRAINT fk_attr_value_trans_value FOREIGN KEY (value_id) REFERENCES attribute_values(id),
    CONSTRAINT fk_attr_value_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_attr_value_trans_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_attr_value_trans_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE product_variants (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id NUMBER NOT NULL,
    sku VARCHAR2(50) NOT NULL UNIQUE,
    price_adjustment NUMBER(10,2) DEFAULT 0,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_variants_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_variants_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE variant_attributes (
    variant_id NUMBER NOT NULL,
    attribute_id NUMBER NOT NULL,
    attribute_value_id NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by NUMBER,
    CONSTRAINT pk_variant_attributes PRIMARY KEY (variant_id, attribute_id),
    CONSTRAINT fk_var_attr_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    CONSTRAINT fk_var_attr_attribute FOREIGN KEY (attribute_id) REFERENCES attributes(id),
    CONSTRAINT fk_var_attr_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id),
    CONSTRAINT fk_var_attr_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Inventario
CREATE TABLE inventory_stock (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    warehouse_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    variant_id NUMBER,
    quantity NUMBER NOT NULL,
    unit_id NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT uk_inventory_stock UNIQUE (warehouse_id, product_id, variant_id),
    CONSTRAINT fk_stock_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_stock_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    CONSTRAINT fk_stock_unit FOREIGN KEY (unit_id) REFERENCES measurement_units(id),
    CONSTRAINT fk_stock_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_stock_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE inventory_movements (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    warehouse_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    variant_id NUMBER,
    movement_type VARCHAR2(20) NOT NULL,
    quantity NUMBER NOT NULL,
    unit_id NUMBER NOT NULL,
    reference_type VARCHAR2(20),
    reference_id NUMBER,
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by NUMBER,
    CONSTRAINT fk_movement_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_movement_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_movement_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    CONSTRAINT fk_movement_unit FOREIGN KEY (unit_id) REFERENCES measurement_units(id),
    CONSTRAINT fk_movement_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Carrito de compra
CREATE TABLE shopping_carts (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    session_id VARCHAR2(100),
    status VARCHAR2(20) DEFAULT 'ACTIVE',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_cart_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_cart_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    variant_id NUMBER,
    quantity NUMBER DEFAULT 1 NOT NULL,
    unit_price NUMBER(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES shopping_carts(id),
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    CONSTRAINT fk_cart_items_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_cart_items_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Pedidos
CREATE TABLE orders (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    status VARCHAR2(50) NOT NULL,
    total_amount NUMBER(10,2) NOT NULL,
    shipping_address_id NUMBER NOT NULL,
    billing_address_id NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_shipping FOREIGN KEY (shipping_address_id) REFERENCES addresses(id),
    CONSTRAINT fk_orders_billing FOREIGN KEY (billing_address_id) REFERENCES addresses(id),
    CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_orders_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE order_items (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    variant_id NUMBER,
    quantity NUMBER NOT NULL,
    unit_price NUMBER(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    CONSTRAINT fk_order_items_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_order_items_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Triggers de auditoría para cada tabla

-- Users
CREATE OR REPLACE TRIGGER trg_users_biu
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Users Auth
CREATE OR REPLACE TRIGGER trg_users_auth_biu
    BEFORE INSERT OR UPDATE ON users_auth
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Languages
CREATE OR REPLACE TRIGGER trg_languages_biu
    BEFORE INSERT OR UPDATE ON languages
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Countries
CREATE OR REPLACE TRIGGER trg_countries_biu
    BEFORE INSERT OR UPDATE ON countries
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Country Translations
CREATE OR REPLACE TRIGGER trg_country_trans_biu
    BEFORE INSERT OR UPDATE ON country_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Regions
CREATE OR REPLACE TRIGGER trg_regions_biu
    BEFORE INSERT OR UPDATE ON regions
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Region Translations
CREATE OR REPLACE TRIGGER trg_region_trans_biu
    BEFORE INSERT OR UPDATE ON region_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Cities
CREATE OR REPLACE TRIGGER trg_cities_biu
    BEFORE INSERT OR UPDATE ON cities
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- City Translations
CREATE OR REPLACE TRIGGER trg_city_trans_biu
    BEFORE INSERT OR UPDATE ON city_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Addresses
CREATE OR REPLACE TRIGGER trg_addresses_biu
    BEFORE INSERT OR UPDATE ON addresses
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Brands
CREATE OR REPLACE TRIGGER trg_brands_biu
    BEFORE INSERT OR UPDATE ON brands
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Brand Translations
CREATE OR REPLACE TRIGGER trg_brand_trans_biu
    BEFORE INSERT OR UPDATE ON brand_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Categories
CREATE OR REPLACE TRIGGER trg_categories_biu
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Category Translations
CREATE OR REPLACE TRIGGER trg_category_trans_biu
    BEFORE INSERT OR UPDATE ON category_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Products
CREATE OR REPLACE TRIGGER trg_products_biu
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Product Translations
CREATE OR REPLACE TRIGGER trg_product_trans_biu
    BEFORE INSERT OR UPDATE ON product_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Attributes
CREATE OR REPLACE TRIGGER trg_attributes_biu
    BEFORE INSERT OR UPDATE ON attributes
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Attribute Translations
CREATE OR REPLACE TRIGGER trg_attribute_trans_biu
    BEFORE INSERT OR UPDATE ON attribute_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Attribute Values
CREATE OR REPLACE TRIGGER trg_attribute_values_biu
    BEFORE INSERT OR UPDATE ON attribute_values
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Attribute Value Translations
CREATE OR REPLACE TRIGGER trg_attr_value_trans_biu
    BEFORE INSERT OR UPDATE ON attribute_value_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Product Variants
CREATE OR REPLACE TRIGGER trg_product_variants_biu
    BEFORE INSERT OR UPDATE ON product_variants
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Warehouses
CREATE OR REPLACE TRIGGER trg_warehouses_biu
    BEFORE INSERT OR UPDATE ON warehouses
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Warehouse Translations
CREATE OR REPLACE TRIGGER trg_warehouse_trans_biu
    BEFORE INSERT OR UPDATE ON warehouse_translations
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Inventory Stock
CREATE OR REPLACE TRIGGER trg_inventory_stock_biu
    BEFORE INSERT OR UPDATE ON inventory_stock
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Shopping Carts
CREATE OR REPLACE TRIGGER trg_shopping_carts_biu
    BEFORE INSERT OR UPDATE ON shopping_carts
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Cart Items
CREATE OR REPLACE TRIGGER trg_cart_items_biu
    BEFORE INSERT OR UPDATE ON cart_items
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Orders
CREATE OR REPLACE TRIGGER trg_orders_biu
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Order Items
CREATE OR REPLACE TRIGGER trg_order_items_biu
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        :NEW.created_by := NVL(:NEW.created_by, util_pkg.get_current_user_id());
    ELSIF UPDATING THEN
        :NEW.updated_at := CURRENT_TIMESTAMP;
        :NEW.updated_by := util_pkg.get_current_user_id();
    END IF;
END;
/

-- Datos iniciales

-- 1. Usuario administrador inicial (necesario para las foreign keys de created_by)
INSERT INTO users (first_name, last_name, email, phone, is_active)
VALUES ('Admin', 'System', 'admin@example.com', '+34600000000', 1);

INSERT INTO users_auth (user_id, password_hash, user_type)
SELECT id, 'HASHED_PASSWORD_HERE', 'ADMIN'
FROM users WHERE email = 'admin@example.com';

-- Usuarios de ejemplo
INSERT INTO users (first_name, last_name, email, phone, is_active) VALUES
('Juan', 'García', 'juan.garcia@example.com', '+34611111111', 1),
('María', 'López', 'maria.lopez@example.com', '+34622222222', 1),
('Carlos', 'Martínez', 'carlos.martinez@example.com', '+34633333333', 1);

INSERT INTO users_auth (user_id, password_hash, user_type)
SELECT id, 'CUSTOMER_PASS_HASH', 'CUSTOMER'
FROM users WHERE email != 'admin@example.com';

-- 2. Idiomas
INSERT INTO languages (code, name, is_active, is_default) VALUES 
('es', 'Español', 1, 1),
('en', 'English', 1, 0),
('ca', 'Català', 1, 0);

-- 3. Países y regiones
INSERT INTO countries (iso_code, iso_code3) VALUES 
('ES', 'ESP'),
('FR', 'FRA'),
('PT', 'PRT');

-- Traducciones de países
INSERT INTO country_translations (country_id, language_id, name)
SELECT c.id, l.id, 
    CASE 
        WHEN c.iso_code = 'ES' THEN
            CASE l.code 
                WHEN 'es' THEN 'España'
                WHEN 'en' THEN 'Spain'
                WHEN 'ca' THEN 'Espanya'
            END
        WHEN c.iso_code = 'FR' THEN
            CASE l.code 
                WHEN 'es' THEN 'Francia'
                WHEN 'en' THEN 'France'
                WHEN 'ca' THEN 'França'
            END
        WHEN c.iso_code = 'PT' THEN
            CASE l.code 
                WHEN 'es' THEN 'Portugal'
                WHEN 'en' THEN 'Portugal'
                WHEN 'ca' THEN 'Portugal'
            END
    END
FROM countries c
CROSS JOIN languages l;

-- Regiones de España
INSERT INTO regions (country_id, region_code) 
SELECT id, column_value
FROM countries c, TABLE(sys.odcivarchar2list(
    'CAT', 'MAD', 'AND', 'VAL', 'GAL'
))
WHERE c.iso_code = 'ES';

-- Traducciones de regiones
INSERT INTO region_translations (region_id, language_id, name)
SELECT r.id, l.id,
    CASE r.region_code 
        WHEN 'CAT' THEN
            CASE l.code 
                WHEN 'es' THEN 'Cataluña'
                WHEN 'en' THEN 'Catalonia'
                WHEN 'ca' THEN 'Catalunya'
            END
        WHEN 'MAD' THEN
            CASE l.code 
                WHEN 'es' THEN 'Madrid'
                WHEN 'en' THEN 'Madrid'
                WHEN 'ca' THEN 'Madrid'
            END
        WHEN 'AND' THEN
            CASE l.code 
                WHEN 'es' THEN 'Andalucía'
                WHEN 'en' THEN 'Andalusia'
                WHEN 'ca' THEN 'Andalusia'
            END
        WHEN 'VAL' THEN
            CASE l.code 
                WHEN 'es' THEN 'Valencia'
                WHEN 'en' THEN 'Valencia'
                WHEN 'ca' THEN 'València'
            END
        WHEN 'GAL' THEN
            CASE l.code 
                WHEN 'es' THEN 'Galicia'
                WHEN 'en' THEN 'Galicia'
                WHEN 'ca' THEN 'Galícia'
            END
    END
FROM regions r
CROSS JOIN languages l;

-- 4. Unidades de medida
INSERT INTO measurement_units (code) VALUES 
('UNIT'),
('KG'),
('GR'),
('LT'),
('ML');

INSERT INTO measurement_unit_translations (unit_id, language_id, name, symbol)
SELECT mu.id, l.id,
    CASE mu.code 
        WHEN 'UNIT' THEN
            CASE l.code 
                WHEN 'es' THEN 'Unidad'
                WHEN 'en' THEN 'Unit'
                WHEN 'ca' THEN 'Unitat'
            END
        WHEN 'KG' THEN 'Kilogramo'
        WHEN 'GR' THEN 'Gramo'
        WHEN 'LT' THEN 'Litro'
        WHEN 'ML' THEN 'Mililitro'
    END,
    CASE mu.code 
        WHEN 'UNIT' THEN 'ud'
        WHEN 'KG' THEN 'kg'
        WHEN 'GR' THEN 'g'
        WHEN 'LT' THEN 'l'
        WHEN 'ML' THEN 'ml'
    END
FROM measurement_units mu
CROSS JOIN languages l;

-- 5. Marcas
INSERT INTO brands (code, name, website_url) VALUES 
('NIKE', 'Nike', 'https://www.nike.com'),
('ADIDAS', 'adidas', 'https://www.adidas.com'),
('PUMA', 'PUMA', 'https://www.puma.com'),
('REEBOK', 'Reebok', 'https://www.reebok.com'),
('NB', 'New Balance', 'https://www.newbalance.com');

-- 6. Categorías
INSERT INTO categories (category_code) VALUES 
('FOOTWEAR'),
('CLOTHING'),
('ACCESSORIES'),
('EQUIPMENT');

INSERT INTO category_translations (category_id, language_id, name, description)
SELECT c.id, l.id,
    CASE c.category_code 
        WHEN 'FOOTWEAR' THEN
            CASE l.code 
                WHEN 'es' THEN 'Calzado'
                WHEN 'en' THEN 'Footwear'
                WHEN 'ca' THEN 'Calçat'
            END
        WHEN 'CLOTHING' THEN
            CASE l.code 
                WHEN 'es' THEN 'Ropa'
                WHEN 'en' THEN 'Clothing'
                WHEN 'ca' THEN 'Roba'
            END
        WHEN 'ACCESSORIES' THEN
            CASE l.code 
                WHEN 'es' THEN 'Accesorios'
                WHEN 'en' THEN 'Accessories'
                WHEN 'ca' THEN 'Accessoris'
            END
        WHEN 'EQUIPMENT' THEN
            CASE l.code 
                WHEN 'es' THEN 'Equipamiento'
                WHEN 'en' THEN 'Equipment'
                WHEN 'ca' THEN 'Equipament'
            END
    END,
    CASE l.code 
        WHEN 'es' THEN 'Descripción en español'
        WHEN 'en' THEN 'Description in English'
        WHEN 'ca' THEN 'Descripció en català'
    END
FROM categories c
CROSS JOIN languages l;

-- 7. Productos de ejemplo
INSERT INTO products (brand_id, sku, base_price)
SELECT b.id, 'NIKE-AIR-001', 99.99
FROM brands b WHERE b.code = 'NIKE'
UNION ALL
SELECT b.id, 'ADIDAS-ULTRA-001', 129.99
FROM brands b WHERE b.code = 'ADIDAS';

INSERT INTO product_translations (product_id, language_id, name, description)
SELECT p.id, l.id,
    CASE p.sku 
        WHEN 'NIKE-AIR-001' THEN
            CASE l.code 
                WHEN 'es' THEN 'Nike Air Max'
                WHEN 'en' THEN 'Nike Air Max'
                WHEN 'ca' THEN 'Nike Air Max'
            END
        WHEN 'ADIDAS-ULTRA-001' THEN
            CASE l.code 
                WHEN 'es' THEN 'Adidas Ultraboost'
                WHEN 'en' THEN 'Adidas Ultraboost'
                WHEN 'ca' THEN 'Adidas Ultraboost'
            END
    END,
    CASE l.code 
        WHEN 'es' THEN 'Descripción detallada en español'
        WHEN 'en' THEN 'Detailed description in English'
        WHEN 'ca' THEN 'Descripció detallada en català'
    END
FROM products p
CROSS JOIN languages l;

-- 8. Almacenes
INSERT INTO warehouses (code) VALUES 
('BCN-01'),
('MAD-01'),
('VAL-01');

INSERT INTO warehouse_translations (warehouse_id, language_id, name, description)
SELECT w.id, l.id,
    CASE w.code 
        WHEN 'BCN-01' THEN 'Barcelona Central'
        WHEN 'MAD-01' THEN 'Madrid Central'
        WHEN 'VAL-01' THEN 'Valencia Central'
    END,
    CASE l.code 
        WHEN 'es' THEN 'Almacén principal'
        WHEN 'en' THEN 'Main warehouse'
        WHEN 'ca' THEN 'Magatzem principal'
    END
FROM warehouses w
CROSS JOIN languages l;

-- 9. Stock inicial
INSERT INTO inventory_stock (warehouse_id, product_id, quantity, unit_id)
SELECT 
    w.id,
    p.id,
    100,
    mu.id
FROM warehouses w
CROSS JOIN products p
CROSS JOIN measurement_units mu
WHERE mu.code = 'UNIT';

-- Índices adicionales para búsquedas comunes
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_brands_active ON brands(is_active);
CREATE INDEX idx_product_trans_name ON product_translations(name);
CREATE INDEX idx_inventory_product ON inventory_stock(product_id, warehouse_id);

-- Vista principal de productos
CREATE OR REPLACE VIEW vw_products_full AS
SELECT 
    p.id,
    p.sku,
    b.name as brandName,
    pt.name as productName,
    CAST(pt.description AS VARCHAR2(4000)) as description,
    p.base_price,
    c.code as categoryCode,
    ct.name as categoryName,
    l.code as languageCode,
    p.is_active,
    COALESCE(SUM(inv_stock.quantity), 0) as total_stock,
    seo.meta_title,
    seo.meta_description,
    seo.og_title,
    seo.og_description,
    seo.og_image,
    LISTAGG(pv.sku || ':' || COALESCE(pv.price_adjustment, 0) || ':' || COALESCE(av.value_code, 'N/A') || ':' || COALESCE(avt.value_name, 'N/A'), '|') 
        WITHIN GROUP (ORDER BY pv.sku) as variants_info,
    LISTAGG(pv.sku || ':' || COALESCE(inv_stock_var.quantity, 0), '|')
        WITHIN GROUP (ORDER BY pv.sku) as variant_stock
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN product_translations pt ON p.id = pt.product_id
JOIN languages l ON pt.language_id = l.id
LEFT JOIN product_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language_id = pt.language_id
LEFT JOIN inventory_stock inv_stock ON p.id = inv_stock.product_id AND inv_stock.variant_id IS NULL
LEFT JOIN seo_metadata seo ON p.id = seo.entity_id AND seo.entity_type = 'PRODUCT' AND seo.language_id = pt.language_id
LEFT JOIN product_variants pv ON p.id = pv.product_id
LEFT JOIN variant_attributes va ON pv.id = va.variant_id
LEFT JOIN attribute_values av ON va.attribute_value_id = av.id
LEFT JOIN attribute_value_translations avt ON av.id = avt.value_id AND avt.language_id = pt.language_id
LEFT JOIN inventory_stock inv_stock_var ON pv.id = inv_stock_var.variant_id
GROUP BY 
    p.id, 
    p.sku, 
    b.name, 
    pt.name, 
    CAST(pt.description AS VARCHAR2(4000)),
    p.base_price, 
    c.code, 
    ct.name, 
    l.code, 
    p.is_active,
    seo.meta_title,
    seo.meta_description,
    seo.og_title,
    seo.og_description,
    seo.og_image; 

-- Vista de stock por almacén
CREATE OR REPLACE VIEW vw_stock_by_warehouse AS
SELECT 
    w.code as whCode,
    wt.name as whName,
    p.sku,
    pt.name as productName,
    inv_stock.quantity,
    mu.code as unitCode,
    l.code as languageCode
FROM inventory_stock inv_stock
JOIN warehouses w ON inv_stock.warehouse_id = w.id
JOIN warehouse_translations wt ON w.id = wt.warehouse_id
JOIN products p ON inv_stock.product_id = p.id
JOIN product_translations pt ON p.id = pt.product_id
JOIN measurement_units mu ON inv_stock.unit_id = mu.id
JOIN languages l ON pt.language_id = l.id;

COMMIT;

