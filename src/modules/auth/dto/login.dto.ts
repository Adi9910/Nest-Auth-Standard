/**
 * Login DTO
 * Simpler validation for login - we only need email and password
 */
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
