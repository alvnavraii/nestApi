import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('LANGUAGES', { schema: 'ECOMMERCE' })
export class Language extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Column({
    name: 'ISO_CODE',
    type: 'varchar2',
    length: 5,
    nullable: false,
  })
  isoCode: string;

  @Column({
    name: 'NAME',
    type: 'varchar2',
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'IS_ACTIVE',
    type: 'number',
    precision: 1,
    default: 1,
    nullable: false,
  })
  isActive: number;

  @Column({
    name: 'IS_DEFAULT',
    type: 'number',
    precision: 1,
    default: 0,
    nullable: false,
  })
  isDefault: number;
}
