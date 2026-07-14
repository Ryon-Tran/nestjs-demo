import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Số trang hiện tại', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng phần tử trên mỗi trang',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (username hoặc email)',
    default: '',
  })
  @IsOptional()
  @IsString()
  search?: string = '';

  @ApiPropertyOptional({
    description: 'Lọc theo vai trò (role)',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
