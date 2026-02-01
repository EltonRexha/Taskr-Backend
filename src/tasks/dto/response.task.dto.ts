import { ApiProperty } from '@nestjs/swagger';
import { TaskDto } from './task.dto';
import { ResponsePaginationDto } from 'src/common/dto/response-pagination.dto';

export class TasksResponseDto {
  @ApiProperty({ type: [TaskDto] })
  tasks: TaskDto[];

  @ApiProperty({ type: ResponsePaginationDto })
  metadata: ResponsePaginationDto;
}
