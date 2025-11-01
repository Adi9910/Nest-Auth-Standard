/**
 * Tasks Module
 * Manages task operations with advanced features:
 * - CRUD operations
 * - Query parameters for filtering
 * - Caching with Redis
 * - User ownership validation
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
