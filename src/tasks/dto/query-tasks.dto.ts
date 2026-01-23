import { IsOptional, IsString } from 'class-validator';
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
}
