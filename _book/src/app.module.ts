import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { UserModule } from './user/user.module';
import { ClsModule } from 'nestjs-cls';
import { AuditSubscriber } from './common/subscribers/audit.subscriber';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { UserContextInterceptor } from './common/interceptors/user-context.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LanguageModule } from './language/language.module';
import { CountriesModule } from './countries/countries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${configService.get('BD_HOST')})(PORT=${configService.get('BD_PORT')}))(CONNECT_DATA=(SERVICE_NAME=${configService.get('BD_SERVICE_NAME')})))`,
        username: configService.get<string>('BD_USER'),
        password: configService.get<string>('BD_PASSWORD'),
        synchronize: false,
        logging: true,
        entities: ['dist/**/*.entity.js'],
        extra: {
          timezone: 'Europe/Madrid',
          formatOptions: {
            useNativeDate: true,
          },
        },
      }),
    }),
    AuthModule,
    CategoriesModule,
    UserModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    LanguageModule,
    CountriesModule,
  ],
  controllers: [AppController],
  providers: [
    AuditSubscriber,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserContextInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
