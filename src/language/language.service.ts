/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './language.entity.ts';
import { UserService } from '../user/user.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class LanguageService {
  private readonly BASE_QUERY = `
    SELECT 
      l.ID,
      l.CODE,
      l.NAME,
      l.IS_DEFAULT,
      l.IS_ACTIVE,
      l.CREATED_AT,
      l.UPDATED_AT,
      l.CREATED_BY,
      l.UPDATED_BY,
      u1.ID as CREATED_BY_ID,
      u1.FIRST_NAME as CREATED_BY_FIRST_NAME,
      u1.LAST_NAME as CREATED_BY_LAST_NAME,
      u2.ID as UPDATED_BY_ID,
      u2.FIRST_NAME as UPDATED_BY_FIRST_NAME,
      u2.LAST_NAME as UPDATED_BY_LAST_NAME
    FROM ECOMMERCE.LANGUAGES l
    LEFT JOIN ECOMMERCE.USERS u1 ON l.CREATED_BY = u1.ID
    LEFT JOIN ECOMMERCE.USERS u2 ON l.UPDATED_BY = u2.ID
  `;

  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    private userService: UserService,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async findAll() {
    const languages = await this.entityManager.query(this.BASE_QUERY);
    return this.transformLanguages(languages);
  }

  async findOne(id: number) {
    const [language] = await this.entityManager.query(
      `${this.BASE_QUERY} WHERE l.ID = :1`,
      [id],
    );
    return language ? this.transformLanguage(language) : null;
  }

  private transformLanguage(language: any) {
    return {
      id: language.ID,
      code: language.CODE,
      name: language.NAME,
      isDefault: language.IS_DEFAULT === 1,
      isActive: language.IS_ACTIVE === 1,
      audit: {
        createdAt: language.CREATED_AT,
        updatedAt: language.UPDATED_AT,
        createdBy: language.CREATED_BY_ID ? {
          id: language.CREATED_BY_ID,
          firstName: language.CREATED_BY_FIRST_NAME,
          lastName: language.CREATED_BY_LAST_NAME
        } : null,
        updatedBy: language.UPDATED_BY_ID ? {
          id: language.UPDATED_BY_ID,
          firstName: language.UPDATED_BY_FIRST_NAME,
          lastName: language.UPDATED_BY_LAST_NAME
        } : null
      }
    };
  }

  private transformLanguages(languages: any[]) {
    return languages.map(language => this.transformLanguage(language));
  }
}
