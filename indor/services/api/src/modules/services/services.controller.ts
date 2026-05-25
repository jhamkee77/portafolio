import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Public } from '../../common/decorators';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Browse service catalog (public)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
  ) {
    return this.servicesService.findAll(page, limit, category);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get list of service categories (public)' })
  getCategories() {
    return this.servicesService.getCategories();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service details (public)' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new service (admin only)' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a service (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate a service (admin only)' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
