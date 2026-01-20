import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class TaskQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  taskDescription?: string;

  @IsOptional()
  @IsString()
  projectName?: string;
}
