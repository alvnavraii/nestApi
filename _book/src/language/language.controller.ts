/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { CreateLanguageDto } from './language.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateLanguageDto } from './language.dto';

@Controller('language')
@UseGuards(RolesGuard)
@UseInterceptors(TransformInterceptor)
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get('active')
  @Roles(Role.ADMIN, Role.USER)
  findAllActive() {
    return this.languageService.findAllActive();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.languageService.findOne(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  findAll() {
    return this.languageService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  create(@Body() createLanguageDto: CreateLanguageDto, @Request() req: any) {
    return this.languageService.create(createLanguageDto, req.user.email);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
    @Request() req: any,
  ) {
    return this.languageService.update(+id, updateLanguageDto, req.user.email);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.languageService.remove(+id, req.user.email);
  }
}
