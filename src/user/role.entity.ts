import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('ROLES', { schema: 'ECOMMERCE' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Column({
    name: 'NAME',
    type: 'varchar2',
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'DESCRIPTION',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  description?: string;

  @Column({
    name: 'IS_ACTIVE',
    type: 'number',
    precision: 1,
    default: 1,
    nullable: false,
  })
  isActive: number;
}
