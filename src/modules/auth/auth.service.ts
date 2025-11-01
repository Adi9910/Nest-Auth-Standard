/**
 * Authentication Service
 * Core business logic for authentication
 */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register new user
   * 1. Check if user already exists
   * 2. Hash password
   * 3. Create user in database
   * 4. Generate JWT token
   */
  async register(registerDto: RegisterDto) {
    // Check if user with email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    /**
     * Hash password using bcrypt
     * Salt rounds: 10 (higher = more secure but slower)
     * Never store plain text passwords!
     */
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user in database with hashed password
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate JWT token for immediate login
    const token = this.generateToken(user.id, user.email);

    // Return user (without password) and token
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      access_token: token,
    };
  }

  /**
   * Login user
   * 1. Find user by email
   * 2. Verify password
   * 3. Generate JWT token
   */
  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    /**
     * Compare provided password with stored hashed password
     * bcrypt.compare() hashes the input and compares with stored hash
     */
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      access_token: token,
    };
  }

  /**
   * Generate JWT token
   * Payload contains user identification info
   * Token can be decoded to extract this info without database query
   */
  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email }; // 'sub' is standard JWT claim for subject (user ID)
    return this.jwtService.sign(payload);
  }

  /**
   * Validate user from JWT payload
   * Called by JWT strategy during authentication
   */
  async validateUser(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
}