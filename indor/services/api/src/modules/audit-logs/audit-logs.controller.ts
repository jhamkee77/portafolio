import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs (admin only)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('entityType') entityType?: string,
  ) {
    return this.auditLogsService.findAll(page, limit, entityType);
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogsService.findByEntity(entityType, entityId);
  }
}
