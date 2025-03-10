/* CREATE TABLE categories (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id NUMBER,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(1024),
    image_url VARCHAR2(100),
    category_code VARCHAR2(50) NOT NULL,
    is_active NUMBER(1) DEFAULT 1,
    display_order NUMBER,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER,
    CONSTRAINT fk_parent_category FOREIGN KEY (parent_id) REFERENCES categories(id)
); */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity as CommonBaseEntity } from '../common/entities/base.entity';

@Entity('CATEGORIES', { schema: 'ECOMMERCE' })
export class CategoriesEntity extends CommonBaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Column({
    name: 'NAME',
    type: 'varchar2',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'CATEGORY_CODE',
    type: 'varchar2',
    length: 50,
    nullable: false,
  })
  categoryCode: string;

  @Column({
    name: 'DESCRIPTION',
    type: 'varchar2',
    length: 1024,
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'IMAGE_URL',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    name: 'IS_ACTIVE',
    type: 'number',
    precision: 1,
    default: 1,
  })
  isActive: number;

  @Column({
    name: 'DISPLAY_ORDER',
    type: 'number',
    nullable: true,
  })
  displayOrder: number | null;

  @Column({
    name: 'PARENT_ID',
    type: 'number',
    nullable: true,
  })
  parentId: number | null;

  @ManyToOne(() => CategoriesEntity, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({
    name: 'PARENT_ID',
  })
  parent: CategoriesEntity | null;

  @OneToMany(() => CategoriesEntity, (category) => category.parent)
  children: CategoriesEntity[];

  @CreateDateColumn({
    name: 'CREATED_AT',
    type: 'timestamp',
  })
  declare createdAt: Date;

  @UpdateDateColumn({
    name: 'UPDATED_AT',
    type: 'timestamp',
  })
  declare updatedAt: Date;

  @Column({
    name: 'CREATED_BY',
    type: 'number',
    nullable: true,
  })
  createdBy: number | null;

  @Column({
    name: 'UPDATED_BY',
    type: 'number',
    nullable: true,
  })
  updatedBy: number | null;
}

export type CreateCategoryDto = Omit<
  CategoriesEntity,
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateCategoryDto = Partial<CreateCategoryDto>;
