/*Name        Null?    Type          
----------- -------- ------------- 
ID          NOT NULL NUMBER        
COUNTRY_ID  NOT NULL NUMBER        
LANGUAGE_ID NOT NULL NUMBER        
NAME        NOT NULL VARCHAR2(100) 
IS_ACTIVE   NOT NULL NUMBER(1)     
CREATED_AT  NOT NULL TIMESTAMP(6)  
UPDATED_AT           TIMESTAMP(6)  
CREATED_BY           NUMBER        
UPDATED_BY           NUMBER        
*/

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Country } from '../countries/countries.entity';
import { Language } from '../languages/languages.entity';

@Entity('COUNTRY_TRANSLATIONS', { schema: 'ECOMMERCE' })
export class CountriesTradEntity {
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
    name: 'IS_ACTIVE',
    type: 'number',
    precision: 1,
    default: 1,
    nullable: false,
  })
  isActive: number;

  @Column({
    name: 'COUNTRY_ID',
    type: 'number',
    nullable: false,
  })
  countryId: number;

  @ManyToOne(() => Country, {
    nullable: false,
  })
  @JoinColumn({
    name: 'COUNTRY_ID',
  })
  country: Country;

  @Column({
    name: 'LANGUAGE_ID',
    type: 'number',
    nullable: false,
  })
  languageId: number;

  @ManyToOne(() => Language, {
    nullable: false,
  })
  @JoinColumn({
    name: 'LANGUAGE_ID',
  })
  language: Language;

  @Column({
    name: 'CREATED_AT',
    type: 'timestamp',
    nullable: false,
    default: () => 'SYSTIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'UPDATED_AT',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;

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
