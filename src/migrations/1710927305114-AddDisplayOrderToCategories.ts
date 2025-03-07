import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDisplayOrderToCategories1710927305114
  implements MigrationInterface
{
  name = 'AddDisplayOrderToCategories1710927305114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ECOMMERCE"."CATEGORIES" ADD "DISPLAY_ORDER" NUMBER`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ECOMMERCE"."CATEGORIES" DROP COLUMN "DISPLAY_ORDER"`,
    );
  }
}
