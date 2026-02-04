import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryBuilder, cursorQueryBuilder } from "../query-builder";

describe("Query Builder Integration", () => {
  const mockModel = {
    findMany: vi.fn(),
    count: vi.fn(),
  };

  beforeEach(() => {
    mockModel.findMany.mockReset();
    mockModel.count.mockReset();
  });

  it("queryBuilder should combine search and filters and call Prisma correctly", async () => {
    mockModel.findMany.mockResolvedValue([]);
    mockModel.count.mockResolvedValue(0);

    await queryBuilder({
      model: mockModel,
      page: 2,
      limit: 10,
      search: "john",
      searchFields: ["email"],
      filters: { status: "ACTIVE" },
      sortBy: "createdAt",
      sortOrder: "desc",
      include: { profile: true },
      select: { id: true },
    });

    expect(mockModel.findMany).toHaveBeenCalledTimes(1);
    expect(mockModel.count).toHaveBeenCalledTimes(1);

    const args = mockModel.findMany.mock.calls[0][0];
    expect(args.where).toHaveProperty("OR");
    expect(args.where).toHaveProperty("status", "ACTIVE");
    expect(args.orderBy).toEqual({ createdAt: "desc" });
    expect(args.include).toEqual({ profile: true });
    expect(args.select).toEqual({ id: true });
    expect(args.take).toBe(10);
    expect(args.skip).toBe(10);
  });

  it("cursorQueryBuilder should apply cursor pagination and compute hasMore", async () => {
    mockModel.findMany.mockResolvedValue([
      { id: "a" },
      { id: "b" },
      { id: "c" },
    ]);

    const result = await cursorQueryBuilder({
      model: mockModel,
      cursor: "cursor-1",
      limit: 2,
      search: "live",
      searchFields: ["title"],
      filters: { status: "LIVE" },
      sortBy: "createdAt",
      sortOrder: "desc",
      include: { speakers: true },
    });

    const args = mockModel.findMany.mock.calls[0][0];
    expect(args.take).toBe(3); // limit + 1
    expect(args.skip).toBe(1);
    expect(args.cursor).toEqual({ id: "cursor-1" });
    expect(args.orderBy).toEqual({ createdAt: "desc" });
    expect(args.where).toHaveProperty("OR");
    expect(args.where).toHaveProperty("status", "LIVE");

    expect(result.meta.hasMore).toBe(true);
    expect(result.meta.nextCursor).toBe("b");
    expect(result.data).toEqual([{ id: "a" }, { id: "b" }]);
  });
});
