import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { IsEmail, IsString, IsOptional } from 'class-validator';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('USERS', { schema: 'ECOMMERCE' })
export class User extends BaseEntity<User> {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'ROLE_ID' })
  role: Role;

  @Column({ name: 'ROLE_ID', select: false })
  roleId: number;

  @IsEmail()
  @Column({ name: 'EMAIL', unique: true })
  email: string;

  @Column({ name: 'PASSWORD_HASH' })
  passwordHash: string;

  @IsString()
  @Column({ name: 'FIRST_NAME' })
  firstName: string;

  @IsString()
  @Column({ name: 'LAST_NAME' })
  lastName: string;

  @IsString()
  @IsOptional()
  @Column({ name: 'PHONE', nullable: true })
  phone?: string;

  @IsString()
  @IsOptional()
  @Column({ name: 'COMPANY_NAME', nullable: true })
  companyName?: string;

  @IsString()
  @IsOptional()
  @Column({ name: 'WEBSITE', nullable: true })
  website?: string;

  @Column({ name: 'IS_ACTIVE', default: true })
  isActive: boolean;

  @Column({ name: 'LAST_LOGIN_DATE', nullable: true })
  lastLoginDate?: Date;
}
