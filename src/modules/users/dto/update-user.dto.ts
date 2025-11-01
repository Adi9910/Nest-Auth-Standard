/**
 * Update User DTO
 * Allows updating user profile information
 */
import { IsOptional, IsString, IsBoolean, IsEnum, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '@/modules/users/entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  /**
   * Only admins should be able to update roles
   * This should be validated in the service layer
   */
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}