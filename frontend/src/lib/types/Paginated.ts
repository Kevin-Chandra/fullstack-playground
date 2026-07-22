export interface PaginatedMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  sortBy: [];
}

export interface PaginatedLinks {
  first: string;
  previous: string;
  current: string;
  next: string;
  last: string;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
  links: PaginatedLinks;
}
