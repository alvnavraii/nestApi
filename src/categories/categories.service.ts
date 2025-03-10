import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CategoriesEntity } from './categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse } from './interfaces/category-response.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
    private dataSource: DataSource,
    private userService: UserService,
  ) {}

  private async setSessionIdentifier(userEmail: string): Promise<void> {
    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    await this.dataSource.query(
      'BEGIN dbms_session.set_identifier(:userId); END;',
      [user.id],
    );
  }

  private formatCategoryResponse(category: CategoriesEntity): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      categoryCode: category.categoryCode,
      description: category.description || null,
      imageUrl: category.imageUrl || null,
      isActive: category.isActive,
      displayOrder: category.displayOrder || null,
      parentId: category.parentId || null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      createdBy: category.createdBy || null,
      updatedBy: category.updatedBy || null,
    };
  }

  async findAll(): Promise<CategoryResponse[]> {
    try {
      const categories = await this.categoriesRepository.find({
        where: { isActive: 1 },
      });
      return categories.map((category: CategoriesEntity) =>
        this.formatCategoryResponse(category),
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error desconocido al obtener las categorías',
      );
    }
  }

  async findOne(id: number): Promise<CategoryResponse> {
    try {
      const category = await this.categoriesRepository.findOne({
        where: { id, isActive: 1 },
      });

      if (!category) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }

      return this.formatCategoryResponse(category);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error desconocido al obtener la categoría',
      );
    }
  }

  async create(
    dto: CreateCategoryDto,
    userEmail: string,
  ): Promise<CategoryResponse> {
    try {
      await this.setSessionIdentifier(userEmail);

      if (dto.parentId) {
        const parentCategory = await this.categoriesRepository.findOne({
          where: { id: dto.parentId },
        });

        if (!parentCategory) {
          throw new NotFoundException(
            `Categoría padre con ID ${dto.parentId} no encontrada`,
          );
        }
      }

      const user = await this.userService.findByEmail(userEmail);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const category = this.categoriesRepository.create({
        ...dto,
        isActive: 1,
        createdBy: user.id,
        updatedBy: user.id,
      });

      const savedCategory = await this.categoriesRepository.save(category);
      return this.formatCategoryResponse(savedCategory);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error desconocido al crear la categoría',
      );
    }
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
    userEmail: string,
  ): Promise<CategoryResponse> {
    try {
      await this.setSessionIdentifier(userEmail);

      const category = await this.categoriesRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }

      if (dto.parentId) {
        const parentCategory = await this.categoriesRepository.findOne({
          where: { id: dto.parentId },
        });

        if (!parentCategory) {
          throw new NotFoundException(
            `Categoría padre con ID ${dto.parentId} no encontrada`,
          );
        }
      }

      const user = await this.userService.findByEmail(userEmail);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const updatedCategory = await this.categoriesRepository.save({
        ...category,
        ...dto,
        updatedBy: user.id,
      });

      return this.formatCategoryResponse(updatedCategory);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error desconocido al actualizar la categoría',
      );
    }
  }

  async remove(id: number, userEmail: string): Promise<void> {
    try {
      await this.setSessionIdentifier(userEmail);

      const category = await this.categoriesRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }

      const user = await this.userService.findByEmail(userEmail);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      category.isActive = 0;
      category.updatedBy = user.id;
      await this.categoriesRepository.save(category);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error desconocido al eliminar la categoría',
      );
    }
  }

  async restore(id: number, userEmail: string): Promise<void> {
    try {
      await this.setSessionIdentifier(userEmail);

      const category = await this.categoriesRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }

      const user = await this.userService.findByEmail(userEmail);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      category.isActive = 1;
      category.updatedBy = user.id;
      await this.categoriesRepository.save(category);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error desconocido al restaurar la categoría',
      );
    }
  }
}
