import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: number;
    username: string;
    role: string;
  };
}

@ApiTags('Giỏ hàng (Cart)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @Post()
  addToCart(
    @Request() req: AuthenticatedRequest,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @ApiOperation({ summary: 'Xem giỏ hàng của tôi' })
  @Get()
  getCart(@Request() req: AuthenticatedRequest) {
    return this.cartService.getCart(req.user.id);
  }

  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng' })
  @Put(':id')
  updateQuantity(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.updateQuantity(
      req.user.id,
      Number(id),
      updateCartDto,
    );
  }

  @ApiOperation({ summary: 'Xóa một sản phẩm khỏi giỏ hàng' })
  @Delete(':id')
  removeItem(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, Number(id));
  }

  @ApiOperation({ summary: 'Xóa sạch toàn bộ giỏ hàng' })
  @Delete()
  clearCart(@Request() req: AuthenticatedRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
