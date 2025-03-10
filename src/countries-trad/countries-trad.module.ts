import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesTradController } from './countries-trad.controller';
import { CountriesTradEntity } from './countries-trad.entity';
import { CountriesTradService } from './countries-trad.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([CountriesTradEntity]), UserModule],
  providers: [CountriesTradService],
  controllers: [CountriesTradController],
})
export class CountriesTradModule {}
