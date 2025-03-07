/* CREATE TABLE categories (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id NUMBER,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    image_url VARCHAR2(255),
    is_active NUMBER(1) DEFAULT 1,
    display_order NUMBER,
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_parent_category FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
); */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('CATEGORIES', { schema: 'ECOMMERCE' })
export class CategoriesEntity extends BaseEntity<CategoriesEntity> {
  @PrimaryGeneratedColumn({ name: 'ID' })
  ID: number;

  @ManyToOne(() => CategoriesEntity, (category) => category.children)
  @JoinColumn({ name: 'PARENT_ID' })
  parent: CategoriesEntity;

  @OneToMany(() => CategoriesEntity, (category) => category.parent)
  children: CategoriesEntity[];

  @Column({ name: 'PARENT_ID', nullable: true, type: 'number' })
  PARENT_ID: number | null;

  @Column({ name: 'NAME', type: 'varchar2' })
  NAME: string;

  @Column({ name: 'DESCRIPTION', nullable: true, type: 'varchar2' })
  DESCRIPTION: string | null;

  @Column({ name: 'IMAGE_URL', nullable: true, type: 'varchar2' })
  IMAGE_URL: string | null;

  @Column({ name: 'IS_ACTIVE', type: 'number' })
  IS_ACTIVE: number;

  @Column({ name: 'DISPLAY_ORDER', nullable: true, type: 'number' })
  DISPLAY_ORDER: number | null;
}

export type CreateCategoryDto = Omit<
  CategoriesEntity,
  'category_id' | 'created_at' | 'updated_at'
>;
export type UpdateCategoryDto = Partial<CreateCategoryDto>;
