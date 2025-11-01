/**
 * Logging Interceptor
 * Intercepts requests and responses for logging/transformation
 * Interceptors execute AROUND route handlers (before and after)
 * Use Case: Response transformation, logging, caching, timeout handling
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * intercept() method wraps the route handler execution
   * @param context - Provides access to request details
   * @param next - CallHandler to invoke the route handler
   * @returns Observable that can be transformed
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    this.logger.debug(`Before handler: ${method} ${url}`);

    /**
     * next.handle() calls the route handler
     * tap() operator allows side effects without modifying the response
     * Here we log the response time
     */
    return next
      .handle()
      .pipe(
        tap(() => {
          const responseTime = Date.now() - now;
          this.logger.debug(`After handler: ${method} ${url} - ${responseTime}ms`);
        }),
      );
  }
}