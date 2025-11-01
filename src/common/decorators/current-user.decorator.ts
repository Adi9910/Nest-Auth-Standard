/**
 * Custom @CurrentUser() Decorator
 * Extracts user object from request
 * Cleaner alternative to accessing req.user directly
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Usage: @CurrentUser() user: User in controller parameter
 * Example:
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user; // Returns authenticated user
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If specific property requested, return only that property
    // Example: @CurrentUser('id') returns only user.id
    return data ? user?.[data] : user;
  },
);