import { ApiProperty } from '@nestjs/swagger';
import { ProjectDto } from '../model/project.dto';
import { ResponsePaginationDto } from 'src/common/dto/pagination/pagination-response.dto';

export class ProjectsResponseDto {
  @ApiProperty({ type: [ProjectDto] })
  projects: ProjectDto[];

  @ApiProperty({ type: ResponsePaginationDto })
  metadata: ResponsePaginationDto;
}

