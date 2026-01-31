import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { transformToUtcDate } from 'src/common/utils/transform.to.utc.date';

export class TaskQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by task description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by project name' })
  projectName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by label' })
  label?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by priority (e.g., high, low)' })
  priority?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by project ID' })
  projectId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by type of task' })
  type?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Filter by status (for e.g in scrum, TODO, IN_PROGRESS, IN_REVIEW, DONE)',
  })
  status?: string;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'startDate must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks starting from this date',
    type: String,
    format: 'date',
  })
  startDate?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'startDateGte must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks starting after or equal to this date',
    type: String,
    format: 'date',
  })
  startDateGte?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'startDateLte must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks starting before or equal to this date',
    type: String,
    format: 'date',
  })
  startDateLte?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'dueDate must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks due by this date',
    type: String,
    format: 'date',
  })
  dueDate?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'dueDateLte must be in YYYY-MM-DD format' })
  @ApiPropertyOptional({
    description: 'Filter tasks due before or equal to this date',
    type: String,
    format: 'date',
  })
  dueDateLte?: Date;
}
