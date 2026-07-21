import { BadRequestException } from "@nestjs/common";
import { Paginated, PaginateQuery } from "nestjs-paginate";
import { errorCodeConstants } from "../constants/error-code.constants";

export class PaginationUtil {
  static assertPageInRange<T>(
    query: PaginateQuery,
    result: Paginated<T>,
  ): void {
    const requestedPage = query.page ?? 1;
    const { totalPages } = result.meta;

    if (totalPages > 0 && requestedPage > totalPages) {
      throw new BadRequestException(
        `Page ${requestedPage} does not exist. Last page is ${totalPages}.`,
        {
          description: errorCodeConstants.PAGINATION_OUT_OF_BOUND,
        },
      );
    }
  }
}
