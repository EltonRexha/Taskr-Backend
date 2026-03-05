import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from 'prisma/generated/prisma/enums';

export class ProjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ProjectType })
  projectType: ProjectType;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

