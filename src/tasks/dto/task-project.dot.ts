import { ApiProperty } from '@nestjs/swagger';

export class TaskProjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
