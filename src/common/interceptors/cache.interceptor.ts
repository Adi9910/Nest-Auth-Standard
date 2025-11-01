/**
 * Cache Interceptor
 * Caches GET request responses in Redis
 * Subsequent identical requests return cached data (faster response)
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    // Inject cache manager to access Redis
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Create cache key from URL and query params
    const cacheKey = `cache:${request.url}`;

    // Try to get cached response
    const cachedResponse = await this.cacheManager.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`Cache hit for: ${cacheKey}`);
      // Return cached data as Observable
      return of(cachedResponse);
    }

    console.log(`Cache miss for: ${cacheKey}`);
    
    /**
     * If no cache, execute handler and store response in cache
     * tap() stores the response in cache for future requests
     */
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(cacheKey, response);
      }),
    );
  }
}