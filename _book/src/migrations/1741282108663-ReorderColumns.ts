import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReorderColumns1741282108663 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Guardamos las constraints existentes
    const constraints = await queryRunner.query(`
      SELECT constraint_name, constraint_type, table_name
      FROM user_constraints 
      WHERE table_name = 'CATEGORIES'
    `);

    // Desactivamos las foreign keys que referencian a CATEGORIES
    await queryRunner.query(`
      BEGIN
        FOR c IN (
          SELECT constraint_name, table_name 
          FROM user_constraints 
          WHERE r_constraint_name IN (
            SELECT constraint_name 
            FROM user_constraints 
            WHERE table_name = 'CATEGORIES'
          )
        ) LOOP
          EXECUTE IMMEDIATE 'ALTER TABLE ' || c.table_name || 
                          ' DISABLE CONSTRAINT ' || c.constraint_name;
        END LOOP;
      END;
    `);

    // Creamos la tabla temporal con el orden deseado
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

    // Copiamos los datos de CATEGORIES a TEMP_TABLE
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

    // Renombramos TEMP_TABLE a CATEGORIES
    await queryRunner.query(`ALTER TABLE ECOMMERCE.TEMP_TABLE RENAME TO CATEGORIES`);

    // Recreamos las constraints
    for (const constraint of constraints) {
      if (constraint.CONSTRAINT_TYPE === 'P') {
        await queryRunner.query(`
          ALTER TABLE ECOMMERCE.CATEGORIES 
          ADD CONSTRAINT ${constraint.CONSTRAINT_NAME} PRIMARY KEY (ID)
        `);
      }
      if (constraint.CONSTRAINT_TYPE === 'R' && constraint.TABLE_NAME === 'CATEGORIES') {
        await queryRunner.query(`
          ALTER TABLE ECOMMERCE.CATEGORIES 
          ADD CONSTRAINT ${constraint.CONSTRAINT_NAME} 
          FOREIGN KEY (PARENT_ID) REFERENCES ECOMMERCE.CATEGORIES(ID)
        `);
      }
    }

    // Reactivamos las foreign keys
    await queryRunner.query(`
      BEGIN
        FOR c IN (
          SELECT constraint_name, table_name 
          FROM user_constraints 
          WHERE r_constraint_name IN (
            SELECT constraint_name 
            FROM user_constraints 
            WHERE table_name = 'CATEGORIES'
          )
        ) LOOP
          EXECUTE IMMEDIATE 'ALTER TABLE ' || c.table_name || 
                          ' ENABLE CONSTRAINT ' || c.constraint_name;
        END LOOP;
      END;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Método down vacío para evitar operaciones de reversión
  }
} 