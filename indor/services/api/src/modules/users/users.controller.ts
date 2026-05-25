import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all users (admin only)' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
