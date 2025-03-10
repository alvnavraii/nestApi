import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCategoriesTable1710050395 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ECOMMERCE.CATEGORIES
      ADD (
        DELETED_AT TIMESTAMP(6)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE ECOMMERCE.CATEGORIES
      MODIFY (
        NAME VARCHAR2(100) NOT NULL,
        DESCRIPTION CLOB,
        IMAGE_URL VARCHAR2(255),
        IS_ACTIVE NUMBER(1) DEFAULT 1,
        DISPLAY_ORDER NUMBER,
        PARENT_ID NUMBER,
        CONSTRAINT fk_parent_category FOREIGN KEY (PARENT_ID) REFERENCES ECOMMERCE.CATEGORIES(ID)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ECOMMERCE.CATEGORIES
      DROP COLUMN DELETED_AT
    `);

    await queryRunner.query(`
      ALTER TABLE ECOMMERCE.CATEGORIES
      MODIFY (
        NAME VARCHAR2(50),
        DESCRIPTION VARCHAR2(255),
        IMAGE_URL VARCHAR2(100),
        IS_ACTIVE NUMBER(1),
        DISPLAY_ORDER NUMBER,
        PARENT_ID NUMBER
      )
    `);
  }
}
