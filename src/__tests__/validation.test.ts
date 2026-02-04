import { describe, it, expect } from "vitest";
import {
  paginationSchema,
  cursorPaginationSchema,
  sortSchema,
  searchSchema,
  dateRangeSchema,
  numberRangeSchema,
  genericQuerySchema,
} from "../validation";

describe("Validation Schemas", () => {
  it("paginationSchema should coerce and default values", () => {
    const parsed = paginationSchema.parse({ page: "2", limit: "20" });
    expect(parsed).toEqual({ page: 2, limit: 20 });

    const defaults = paginationSchema.parse({});
    expect(defaults).toEqual({ page: 1, limit: 10 });
  });

  it("cursorPaginationSchema should validate uuid and default limit", () => {
    const parsed = cursorPaginationSchema.parse({
      cursor: "123e4567-e89b-12d3-a456-426614174000",
      limit: "5",
    });
    expect(parsed.cursor).toBeDefined();
    expect(parsed.limit).toBe(5);

    const defaults = cursorPaginationSchema.parse({});
    expect(defaults.limit).toBe(10);
  });

  it("sortSchema should default sort values", () => {
    const parsed = sortSchema.parse({});
    expect(parsed).toEqual({ sortBy: "createdAt", sortOrder: "desc" });
  });

  it("searchSchema should accept optional search", () => {
    expect(searchSchema.parse({})).toEqual({ search: undefined });
    expect(searchSchema.parse({ search: "john" })).toEqual({ search: "john" });
  });

  it("dateRangeSchema should coerce dates", () => {
    const parsed = dateRangeSchema.parse({
      from: "2025-01-01",
      to: "2025-12-31",
    });
    expect(parsed.from).toBeInstanceOf(Date);
    expect(parsed.to).toBeInstanceOf(Date);
  });

  it("numberRangeSchema should coerce numbers", () => {
    const parsed = numberRangeSchema.parse({ from: "10", to: "20" });
    expect(parsed).toEqual({ from: 10, to: 20 });
  });

  it("genericQuerySchema should merge pagination, sort, search", () => {
    const parsed = genericQuerySchema.parse({
      page: "1",
      limit: "15",
      sortBy: "name",
      sortOrder: "asc",
      search: "john",
    });
    expect(parsed).toEqual({
      page: 1,
      limit: 15,
      sortBy: "name",
      sortOrder: "asc",
      search: "john",
    });
  });
});
