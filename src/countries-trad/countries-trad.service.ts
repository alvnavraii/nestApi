import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountriesTradEntity } from './countries-trad.entity';
import { UserService } from '../user/user.service';
import {
  CountryTradRaw,
  CountryTradResponse,
} from './interfaces/country-trad.interface';
import { transformCountryTrad } from './transformers/country-trad.transformer';
import {
  CreateCountryTradDto,
  UpdateCountryTradDto,
} from './countries-trad-dto';
import {
  OracleCountResult,
  OracleInsertResult,
  OracleQueryResult,
} from './interfaces/oracle-types.interface';

@Injectable()
export class CountriesTradService {
  constructor(
    @InjectRepository(CountriesTradEntity)
    private readonly countriesTradRepository: Repository<CountriesTradEntity>,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<CountryTradResponse[]> {
    try {
      const result = (await this.countriesTradRepository.query(`
        SELECT ct.*,
          c.ISO_CODE as COUNTRY_ISO_CODE,
          c.ISO_CODE3 as COUNTRY_ISO_CODE3,
          c.IS_ACTIVE as COUNTRY_IS_ACTIVE,
          c.IS_DEFAULT as COUNTRY_IS_DEFAULT,
          l.ISO_CODE as LANGUAGE_ISO_CODE,
          l.NAME as LANGUAGE_NAME,
          l.IS_ACTIVE as LANGUAGE_IS_ACTIVE,
          l.IS_DEFAULT as LANGUAGE_IS_DEFAULT
        FROM ecommerce.COUNTRY_TRANSLATIONS ct
        JOIN ecommerce.COUNTRIES c ON c.ID = ct.COUNTRY_ID
        JOIN ecommerce.LANGUAGES l ON l.ID = ct.LANGUAGE_ID
        WHERE ct.IS_ACTIVE = 1
      `)) as OracleQueryResult<CountryTradRaw>;

      return result.rows.map(transformCountryTrad);
    } catch (_) {
      throw new InternalServerErrorException(
        'Error al obtener las traducciones de países',
      );
    }
  }

  async findOne(id: number): Promise<CountryTradResponse> {
    try {
      const result = (await this.countriesTradRepository.query(
        `SELECT ct.*,
          c.ISO_CODE as COUNTRY_ISO_CODE,
          c.ISO_CODE3 as COUNTRY_ISO_CODE3,
          c.IS_ACTIVE as COUNTRY_IS_ACTIVE,
          c.IS_DEFAULT as COUNTRY_IS_DEFAULT,
          l.ISO_CODE as LANGUAGE_ISO_CODE,
          l.NAME as LANGUAGE_NAME,
          l.IS_ACTIVE as LANGUAGE_IS_ACTIVE,
          l.IS_DEFAULT as LANGUAGE_IS_DEFAULT
        FROM ecommerce.COUNTRY_TRANSLATIONS ct
        JOIN ecommerce.COUNTRIES c ON c.ID = ct.COUNTRY_ID
        JOIN ecommerce.LANGUAGES l ON l.ID = ct.LANGUAGE_ID
        WHERE ct.ID = :1`,
        [id],
      )) as OracleQueryResult<CountryTradRaw>;

      if (!result.rows[0]) {
        throw new NotFoundException(`Traducción con ID ${id} no encontrada`);
      }

      return transformCountryTrad(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en findOne:', error);
      throw new InternalServerErrorException(
        'Error al obtener la traducción del país',
      );
    }
  }

  async findAllInactive(): Promise<CountryTradResponse[]> {
    try {
      const result = (await this.countriesTradRepository.query(`
        SELECT ct.*,
          c.ISO_CODE as COUNTRY_ISO_CODE,
          c.ISO_CODE3 as COUNTRY_ISO_CODE3,
          c.IS_ACTIVE as COUNTRY_IS_ACTIVE,
          c.IS_DEFAULT as COUNTRY_IS_DEFAULT,
          l.ISO_CODE as LANGUAGE_ISO_CODE,
          l.NAME as LANGUAGE_NAME,
          l.IS_ACTIVE as LANGUAGE_IS_ACTIVE,
          l.IS_DEFAULT as LANGUAGE_IS_DEFAULT
        FROM ecommerce.COUNTRY_TRANSLATIONS ct
        JOIN ecommerce.COUNTRIES c ON c.ID = ct.COUNTRY_ID
        JOIN ecommerce.LANGUAGES l ON l.ID = ct.LANGUAGE_ID
        WHERE ct.IS_ACTIVE = 0
      `)) as OracleQueryResult<CountryTradRaw>;

      return result.rows.map(transformCountryTrad);
    } catch (_) {
      console.error('Error en findAllInactive:', _);
      throw new InternalServerErrorException(
        'Error al obtener las traducciones inactivas',
      );
    }
  }

  async create(
    createCountryTradDto: CreateCountryTradDto,
    userEmail: string,
  ): Promise<CountryTradResponse> {
    try {
      const user = await this.userService.findByEmail(userEmail);
      if (!user) {
        throw new NotFoundException(`Usuario no encontrado: ${userEmail}`);
      }

      // Verificar si el país existe
      const countryExists = (await this.countriesTradRepository.query(
        `SELECT COUNT(*) as COUNT FROM ecommerce.COUNTRIES WHERE ID = :1`,
        [createCountryTradDto.countryId],
      )) as OracleQueryResult<OracleCountResult>;

      if (countryExists.rows[0]?.COUNT === 0) {
        throw new BadRequestException(
          `El país con ID ${createCountryTradDto.countryId} no existe`,
        );
      }

      // Verificar si el idioma existe
      const languageExists = (await this.countriesTradRepository.query(
        `SELECT COUNT(*) as COUNT FROM ecommerce.LANGUAGES WHERE ID = :1`,
        [createCountryTradDto.languageId],
      )) as OracleQueryResult<OracleCountResult>;

      if (languageExists.rows[0]?.COUNT === 0) {
        throw new BadRequestException(
          `El idioma con ID ${createCountryTradDto.languageId} no existe`,
        );
      }

      // Verificar si ya existe una traducción para este país y lenguaje
      const existingTranslation = (await this.countriesTradRepository.query(
        `SELECT COUNT(*) as COUNT 
         FROM ecommerce.COUNTRY_TRANSLATIONS 
         WHERE COUNTRY_ID = :1 AND LANGUAGE_ID = :2 AND IS_ACTIVE = 1`,
        [createCountryTradDto.countryId, createCountryTradDto.languageId],
      )) as OracleQueryResult<OracleCountResult>;

      if (existingTranslation.rows[0]?.COUNT > 0) {
        throw new BadRequestException(
          'Ya existe una traducción activa para este país en este idioma',
        );
      }

      // Establecer el identificador de sesión
      await this.countriesTradRepository.query(
        `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
        [user.id.toString()],
      );

      // Insertar el registro
      const insertResult = (await this.countriesTradRepository.query(
        `INSERT INTO ecommerce.COUNTRY_TRANSLATIONS 
         (COUNTRY_ID, LANGUAGE_ID, NAME, IS_ACTIVE, CREATED_BY) 
         VALUES (:1, :2, :3, 1, :4)
         RETURNING ID INTO :5`,
        [
          createCountryTradDto.countryId,
          createCountryTradDto.languageId,
          createCountryTradDto.name,
          user.id,
          { dir: 3000, type: 2002, maxSize: 1 },
        ],
      )) as OracleInsertResult;

      // Obtener la traducción recién creada
      const newId = Number(insertResult.outBinds[0][0]);
      return this.findOne(newId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error en create:', error);
      throw new InternalServerErrorException(
        'Error al crear la traducción del país',
      );
    }
  }

  async update(
    id: number,
    updateCountryTradDto: UpdateCountryTradDto,
    userEmail: string,
  ): Promise<CountryTradResponse> {
    try {
      const user = await this.userService.findByEmail(userEmail);
      if (!user) {
        throw new NotFoundException(`Usuario no encontrado: ${userEmail}`);
      }

      const translation = await this.findOne(id);
      if (!translation) {
        throw new NotFoundException(`Traducción con ID ${id} no encontrada`);
      }

      if (updateCountryTradDto.countryId) {
        const countryExists = (await this.countriesTradRepository.query(
          `SELECT COUNT(*) as COUNT FROM ecommerce.COUNTRIES WHERE ID = :1`,
          [updateCountryTradDto.countryId],
        )) as OracleQueryResult<OracleCountResult>;

        if (countryExists.rows[0]?.COUNT === 0) {
          throw new BadRequestException(
            `El país con ID ${updateCountryTradDto.countryId} no existe`,
          );
        }
      }

      if (updateCountryTradDto.languageId) {
        const languageExists = (await this.countriesTradRepository.query(
          `SELECT COUNT(*) as COUNT FROM ecommerce.LANGUAGES WHERE ID = :1`,
          [updateCountryTradDto.languageId],
        )) as OracleQueryResult<OracleCountResult>;

        if (languageExists.rows[0]?.COUNT === 0) {
          throw new BadRequestException(
            `El idioma con ID ${updateCountryTradDto.languageId} no existe`,
          );
        }
      }

      // Establecer el identificador de sesión
      await this.countriesTradRepository.query(
        `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
        [user.id.toString()],
      );

      // Construir la consulta de actualización
      const updateFields: string[] = [];
      const params: (string | number)[] = [];
      let paramIndex = 1;

      if (updateCountryTradDto.countryId !== undefined) {
        updateFields.push(`COUNTRY_ID = :${paramIndex}`);
        params.push(updateCountryTradDto.countryId);
        paramIndex++;
      }

      if (updateCountryTradDto.languageId !== undefined) {
        updateFields.push(`LANGUAGE_ID = :${paramIndex}`);
        params.push(updateCountryTradDto.languageId);
        paramIndex++;
      }

      if (updateCountryTradDto.name !== undefined) {
        updateFields.push(`NAME = :${paramIndex}`);
        params.push(updateCountryTradDto.name);
        paramIndex++;
      }

      // Agregar campos de auditoría
      updateFields.push(`UPDATED_AT = SYSTIMESTAMP`);
      updateFields.push(`UPDATED_BY = :${paramIndex}`);
      params.push(user.id);
      paramIndex++;

      // Agregar el ID al final de los parámetros
      params.push(id);

      await this.countriesTradRepository.query(
        `UPDATE ecommerce.COUNTRY_TRANSLATIONS 
         SET ${updateFields.join(', ')}
         WHERE ID = :${paramIndex}`,
        params,
      );

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error en update:', error);
      throw new InternalServerErrorException(
        'Error al actualizar la traducción del país',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const translation = await this.findOne(id);
      if (!translation) {
        throw new NotFoundException(`Traducción con ID ${id} no encontrada`);
      }

      await this.countriesTradRepository.query(
        `UPDATE ecommerce.COUNTRY_TRANSLATIONS 
         SET IS_ACTIVE = 0
         WHERE ID = :1`,
        [id],
      );
    } catch (_) {
      if (_ instanceof NotFoundException) {
        throw _;
      }
      console.error('Error en remove:', _);
      throw new InternalServerErrorException(
        'Error al eliminar la traducción del país',
      );
    }
  }
}
