import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ProjectQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  project_name?: string;
}
