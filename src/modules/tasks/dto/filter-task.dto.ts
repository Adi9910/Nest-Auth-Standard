/**
 * Filter Task DTO
 * Used for query parameters in GET requests
 * Enables filtering, sorting, and pagination
 */
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '@/modules/tasks/entities/task.entity';

export class FilterTaskDto {
  // Filter by status
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  // Filter by priority
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  // Search in title or description
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Pagination parameters
   * @Type() transforms string query params to numbers
   * @Min() and @Max() ensure valid ranges
   */
  @IsOptional()
  @Type(() => Number) // Convert string to number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Prevent excessive data retrieval
  limit?: number = 10;

  // Sort by field
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'dueDate', 'priority'], {
    message: 'Sort by must be one of: createdAt, updatedAt, dueDate, priority',
  })
  sortBy?: string = 'createdAt';

  // Sort order
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}