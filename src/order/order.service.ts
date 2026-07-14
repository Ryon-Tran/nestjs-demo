import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  async checkout(userId: number) {
    // 1. Lấy giỏ hàng hiện tại
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống, không thể thanh toán');
    }

    // 2. Tạo đơn hàng và chi tiết đơn hàng bằng transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // a. Tạo Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalPrice: cart.totalAmount,
          status: OrderStatus.PENDING,
        },
      });

      // b. Tạo các OrderItem
      const orderItemsData = cart.items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price, // lưu giá tại thời điểm mua
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // c. Xóa sạch giỏ hàng của user
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return newOrder;
    });

    // Lấy đầy đủ thông tin đơn hàng vừa tạo để trả về
    return this.findOneOrder(order.id);
  }

  async getHistory(userId: number) {
    return await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private findOneOrder(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(userId: number, userRole: string, id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng có id: ${id}`);
    }

    // Chỉ cho phép người sở hữu đơn hàng hoặc Admin xem chi tiết
    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new NotFoundException(`Không tìm thấy đơn hàng có id: ${id}`);
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng có id: ${id}`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: updated,
    };
  }
}
