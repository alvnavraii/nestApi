import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  Post,
  BadRequestException,
  ClassSerializerInterceptor,
  ParseIntPipe,
  Delete,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { CategoryResponse } from './interfaces/category-response.interface';

interface RequestWithUser extends Request {
  user: {
    email: string;
  };
}

@Controller('categories')
@UseGuards(RolesGuard)
@UseInterceptors(TransformInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  findAll(): Promise<CategoryResponse[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponse> {
    console.log('Controller findOne - ID recibido:', id);
    const result = await this.categoriesService.findOne(id);
    console.log(
      'Controller findOne - Resultado:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: RequestWithUser,
  ): Promise<CategoryResponse> {
    // Debug de los datos recibidos
    console.log('DTO recibido:', JSON.stringify(createCategoryDto, null, 2));
    console.log('Tipo de name:', typeof createCategoryDto.name);

    // Validación manual
    if (typeof createCategoryDto.name !== 'string') {
      throw new BadRequestException(
        `name debe ser string, recibido: ${typeof createCategoryDto.name}`,
      );
    }

    return this.categoriesService.create(createCategoryDto, req.user.email);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: RequestWithUser,
  ): Promise<CategoryResponse> {
    return this.categoriesService.update(id, updateCategoryDto, req.user.email);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    return this.categoriesService.remove(id, req.user.email);
  }
}
