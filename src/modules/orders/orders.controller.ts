import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/UserRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { CreateOrderDTO } from '@modules/orders/dto/create-order.dto';
import { OrdersService } from '@modules/orders/orders.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  createOrder(@Req() req, @Body() createOrderDto: CreateOrderDTO) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get('all')
  @Roles(UserRole.Admin)
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  updateOrder() {
    // Logic to update an order
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  deleteOrder() {
    // Logic to delete an order
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
}
