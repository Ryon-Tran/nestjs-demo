import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from './dto/pagination.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

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
