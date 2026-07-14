import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UsersService } from './users.service';
import { PaginationDto } from './dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Lấy thông tin profile

  @Get('profile')
  getProfile(@Request() req: Record<string, unknown>) {
    return {
      message: 'Lấy thông tin profile thành công',
      user: req['user'],
    };
  }

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: `Chi tiết user có id: ${id}` };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return { message: 'Tạo user mới', data: createUserDto };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return { message: `Cập nhật user có id: ${id}`, data: updateUserDto };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return { message: `Xóa user có id: ${id}` };
  }
}
