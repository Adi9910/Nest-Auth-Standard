/**
 * Create Task DTO
 * Defines required and optional fields for creating a task
 */
import { IsString, IsOptional, IsEnum, IsDateString, MinLength, MaxLength } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  /**
   * @IsOptional() makes this field optional
   * Validation only runs if the field is provided
   */
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  /**
   * @IsEnum() validates against TaskStatus enum values
   * Only 'todo', 'in_progress', or 'done' are accepted
   */
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be one of: todo, in_progress, done' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be one of: low, medium, high' })
  priority?: TaskPriority;

  /**
   * @IsDateString() validates ISO 8601 date format
   * Example: "2025-12-31T23:59:59Z"
   */
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
  dueDate?: string;
}
