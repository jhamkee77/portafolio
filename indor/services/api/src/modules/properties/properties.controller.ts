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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateHomeSystemDto } from './dto/create-home-system.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new property' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current user properties' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.propertiesService.findAll(userId, page, limit);
  }

  @Get('admin')
  @Roles('admin')
  @ApiOperation({ summary: 'List all properties (admin only)' })
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.propertiesService.findAllAdmin(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property details with home systems and order history' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.propertiesService.findOne(id, role === 'admin' ? undefined : userId);
  }

  @Get(':id/house-facts')
  @ApiOperation({ summary: 'Get House Facts Record for a property' })
  getHouseFacts(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.propertiesService.getHouseFacts(id, role === 'admin' ? undefined : userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property details' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.propertiesService.remove(id, userId);
  }

  // ─── Home Systems ─────────────────────────────────────

  @Post(':id/home-systems')
  @ApiOperation({ summary: 'Add a home system to property' })
  addHomeSystem(
    @Param('id') propertyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateHomeSystemDto,
  ) {
    return this.propertiesService.addHomeSystem(propertyId, userId, dto);
  }

  @Get(':id/home-systems')
  @ApiOperation({ summary: 'Get home systems for a property' })
  getHomeSystems(@Param('id') propertyId: string) {
    return this.propertiesService.getHomeSystems(propertyId);
  }

  @Delete('home-systems/:homeSystemId')
  @ApiOperation({ summary: 'Remove a home system' })
  removeHomeSystem(
    @Param('homeSystemId') homeSystemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.propertiesService.removeHomeSystem(homeSystemId, userId);
  }
}
