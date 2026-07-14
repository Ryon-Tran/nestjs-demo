import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartModule } from '../cart/cart.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [CartModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
  exports: [OrderService],
})
export class OrderModule {}
