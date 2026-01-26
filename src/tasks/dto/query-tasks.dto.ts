import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { transformToUtcDate } from 'src/common/utils/transform.to.utc.date';

export class TaskQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'startDate must be in YYYY-MM-DD format' })
  startDate?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'startDateGte must be in YYYY-MM-DD format' })
  startDateGte?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'dueDate must be in YYYY-MM-DD format' })
  dueDate?: Date;

  @IsOptional()
  @Transform(transformToUtcDate)
  @IsDate({ message: 'dueDateLte must be in YYYY-MM-DD format' })
  dueDateLte?: Date;
}
