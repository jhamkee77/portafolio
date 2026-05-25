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
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles('homeowner', 'renter', 'property_manager')
  @ApiOperation({ summary: 'Create a new service order' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition order to a new status (state machine enforced)' })
  transition(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.transition(
      orderId,
      dto.status,
      userId,
      userRole as any,
      dto.notes,
    );
  }

  @Patch(':id/assign-provider')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign a provider to an order (admin only)' })
  assignProvider(
    @Param('id') orderId: string,
    @CurrentUser('id') adminId: string,
    @Body('providerId') providerId: string,
  ) {
    return this.ordersService.assignProvider(orderId, providerId, adminId);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all orders (admin only)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll(page, limit, { status });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user orders' })
  findMyOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.findByUser(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details with next available statuses' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get orders for a specific property (property record)' })
  findByProperty(
    @Param('propertyId') propertyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.findByProperty(propertyId, page, limit);
  }
}
