import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CountriesTradService } from './countries-trad.service';
import { CountriesTradEntity } from './countries-trad.entity';
import { UserService } from '../user/user.service';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  OracleCountResult,
  OracleQueryResult,
} from './interfaces/oracle-types.interface';
import { CountryTradRaw } from './interfaces/country-trad.interface';
import { User } from '../user/user.entity';

describe('CountriesTradService', () => {
  let service: CountriesTradService;
  let mockRepository: { query: jest.Mock };
  let mockUserService: { findByEmail: jest.Mock };

  const mockTraduccion: OracleQueryResult<Partial<CountryTradRaw>> = {
    rows: [
      {
        ID: 1,
        COUNTRY_ID: 1,
        LANGUAGE_ID: 1,
        NAME: 'España',
        IS_ACTIVE: 1,
        COUNTRY_ISO_CODE: 'ES',
        COUNTRY_ISO_CODE3: 'ESP',
        COUNTRY_IS_ACTIVE: 1,
        COUNTRY_IS_DEFAULT: 1,
        LANGUAGE_ISO_CODE: 'es',
        LANGUAGE_NAME: 'Español',
        LANGUAGE_IS_ACTIVE: 1,
        LANGUAGE_IS_DEFAULT: 1,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
        CREATED_BY: 1,
        UPDATED_BY: 1,
      },
    ],
  };

  beforeEach(async () => {
    mockRepository = {
      query: jest.fn(),
    };

    mockUserService = {
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesTradService,
        {
          provide: getRepositoryToken(CountriesTradEntity),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<CountriesTradService>(CountriesTradService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar un array de traducciones de países', async () => {
      mockRepository.query.mockResolvedValue(mockTraduccion);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('name', 'España');
      expect(mockRepository.query).toHaveBeenCalled();
    });

    it('debería manejar errores de base de datos', async () => {
      mockRepository.query.mockRejectedValue(new Error('Error de BD'));

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findAll()).rejects.toThrow(
        'Error al obtener las traducciones de países',
      );
    });
  });

  describe('findOne', () => {
    it('debería retornar una traducción por ID', async () => {
      mockRepository.query.mockResolvedValue(mockTraduccion);

      const result = await service.findOne(1);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'España');
      expect(mockRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE ct.ID = :1'),
        [1],
      );
    });

    it('debería lanzar NotFoundException cuando no existe la traducción', async () => {
      mockRepository.query.mockResolvedValue({ rows: [] });

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const mockUser: Partial<User> = {
      id: 1,
      email: 'test@example.com',
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createDto = {
      countryId: 1,
      languageId: 1,
      name: 'España',
    };

    beforeEach(() => {
      const countResult: OracleQueryResult<OracleCountResult> = {
        rows: [{ COUNT: 1 }],
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockRepository.query
        .mockResolvedValueOnce(countResult) // país existe
        .mockResolvedValueOnce(countResult) // idioma existe
        .mockResolvedValueOnce({ rows: [{ COUNT: 0 }] }) // no existe traducción
        .mockResolvedValueOnce(undefined) // set identifier
        .mockResolvedValueOnce({ outBinds: [[1]] }) // insert
        .mockResolvedValueOnce(mockTraduccion); // findOne después del insert
    });

    it('debería crear una nueva traducción', async () => {
      const result = await service.create(createDto, 'test@example.com');

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'España');
      expect(mockRepository.query).toHaveBeenCalledTimes(6);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('debería lanzar BadRequestException si ya existe la traducción', async () => {
      const countResult: OracleQueryResult<OracleCountResult> = {
        rows: [{ COUNT: 1 }],
      };

      mockRepository.query
        .mockReset()
        .mockResolvedValueOnce(countResult) // país existe
        .mockResolvedValueOnce(countResult) // idioma existe
        .mockResolvedValueOnce(countResult); // traducción existe

      await expect(
        service.create(createDto, 'test@example.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.create(createDto, 'noexiste@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockUser: Partial<User> = {
      id: 1,
      email: 'test@example.com',
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateDto = {
      name: 'España Actualizado',
    };

    beforeEach(() => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockRepository.query
        .mockResolvedValueOnce(mockTraduccion) // findOne inicial
        .mockResolvedValueOnce(undefined) // set identifier
        .mockResolvedValueOnce(undefined) // update
        .mockResolvedValueOnce(mockTraduccion); // findOne final
    });

    it('debería actualizar una traducción existente', async () => {
      const result = await service.update(1, updateDto, 'test@example.com');

      expect(result).toHaveProperty('id', 1);
      expect(mockRepository.query).toHaveBeenCalledTimes(4);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('debería lanzar NotFoundException si la traducción no existe', async () => {
      mockRepository.query.mockReset().mockResolvedValueOnce({ rows: [] });

      await expect(
        service.update(999, updateDto, 'test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.update(1, updateDto, 'noexiste@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      mockRepository.query
        .mockResolvedValueOnce(mockTraduccion) // findOne
        .mockResolvedValueOnce(undefined); // update IS_ACTIVE = 0
    });

    it('debería desactivar una traducción existente', async () => {
      await service.remove(1);

      expect(mockRepository.query).toHaveBeenCalledTimes(2);
      expect(mockRepository.query).toHaveBeenLastCalledWith(
        expect.stringContaining('SET IS_ACTIVE = 0'),
        [1],
      );
    });

    it('debería lanzar NotFoundException si la traducción no existe', async () => {
      mockRepository.query.mockReset().mockResolvedValue({ rows: [] }); // findOne retorna vacío

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
