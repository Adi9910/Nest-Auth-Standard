import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Task Status Enum
 * Defines the lifecycle of a task
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

/**
 * Task Priority Enum
 * Helps in task prioritization
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('tasks') // Maps to 'tasks' table
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  /**
   * Description field
   * type: 'text' for long content (no character limit)
   * nullable: true allows NULL values in database
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Status field with enum constraint
   * Ensures only valid status values can be stored
   */
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  /**
   * Due date field
   * timestamp type stores date and time
   * nullable for tasks without deadlines
   */
  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  /**
   * Foreign Key to User table
   * Stores the UUID of the user who owns this task
   */
  @Column({ type: 'uuid' })
  userId: string;

  /**
   * Many-to-One Relationship with User
   * Many tasks belong to one user
   * onDelete: 'CASCADE' means if user is deleted, all their tasks are deleted
   * @JoinColumn specifies the foreign key column name
   */
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}