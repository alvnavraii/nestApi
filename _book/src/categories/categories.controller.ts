/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  Post,
  BadRequestException,
  ClassSerializerInterceptor,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@Controller('categories')
@UseGuards(RolesGuard)
@UseInterceptors(TransformInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id', ParseIntPipe) id: number) {
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
    @Request() req: any,
  ) {
    // Debug de los datos recibidos
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('DTO recibido:', JSON.stringify(createCategoryDto, null, 2));
    console.log('Tipo de name:', typeof createCategoryDto.name);
    console.log('Tipo de isActive:', typeof createCategoryDto.isActive);

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
    @Request() req,
  ) {
    const userEmail = req.user.email;
    return this.categoriesService.update(id, updateCategoryDto, userEmail);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.categoriesService.remove(id, req.user.email);
  }
}
