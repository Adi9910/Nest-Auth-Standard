/**
 * Users Module
 * Manages user-related operations (CRUD for users)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  /**
   * Import User entity to enable database operations
   * TypeOrmModule.forFeature() registers repositories for this module
   */
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export service for use in other modules (e.g., AuthModule)
})
export class UsersModule {}
