/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './countries.entity';
import { UserService } from '../user/user.service';
import { CreateCountryDto } from './country-dto';
import { UpdateCountryDto } from './country-dto';

@Injectable()
export class CountriesService {
  private readonly BASE_QUERY = `
    SELECT 
      c.ID,
      c.ISO_CODE,
      c.ISO_CODE3,
      c.IS_ACTIVE,
      c.IS_DEFAULT,
      c.CREATED_AT,
      c.UPDATED_AT,
      c.CREATED_BY,
      c.UPDATED_BY,
      u1.ID as CREATED_BY_ID,
      u1.FIRST_NAME as CREATED_BY_FIRST_NAME,
      u1.LAST_NAME as CREATED_BY_LAST_NAME,
      u2.ID as UPDATED_BY_ID,
      u2.FIRST_NAME as UPDATED_BY_FIRST_NAME,
      u2.LAST_NAME as UPDATED_BY_LAST_NAME
    FROM ECOMMERCE.COUNTRIES c
    LEFT JOIN ECOMMERCE.USERS u1 ON c.CREATED_BY = u1.ID
    LEFT JOIN ECOMMERCE.USERS u2 ON c.UPDATED_BY = u2.ID
  `;

  constructor(
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
    private readonly userService: UserService,
  ) {}
  async findAll() {
    const countries = await this.countriesRepository.query(this.BASE_QUERY);
    return countries.map((country) => this.transformCountry(country));
  }
  async findOne(id: number) {
    const country = await this.countriesRepository.query(
      `${this.BASE_QUERY} WHERE c.ID = :1`,
      [id],
    );
    return this.transformCountry(country[0]);
  }
  async findAllActive() {
    const countries = await this.countriesRepository.query(
      `${this.BASE_QUERY} WHERE c.IS_ACTIVE = 1`,
    );
    return countries.map((country) => this.transformCountry(country));
  }

  async findAllInactive() {
    const countries = await this.countriesRepository.query(
      `${this.BASE_QUERY} WHERE c.IS_ACTIVE = 0`,
    );
    return countries.map((country) => this.transformCountry(country));
  }

  async create(createCountryDto: CreateCountryDto, userEmail: string) {
    if (!createCountryDto) {
      throw new BadRequestException(
        'No se han proporcionado datos para crear el país',
      );
    }

    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.countriesRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [user.id.toString()],
    );

    try {
      const country = new Country();
      country.isoCode = createCountryDto.isoCode;
      country.isoCode3 = createCountryDto.isoCode3;
      country.isActive = createCountryDto.isActive !== false ? 1 : 0;
      country.isDefault = createCountryDto.isDefault ? 1 : 0;
      await this.countriesRepository.save(country);
      const savedCountry = await this.findOne(country.id);
      await this.countriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      return savedCountry;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el país', {
        cause: error,
      });
    } finally {
      await this.countriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
    }
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
    userEmail: string,
  ): Promise<any> {
    const country = await this.countriesRepository.findOne({
      where: { id: id },
    });
    if (!country) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.countriesRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [user.id.toString()],
    );

    try {
      if (updateCountryDto.isoCode) country.isoCode = updateCountryDto.isoCode;
      if (updateCountryDto.isoCode3)
        country.isoCode3 = updateCountryDto.isoCode3;
      if (updateCountryDto.isActive !== undefined)
        country.isActive = updateCountryDto.isActive ? 1 : 0;
      if (updateCountryDto.isDefault !== undefined)
        country.isDefault = updateCountryDto.isDefault ? 1 : 0;

      await this.countriesRepository.save(country);
      const updatedCountry = await this.findOne(id);
      await this.countriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      return updatedCountry;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el país', {
        cause: error,
      });
    }
  }

  async remove(id: number, userEmail: string): Promise<any> {
    const country = await this.countriesRepository.findOne({
      where: { id: id },
    });
    if (!country) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    try {
      await this.countriesRepository.update(id, { isActive: 0 });
      await this.countriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
    } catch (error) {
      await this.countriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
    const updatedCountry = await this.findOne(id);
    return updatedCountry;
  }

  private transformCountry(country: any) {
    return {
      id: country.ID,
      isoCode: country.ISO_CODE,
      isoCode3: country.ISO_CODE3,
      isActive: country.IS_ACTIVE === 1,
      isDefault: country.IS_DEFAULT === 1,
      audit: {
        createdAt: country.CREATED_AT,
        updatedAt: country.UPDATED_AT,
        createdBy: country.CREATED_BY_ID
          ? {
              id: country.CREATED_BY_ID,
              firstName: country.CREATED_BY_FIRST_NAME,
              lastName: country.CREATED_BY_LAST_NAME,
            }
          : null,
        updatedBy: country.UPDATED_BY_ID
          ? {
              id: country.UPDATED_BY_ID,
              firstName: country.UPDATED_BY_FIRST_NAME,
              lastName: country.UPDATED_BY_LAST_NAME,
            }
          : null,
      },
    };
  }
}
