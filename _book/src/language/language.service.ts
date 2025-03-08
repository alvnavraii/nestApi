/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './language.entity';
import { UserService } from '../user/user.service';
import { CreateLanguageDto } from './language.dto';
import { UpdateLanguageDto } from './language.dto';

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
    private readonly languageRepository: Repository<Language>,
    private readonly userService: UserService,
  ) {}

  async create(
    createLanguageDto: CreateLanguageDto,
    userEmail: string,
  ): Promise<any> {
    if (!createLanguageDto) {
      throw new BadRequestException(
        'No se han proporcionado datos para crear el idioma',
      );
    }

    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.languageRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [user.id.toString()],
    );

    try {
      const language = new Language();
      language.code = createLanguageDto.code;
      language.name = createLanguageDto.name;
      language.isDefault = !!createLanguageDto.isDefault;
      language.isActive = createLanguageDto.isActive !== false;

      const savedLanguage = await this.languageRepository.save(language);

      await this.languageRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );

      const result = await this.findOne(savedLanguage.id);
      console.log('Idioma creado:', result);

      return result;
    } catch (error) {
      console.error('Error al crear idioma:', error);
      await this.languageRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateLanguageDto: UpdateLanguageDto,
    userEmail: string,
  ): Promise<any> {
    const language = await this.languageRepository.findOne({
      where: { id: id },
    });

    if (!language) {
      throw new NotFoundException(`Idioma con ID ${id} no encontrado`);
    }

    if (!userEmail) {
      throw new UnauthorizedException('Email de usuario no proporcionado');
    }

    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.languageRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [user.id.toString()],
    );

    try {
      if (updateLanguageDto.code) language.code = updateLanguageDto.code;
      if (updateLanguageDto.name) language.name = updateLanguageDto.name;
      if (updateLanguageDto.isDefault !== undefined)
        language.isDefault = updateLanguageDto.isDefault;
      if (updateLanguageDto.isActive !== undefined)
        language.isActive = updateLanguageDto.isActive;

      await this.languageRepository.save(language);

      await this.languageRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );

      const result = await this.findOne(id);
      return result;
    } catch (error) {
      await this.languageRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }

  async remove(id: number, userEmail: string): Promise<any> {
    const language = await this.languageRepository.findOne({
      where: { id: id },
    });

    if (!language) {
      throw new NotFoundException(`Idioma con ID ${id} no encontrado`);
    }
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.languageRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [user.id.toString()],
    );
    try {
      await this.languageRepository.update(id, { isActive: false });
      await this.languageRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
    } catch (error) {
      await this.languageRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
    const updatedLanguage = await this.findOne(id);
    return updatedLanguage;
  }

  async findOne(id: number) {
    const [language] = await this.languageRepository.query(
      `${this.BASE_QUERY} WHERE l.ID = :1`,
      [id],
    );
    return language ? this.transformLanguage(language) : null;
  }

  async findAll() {
    const languages = await this.languageRepository.query(this.BASE_QUERY);
    return languages.map((language) => this.transformLanguage(language));
  }

  async findAllActive() {
    const languages = await this.languageRepository.query(
      `${this.BASE_QUERY} WHERE l.IS_ACTIVE = 1`,
    );
    return languages.map((language) => this.transformLanguage(language));
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
        createdBy: language.CREATED_BY_ID
          ? {
              id: language.CREATED_BY_ID,
              firstName: language.CREATED_BY_FIRST_NAME,
              lastName: language.CREATED_BY_LAST_NAME,
            }
          : null,
        updatedBy: language.UPDATED_BY_ID
          ? {
              id: language.UPDATED_BY_ID,
              firstName: language.UPDATED_BY_FIRST_NAME,
              lastName: language.UPDATED_BY_LAST_NAME,
            }
          : null,
      },
    };
  }
}
