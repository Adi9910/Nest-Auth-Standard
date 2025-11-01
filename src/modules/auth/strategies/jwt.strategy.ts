/**
 * JWT Strategy
 * Passport strategy for validating JWT tokens
 * Automatically called by JwtAuthGuard
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/modules/auth/auth.service';

/**
 * JWT Payload Interface
 * Defines the structure of data stored in JWT
 */
interface JwtPayload {
  sub: string; // User ID
  email: string;
  iat?: number; // Issued at (timestamp)
  exp?: number; // Expiration (timestamp)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    /**
     * Configure JWT extraction and validation
     * - jwtFromRequest: How to extract JWT from request (Bearer token in Authorization header)
     * - ignoreExpiration: false means expired tokens will be rejected
     * - secretOrKey: Secret used to verify token signature
     */
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  /**
   * validate() is called automatically after token is verified
   * @param payload - Decoded JWT payload
   * @returns User object (attached to request.user)
   */
  async validate(payload: JwtPayload) {
    // Validate user still exists and is active
    const user = await this.authService.validateUser(payload);
    
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    /**
     * Return user object
     * This will be available as request.user in controllers
     */
    return user;
  }
}
