import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TaskSummaryQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Project ID' })
  projectId: string;
}
