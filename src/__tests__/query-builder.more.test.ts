import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  advancedQueryBuilder,
  countQuery,
  aggregateQuery,
} from "../query-builder";

describe("Query Builder - Additional Coverage", () => {
  const mockModel = {
    findMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  };

  beforeEach(() => {
    mockModel.findMany.mockReset();
    mockModel.count.mockReset();
    mockModel.aggregate.mockReset();
  });

  it("advancedQueryBuilder should build multi-field orderBy", async () => {
    mockModel.findMany.mockResolvedValue([]);
    mockModel.count.mockResolvedValue(0);

    await advancedQueryBuilder({
      model: mockModel,
      page: 1,
      limit: 5,
      search: "john",
      searchFields: ["email"],
      filters: { status: "ACTIVE" },
      sortFields: [
        { field: "createdAt", order: "desc" },
        { field: "email", order: "asc" },
      ],
    });

    const args = mockModel.findMany.mock.calls[0][0];
    expect(args.orderBy).toEqual([
      { createdAt: "desc" },
      { email: "asc" },
    ]);
    expect(args.where).toHaveProperty("OR");
    expect(args.where).toHaveProperty("status", "ACTIVE");
  });

  it("countQuery should pass combined where to model.count", async () => {
    mockModel.count.mockResolvedValue(12);

    const result = await countQuery({
      model: mockModel,
      search: "john",
      searchFields: ["email"],
      filters: { isActive: true },
    });

    expect(result).toBe(12);
    const args = mockModel.count.mock.calls[0][0];
    expect(args.where).toHaveProperty("OR");
    expect(args.where).toHaveProperty("isActive", true);
  });

  it("aggregateQuery should pass aggregations and where", async () => {
    mockModel.aggregate.mockResolvedValue({
      _count: 1,
      _sum: { amount: 100 },
    });

    const result = await aggregateQuery({
      model: mockModel,
      filters: { status: "PAID" },
      aggregations: {
        _count: true,
        _sum: { amount: true },
      },
    });

    expect(result).toEqual({ _count: 1, _sum: { amount: 100 } });
    const args = mockModel.aggregate.mock.calls[0][0];
    expect(args.where).toHaveProperty("status", "PAID");
    expect(args._sum).toEqual({ amount: true });
  });
});
