"use client";

import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";

type PaginationBarProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  maxPageNumber: number;
  onPageChange: (page: number) => void;
};

const bar = "flex items-center justify-between gap-lg";
const summary = "text-caption text-muted";
const controls = "flex items-center gap-sm";
const currentPageFill = "bg-field text-ink";

function getPageWindow(
  currentPage: number,
  totalPages: number,
  maxPageNumber: number,
): number[] {
  const windowSize = Math.min(maxPageNumber, totalPages);
  if (windowSize <= 0) {
    return [];
  }
  const half = Math.floor(windowSize / 2);
  const lastStart = totalPages - windowSize + 1;
  const start = Math.max(1, Math.min(currentPage - half, lastStart));
  return Array.from({ length: windowSize }, (_, index) => start + index);
}

export default function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  maxPageNumber,
  onPageChange,
}: PaginationBarProps) {
  const rangeStart =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = getPageWindow(currentPage, totalPages, maxPageNumber);

  return (
    <nav aria-label="Pagination" className={bar}>
      <p className={summary}>
        {rangeStart}&ndash;{rangeEnd} of {totalItems}
      </p>
      <div className={controls}>
        <DefaultButton
          variant="secondary"
          size="sm"
          icon={<MdChevronLeft />}
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {pages.map((pageNumber) => {
          const isCurrent = pageNumber === currentPage;
          return (
            <DefaultButton
              key={pageNumber}
              variant={isCurrent ? "secondary" : "ghost"}
              size="sm"
              label={String(pageNumber)}
              aria-label={`Page ${pageNumber}`}
              aria-current={isCurrent ? "page" : undefined}
              className={isCurrent ? currentPageFill : undefined}
              onClick={() => onPageChange(pageNumber)}
            />
          );
        })}
        <DefaultButton
          variant="secondary"
          size="sm"
          icon={<MdChevronRight />}
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </div>
    </nav>
  );
}
