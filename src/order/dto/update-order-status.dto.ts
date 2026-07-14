import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của đơn hàng',
    enum: OrderStatus,
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(OrderStatus, { message: 'Trạng thái đơn hàng không hợp lệ' })
  status!: OrderStatus;
}
