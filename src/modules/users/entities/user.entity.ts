import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer'; // Exclude sensitive fields from responses
import { Task } from '@/modules/tasks/entities/task.entity';

/**
 * User Roles Enum
 * Defines user permission levels
 */
export enum UserRole {
  ADMIN = 'admin',  // Full access
  USER = 'user',    // Limited access
}

@Entity('users') // Maps to 'users' table in database
export class User {
  /**
   * Primary Key - UUID for security and scalability
   * UUIDs are harder to guess than sequential IDs
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Email field - Unique identifier for authentication
   * unique: true creates unique constraint in database
   */
  @Column({ unique: true })
  email: string;

  /**
   * Password field - Hashed password storage
   * @Exclude() prevents password from being included in API responses
   * Even when User entity is returned, password won't be exposed
   */
  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  /**
   * Role field - Enum type for user permissions
   * Stored as enum in PostgreSQL for data integrity
   * Default value is USER role
   */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  /**
   * Active status - Soft delete mechanism
   * Instead of deleting users, we can deactivate them
   */
  @Column({ default: true })
  isActive: boolean;

  /**
   * One-to-Many Relationship with Tasks
   * One user can have many tasks
   * (task) => task.user specifies the inverse side of relationship
   */
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  /**
   * Automatic timestamps
   * CreateDateColumn: Set only once when record is created
   * UpdateDateColumn: Automatically updates on every record update
   */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
