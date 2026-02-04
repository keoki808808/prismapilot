/**
 * Domain-specific filter helpers (examples)
 * These are intentionally not exported from the package entry point.
 * Copy and adapt them to your own models and role system.
 */

export type RoleBasedAccess = {
  role?: string;
  userId?: string;
  applyRoleFilter?: boolean;
};

/**
 * Example role-based filters
 */
export function buildRoleBasedFilters(
  role?: string,
  userId?: string
): Record<string, any> {
  const filters: Record<string, any> = {};

  // ADMIN can see everything, so no additional filters
  if (role === "ADMIN") {
    return filters;
  }

  // USER can only see their own data (for certain models)
  if (role === "USER" && userId) {
    filters.userId = userId;
  }

  // GUEST has most restricted access
  if (role === "GUEST") {
    filters.isActive = true; // Only active records
  }

  return filters;
}
