import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable()
export class PaginatedService {
  getPagination(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    return { skip, take: limit, page, limit };
  }

  /**
   * Builds pagination metadata for a paginated API response.
   *
   * The returned `meta` object provides context about the paginated data,
   * including the current page, page size, total number of records,
   * total number of pages, and navigation helpers.
   *
   * @param total - Total number of records available (before pagination).
   * @param page - Current page number (1-based).
   * @param limit - Number of records per page.
   *
   * @returns Pagination metadata describing the current pagination state.
   *
   * @example
   * const meta = paginationService.getMeta(128, 3, 10);
   *
   * // Result:
   * // {
   * //   total: 128,
   * //   page: 3,
   * //   limit: 10,
   * //   totalPages: 13,
   * //   hasPreviousPage: true,
   * //   hasNextPage: true
   * // }
   */
  getMeta(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }
}
