/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { formatInTimeZone } from 'date-fns-tz';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Establecer la zona horaria al iniciar el servicio
    this.setTimeZone();
  }

  private async setTimeZone() {
    await this.userRepository.query(
      `ALTER SESSION SET TIME_ZONE = 'Europe/Madrid'`,
    );
  }

  private readonly userSelectFields = [
    'user.id',
    'user.email',
    'user.firstName',
    'user.lastName',
    'user.isActive',
    'user.phone',
    'user.companyName',
    'user.website',
    'user.createdAt',
    'user.updatedAt',
    'user.lastLoginDate',
    'user.roleId',
    'role.id',
    'role.name',
    'role.description',
    'role.isActive',
    'role.createdAt',
    'role.updatedAt',
    'createdBy.id',
    'createdBy.firstName',
    'createdBy.lastName',
    'updatedBy.id',
    'updatedBy.firstName',
    'updatedBy.lastName',
  ];

  private transformUserData(user: User): User {
    return user; // Ya no necesitamos transformar las fechas
  }

  private createBaseQuery() {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.createdBy', 'createdBy')
      .leftJoinAndSelect('role.updatedBy', 'updatedBy')
      .select(this.userSelectFields);
  }

  private formatUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      companyName: user.companyName,
      website: user.website,
      isActive: user.isActive,
      lastLoginDate: user.lastLoginDate,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
            isActive: user.role.isActive,
          }
        : null,
      audit: {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        createdBy: user.role?.createdBy
          ? {
              id: user.role.createdBy.id,
              firstName: user.role.createdBy.firstName,
              lastName: user.role.createdBy.lastName,
            }
          : null,
        updatedBy: user.role?.updatedBy
          ? {
              id: user.role.updatedBy.id,
              firstName: user.role.updatedBy.firstName,
              lastName: user.role.updatedBy.lastName,
            }
          : null,
      },
    };
  }

  async findAll(): Promise<any[]> {
    const users = await this.createBaseQuery().getMany();
    return users.map((user) => this.formatUserResponse(user));
  }

  async findOne(id: number): Promise<any> {
    const user = await this.createBaseQuery()
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.formatUserResponse(user);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async create(createUserData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    website?: string;
    roleId?: number;
  }) {
    const passwordHash = await bcrypt.hash(createUserData.password, 10);
    const user = this.userRepository.create({
      ...createUserData,
      passwordHash,
      roleId: createUserData.roleId || 2,
      isActive: true,
    });
    return await this.userRepository.save(user);
  }

  async update(id: number, updateUserData: Partial<User>) {
    const userEntity = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    if (!userEntity) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Establecemos el CLIENT_IDENTIFIER antes de hacer el update
    await this.userRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [id],
    );

    try {
      // Hacemos el merge y el save con la entidad original, no con los datos transformados
      this.userRepository.merge(userEntity, updateUserData);
      await this.userRepository.save(userEntity);

      // Limpiamos el CLIENT_IDENTIFIER
      await this.userRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );

      // Después de guardar, buscamos el usuario actualizado y lo transformamos
      const updatedUser = await this.findOne(id);
      return this.transformUserData(updatedUser);
    } catch (error) {
      // Aseguramos que se limpie el CLIENT_IDENTIFIER incluso si hay error
      await this.userRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    // Primero establecemos el CLIENT_IDENTIFIER
    await this.userRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [id],
    );

    // Luego hacemos el update
    await this.userRepository.query(
      `UPDATE ECOMMERCE.USERS 
       SET last_login_date = CURRENT_TIMESTAMP,
           updated_by = :1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = :2`,
      [id, id],
    );

    // Limpiamos el CLIENT_IDENTIFIER
    await this.userRepository.query(
      `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
    );
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    // Establecemos el CLIENT_IDENTIFIER antes de hacer el update
    await this.userRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [id],
    );

    try {
      user.isActive = false;
      await this.userRepository.save(user);

      // Limpiamos el CLIENT_IDENTIFIER
      await this.userRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );

      return user;
    } catch (error) {
      // Aseguramos que se limpie el CLIENT_IDENTIFIER incluso si hay error
      await this.userRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }
}
