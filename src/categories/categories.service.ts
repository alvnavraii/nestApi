/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesEntity } from './categories.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
    private readonly userService: UserService,
  ) {}

  private getBaseQuery(hierarchyClause: string): string {
    return `
      SELECT 
        c.ID,
        c.NAME,
        c.DESCRIPTION,
        c.IMAGE_URL,
        c.IS_ACTIVE,
        c.DISPLAY_ORDER,
        c.PARENT_ID,
        c.CREATED_AT,
        c.UPDATED_AT,
        c.CREATED_BY,
        c.UPDATED_BY,
        u1.ID as CREATED_BY_ID,
        u1.FIRST_NAME as CREATED_BY_FIRST_NAME,
        u1.LAST_NAME as CREATED_BY_LAST_NAME,
        u2.ID as UPDATED_BY_ID,
        u2.FIRST_NAME as UPDATED_BY_FIRST_NAME,
        u2.LAST_NAME as UPDATED_BY_LAST_NAME,
        LEVEL
      FROM ECOMMERCE.CATEGORIES c
      LEFT JOIN ECOMMERCE.USERS u1 ON u1.ID = c.CREATED_BY
      LEFT JOIN ECOMMERCE.USERS u2 ON u2.ID = c.UPDATED_BY
      ${hierarchyClause}
      ORDER SIBLINGS BY c.ID
    `;
  }

  private buildTree(items: any[]): any[] {
    if (!items || items.length === 0) return [];

    // Encontramos el elemento raíz (el que estamos buscando)
    const rootId = items[0].ID;

    const buildNode = (parentId: number | null = rootId) => {
      return items
        .filter((item) => item.PARENT_ID === parentId)
        .map((item) => ({
          id: item.ID,
          name: item.NAME,
          description: item.DESCRIPTION,
          imageUrl: item.IMAGE_URL,
          isActive: item.IS_ACTIVE === 1,
          displayOrder: item.DISPLAY_ORDER,
          level: item.LEVEL,
          children: buildNode(item.ID),
          audit: {
            createdAt: item.CREATED_AT,
            updatedAt: item.UPDATED_AT,
            createdBy: item.CREATED_BY_ID
              ? {
                  id: item.CREATED_BY_ID,
                  firstName: item.CREATED_BY_FIRST_NAME,
                  lastName: item.CREATED_BY_LAST_NAME,
                }
              : null,
            updatedBy: item.UPDATED_BY_ID
              ? {
                  id: item.UPDATED_BY_ID,
                  firstName: item.UPDATED_BY_FIRST_NAME,
                  lastName: item.UPDATED_BY_LAST_NAME,
                }
              : null,
          },
        }));
    };

    // Construimos el árbol empezando por el elemento raíz
    const tree = items
      .filter((item) => item.ID === rootId)
      .map((item) => ({
        id: item.ID,
        name: item.NAME,
        description: item.DESCRIPTION,
        imageUrl: item.IMAGE_URL,
        isActive: item.IS_ACTIVE === 1,
        displayOrder: item.DISPLAY_ORDER,
        level: item.LEVEL,
        children: buildNode(item.ID),
        audit: {
          createdAt: item.CREATED_AT,
          updatedAt: item.UPDATED_AT,
          createdBy: item.CREATED_BY_ID
            ? {
                id: item.CREATED_BY_ID,
                firstName: item.CREATED_BY_FIRST_NAME,
                lastName: item.CREATED_BY_LAST_NAME,
              }
            : null,
          updatedBy: item.UPDATED_BY_ID
            ? {
                id: item.UPDATED_BY_ID,
                firstName: item.UPDATED_BY_FIRST_NAME,
                lastName: item.UPDATED_BY_LAST_NAME,
              }
            : null,
        },
      }));

    return tree;
  }

  async findAll(): Promise<any[]> {
    const result = await this.categoriesRepository.query(
      this.getBaseQuery(
        'START WITH c.PARENT_ID IS NULL CONNECT BY PRIOR c.ID = c.PARENT_ID',
      ),
    );

    // Devolvemos directamente el array de resultados
    return Object.values(this.buildTree(result));
  }

  async findOne(id: number): Promise<any> {
    const result = await this.categoriesRepository.query(
      this.getBaseQuery(
        'START WITH c.ID = :1 CONNECT BY c.PARENT_ID = PRIOR c.ID',
      ),
      [id],
    );

    if (!result.length) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Construimos el árbol solo para la categoría solicitada y sus hijos directos
    const categoryTree = this.buildTree(result);
    return categoryTree[0];
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    userEmail: string,
  ): Promise<CategoriesEntity> {
    if (!createCategoryDto) {
      throw new BadRequestException(
        'No se han proporcionado datos para crear la categoría',
      );
    }

    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.categoriesRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [user.id.toString()],
    );

    try {
      const category = new CategoriesEntity();

      category.NAME = createCategoryDto.name;
      category.DESCRIPTION = createCategoryDto.description || null;
      category.IMAGE_URL = createCategoryDto.imageUrl || null;
      category.IS_ACTIVE = createCategoryDto.isActive !== false ? 1 : 0;
      category.PARENT_ID = createCategoryDto.parent_id || null;

      const savedCategory = await this.categoriesRepository.save(category);

      await this.categoriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );

      // Esperamos a que la transacción se complete y luego buscamos la categoría
      const result = await this.findOne(savedCategory.ID);
      console.log('Categoría creada:', result);

      return result;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      await this.categoriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    userEmail?: string,
  ): Promise<CategoriesEntity> {
    const category = await this.categoriesRepository.findOne({
      where: { ID: id },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    if (!userEmail) {
      throw new UnauthorizedException('Email de usuario no proporcionado');
    }

    const user = await this.userService.findByEmail(userEmail);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.categoriesRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [user.id.toString()],
    );

    try {
      Object.assign(category, updateCategoryDto);
      await this.categoriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );

      const result = await this.findOne(id);
      return result;
    } catch (error) {
      await this.categoriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }

  async remove(id: number, userEmail: string): Promise<any> {
    // Primero verificamos si la categoría existe
    const category = await this.categoriesRepository.findOne({
      where: { ID: id },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    const user = await this.userService.findByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.categoriesRepository.query(
      `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
      [user.id.toString()],
    );

    try {
      // Actualizamos la categoría padre si existe
      if (category.PARENT_ID) {
        await this.categoriesRepository.update(
          { ID: category.PARENT_ID },
          { IS_ACTIVE: 0 },
        );
      }

      // Actualizamos todas las categorías hijas usando una consulta recursiva
      await this.categoriesRepository.query(
        `
        UPDATE ECOMMERCE.CATEGORIES
        SET IS_ACTIVE = 0
        WHERE ID IN (
          SELECT ID
          FROM ECOMMERCE.CATEGORIES
          START WITH ID = :1
          CONNECT BY PRIOR ID = PARENT_ID
        )
      `,
        [id],
      );

      await this.categoriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );

      // Obtenemos y devolvemos la categoría actualizada
      const updatedCategory = await this.categoriesRepository.findOne({
        where: { ID: id },
      });
      return updatedCategory;
    } catch (error) {
      await this.categoriesRepository.query(
        `BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;`,
      );
      throw error;
    }
  }
}
