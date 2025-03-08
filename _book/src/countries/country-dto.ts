import { IsOptional, IsString } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  isoCode: string;

  @IsString()
  isoCode3: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  isDefault?: boolean;
}

export class UpdateCountryDto {
  isoCode?: string;
  isoCode3?: string;
  isActive?: boolean;
  isDefault?: boolean;
}
