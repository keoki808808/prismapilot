/**
 * Pagination utilities for both offset-based and cursor-based pagination
 */

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Get pagination parameters for offset-based pagination
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Object with take and skip values for Prisma
 */
export function getPagination({
  page = 1,
  limit = DEFAULT_LIMIT,
}: {
  page?: number;
  limit?: number;
}) {
  // Ensure page is at least 1
  const safePage = Math.max(1, page);

  // Cap limit to prevent abuse
  const take = Math.min(Math.max(1, limit), MAX_LIMIT);

  // Calculate skip (0-indexed for Prisma)
  const skip = (safePage - 1) * take;

  return { take, skip };
}

/**
 * Get pagination parameters for cursor-based pagination
 * @param cursor - Cursor string (typically the ID of the last item)
 * @param limit - Items per page
 * @returns Object with take, skip, and cursor values for Prisma
 */
export function getCursorPagination({
  cursor,
  cursorField = "id",
  limit = DEFAULT_LIMIT,
}: {
  cursor?: string;
  cursorField?: string;
  limit?: number;
}) {
  const take = Math.min(Math.max(1, limit), MAX_LIMIT);

  return {
    take: take + 1, // Fetch one extra to determine if there are more results
    ...(cursor && {
      skip: 1, // Skip the cursor item
      cursor: {
        [cursorField]: cursor,
      },
    }),
  };
}

/**
 * Calculate total pages from total count and limit
 * @param total - Total number of items
 * @param limit - Items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Process cursor pagination results
 * Extracts the extra item to determine hasMore and nextCursor
 * @param results - Query results
 * @param limit - Original limit requested
 * @returns Processed data with pagination metadata
 */
export function processCursorResults<T extends Record<string, any>>(
  results: T[],
  limit: number,
  cursorField = "id",
): {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
} {
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  let nextCursor: string | null = null;

  if (hasMore && data && data.length > 0) {
    const lastItem = data[data.length - 1];
    if (lastItem) {
      const cursorValue = lastItem[cursorField];
      nextCursor = cursorValue !== undefined ? String(cursorValue) : null;
    }
  }

  return {
    data,
    hasMore,
    nextCursor,
  };
}
