import { IsNotEmpty, IsNumber, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống.' })
  @MaxLength(100, { message: 'Tên tối đa 100 ký tự.' })
  name!: string;

  @IsNotEmpty({ message: 'Mô tả không được để trống.' })
  @MaxLength(500, { message: 'Mô tả tối đa 500 ký tự.' })
  description!: string;

  @IsNotEmpty({ message: 'Giá không được để trống.' })
  @IsNumber({}, { message: 'Giá phải là số.' })
  @Min(0, { message: 'Giá phải ≥ 0.' })
  price!: number;

  @IsNotEmpty({ message: 'Danh mục không được để trống.' })
  @MaxLength(50, { message: 'Danh mục tối đa 50 ký tự.' })
  category!: string;
}
