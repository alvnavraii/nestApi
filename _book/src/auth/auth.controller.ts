/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/create-user-dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  async registro(@Body() datosRegistro: CreateUserDto) {
    try {
      return await this.authService.register(datosRegistro);
    } catch (error) {
      throw new HttpException(
        'Error durante el registro',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Post('login')
  async login(@Body() datosLogin: { email: string; password: string }) {
    try {
      return this.authService.login(datosLogin);
    } catch (error) {
      throw new HttpException(
        'Credenciales inválidas',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
