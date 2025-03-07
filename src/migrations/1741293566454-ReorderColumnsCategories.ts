import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReorderColumnsCategories1741293566454 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero eliminamos TEMP_TABLE si existe
    await queryRunner.query(`
      BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE ECOMMERCE.TEMP_TABLE';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -942 THEN
            RAISE;
          END IF;
      END;
    `);

    // Obtenemos y eliminamos TODAS las foreign keys que referencian a CATEGORIES
    await queryRunner.query(`
      DECLARE
        CURSOR c_fk IS
          SELECT a.owner, a.table_name, a.constraint_name
          FROM all_constraints a
          JOIN all_constraints b ON (a.r_constraint_name = b.constraint_name)
          WHERE b.owner = 'ECOMMERCE'
          AND b.table_name = 'CATEGORIES'
          AND a.constraint_type = 'R';
      BEGIN
        FOR fk IN c_fk LOOP
          EXECUTE IMMEDIATE 'ALTER TABLE ' || fk.owner || '.' || fk.table_name || 
                          ' DROP CONSTRAINT ' || fk.constraint_name;
        END LOOP;
      END;
    `);

    // Eliminamos las constraints propias de CATEGORIES
    await queryRunner.query(`
      DECLARE
        CURSOR c_constraints IS
          SELECT constraint_name, constraint_type
          FROM user_constraints
          WHERE table_name = 'CATEGORIES'
          ORDER BY 
            CASE constraint_type
              WHEN 'R' THEN 1
              WHEN 'P' THEN 2
              ELSE 3
            END;
      BEGIN
        FOR c IN c_constraints LOOP
          EXECUTE IMMEDIATE 'ALTER TABLE ECOMMERCE.CATEGORIES DROP CONSTRAINT ' || c.constraint_name;
        END LOOP;
      END;
    `);

    // Creamos la tabla temporal
    await queryRunner.query(`
      CREATE TABLE ECOMMERCE.TEMP_TABLE (
        ID NUMBER NOT NULL,
        NAME VARCHAR2(255) NOT NULL,
        DESCRIPTION VARCHAR2(255),
        IMAGE_URL VARCHAR2(255),
        DISPLAY_ORDER NUMBER,
        PARENT_ID NUMBER,
        IS_ACTIVE NUMBER(1) NOT NULL,
        CREATED_AT TIMESTAMP(6) NOT NULL,
        UPDATED_AT TIMESTAMP(6),
        CREATED_BY NUMBER,
        UPDATED_BY NUMBER
      )
    `);

    // Copiamos los datos
    await queryRunner.query(`
      INSERT INTO ECOMMERCE.TEMP_TABLE
      SELECT 
        ID,
        NAME,
        DESCRIPTION,
        IMAGE_URL,
        DISPLAY_ORDER,
        PARENT_ID,
        IS_ACTIVE,
        CREATED_AT,
        UPDATED_AT,
        CREATED_BY,
        UPDATED_BY
      FROM ECOMMERCE.CATEGORIES
    `);

    // Eliminamos la tabla original
    await queryRunner.query(`DROP TABLE ECOMMERCE.CATEGORIES`);

    // Renombramos la temporal
    await queryRunner.query(`ALTER TABLE ECOMMERCE.TEMP_TABLE RENAME TO CATEGORIES`);

    // Añadimos la primary key
    await queryRunner.query(`
      ALTER TABLE ECOMMERCE.CATEGORIES 
      ADD CONSTRAINT PK_CATEGORIES PRIMARY KEY (ID)
    `);

    // Recreamos la foreign key self-referencial
    await queryRunner.query(`
      ALTER TABLE ECOMMERCE.CATEGORIES 
      ADD CONSTRAINT FK_PARENT_CATEGORY 
      FOREIGN KEY (PARENT_ID) REFERENCES ECOMMERCE.CATEGORIES(ID)
    `);

    // Recreamos las foreign keys que referenciaban a CATEGORIES
    await queryRunner.query(`
      ALTER TABLE ECOMMERCE.CATEGORY_TRANSLATIONS 
      ADD CONSTRAINT FK_CAT_TRANS_CATEGORY 
      FOREIGN KEY (CATEGORY_ID) REFERENCES ECOMMERCE.CATEGORIES(ID)
    `);

    await queryRunner.query(`
      ALTER TABLE ECOMMERCE.PRODUCT_CATEGORIES 
      ADD CONSTRAINT FK_PC_CATEGORY 
      FOREIGN KEY (CATEGORY_ID) REFERENCES ECOMMERCE.CATEGORIES(ID)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Método down vacío para evitar operaciones de reversión
  }
}
