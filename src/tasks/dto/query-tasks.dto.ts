import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
  @Transform(({ value }) => {
    if (!value) return undefined;

    if (typeof value === 'string') {
      const parts = value.split('-').map(Number);

      // Check format correctness
      if (
        parts.length !== 3 ||
        parts.some(isNaN) ||
        parts[0] < 1000 ||
        parts[1] < 1 ||
        parts[1] > 12 ||
        parts[2] < 1 ||
        parts[2] > 31
      ) {
        return undefined;
      }

      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    }

    return undefined;
  })
  @IsDate({ message: 'startDate must be in YYYY-MM-DD format' })
  startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;

    if (typeof value === 'string') {
      const parts = value.split('-').map(Number);

      // Check format correctness
      if (
        parts.length !== 3 ||
        parts.some(isNaN) ||
        parts[0] < 1000 ||
        parts[1] < 1 ||
        parts[1] > 12 ||
        parts[2] < 1 ||
        parts[2] > 31
      ) {
        return undefined;
      }

      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    }

    return undefined;
  })
  @IsDate({ message: 'startDate must be in YYYY-MM-DD format' })
  startDateGte?: Date;
}
