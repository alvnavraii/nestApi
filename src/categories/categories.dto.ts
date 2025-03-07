import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  isActive?: boolean;

  @Transform(({ value }) => value ? Number(value) : null)
  @IsOptional()
  parent_id?: number;
}

export class UpdateCategoryDto {
  parentId?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: number;
  displayOrder?: number;
}
