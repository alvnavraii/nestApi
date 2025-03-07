import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageService } from './language.service';
import { LanguageController } from './language.controller';
import { Language } from './language.entity.ts';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Language]), UserModule],
  providers: [LanguageService],
  controllers: [LanguageController],
  exports: [LanguageService],
})
export class LanguageModule {}
