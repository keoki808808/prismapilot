/**
 * Filter builder for complex query conditions
 * Supports exact matches, ranges, arrays, booleans, enums, and relations
 */

import { DateRangeFilter, NumberRangeFilter } from "./query-types";

/**
 * Build filter conditions from a filter object
 * @param filters - Object containing filter conditions
 * @returns Prisma where clause
 */
export function buildFilters(filters: Record<string, any>): Record<string, any> {
  const where: Record<string, any> = {};

  for (const key in filters) {
    const value = filters[key];

    // Skip undefined, null, or empty string values
    if (value === undefined || value === null || value === "") {
      continue;
    }

    // Number range filter
    if (isNumberRangeFilter(value)) {
      where[key] = buildNumberRangeFilter(value);
    }
    // Date range filter
    else if (isDateRangeFilter(value)) {
      where[key] = buildDateRangeFilter(value);
    }
    // Array (IN query)
    else if (Array.isArray(value)) {
      if (value.length > 0) {
        where[key] = { in: value };
      }
    }
    // Boolean
    else if (typeof value === "boolean") {
      where[key] = value;
    }
    // String, Number, Enum (exact match)
    else {
      where[key] = value;
    }
  }

  return where;
}

/**
 * Build date range filter
 * @param range - Date range object
 * @returns Prisma date filter
 */
export function buildDateRangeFilter(range: DateRangeFilter): any {
  const filter: any = {};

  if (range.from) {
    filter.gte = new Date(range.from);
  }

  if (range.to) {
    filter.lte = new Date(range.to);
  }

  return filter;
}

/**
 * Build number range filter
 * @param range - Number range object
 * @returns Prisma number filter
 */
export function buildNumberRangeFilter(range: NumberRangeFilter): any {
  const filter: any = {};

  if (range.from !== undefined) {
    filter.gte = range.from;
  }

  if (range.to !== undefined) {
    filter.lte = range.to;
  }

  return filter;
}

/**
 * Type guard for date range filter
 */
function isDateRangeFilter(value: any): value is DateRangeFilter {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    (!("from" in value) && !("to" in value))
  ) {
    return false;
  }

  const from = (value as DateRangeFilter).from;
  const to = (value as DateRangeFilter).to;

  const isDateLike = (candidate: unknown) =>
    candidate instanceof Date || typeof candidate === "string";

  return (
    (from !== undefined && isDateLike(from)) ||
    (to !== undefined && isDateLike(to))
  );
}

/**
 * Type guard for number range filter
 */
function isNumberRangeFilter(value: any): value is NumberRangeFilter {
  return (
    typeof value === "object" &&
    value !== null &&
    ("from" in value || "to" in value) &&
    !Array.isArray(value) &&
    (typeof value.from === "number" || typeof value.to === "number")
  );
}

/**
 * Build relation filters
 * @param relationFilters - Object with relation name as key and filter conditions as value
 * @returns Prisma where clause for relations
 * 
 * @example
 * buildRelationFilters({
 *   user: { isActive: true },
 *   event: { status: "LIVE" }
 * })
 */
export function buildRelationFilters(
  relationFilters: Record<string, any>
): Record<string, any> {
  const where: Record<string, any> = {};

  for (const relation in relationFilters) {
    const conditions = relationFilters[relation];
    
    if (conditions && typeof conditions === "object") {
      where[relation] = buildFilters(conditions);
    }
  }

  return where;
}

/**
 * Build NOT filters (exclusion)
 * @param notFilters - Filters to exclude
 * @returns Prisma NOT clause
 */
export function buildNotFilters(notFilters: Record<string, any>): any {
  const filters = buildFilters(notFilters);
  
  if (Object.keys(filters).length === 0) {
    return undefined;
  }

  return { NOT: filters };
}

/**
 * Build filters for specific models based on user role
 * @param role - User role
 * @param userId - User ID
 * @returns Role-based filters
 */
/**
 * Combine multiple filter objects with AND logic
 * @param filterObjects - Array of filter objects
 * @returns Combined Prisma where clause
 */
export function combineFilters(...filterObjects: Record<string, any>[]): Record<string, any> {
  return filterObjects.reduce((combined, current) => {
    return { ...combined, ...current };
  }, {});
}

/**
 * Combine filters with OR logic
 * @param filterObjects - Array of filter objects
 * @returns Prisma OR clause
 */
export function combineFiltersWithOr(...filterObjects: Record<string, any>[]): any {
  const validFilters = filterObjects.filter(
    (filter) => Object.keys(filter).length > 0
  );

  if (validFilters.length === 0) {
    return undefined;
  }

  if (validFilters.length === 1) {
    return validFilters[0];
  }

  return { OR: validFilters };
}
