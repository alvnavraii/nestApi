import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post, // Tipo número
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { CountriesTradService } from './countries-trad.service';
import {
  CreateCountryTradDto,
  UpdateCountryTradDto,
} from './countries-trad-dto';
import { NotFoundException } from '@nestjs/common';

@Controller('countries-trad')
@UseGuards(RolesGuard)
@UseInterceptors(TransformInterceptor)
export class CountriesTradController {
  constructor(private readonly countriesTradService: CountriesTradService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  findAll() {
    return this.countriesTradService.findAll();
  }

  @Get('inactive')
  @Roles(Role.ADMIN)
  findAllInactive() {
    return this.countriesTradService.findAllInactive();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id') id: string) {
    const countryTrad = await this.countriesTradService.findOne(+id);
    if (!countryTrad) {
      throw new NotFoundException(
        `No se encontró la traducción del país con ID ${id}`,
      );
    }
    return countryTrad;
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() createCountryTradDto: CreateCountryTradDto,
    @Req() req: Request & { user: { email: string } },
  ) {
    return this.countriesTradService.create(
      createCountryTradDto,
      req.user.email,
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCountryTradDto: UpdateCountryTradDto,
    @Req() req: Request & { user: { email: string } },
  ) {
    return this.countriesTradService.update(
      +id,
      updateCountryTradDto,
      req.user.email,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.countriesTradService.remove(+id);
  }
}
