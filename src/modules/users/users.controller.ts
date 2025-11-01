/**
 * Users Controller
 * Handles HTTP requests related to users
 * Routes are protected by JwtAuthGuard (requires authentication)
 */
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';
import { ParseUUIDPipe } from '@/common/pipes/parse-uuid.pipe';

/**
 * Apply guards to all routes in this controller
 * JwtAuthGuard: Requires JWT authentication
 * RolesGuard: Checks role-based permissions
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users (Admin only)
   * GET /api/v1/users?page=1&limit=10
   * Query parameters for pagination
   */
  @Get()
  @Roles(UserRole.ADMIN) // Only admins can list all users
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.findAll(page, limit);
  }

  /**
   * Get current user profile
   * GET /api/v1/users/me
   * Returns authenticated user's profile
   */
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    /**
     * @CurrentUser() decorator extracts user from request
     * User object is attached by JwtAuthGuard after token validation
     */
    return user;
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   * ParseUUIDPipe validates that id is a valid UUID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Update user
   * PATCH /api/v1/users/:id
   * Users can update themselves, admins can update anyone
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  /**
   * Delete user (soft delete)
   * DELETE /api/v1/users/:id
   * Admin only - sets isActive to false
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    await this.usersService.remove(id, currentUser);
  }

  /**
   * Permanently delete user (hard delete)
   * DELETE /api/v1/users/:id/permanent
   * Admin only - permanently removes from database
   */
  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    await this.usersService.hardDelete(id, currentUser);
  }
}

/**
 * Example API Usage:
 * 
 * 1. Get current user profile:
 * GET /api/v1/users/me
 * Headers: Authorization: Bearer <token>
 * 
 * 2. Get all users (admin only):
 * GET /api/v1/users?page=1&limit=10
 * Headers: Authorization: Bearer <admin-token>
 * 
 * 3. Update user profile:
 * PATCH /api/v1/users/123e4567-e89b-12d3-a456-426614174000
 * Headers: Authorization: Bearer <token>
 * Body: { "firstName": "Jane", "lastName": "Smith" }
 * 
 * 4. Delete user (admin only):
 * DELETE /api/v1/users/123e4567-e89b-12d3-a456-426614174000
 * Headers: Authorization: Bearer <admin-token>
 */