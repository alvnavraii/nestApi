import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UserResponse } from './interfaces/user-response.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    void this.setTimeZone();
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
    'user.lastLoginDate',
    'user.createdAt',
    'user.updatedAt',
    'user.roleId',
    'role.id',
    'role.name',
    'role.description',
    'role.isActive',
    'role.createdAt',
    'role.updatedAt',
  ];

  private createBaseQuery() {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select(this.userSelectFields);
  }

  private formatUserResponse(user: User): UserResponse {
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
            description: user.role.description || null,
            isActive: user.role.isActive,
          }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.createBaseQuery().getMany();
    return users.map((user) => this.formatUserResponse(user));
  }

  async findOne(id: number): Promise<UserResponse> {
    const user = await this.createBaseQuery()
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.formatUserResponse(user);
  }

  async findByEmail(email: string): Promise<User | null> {
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
  }): Promise<UserResponse> {
    const passwordHash = await bcrypt.hash(createUserData.password, 10);
    const user = this.userRepository.create({
      ...createUserData,
      passwordHash,
      roleId: createUserData.roleId || 2,
      isActive: 1,
    });
    const savedUser = await this.userRepository.save(user);
    return this.findOne(savedUser.id);
  }

  async update(
    id: number,
    updateUserData: Partial<User>,
  ): Promise<UserResponse> {
    const userEntity = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    if (!userEntity) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.userRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [id],
    );

    try {
      if (typeof updateUserData.isActive === 'boolean') {
        updateUserData.isActive = updateUserData.isActive ? 1 : 0;
      }
      this.userRepository.merge(userEntity, updateUserData);
      await this.userRepository.save(userEntity);

      await this.userRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );

      const updatedUser = await this.findOne(id);
      return updatedUser;
    } catch (error) {
      await this.userRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [id],
    );

    await this.userRepository.query(
      `UPDATE ECOMMERCE.USERS 
       SET LAST_LOGIN_DATE = CURRENT_TIMESTAMP,
           UPDATED_BY = :1,
           UPDATED_AT = CURRENT_TIMESTAMP
       WHERE ID = :2`,
      [id, id],
    );

    await this.userRepository.query(
      `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
    );
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.userRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [id],
    );

    try {
      await this.userRepository.softDelete(id);

      await this.userRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
    } catch (error) {
      await this.userRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }
}
