import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('orders-by-status')
  @ApiOperation({ summary: 'Get order counts grouped by status' })
  getOrdersByStatus() {
    return this.adminService.getOrdersByStatus();
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent audit log activity' })
  getRecentActivity(@Query('limit') limit?: number) {
    return this.adminService.getRecentActivity(limit);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user account' })
  deactivateUser(
    @Param('id') userId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.deactivateUser(userId, adminId);
  }

  @Patch('users/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate a user account' })
  reactivateUser(
    @Param('id') userId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.reactivateUser(userId, adminId);
  }
}
