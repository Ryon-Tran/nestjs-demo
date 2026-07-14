import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'Tên người dùng' })
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @IsString({ message: 'Tên người dùng phải là chuỗi ký tự' })
  username!: string;

  @ApiProperty({ description: 'Email của người dùng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @ApiProperty({ description: 'Mật khẩu' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Vai trò người dùng',
    enum: Role,
    default: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
  role?: Role;
}
