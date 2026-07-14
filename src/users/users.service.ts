import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from './dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, email, password, role } = createUserDto;
    const existing = await this.prismaService.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      if (existing.username === username) {
        throw new ConflictException('Tên người dùng đã tồn tại');
      }
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'USER',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return {
      message: 'Tạo người dùng thành công',
      data: user,
    };
  }

  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng có id: ${id}`);
    }
    return {
      message: 'Chi tiết người dùng',
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng có id: ${id}`);
    }

    const { username, email, password, role } = updateUserDto;
    const data: Prisma.UserUpdateInput = {};

    if (username) {
      const existing = await this.prismaService.user.findFirst({
        where: { username, NOT: { id } },
      });
      if (existing) throw new ConflictException('Tên người dùng đã tồn tại');
      data.username = username;
    }

    if (email) {
      const existing = await this.prismaService.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existing) throw new ConflictException('Email đã được sử dụng');
      data.email = email;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      data.role = role;
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return {
      message: 'Cập nhật người dùng thành công',
      data: updatedUser,
    };
  }

  async remove(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng có id: ${id}`);
    }

    await this.prismaService.user.delete({ where: { id } });
    return {
      message: 'Xóa người dùng thành công',
    };
  }

  async findAll(query: PaginationDto) {
    const cacheKey = `users_list_${JSON.stringify(query)}`;

    // 1. Kiểm tra xem có dữ liệu trong Cache chưa
    const cachedUsers = await this.cache.get(cacheKey);
    if (cachedUsers) {
      return cachedUsers;
    }

    const pageNum = Number(query.page) || 1;
    const limitNum = Number(query.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const { search, role } = query;
    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    const result = {
      data: users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };

    // 2. Lưu dữ liệu vào Cache với TTL là 60000ms (60 giây)
    await this.cache.set(cacheKey, result, 60000);

    return result;
  }
}
