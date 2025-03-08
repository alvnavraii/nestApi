import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './countries.entity';
import { UserModule } from '../user/user.module';

@Module({
  providers: [CountriesService],
  controllers: [CountriesController],
  imports: [TypeOrmModule.forFeature([Country]), UserModule],
})
export class CountriesModule {}
