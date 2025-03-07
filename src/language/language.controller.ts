import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@Controller('language')
@UseGuards(RolesGuard)
@UseInterceptors(TransformInterceptor)
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  findAll() {
    return this.languageService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.languageService.findOne(id);
  }
}
