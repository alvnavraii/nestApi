import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ReorderColumns1720294304000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero verificamos si la tabla existe y la eliminamos de forma segura
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

    // Creamos la tabla temporal con el orden exacto que queremos
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

    // Insertamos los datos especificando explícitamente el orden de las columnas
    await queryRunner.query(`
      INSERT INTO ECOMMERCE.TEMP_TABLE (
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
      )
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Método down vacío para evitar operaciones de reversión
  }
}
