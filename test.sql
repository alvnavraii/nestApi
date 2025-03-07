-- Primero verificamos qué columnas ya existen
SELECT column_name, data_type, nullable 
FROM user_tab_columns 
WHERE table_name = 'CATEGORIES';

-- Primero eliminamos la constraint existente si la hay
ALTER TABLE ECOMMERCE.CATEGORIES
DROP CONSTRAINT fk_parent_category;

-- Añadimos solo las columnas que faltan
ALTER TABLE ECOMMERCE.CATEGORIES
ADD (
    DESCRIPTION CLOB,
    IMAGE_URL VARCHAR2(255),
    DISPLAY_ORDER NUMBER
);

-- Primero verificamos si hay NULLs en NAME
SELECT COUNT(*) 
FROM ECOMMERCE.CATEGORIES 
WHERE NAME IS NULL;

-- Si hay NULLs, actualizamos esos registros (por ejemplo, con el ID como nombre temporal)
UPDATE ECOMMERCE.CATEGORIES
SET NAME = 'Category ' || ID
WHERE NAME IS NULL;

-- Una vez que no hay NULLs, podemos hacer la columna NOT NULL
ALTER TABLE ECOMMERCE.CATEGORIES
MODIFY NAME NOT NULL;

-- Actualizamos IS_ACTIVE default
ALTER TABLE ECOMMERCE.CATEGORIES
MODIFY IS_ACTIVE DEFAULT 1;

-- Eliminamos la columna CATEGORY_CODE
ALTER TABLE ECOMMERCE.CATEGORIES
DROP COLUMN CATEGORY_CODE;

-- Añadimos la nueva foreign key
ALTER TABLE ECOMMERCE.CATEGORIES
ADD CONSTRAINT fk_parent_category 
FOREIGN KEY (PARENT_ID) 
REFERENCES ECOMMERCE.CATEGORIES(ID);


-- Primero verificamos qué columnas ya existen
SELECT column_name, data_type, nullable 
FROM user_tab_columns 
WHERE table_name = 'CATEGORIES';

desc categories;

desc TEMP_TABLE;