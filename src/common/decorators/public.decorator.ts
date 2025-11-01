/**
 * Custom @Public() Decorator
 * Marks routes as public (no authentication required)
 * Use on routes like login, register that shouldn't require JWT
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Usage: @Public() above controller method
 * Example:
 * @Public()
 * @Post('login')
 * login() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);