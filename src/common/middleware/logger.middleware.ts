/**
 * Logger Middleware
 * Logs all incoming HTTP requests with details
 * Middleware executes BEFORE route handlers
 * Use Case: Request logging, adding request IDs, timing requests
 */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // Logger instance for this middleware
  private logger = new Logger('HTTP');

  /**
   * use() method is called for every request that matches the route
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Function to pass control to next middleware/handler
   */
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`Incoming Request: ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    /**
     * Listen to response 'finish' event to log after response is sent
     * This allows us to measure request duration
     */
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      
      this.logger.log(
        `Completed Request: ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
      );
    });

    // Pass control to next middleware or route handler
    next();
  }
}