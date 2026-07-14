import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'ID của sản phẩm' })
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
  @IsInt({ message: 'ID sản phẩm phải là số nguyên' })
  productId!: number;

  @ApiPropertyOptional({ description: 'Số lượng sản phẩm', default: 1 })
  @IsOptional()
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  quantity?: number;
}
