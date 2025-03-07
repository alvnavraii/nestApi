import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from './login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async generarToken(payload: {
    id: number;
    email: string;
    roleId: number;
  }): Promise<LoginResponseDto> {
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(datosLogin: { email: string; password: string }) {
    // Primero buscar el usuario
    const user = await this.usersService.findByEmail(datosLogin.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(
      datosLogin.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(datosRegistro: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    website?: string;
    roleId: number;
  }) {
    return await this.usersService.create({
      ...datosRegistro,
      companyName: datosRegistro.companyName || undefined,
      website: datosRegistro.website || undefined,
    });
  }
}
