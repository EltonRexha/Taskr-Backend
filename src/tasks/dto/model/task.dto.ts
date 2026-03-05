import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskProjectDto } from './task-project.dto';
import { TaskMetaDto } from './task-meta.dto';
import { AssignedToDto } from './task-assignee.dto';
import { TaskLabel, TaskUrgency } from 'prisma/generated/prisma/enums';

export class TaskDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  label!: TaskLabel;

  @ApiProperty()
  priority!: TaskUrgency;

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  dueDate!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: [AssignedToDto], description: 'List of assigned users' })
  assignedTo!: AssignedToDto[];

  @ApiProperty({ type: TaskProjectDto }) project!: TaskProjectDto;
  @ApiPropertyOptional({ type: TaskMetaDto }) metaData?: TaskMetaDto;
}

