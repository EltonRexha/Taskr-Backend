import { ApiProperty } from '@nestjs/swagger';
import { ProjectDto } from './project.dto';
import { ResponsePaginationDto } from 'src/common/dto/response-pagination.dto';

export class ProjectsResponseDto {
  @ApiProperty({ type: [ProjectDto] })
  projects: ProjectDto[];

  @ApiProperty({ type: ResponsePaginationDto })
  metadata: ResponsePaginationDto;
}
