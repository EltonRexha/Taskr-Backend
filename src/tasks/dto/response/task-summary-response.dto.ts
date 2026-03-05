import { ApiProperty } from '@nestjs/swagger';

export class TaskSummaryResponseDto {
  @ApiProperty({ type: Number })
  TODO: number;

  @ApiProperty({ type: Number })
  IN_PROGRESS: number;

  @ApiProperty({ type: Number })
  IN_REVIEW: number;

  @ApiProperty({ type: Number })
  DONE: number;

  @ApiProperty({ type: Number })
  overdueTasks: number;

  @ApiProperty({ type: Number })
  memberCount: number;
}

