import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}

export class UpdateLanguageDto {
  code?: string;
  name?: string;
  isDefault?: boolean;
  isActive?: boolean;
}
