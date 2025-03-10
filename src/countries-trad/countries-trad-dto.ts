import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCountryTradDto {
  @IsNotEmpty()
  @IsNumber()
  countryId: number;

  @IsNotEmpty()
  @IsNumber()
  languageId: number;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateCountryTradDto {
  @IsNumber()
  countryId?: number;

  @IsNumber()
  languageId?: number;

  @IsString()
  name?: string;
}
