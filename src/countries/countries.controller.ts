import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { CreateCountryDto, UpdateCountryDto } from './country-dto';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@Controller('countries')
@UseGuards(RolesGuard)
@UseInterceptors(TransformInterceptor)
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  findAll() {
    return this.countriesService.findAll();
  }

  @Get('active')
  @Roles(Role.ADMIN, Role.USER)
  findAllActive() {
    return this.countriesService.findAllActive();
  }

  @Get('inactive')
  @Roles(Role.ADMIN, Role.USER)
  findAllInactive() {
    return this.countriesService.findAllInactive();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  findOne(@Param('id') id: string) {
    return this.countriesService.findOne(+id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() createCountryDto: CreateCountryDto,
    @Req() req: Request & { user: { email: string } },
  ) {
    return this.countriesService.create(createCountryDto, req.user.email);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
    @Req() req: Request & { user: { email: string } },
  ) {
    return this.countriesService.update(+id, updateCountryDto, req.user.email);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: { email: string } },
  ) {
    return this.countriesService.remove(+id, req.user.email);
  }
}
