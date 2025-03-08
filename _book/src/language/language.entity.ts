/*
Name       Null?    Type         
---------- -------- ------------ 
ID         NOT NULL NUMBER       
CODE       NOT NULL VARCHAR2(5)  
NAME       NOT NULL VARCHAR2(50) 
IS_DEFAULT NOT NULL NUMBER(1)    
IS_ACTIVE  NOT NULL NUMBER(1)   
CREATED_AT NOT NULL TIMESTAMP(6) 
UPDATED_AT          TIMESTAMP(6) 
CREATED_BY          NUMBER       
UPDATED_BY          NUMBER       
*/

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('LANGUAGES', { schema: 'ECOMMERCE' })
export class Language extends BaseEntity<Language> {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'CODE' })
  code: string;

  @Column({ name: 'NAME' })
  name: string;

  @Column({ name: 'IS_DEFAULT' })
  isDefault: boolean;

  @Column({ name: 'IS_ACTIVE' })
  isActive: boolean;
}
