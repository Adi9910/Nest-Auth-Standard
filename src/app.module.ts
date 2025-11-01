/**
 * Root Application Module
 * This module imports all feature modules and configures global services
 * Implements NestModule for middleware configuration
 */
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '@/modules/auth/auth.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { UsersModule } from '@/modules/users/users.module';
import { LoggerMiddleware } from '@/common/middleware/logger.middleware';
import configuration from '@/config/configuration';

@Module({
  imports: [
    /**
     * ConfigModule - Handles environment variables and configuration
     * - isGlobal: Makes config available throughout the app without re-importing
     * - load: Custom configuration factory function
     * - envFilePath: Load environment-specific .env files
     */
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    
    /**
     * TypeORM Configuration - PostgreSQL Database
     * Using forRootAsync to inject ConfigService for dynamic configuration
     * - entities: Auto-load all entity files
     * - synchronize: Auto-sync schema (ONLY for development, false in production)
     * - logging: Enable SQL query logging for debugging
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'), // WARNING: Set to false in production
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),
    
    /**
     * Cache Module - Redis Integration
     * Used for caching frequently accessed data to improve performance
     * - isGlobal: Available throughout the app
     * - ttl: Time to live in seconds (default cache expiry)
     */
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: 'redisStore',
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        ttl: configService.get('redis.ttl'),
      }),
      inject: [ConfigService],
    }),
    
    /**
     * Throttler Module - Rate Limiting
     * Prevents abuse by limiting requests per time window
     * - ttl: Time window in milliseconds (60000ms = 1 minute)
     * - limit: Maximum requests per time window
     */
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    
    // Feature modules
    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware
   * Middleware runs before route handlers and can modify request/response
   * LoggerMiddleware will apply to all routes (*)
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}