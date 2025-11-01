/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '@/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register new user
   * POST /api/v1/auth/register
   * @Public() decorator skips JWT authentication for this route
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   * Returns JWT token for authenticated requests
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

/**
 * Example API Usage:
 * 
 * 1. Register:
 * POST /api/v1/auth/register
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePass123!",
 *   "firstName": "John",
 *   "lastName": "Doe"
 * }
 * 
 * Response:
 * {
 *   "user": { "id": "...", "email": "...", ... },
 *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * 2. Login:
 * POST /api/v1/auth/login
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePass123!"
 * }
 * 
 * 3. Use token in subsequent requests:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */