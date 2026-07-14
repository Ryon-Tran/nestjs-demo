import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { OrderService } from './order.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: number;
    username: string;
    role: string;
  };
}

@ApiTags('Đơn hàng (Order)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Thanh toán - Tạo đơn hàng từ giỏ hàng' })
  @Post('checkout')
  checkout(@Request() req: AuthenticatedRequest) {
    return this.orderService.checkout(req.user.id);
  }

  @ApiOperation({ summary: 'Xem lịch sử đơn hàng của tôi' })
  @Get('history')
  getHistory(@Request() req: AuthenticatedRequest) {
    return this.orderService.getHistory(req.user.id);
  }

  @ApiOperation({ summary: 'Xem chi tiết một đơn hàng' })
  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.orderService.findOne(req.user.id, req.user.role, Number(id));
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (Chỉ Admin)' })
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(
      Number(id),
      updateOrderStatusDto.status,
    );
  }
}
