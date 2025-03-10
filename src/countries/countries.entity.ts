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

import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { CountriesTradEntity } from '../countries-trad/countries-trad.entity';

@Entity('COUNTRIES', { schema: 'ECOMMERCE' })
export class Country extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Column({
    name: 'ISO_CODE',
    type: 'varchar2',
    length: 2,
    nullable: false,
  })
  isoCode: string;

  @Column({
    name: 'ISO_CODE3',
    type: 'varchar2',
    length: 3,
    nullable: false,
  })
  isoCode3: string;

  @Column({
    name: 'IS_ACTIVE',
    type: 'number',
    precision: 1,
    nullable: false,
    default: 1,
  })
  isActive: number;

  @Column({
    name: 'IS_DEFAULT',
    type: 'number',
    precision: 1,
    nullable: false,
    default: 0,
  })
  isDefault: number;

  @OneToMany(() => CountriesTradEntity, (translation) => translation.country)
  translations: CountriesTradEntity[];
}
