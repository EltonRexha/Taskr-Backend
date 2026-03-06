import { ApiProperty } from '@nestjs/swagger';
import { ProjectType, ProjectMemberRole } from 'prisma/generated/prisma/enums';

class ProjectMemberDto {
  @ApiProperty()
  userClerkId!: string;

  @ApiProperty({ enum: ProjectMemberRole })
  role!: ProjectMemberRole;
}

export class ProjectResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ProjectType })
  projectType!: ProjectType;

  @ApiProperty({ type: [ProjectMemberDto] })
  members!: ProjectMemberDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
