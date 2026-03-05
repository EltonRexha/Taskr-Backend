import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { transformToUtcDate } from 'src/common/utils/transform-to-utc-date';
import {
  ProjectType,
  ScrumTaskStatus,
  TaskLabel,
  TaskUrgency,
} from 'prisma/generated/prisma/enums';

export class TaskQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by task description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by project name' })
  project_name?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? (value.toUpperCase() as TaskLabel)
      : (value as TaskLabel),
  )
  @IsEnum(TaskLabel)
  @ApiPropertyOptional({ description: 'Filter by label' })
  label?: TaskLabel;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? (value.toUpperCase() as TaskUrgency)
      : (value as TaskUrgency),
  )
  @IsEnum(TaskUrgency)
  @ApiPropertyOptional({ description: 'Filter by priority (e.g., HIGH, LOW)' })
  priority?: TaskUrgency;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by project ID' })
  project_id?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? (value.toUpperCase() as ProjectType)
      : (value as ProjectType),
  )
  @IsEnum(ProjectType)
  @ApiPropertyOptional({
    description: 'Filter by project type (e.g., SCRUM, KANBAN)',
  })
  type?: ProjectType;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? (value.toUpperCase() as ScrumTaskStatus)
      : (value as ScrumTaskStatus),
  )
  @IsEnum(ScrumTaskStatus)
  @ApiPropertyOptional({
    description:
      'Filter by Scrum task status (TODO, IN_PROGRESS, IN_REVIEW, DONE)',
  })
  status?: ScrumTaskStatus;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'start_date must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks starting from this date',
    type: String,
    format: 'date',
  })
  start_date?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'start_date_gte must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks starting after or equal to this date',
    type: String,
    format: 'date',
  })
  start_date_gte?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'start_date_lte must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks starting before or equal to this date',
    type: String,
    format: 'date',
  })
  start_date_lte?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'due_date must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks due by this date',
    type: String,
    format: 'date',
  })
  due_date?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'due_date_lte must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks due before or equal to this date',
    type: String,
    format: 'date',
  })
  due_date_lte?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? [value]
        : undefined,
  )
  @ApiPropertyOptional({
    example: ['priority:desc', 'due_date:asc'],
    description: 'Sort by fields in format field:order (e.g., priority:desc)',
  })
  sort_by?: string[];
}
