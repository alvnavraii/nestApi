import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Role } from './role.entity';

@Entity('USERS', { schema: 'ECOMMERCE' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Column({
    name: 'EMAIL',
    type: 'varchar2',
    length: 100,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'PASSWORD_HASH',
    type: 'varchar2',
    length: 255,
    nullable: false,
  })
  passwordHash: string;

  @Column({
    name: 'FIRST_NAME',
    type: 'varchar2',
    length: 50,
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'LAST_NAME',
    type: 'varchar2',
    length: 50,
    nullable: false,
  })
  lastName: string;

  @Column({
    name: 'IS_ACTIVE',
    type: 'number',
    precision: 1,
    default: 1,
    nullable: false,
  })
  isActive: number;

  @Column({
    name: 'PHONE',
    type: 'varchar2',
    length: 20,
    nullable: true,
  })
  phone?: string;

  @Column({
    name: 'COMPANY_NAME',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  companyName?: string;

  @Column({
    name: 'WEBSITE',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  website?: string;

  @Column({
    name: 'LAST_LOGIN_DATE',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginDate?: Date;

  @Column({
    name: 'ROLE_ID',
    type: 'number',
    nullable: false,
  })
  roleId: number;

  @ManyToOne(() => Role, {
    nullable: false,
  })
  @JoinColumn({
    name: 'ROLE_ID',
  })
  role: Role;
}
