import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToCountryTranslations1710050394
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ecommerce.COUNTRY_TRANSLATIONS
      ADD IS_ACTIVE NUMBER(1) DEFAULT 1 NOT NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN ecommerce.COUNTRY_TRANSLATIONS.IS_ACTIVE IS 'Indica si la traducción está activa (1) o inactiva (0)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ecommerce.COUNTRY_TRANSLATIONS
      DROP COLUMN IS_ACTIVE
    `);
  }
}
