import { ApiProperty } from '@nestjs/swagger';

export class TaskMetaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  type: string;
}
