/**
 * Roles Guard
 * Authorizes users based on their roles
 * Use Case: Authorization - checking if user has permission
 * Example: Only admins can delete users
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Checks if user has required role to access the route
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * Get required roles from @Roles() decorator
     * Example: @Roles(UserRole.ADMIN) requires admin role
     */
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request (attached by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Check if user exists
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    /**
     * Check if user's role is in the required roles array
     * Example: If route requires ADMIN role, user.role must be ADMIN
     */
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}