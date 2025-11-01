/**
 * Application entry point
 * This file bootstraps the NestJS application with global configurations
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

    const port = process.env.PORT || 3000;
    await app.listen(port);

    // ✅ Swagger setup
    const config = new DocumentBuilder()
      .setTitle('Task Management API')
      .setDescription('API documentation for the NestJS Task Management system')
      .setVersion('1.0')
      .addBearerAuth() // if you use JWT
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

  } catch (error) {
    logger.error('❌ Failed to start application', error);
    process.exit(1);
  }
}

bootstrap()