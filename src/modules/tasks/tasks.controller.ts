/**
 * Tasks Controller
 * Demonstrates all HTTP methods (GET, POST, PATCH, PUT, DELETE)
 * With query parameters, body validation, and response codes
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { ParseUUIDPipe } from '@/common/pipes/parse-uuid.pipe';
import { HttpCacheInterceptor } from '@/common/interceptors/cache.interceptor';

/**
 * Base route: /api/v1/tasks
 * All routes require JWT authentication (JwtAuthGuard)
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create new task
   * POST /api/v1/tasks
   * 
   * @Body() - Extracts JSON body and validates against CreateTaskDto
   * @CurrentUser() - Gets authenticated user from JWT
   * @HttpCode() - Sets response status code (default 201 for POST)
   * 
   * Request Body Example:
   * {
   *   "title": "Complete project documentation",
   *   "description": "Write comprehensive README and API docs",
   *   "priority": "high",
   *   "dueDate": "2025-11-15T18:00:00Z"
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.create(createTaskDto, user);
  }

  /**
   * Get all tasks with filtering and pagination
   * GET /api/v1/tasks?status=todo&priority=high&page=1&limit=10&search=project
   * 
   * @Query() - Extracts query parameters
   * Query parameters are optional and validated by FilterTaskDto
   * @UseInterceptors(HttpCacheInterceptor) - Enables caching for this route
   * 
   * Query Parameters:
   * - status: Filter by task status (todo, in_progress, done)
   * - priority: Filter by priority (low, medium, high)
   * - search: Search in title and description
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 10, max: 100)
   * - sortBy: Sort field (createdAt, updatedAt, dueDate, priority)
   * - sortOrder: Sort direction (ASC, DESC)
   * 
   * Example URLs:
   * - /tasks (all tasks, first page)
   * - /tasks?status=todo (only TODO tasks)
   * - /tasks?status=done&page=2&limit=20 (second page, 20 items)
   * - /tasks?search=meeting&sortBy=dueDate&sortOrder=ASC (search with custom sort)
   */
  @Get()
  @UseInterceptors(HttpCacheInterceptor) // Cache GET requests
  async findAll(
    @Query() filterDto: FilterTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.findAll(filterDto, user);
  }

  /**
   * Get task statistics
   * GET /api/v1/tasks/statistics
   * 
   * Returns aggregated data about user's tasks
   * Must be placed BEFORE @Get(':id') to avoid route conflict
   * (Otherwise 'statistics' would be treated as an ID)
   * 
   * Response Example:
   * {
   *   "total": 15,
   *   "byStatus": {
   *     "todo": 5,
   *     "in_progress": 7,
   *     "done": 3
   *   }
   * }
   */
  @Get('statistics')
  @UseInterceptors(HttpCacheInterceptor)
  async getStatistics(@CurrentUser() user: User) {
    return this.tasksService.getStatistics(user);
  }

  /**
   * Get single task by ID
   * GET /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
   * 
   * @Param('id', ParseUUIDPipe) - Extracts :id from URL and validates UUID format
   * ParseUUIDPipe throws BadRequestException if ID is not valid UUID
   * 
   * Response: Single Task object
   */
  @Get(':id')
  @UseInterceptors(HttpCacheInterceptor)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.findOne(id, user);
  }

  /**
   * Partial update task (PATCH)
   * PATCH /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
   * 
   * PATCH is used for partial updates (update only specific fields)
   * UpdateTaskDto extends CreateTaskDto with all fields optional
   * 
   * Request Body Example (update only status):
   * {
   *   "status": "in_progress"
   * }
   * 
   * Request Body Example (update multiple fields):
   * {
   *   "status": "done",
   *   "priority": "low"
   * }
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  /**
   * Full update task (PUT)
   * PUT /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
   * 
   * PUT is traditionally used for full replacement
   * In practice, often used interchangeably with PATCH
   * Here we use the same UpdateTaskDto, but you could create a separate one
   * that requires all fields for true PUT semantics
   * 
   * Request Body Example:
   * {
   *   "title": "Updated title",
   *   "description": "Updated description",
   *   "status": "in_progress",
   *   "priority": "high",
   *   "dueDate": "2025-12-01T18:00:00Z"
   * }
   */
  @Put(':id')
  async replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    /**
     * For true PUT semantics, you might want to:
     * 1. Create a ReplaceTaskDto that requires all fields
     * 2. Clear all fields first, then set new values
     * Here we just reuse the update logic for simplicity
     */
    return this.tasksService.update(id, updateTaskDto, user);
  }

  /**
   * Delete task
   * DELETE /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
   * 
   * @HttpCode(HttpStatus.NO_CONTENT) - Returns 204 No Content on success
   * 204 means successful deletion with no response body
   * This is RESTful convention for DELETE operations
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.tasksService.remove(id, user);
    // No return value - 204 No Content
  }
}

/**
 * Complete API Usage Examples:
 * 
 * All requests require Authorization header:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * ==========================================
 * 1. CREATE TASK (POST)
 * ==========================================
 * POST /api/v1/tasks
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "title": "Implement authentication",
 *   "description": "Add JWT authentication to the API",
 *   "priority": "high",
 *   "status": "todo",
 *   "dueDate": "2025-11-20T18:00:00Z"
 * }
 * 
 * Response: 201 Created
 * {
 *   "id": "123e4567-e89b-12d3-a456-426614174000",
 *   "title": "Implement authentication",
 *   "description": "Add JWT authentication to the API",
 *   "status": "todo",
 *   "priority": "high",
 *   "dueDate": "2025-11-20T18:00:00.000Z",
 *   "userId": "987fcdeb-51a2-43f1-9876-543210fedcba",
 *   "createdAt": "2025-10-31T10:00:00.000Z",
 *   "updatedAt": "2025-10-31T10:00:00.000Z"
 * }
 * 
 * ==========================================
 * 2. GET ALL TASKS (with filters)
 * ==========================================
 * GET /api/v1/tasks?status=todo&priority=high&page=1&limit=10
 * 
 * Response: 200 OK
 * {
 *   "data": [
 *     { "id": "...", "title": "...", ... },
 *     { "id": "...", "title": "...", ... }
 *   ],
 *   "meta": {
 *     "total": 25,
 *     "page": 1,
 *     "limit": 10,
 *     "totalPages": 3,
 *     "hasNextPage": true,
 *     "hasPreviousPage": false
 *   }
 * }
 * 
 * ==========================================
 * 3. SEARCH TASKS
 * ==========================================
 * GET /api/v1/tasks?search=authentication
 * 
 * Searches in both title and description fields
 * 
 * ==========================================
 * 4. GET TASK STATISTICS
 * ==========================================
 * GET /api/v1/tasks/statistics
 * 
 * Response: 200 OK
 * {
 *   "total": 15,
 *   "byStatus": {
 *     "todo": 5,
 *     "in_progress": 7,
 *     "done": 3
 *   }
 * }
 * 
 * ==========================================
 * 5. GET SINGLE TASK
 * ==========================================
 * GET /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
 * 
 * Response: 200 OK
 * { "id": "...", "title": "...", ... }
 * 
 * ==========================================
 * 6. UPDATE TASK (PATCH - Partial)
 * ==========================================
 * PATCH /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
 * 
 * Body:
 * {
 *   "status": "in_progress"
 * }
 * 
 * Response: 200 OK
 * { "id": "...", "status": "in_progress", ... }
 * 
 * ==========================================
 * 7. UPDATE TASK (PUT - Full)
 * ==========================================
 * PUT /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
 * 
 * Body:
 * {
 *   "title": "Complete authentication",
 *   "description": "Fully implement and test JWT auth",
 *   "status": "done",
 *   "priority": "high",
 *   "dueDate": "2025-11-20T18:00:00Z"
 * }
 * 
 * Response: 200 OK
 * { "id": "...", "title": "Complete authentication", ... }
 * 
 * ==========================================
 * 8. DELETE TASK
 * ==========================================
 * DELETE /api/v1/tasks/123e4567-e89b-12d3-a456-426614174000
 * 
 * Response: 204 No Content
 * (Empty response body)
 */