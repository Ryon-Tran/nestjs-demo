import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Không yêu cầu role => cho phép
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { role?: Role } }>();
    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    return true;
  }
}
