import { describe, it, expect } from "vitest";
import {
  buildSearchQuery,
  buildNestedSearchQuery,
  buildExactSearch,
  buildPrefixSearch,
} from "../search";

describe("Search Helpers", () => {
  it("buildNestedSearchQuery should include relation fields", () => {
    const result = buildNestedSearchQuery("test", [
      { field: "email" },
      { relation: "user", field: "email" },
    ]);
    expect(result).toHaveProperty("OR");
    expect(result.OR.length).toBe(2);
    expect(result.OR[1]).toHaveProperty("user");
  });

  it("buildExactSearch should return exact match", () => {
    const result = buildExactSearch("abc", "slug");
    expect(result).toEqual({ slug: "abc" });
    expect(buildExactSearch(undefined, "slug")).toBeUndefined();
  });

  it("buildPrefixSearch should return startsWith query", () => {
    const result = buildPrefixSearch("jo", ["name"]);
    expect(result).toEqual({
      OR: [
        { name: { startsWith: "jo", mode: "insensitive" } },
      ],
    });
  });
});
