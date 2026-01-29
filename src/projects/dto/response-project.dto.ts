import { ApiProperty } from '@nestjs/swagger';
import { ProjectDto } from './project.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ProjectsResponseDto extends PaginationDto {
  @ApiProperty({ type: [ProjectDto] })
  projects: ProjectDto[];
}
