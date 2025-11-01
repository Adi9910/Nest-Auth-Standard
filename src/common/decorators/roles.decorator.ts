/**
 * Custom @Roles() Decorator
 * Specifies which roles can access a route
 * Works with RolesGuard to enforce authorization
 */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Usage: @Roles(UserRole.ADMIN) above controller method
 * Example:
 * @Roles(UserRole.ADMIN)
 * @Delete(':id')
 * deleteUser() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);