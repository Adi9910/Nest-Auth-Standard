/**
 * JWT Authentication Guard
 * Protects routes by verifying JWT tokens
 * Guards determine whether a request should be handled by the route handler
 * Use Case: Authentication - checking if user is logged in
 */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * canActivate determines if the request can proceed
   * @param context - Execution context with request details
   * @returns boolean or Promise<boolean>
   */
  canActivate(context: ExecutionContext) {
    /**
     * Check if route is marked as @Public()
     * getAllAndOverride checks both method and class level decorators
     * If route is public, skip authentication
     */
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Method level
      context.getClass(),   // Class level
    ]);

    if (isPublic) {
      return true; // Allow access without authentication
    }

    // If not public, validate JWT token
    return super.canActivate(context);
  }

  /**
   * handleRequest is called after passport strategy validation
   * @param err - Any error from passport strategy
   * @param user - User object from JWT payload (if valid)
   * @param info - Additional info from passport
   */
  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, throw UnauthorizedException
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    // Return user object (will be attached to request.user)
    return user;
  }
}