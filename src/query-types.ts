/**
 * Base types for query builder system
 * Supports pagination, sorting, searching, and filtering
 */

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type CursorPaginationParams = {
  cursor?: string;
  limit?: number;
};

export type SortParams = {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type SearchParams = {
  search?: string;
  searchFields?: string[];
};

export type FilterParams = Record<string, any>;

export type DateRangeFilter = {
  from?: Date | string;
  to?: Date | string;
};

export type NumberRangeFilter = {
  from?: number;
  to?: number;
};

export type QueryBuilderResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CursorQueryBuilderResponse<T> = {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
};

