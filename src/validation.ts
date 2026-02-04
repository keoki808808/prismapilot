/**
 * Zod validation schemas for query parameters
 * Ensures type safety and validation for all query inputs
 */

import { z } from "zod";

// Base schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const sortSchema = z.object({
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = z.object({
  search: z.string().optional(),
});

// Date range schema
export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// Number range schema
export const numberRangeSchema = z.object({
  from: z.coerce.number().optional(),
  to: z.coerce.number().optional(),
});

// Generic query schema that combines common fields
export const genericQuerySchema = z.intersection(
  z.intersection(paginationSchema, sortSchema),
  searchSchema
);

// Export type inference helpers
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
export type SortInput = z.infer<typeof sortSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type NumberRangeInput = z.infer<typeof numberRangeSchema>;

