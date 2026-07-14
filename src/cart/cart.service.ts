import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity = 1 } = addToCartDto;

    // Kiểm tra sản phẩm tồn tại
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm có id: ${productId}`,
      );
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingItem) {
      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
      return {
        message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng',
        data: updatedItem,
      };
    }

    const newItem = await this.prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: { product: true },
    });

    return {
      message: 'Đã thêm sản phẩm vào giỏ hàng thành công',
      data: newItem,
    };
  }

  async getCart(userId: number) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    return {
      items,
      totalAmount,
    };
  }

  async updateQuantity(
    userId: number,
    id: number,
    updateCartDto: UpdateCartDto,
  ) {
    const { quantity } = updateCartDto;

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException(
        `Không tìm thấy vật phẩm giỏ hàng có id: ${id}`,
      );
    }

    const updated = await this.prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });

    return {
      message: 'Cập nhật số lượng giỏ hàng thành công',
      data: updated,
    };
  }

  async removeItem(userId: number, id: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException(
        `Không tìm thấy vật phẩm giỏ hàng có id: ${id}`,
      );
    }

    await this.prisma.cartItem.delete({
      where: { id },
    });

    return {
      message: 'Đã xóa sản phẩm khỏi giỏ hàng thành công',
    };
  }

  async clearCart(userId: number) {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });
    return {
      message: 'Đã làm sạch giỏ hàng',
    };
  }
}
