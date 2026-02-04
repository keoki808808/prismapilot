/**
 * Search query builder for PostgreSQL with ILIKE support
 * Works with Prisma's case-insensitive mode
 */

/**
 * Build search query for multiple fields
 * Creates an OR condition across all specified fields
 * @param search - Search term
 * @param fields - Array of field names to search in
 * @returns Prisma where clause for search or undefined
 */
export function buildSearchQuery(
  search?: string,
  fields: string[] = []
): any {
  // Return undefined if no search term or no fields specified
  if (
    !search ||
    search.trim() === "" ||
    !Array.isArray(fields) ||
    fields.length === 0
  ) {
    return undefined;
  }

  const trimmedSearch = search.trim();

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: trimmedSearch,
        mode: "insensitive", // Postgres ILIKE equivalent
      },
    })),
  };
}

/**
 * Build search query with nested relations
 * @param search - Search term
 * @param fieldConfigs - Array of field configurations with optional relations
 * @returns Prisma where clause for search or undefined
 * 
 * @example
 * buildNestedSearchQuery("test", [
 *   { field: "email" },
 *   { field: "firstName" },
 *   { relation: "user", field: "email" }
 * ])
 */
export function buildNestedSearchQuery(
  search?: string,
  fieldConfigs: Array<{ field: string; relation?: string }> = []
): any {
  if (
    !search ||
    search.trim() === "" ||
    !Array.isArray(fieldConfigs) ||
    fieldConfigs.length === 0
  ) {
    return undefined;
  }

  const trimmedSearch = search.trim();

  return {
    OR: fieldConfigs.map((config) => {
      if (config.relation) {
        return {
          [config.relation]: {
            [config.field]: {
              contains: trimmedSearch,
              mode: "insensitive",
            },
          },
        };
      }
      return {
        [config.field]: {
          contains: trimmedSearch,
          mode: "insensitive",
        },
      };
    }),
  };
}

/**
 * Build exact match search (useful for IDs, slugs, etc.)
 * @param value - Value to match exactly
 * @param field - Field name
 * @returns Prisma where clause or undefined
 */
export function buildExactSearch(
  value?: string,
  field?: string
): any {
  if (!value || !field) {
    return undefined;
  }

  return {
    [field]: value,
  };
}

/**
 * Build prefix search (starts with)
 * @param prefix - Prefix to search for
 * @param fields - Array of field names
 * @returns Prisma where clause or undefined
 */
export function buildPrefixSearch(
  prefix?: string,
  fields: string[] = []
): any {
  if (!prefix || prefix.trim() === "" || fields.length === 0) {
    return undefined;
  }

  const trimmedPrefix = prefix.trim();

  return {
    OR: fields.map((field) => ({
      [field]: {
        startsWith: trimmedPrefix,
        mode: "insensitive",
      },
    })),
  };
}
