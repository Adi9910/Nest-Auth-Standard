/**
 * Tasks Service
 * Business logic for task management
 */
import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, ILike } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { User, UserRole } from '@/modules/users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    
    /**
     * Inject Cache Manager for Redis caching
     * Cache improves performance by storing frequently accessed data
     */
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Create new task
   * Assigns task to current user
   */
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    /**
     * Create task entity with user relationship
     * Task is automatically associated with the authenticated user
     */
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId: user.id, // Set ownership
    });

    const savedTask = await this.taskRepository.save(task);
    
    /**
     * Invalidate cache after creating new task
     * Ensures fresh data on next request
     */
    await this.invalidateTasksCache(user.id);
    
    return savedTask;
  }

  /**
   * Find all tasks with advanced filtering
   * Supports:
   * - Filtering by status, priority
   * - Search in title/description
   * - Pagination
   * - Sorting
   * - Caching
   */
  async findAll(filterDto: FilterTaskDto, user: User) {
    const { page, limit, sortBy, sortOrder, status, priority, search } = filterDto;

    /**
     * Generate cache key based on filters
     * Different filters = different cache keys
     */
    const cacheKey = `tasks:${user.id}:${JSON.stringify(filterDto)}`;
    
    /**
     * Try to get cached result first
     * If found, return immediately (faster response)
     */
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache HIT for key: ${cacheKey}`);
      return cachedResult;
    }

    console.log(`Cache MISS for key: ${cacheKey}`);

    /**
     * Build dynamic WHERE clause
     * FindOptionsWhere allows type-safe query building
     */
    const where: FindOptionsWhere<Task> = {
      userId: user.id, // Only show user's own tasks
    };

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add priority filter if provided
    if (priority) {
      where.priority = priority;
    }

    /**
     * For search, we need more complex query
     * TypeORM doesn't support OR with FindOptionsWhere directly
     * So we use QueryBuilder for search functionality
     */
    let query = this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId: user.id });

    // Apply status filter
    if (status) {
      query = query.andWhere('task.status = :status', { status });
    }

    // Apply priority filter
    if (priority) {
      query = query.andWhere('task.priority = :priority', { priority });
    }

    /**
     * Apply search filter
     * ILIKE is case-insensitive LIKE (PostgreSQL specific)
     * Searches in both title and description
     */
    if (search) {
      query = query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    /**
     * Apply sorting
     * Default: Sort by createdAt DESC (newest first)
     */
    query = query.orderBy(`task.${sortBy}`, sortOrder);

    /**
     * Apply pagination
     * skip: How many records to skip
     * take: How many records to return
     */
    query = query.skip((page - 1) * limit).take(limit);

    /**
     * Execute query with count
     * getManyAndCount() returns [data, total]
     */
    const [tasks, total] = await query.getManyAndCount();

    const result = {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };

    /**
     * Cache the result
     * TTL (Time To Live) is set in app.module.ts (default: 5 minutes)
     */
    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  /**
   * Find single task by ID
   * Validates ownership
   */
  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'], // Include user relationship (optional)
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    /**
     * Ownership check
     * Users can only view their own tasks (unless admin)
     */
    if (task.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only access your own tasks');
    }

    return task;
  }

  /**
   * Update task
   * Validates ownership before updating
   */
  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user); // This checks ownership

    /**
     * Merge update data into existing task
     * Only provided fields will be updated
     */
    Object.assign(task, updateTaskDto);

    const updatedTask = await this.taskRepository.save(task);

    /**
     * Invalidate cache after update
     * Ensures users get fresh data
     */
    await this.invalidateTasksCache(user.id);

    return updatedTask;
  }

  /**
   * Delete task
   * Validates ownership before deletion
   */
  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user); // This checks ownership

    await this.taskRepository.remove(task);

    /**
     * Invalidate cache after deletion
     */
    await this.invalidateTasksCache(user.id);
  }

  /**
   * Get task statistics
   * Example of custom query - returns aggregated data
   */
  async getStatistics(user: User) {
    /**
     * Use QueryBuilder for complex aggregation
     * This could be cached too for better performance
     */
    const stats = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.userId = :userId', { userId: user.id })
      .groupBy('task.status')
      .getRawMany();

    // Transform to more readable format
    const result = {
      total: 0,
      byStatus: {} as Record<TaskStatus, number>,
    };

    stats.forEach(stat => {
      result.byStatus[stat.status as TaskStatus] = parseInt(stat.count);
      result.total += parseInt(stat.count);
    });

    return result;
  }

  /**
   * Helper method to invalidate all task caches for a user
   * Called after create, update, or delete operations
   */
  private async invalidateTasksCache(userId: string): Promise<void> {
    /**
     * In production, you'd want more sophisticated cache invalidation
     * Options:
     * 1. Store cache keys in a Set and delete all
     * 2. Use Redis SCAN to find and delete matching keys
     * 3. Use cache tags/groups (if supported by cache adapter)
     * 
     * For simplicity, we'll just reset the entire cache
     * This is fine for small applications
     */
    await this.cacheManager.reset();
  }
}