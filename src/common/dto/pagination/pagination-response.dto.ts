import { ApiProperty } from '@nestjs/swagger';

export class ResponsePaginationDto {
  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Current page number (1-based)' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether a next page exists' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether a previous page exists' })
  hasPreviousPage: boolean;
}
