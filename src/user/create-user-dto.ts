import { OmitType } from '@nestjs/mapped-types';
import { IsString, MinLength } from 'class-validator';
import { User } from './user.entity';

export class CreateUserDto extends OmitType(User, [
  'id',
  'role',
  'passwordHash',
  'isActive',
  'lastLoginDate',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
] as const) {
  @IsString()
  @MinLength(6)
  password: string;
}
