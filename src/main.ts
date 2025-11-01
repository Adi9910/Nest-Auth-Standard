/**
 * Application entry point
 * This file bootstraps the NestJS application with global configurations
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('🚀 Starting application...');
    
    // Create NestJS application instance
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    
    logger.log('✅ Application created successfully');
    
    // Set global API prefix for all routes (e.g., /api/v1/users)
    app.setGlobalPrefix('api/v1');
    logger.log('✅ Global prefix set to: api/v1');
    
    /**
     * Global Validation Pipe
     * - whitelist: Strip properties that don't have decorators
     * - forbidNonWhitelisted: Throw error if non-whitelisted properties exist
     * - transform: Automatically transform payloads to DTO instances
     * - transformOptions.enableImplicitConversion: Auto-convert types (string to number, etc.)
     */
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    logger.log('✅ Global validation pipe configured');
    
    // Enable CORS for cross-origin requests
    app.enableCors();
    logger.log('✅ CORS enabled');
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    logger.log('='.repeat(50));
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Base URL: http://localhost:${port}/api/v1`);
    logger.log(`🔐 Auth endpoints:`);
    logger.log(`   POST http://localhost:${port}/api/v1/auth/register`);
    logger.log(`   POST http://localhost:${port}/api/v1/auth/login`);
    logger.log(`👤 User endpoints:`);
    logger.log(`   GET  http://localhost:${port}/api/v1/users/me`);
    logger.log(`📋 Task endpoints:`);
    logger.log(`   GET  http://localhost:${port}/api/v1/tasks`);
    logger.log(`   POST http://localhost:${port}/api/v1/tasks`);
    logger.log('='.repeat(50));
  } catch (error) {
    logger.error('❌ Failed to start application', error);
    process.exit(1);
  }
}