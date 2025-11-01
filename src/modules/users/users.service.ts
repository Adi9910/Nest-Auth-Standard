/**
 * Users Service
 * Contains business logic for user operations
 * Services are responsible for database interactions and business rules
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    /**
     * Inject User repository
     * @InjectRepository() provides access to TypeORM repository
     * Repository provides methods like: find, findOne, save, remove, etc.
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create new user
   * Used by AuthService during registration
   */
  async create(registerDto: RegisterDto): Promise<User> {
    /**
     * Create user entity instance
     * this.userRepository.create() creates an instance but doesn't save to DB yet
     */
    const user = this.userRepository.create(registerDto);
    
    /**
     * Save to database
     * this.userRepository.save() persists the entity
     */
    return this.userRepository.save(user);
  }

  /**
   * Find all users with pagination
   * Returns paginated list of users
   */
  async findAll(page: number = 1, limit: number = 10) {
    /**
     * findAndCount() returns both data and total count
     * Useful for pagination
     * - skip: Number of records to skip (for pagination)
     * - take: Number of records to return (limit)
     */
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }, // Sort by newest first
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find user by ID
   * Throws NotFoundException if user doesn't exist
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tasks'], // Include related tasks (optional)
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   * Used for login and registration checks
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Update user
   * Validates permissions before updating
   */
  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.findOne(id);

    /**
     * Authorization check
     * Users can only update themselves unless they're admin
     */
    if (currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    /**
     * Additional check: Only admins can change roles
     */
    if (updateUserDto.role && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    /**
     * Merge updates into existing user
     * Object.assign() merges properties
     */
    Object.assign(user, updateUserDto);

    /**
     * Save updated user
     * TypeORM automatically detects changes and updates only modified fields
     */
    return this.userRepository.save(user);
  }

  /**
   * Soft delete user (deactivate)
   * Better than hard delete - preserves data integrity
   */
  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.findOne(id);

    /**
     * Authorization: Only admins can delete users
     * Users can deactivate themselves but not delete
     */
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete users');
    }

    /**
     * Soft delete by setting isActive to false
     * This preserves user data and related records
     */
    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * Hard delete user (permanent)
   * Only use when absolutely necessary (e.g., GDPR compliance)
   */
  async hardDelete(id: string, currentUser: User): Promise<void> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can permanently delete users');
    }

    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
