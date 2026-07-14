import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Tên người dùng đã tồn tại');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
    return { message: 'Đăng ký thành công!', userId: newUser.id };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    // Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }
    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }
    // Tạo JWT token
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      message: 'Đăng nhập thành công!',
      accessToken,
    };
  }
}
