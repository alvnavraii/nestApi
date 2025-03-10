import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CountriesTradController } from './countries-trad.controller';
import { CountriesTradService } from './countries-trad.service';
import { CountriesTradEntity } from './countries-trad.entity';
import { UserService } from '../user/user.service';
import {
  OracleCountResult,
  OracleQueryResult,
} from './interfaces/oracle-types.interface';
import { CountryTradRaw } from './interfaces/country-trad.interface';
import { User } from '../user/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

interface ApiResponse {
  id: number;
  name: string;
  [key: string]: any;
}

describe('CountriesTradController (e2e)', () => {
  let app: INestApplication;
  let mockRepository: { query: jest.Mock };
  let mockUserService: { findByEmail: jest.Mock };
  let mockRolesGuard: { canActivate: jest.Mock };

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

    mockRolesGuard = {
      canActivate: jest.fn().mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        const userEmail = request.headers['user-email'];
        request.user = { email: userEmail };
        return true;
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CountriesTradController],
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
    })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/countries-trad (GET)', () => {
    it('debería retornar un array de traducciones', async () => {
      mockRepository.query.mockResolvedValue(mockTraduccion);

      const response = await request(app.getHttpServer())
        .get('/api/countries-trad')
        .expect(200);

      const body = response.body;
      expect(Array.isArray(body)).toBe(true);
      expect(body[0]).toHaveProperty('id', 1);
      expect(body[0]).toHaveProperty('name', 'España');
    });
  });

  describe('/api/countries-trad/:id (GET)', () => {
    it('debería retornar una traducción por ID', async () => {
      mockRepository.query.mockResolvedValue(mockTraduccion);

      const response = await request(app.getHttpServer())
        .get('/api/countries-trad/1')
        .expect(200);

      const body = response.body;
      expect(body).toHaveProperty('id', 1);
      expect(body).toHaveProperty('name', 'España');
    });

    it('debería retornar 404 cuando no existe la traducción', async () => {
      mockRepository.query.mockResolvedValue({ rows: [] });

      await request(app.getHttpServer())
        .get('/api/countries-trad/999')
        .expect(404);
    });
  });

  describe('/api/countries-trad (POST)', () => {
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

    it('debería crear una nueva traducción', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const countResult: OracleQueryResult<OracleCountResult> = {
        rows: [{ COUNT: 1 }],
      };

      mockRepository.query
        .mockResolvedValueOnce(countResult) // país existe
        .mockResolvedValueOnce(countResult) // idioma existe
        .mockResolvedValueOnce({ rows: [{ COUNT: 0 }] }) // no existe traducción
        .mockResolvedValueOnce(undefined) // set identifier
        .mockResolvedValueOnce({ outBinds: [[1]] }) // insert
        .mockResolvedValueOnce(mockTraduccion); // findOne

      const response = await request(app.getHttpServer())
        .post('/api/countries-trad')
        .set('user-email', 'test@example.com')
        .send(createDto)
        .expect(201);

      const body = response.body;
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name', 'España');
    });

    it('debería retornar 400 si la traducción ya existe', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const countResult: OracleQueryResult<OracleCountResult> = {
        rows: [{ COUNT: 1 }],
      };

      mockRepository.query
        .mockResolvedValueOnce(countResult) // país existe
        .mockResolvedValueOnce(countResult) // idioma existe
        .mockResolvedValueOnce(countResult); // traducción existe

      await request(app.getHttpServer())
        .post('/api/countries-trad')
        .set('user-email', 'test@example.com')
        .send(createDto)
        .expect(400);
    });
  });
});
