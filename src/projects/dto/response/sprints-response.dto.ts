import { ApiProperty } from '@nestjs/swagger';
import { SprintStatus } from 'prisma/generated/prisma/enums';

class SprintDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  dueDate!: string;

  @ApiProperty({ enum: SprintStatus })
  sprintStatus!: SprintStatus;
}

export class SprintsResponseDto {
  @ApiProperty({ type: [SprintDto] })
  sprints!: SprintDto[];
}
