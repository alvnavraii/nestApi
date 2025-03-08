/*Name       Null?    Type         
---------- -------- ------------ 
ID         NOT NULL NUMBER       
ISO_CODE   NOT NULL VARCHAR2(2)  
ISO_CODE3  NOT NULL VARCHAR2(3)  
IS_ACTIVE  NOT NULL NUMBER(1)  
IS_DEFAULT NOT NULL NUMBER(1)  
CREATED_AT NOT NULL TIMESTAMP(6) 
UPDATED_AT          TIMESTAMP(6) 
CREATED_BY          NUMBER       
UPDATED_BY          NUMBER    */

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('COUNTRIES', { schema: 'ECOMMERCE' })
export class Country extends BaseEntity<Country> {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'ISO_CODE' })
  isoCode: string;

  @Column({ name: 'ISO_CODE3' })
  isoCode3: string;

  @Column({ name: 'IS_ACTIVE' })
  isActive: number;

  @Column({ name: 'IS_DEFAULT' })
  isDefault: number;
}
