/**
 * Update Task DTO
 * Extends CreateTaskDto but makes all fields optional
 * PartialType utility from @nestjs/mapped-types makes all properties optional
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/**
 * All fields from CreateTaskDto are now optional
 * This allows partial updates (updating only specific fields)
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}