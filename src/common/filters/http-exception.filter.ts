/**
 * HTTP Exception Filter
 * Catches all HTTP exceptions and formats them consistently
 * Exception filters handle errors thrown during request processing
 * Use Case: Standardizing error responses across the application
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * @Catch() decorator binds this filter to specific exceptions
 * HttpException catches all HTTP-related exceptions
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * catch() method handles the exception
   * @param exception - The exception that was thrown
   * @param host - ArgumentsHost provides access to request/response
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    /**
     * Extract error message
     * NestJS validation errors return an object with message array
     * Other errors might just be strings
     */
    const errorResponse = typeof exceptionResponse === 'string'
      ? { message: exceptionResponse }
      : (exceptionResponse as any);

    /**
     * Build standardized error response
     */
    const errorObject = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorResponse.message || 'An error occurred',
      error: errorResponse.error || HttpStatus[status],
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${JSON.stringify(errorResponse)}`,
    );

    // Send formatted error response
    response.status(status).json(errorObject);
  }
}