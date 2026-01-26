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
   * The meta object provides context about the returned data,
   * such as how many total records exist, which page is currently
   * being viewed, and how many pages are available in total.
   *
   * @param total - Total number of records available (without pagination).
   * @param page - Current page number (1-based).
   * @param limit - Number of records per page.
   *
   * @returns An object containing pagination metadata.
   *
   * @example
   * const meta = paginationService.getMeta(128, 3, 10);
   *
   * // Result:
   * // {
   * //   total: 128,
   * //   page: 3,
   * //   limit: 10,
   * //   totalPages: 13
   * // }
   */
  getMeta(total: number, page: number, limit: number) {
    return { total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
