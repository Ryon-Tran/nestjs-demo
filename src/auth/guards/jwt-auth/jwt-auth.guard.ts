import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException(
        'Không tìm thấy token trong header Authorization',
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(
        'Định dạng token không hợp lệ (phải là Bearer <token>)',
      );
    }

    try {
      const payload: unknown = this.jwtService.verify(token);
      (request as unknown as Record<string, unknown>)['user'] = payload;
      return true;
    } catch (err: any) {
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Token không hợp lệ hoặc đã hết hạn';
      throw new UnauthorizedException(`Token không hợp lệ: ${errMsg}`);
    }
  }
}
