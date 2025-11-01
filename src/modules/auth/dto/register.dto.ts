/**
 * Register DTO (Data Transfer Object)
 * Defines the shape and validation rules for user registration
 * class-validator decorators ensure data integrity before reaching the service layer
 */
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  /**
   * Email validation
   * @IsEmail() validates proper email format
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * Password validation with complex rules
   * - Minimum 8 characters, maximum 32
   * - Must contain: uppercase, lowercase, and number/special character
   * - Regex pattern ensures strong passwords
   */
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password cannot exceed 32 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and number/special character',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;
}