import { ApiProperty } from '@nestjs/swagger';
import { ProjectType, ScrumTaskStatus } from 'prisma/generated/prisma/enums';

export class TaskMetaDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ScrumTaskStatus })
  status!: ScrumTaskStatus;

  @ApiProperty({ enum: ProjectType })
  type!: ProjectType;
}

