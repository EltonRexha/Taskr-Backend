import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  ScrumTaskStatus,
  TaskLabel,
  TaskUrgency,
} from 'prisma/generated/prisma/enums';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Task description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: TaskLabel, description: 'Task label' })
  @IsEnum(TaskLabel)
  label!: TaskLabel;

  @ApiProperty({ enum: TaskUrgency, description: 'Task priority' })
  @IsEnum(TaskUrgency)
  priority!: TaskUrgency;

  @ApiProperty({ description: 'Project ID' })
  @IsUUID()
  projectId!: string;

  @ApiProperty({
    description: 'Start date in YYYY-MM-DD format',
    type: String,
    format: 'date',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Due date in YYYY-MM-DD format',
    type: String,
    format: 'date',
  })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({
    enum: ScrumTaskStatus,
    description: 'Initial status for the task (defaults to TODO)',
  })
  @IsOptional()
  @IsEnum(ScrumTaskStatus)
  status?: ScrumTaskStatus;

  @ApiPropertyOptional({
    description: 'Array of project member clerkIds to assign the task to',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedTo?: string[];

  @ApiProperty({
    description: 'Sprint ID where the task will be assigned (required for Scrum projects)',
    type: String,
  })
  @IsUUID()
  sprintId!: string;
}
