import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../query-builder", () => ({
  queryBuilder: vi.fn(),
}));

import { queryBuilder } from "../query-builder";
import {
  cachedQueryBuilder,
  setCacheStore,
  generateCacheKey,
  onQueryMetrics,
  monitoredQueryBuilder,
  buildSoftDeleteFilter,
  softDeleteQueryBuilder,
  buildTenantFilter,
  tenantQueryBuilder,
  batchQueryBuilder,
  toCSV,
  toJSON,
  queryAndExportCSV,
  queryAndExportJSON,
  saveQueryPreset,
  loadQueryPreset,
  executePreset,
  listPresets,
  deletePreset,
  queryWithWebhook,
  groupByQuery,
} from "../advanced-features";

const queryBuilderMock = queryBuilder as unknown as {
  mockResolvedValue: (val: any) => void;
  mockClear: () => void;
  mock: { calls: any[] };
};

describe("Advanced Features", () => {
  beforeEach(() => {
    queryBuilderMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("generateCacheKey should create a stable key", () => {
    const key = generateCacheKey({
      model: { name: "User" },
      page: 2,
      limit: 20,
      search: "john",
      filters: { status: "ACTIVE" },
      sortBy: "createdAt",
      sortOrder: "asc",
    });
    expect(key).toContain("User");
    expect(key).toContain("page:2");
    expect(key).toContain("limit:20");
    expect(key).toContain("search:john");
    expect(key).toContain("sort:createdAt:asc");
  });

  it("cachedQueryBuilder should return cached result when available", async () => {
    const cached = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    const store = {
      get: vi.fn().mockReturnValue(cached),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    };
    setCacheStore(store);

    const result = await cachedQueryBuilder({ model: { name: "User" } }, { key: "k1" });
    expect(result).toBe(cached);
    expect(queryBuilderMock.mock.calls.length).toBe(0);
  });

  it("cachedQueryBuilder should query and cache when no cached result", async () => {
    const store = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    };
    setCacheStore(store);
    queryBuilderMock.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });

    const result = await cachedQueryBuilder({ model: { name: "User" } }, { key: "k2", ttl: 1000 });
    expect(result).toBeDefined();
    expect(store.set).toHaveBeenCalled();
  });

  it("monitoredQueryBuilder should attach metrics", async () => {
    queryBuilderMock.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });

    let captured: any;
    onQueryMetrics((m) => {
      captured = m;
    });

    const result = await monitoredQueryBuilder({ model: { name: "User" } });
    expect(result._metrics).toBeDefined();
    expect(captured).toBeDefined();
  });

  it("buildSoftDeleteFilter should respect options", () => {
    expect(buildSoftDeleteFilter()).toEqual({ deletedAt: null });
    expect(buildSoftDeleteFilter({ includeTrashed: true })).toEqual({});
    expect(buildSoftDeleteFilter({ trashedOnly: true })).toEqual({ deletedAt: { not: null } });
  });

  it("softDeleteQueryBuilder should merge soft delete filter", async () => {
    queryBuilderMock.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });

    await softDeleteQueryBuilder({ model: { name: "User" }, filters: { status: "ACTIVE" } });
    const args = queryBuilderMock.mock.calls[0][0];
    expect(args.filters).toHaveProperty("status", "ACTIVE");
    expect(args.filters).toHaveProperty("deletedAt", null);
  });

  it("buildTenantFilter should use tenant field", () => {
    expect(buildTenantFilter("t1")).toEqual({ tenantId: "t1" });
    expect(buildTenantFilter("t1", "orgId")).toEqual({ orgId: "t1" });
  });

  it("tenantQueryBuilder should merge tenant filter", async () => {
    queryBuilderMock.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });

    await tenantQueryBuilder(
      { model: { name: "User" }, filters: { status: "ACTIVE" } },
      { tenantId: "t1" },
    );

    const args = queryBuilderMock.mock.calls[0][0];
    expect(args.filters).toHaveProperty("status", "ACTIVE");
    expect(args.filters).toHaveProperty("tenantId", "t1");
  });

  it("batchQueryBuilder should execute queries in parallel", async () => {
    queryBuilderMock.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });

    const result = await batchQueryBuilder([
      { name: "users", options: { model: { name: "User" } } },
      { name: "orders", options: { model: { name: "Order" } } },
    ]);

    expect(result.users).toBeDefined();
    expect(result.orders).toBeDefined();
  });

  it("toCSV and toJSON should format data", () => {
    const csv = toCSV([{ name: "John, Doe", age: 30 }]);
    expect(csv).toContain("\"John, Doe\"");

    const json = toJSON([{ a: 1 }], false);
    expect(json).toBe("[{\"a\":1}]");
  });

  it("toCSV should stringify nested objects and arrays", () => {
    const csv = toCSV([
      { name: "Alice", meta: { role: "ADMIN" }, tags: ["a", "b"] },
    ]);
    expect(csv).toContain("\"{\"\"role\"\":\"\"ADMIN\"\"}\"");
    expect(csv).toContain("\"[\"\"a\"\",\"\"b\"\"]\"");
  });

  it("queryAndExportCSV/JSON should return exported strings", async () => {
    queryBuilderMock.mockResolvedValue({
      data: [{ id: 1, name: "Test" }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    const csv = await queryAndExportCSV({ model: { name: "User" } }, 100);
    const json = await queryAndExportJSON({ model: { name: "User" } }, 100, true);

    expect(csv).toContain("id,name");
    expect(json).toContain("\"id\": 1");
  });

  it("presets should save/load/execute/delete", async () => {
    queryBuilderMock.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });

    saveQueryPreset("users", { model: { name: "User" }, page: 1 });
    expect(listPresets()).toContain("users");
    expect(loadQueryPreset("users")).toBeDefined();

    await executePreset("users", { page: 2 });
    expect(queryBuilderMock.mock.calls[0][0].page).toBe(2);

    expect(deletePreset("users")).toBe(true);
  });

  it("queryWithWebhook should post webhook", async () => {
    queryBuilderMock.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    // @ts-expect-error test override
    globalThis.fetch = fetchMock;

    await queryWithWebhook(
      { model: { name: "User" } },
      "https://example.com/webhook",
      { includeQuery: true },
    );

    expect(fetchMock).toHaveBeenCalled();
  });

  it("groupByQuery should call Prisma groupBy", async () => {
    const model = {
      groupBy: vi.fn().mockResolvedValue([{ status: "PAID", _count: 1 }]),
    };

    const result = await groupByQuery({
      model,
      groupBy: ["status"],
      aggregations: { _count: true },
    });

    expect(model.groupBy).toHaveBeenCalled();
    expect(result).toEqual([{ status: "PAID", _count: 1 }]);
  });
});
