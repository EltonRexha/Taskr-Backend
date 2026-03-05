import { ApiProperty } from '@nestjs/swagger';
import { TaskDto } from '../model/task.dto';
import { ResponsePaginationDto } from 'src/common/dto/pagination/pagination-response.dto';

export class TasksResponseDto {
  @ApiProperty({ type: [TaskDto] })
  tasks!: TaskDto[];

  @ApiProperty({ type: ResponsePaginationDto })
  metadata!: ResponsePaginationDto;
}

