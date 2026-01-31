import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TaskDto } from './task.dto';

export class TasksResponseDto extends PaginationDto {
  @ApiProperty({ type: [TaskDto] })
  tasks: TaskDto[];
}
