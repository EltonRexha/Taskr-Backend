import { ApiProperty } from '@nestjs/swagger';
import { TaskDto } from './task.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class TasksResponseDto extends PaginationDto {
  @ApiProperty({ type: [TaskDto] })
  tasks: TaskDto[];
}
