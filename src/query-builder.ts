/**
 * Main Query Builder Utility
 * Combines pagination, search, filters, and sorting for any Prisma model
 */

import {
  getPagination,
  getCursorPagination,
  processCursorResults,
} from "./pagination";
import { buildSearchQuery } from "./search";
import { buildFilters, buildRelationFilters, combineFilters } from "./filters";
import {
  QueryBuilderResponse,
  CursorQueryBuilderResponse,
} from "./query-types";

type QueryBuilderArgs = {
  model: any; // prisma.user, prisma.order, etc
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  filters?: Record<string, any>;
  relationFilters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  include?: any;
  select?: any;
};

type CursorQueryBuilderArgs = Omit<QueryBuilderArgs, "page"> & {
  cursor?: string;
  cursorField?: string;
};

/**
 * Main query builder with offset-based pagination
 * @returns Data with pagination metadata
 */
export async function queryBuilder<T>({
  model,
  page = 1,
  limit = 10,
  search,
  searchFields = [],
  filters = {},
  relationFilters = {},
  sortBy = "createdAt",
  sortOrder = "desc",
  include,
  select,
}: QueryBuilderArgs): Promise<QueryBuilderResponse<T>> {
  // Get pagination parameters
  const { take, skip } = getPagination({ page, limit });

  // Build search query
  const searchQuery = buildSearchQuery(search, searchFields);

  // Build filter query
  const filterQuery = buildFilters(filters);
  const relationQuery = buildRelationFilters(relationFilters);

  // Combine all where conditions
  const where = combineFilters(searchQuery || {}, filterQuery, relationQuery);

  // Execute query and count in parallel
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      take,
      skip,
      orderBy: { [sortBy]: sortOrder },
      ...(include && { include }),
      ...(select && { select }),
    }),
    model.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
}

/**
 * Query builder with cursor-based pagination
 * Better for infinite scroll and large datasets
 * @returns Data with cursor pagination metadata
 */
export async function cursorQueryBuilder<T extends Record<string, any>>({
  model,
  cursor,
  limit = 10,
  search,
  searchFields = [],
  filters = {},
  relationFilters = {},
  sortBy,
  sortOrder = "desc",
  include,
  select,
  cursorField = "id",
}: CursorQueryBuilderArgs): Promise<CursorQueryBuilderResponse<T>> {
  const effectiveSortBy = sortBy || cursorField;

  // Get cursor pagination parameters
  const cursorPagination = getCursorPagination({ cursor, limit, cursorField });

  // Build search query
  const searchQuery = buildSearchQuery(search, searchFields);

  // Build filter query
  const filterQuery = buildFilters(filters);
  const relationQuery = buildRelationFilters(relationFilters);

  // Combine all where conditions
  const where = combineFilters(searchQuery || {}, filterQuery, relationQuery);

  // Execute query
  const results = await model.findMany({
    where,
    ...cursorPagination,
    orderBy:
      effectiveSortBy === cursorField
        ? { [effectiveSortBy]: sortOrder }
        : [
            { [effectiveSortBy]: sortOrder },
            { [cursorField]: sortOrder },
          ],
    ...(include && { include }),
    ...(select && { select }),
  });

  // Process cursor results
  const { data, hasMore, nextCursor } = processCursorResults(
    results,
    limit,
    cursorField,
  ) as {
    data: T[];
    hasMore: boolean;
    nextCursor: string | null;
  };

  return {
    data,
    meta: {
      nextCursor,
      hasMore,
      limit,
    },
  };
}

/**
 * Query builder with multiple sort fields
 * @returns Data with pagination metadata
 */
export async function advancedQueryBuilder<T>({
  model,
  page = 1,
  limit = 10,
  search,
  searchFields = [],
  filters = {},
  relationFilters = {},
  sortFields = [{ field: "createdAt", order: "desc" as const }],
  include,
  select,
}: Omit<QueryBuilderArgs, "sortBy" | "sortOrder"> & {
  sortFields?: Array<{ field: string; order: "asc" | "desc" }>;
}): Promise<QueryBuilderResponse<T>> {
  // Get pagination parameters
  const { take, skip } = getPagination({ page, limit });

  // Build search query
  const searchQuery = buildSearchQuery(search, searchFields);

  // Build filter query
  const filterQuery = buildFilters(filters);
  const relationQuery = buildRelationFilters(relationFilters);

  // Combine all where conditions
  const where = combineFilters(searchQuery || {}, filterQuery, relationQuery);

  // Build orderBy for multiple fields
  const orderBy = sortFields.map((sort) => ({
    [sort.field]: sort.order,
  }));

  // Execute query and count in parallel
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      take,
      skip,
      orderBy,
      ...(include && { include }),
      ...(select && { select }),
    }),
    model.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
}

/**
 * Simple count query
 * Useful for dashboard statistics
 * @returns Count of matching records
 */
export async function countQuery({
  model,
  filters = {},
  relationFilters = {},
  search,
  searchFields = [],
}: Omit<
  QueryBuilderArgs,
  "page" | "limit" | "sortBy" | "sortOrder" | "include" | "select"
>): Promise<number> {
  // Build search query
  const searchQuery = buildSearchQuery(search, searchFields);

  // Build filter query
  const filterQuery = buildFilters(filters);
  const relationQuery = buildRelationFilters(relationFilters);

  // Combine all where conditions
  const where = combineFilters(searchQuery || {}, filterQuery, relationQuery);

  return model.count({ where });
}

/**
 * Aggregate query builder
 * For sum, avg, min, max operations
 */
export async function aggregateQuery({
  model,
  filters = {},
  relationFilters = {},
  search,
  searchFields = [],
  aggregations,
}: Omit<
  QueryBuilderArgs,
  "page" | "limit" | "sortBy" | "sortOrder" | "include" | "select"
> & {
  aggregations: {
    _sum?: Record<string, boolean>;
    _avg?: Record<string, boolean>;
    _min?: Record<string, boolean>;
    _max?: Record<string, boolean>;
    _count?: boolean | Record<string, boolean>;
  };
}): Promise<any> {
  // Build search query
  const searchQuery = buildSearchQuery(search, searchFields);

  // Build filter query
  const filterQuery = buildFilters(filters);
  const relationQuery = buildRelationFilters(relationFilters);

  // Combine all where conditions
  const where = combineFilters(searchQuery || {}, filterQuery, relationQuery);

  return model.aggregate({
    where,
    ...aggregations,
  });
}
