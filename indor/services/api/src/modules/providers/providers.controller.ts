import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProviderStatus } from '@prisma/client';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('providers')
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Register as a provider' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProviderDto,
  ) {
    return this.providersService.create(dto, userId);
  }

  @Get('me')
  @Roles('provider')
  @ApiOperation({ summary: 'Get my provider profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.providersService.findByUserId(userId);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all providers (admin only)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ProviderStatus,
  ) {
    return this.providersService.findAll(page, limit, status);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get provider details (admin only)' })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update provider (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.providersService.update(id, dto);
  }

  @Patch(':id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve a provider (admin only)' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.providersService.approve(id, adminId);
  }

  @Patch(':id/suspend')
  @Roles('admin')
  @ApiOperation({ summary: 'Suspend a provider (admin only)' })
  suspend(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.providersService.suspend(id, adminId);
  }
}
