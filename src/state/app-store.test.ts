import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ageActiveTasks, filterTasksByQuery } from "@/lib/task-utils";
import type { Task } from "@/lib/types";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "test-id",
  title: "Test task",
  status: "active",
  createdAt: "2026-06-01T00:00:00Z",
  activatedAt: "2026-06-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
  completedAt: null,
  dormantAt: null,
  ...overrides,
});

describe("ageActiveTasks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    process.env.TZ = "UTC";
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = "UTC";
  });

  it("active task activated 8 days ago becomes dormant, changed=true", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const task = makeTask({ activatedAt: "2026-06-07T12:00:00Z" });
    const { updated, changed } = ageActiveTasks([task]);
    expect(changed).toBe(true);
    expect(updated[0].status).toBe("dormant");
    expect(updated[0].dormantAt).toBe("2026-06-15T12:00:00.000Z");
    expect(updated[0].updatedAt).toBe("2026-06-15T12:00:00.000Z");
  });

  it("active task activated 5 days ago stays active, changed=false", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const task = makeTask({ activatedAt: "2026-06-10T12:00:00Z" });
    const { updated, changed } = ageActiveTasks([task]);
    expect(changed).toBe(false);
    expect(updated[0].status).toBe("active");
    expect(updated[0].dormantAt).toBeNull();
  });

  it("active task activated exactly 7 days ago at midnight boundary becomes dormant", () => {
    vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));
    const task = makeTask({ activatedAt: "2026-06-08T00:00:00Z" });
    const { updated, changed } = ageActiveTasks([task]);
    expect(changed).toBe(true);
    expect(updated[0].status).toBe("dormant");
  });

  it("dormant task is unaffected", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const task = makeTask({
      status: "dormant",
      dormantAt: "2026-06-10T00:00:00Z",
    });
    const { updated, changed } = ageActiveTasks([task]);
    expect(changed).toBe(false);
    expect(updated[0].status).toBe("dormant");
    expect(updated[0].dormantAt).toBe("2026-06-10T00:00:00Z");
  });

  it("completed task is unaffected", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const task = makeTask({
      status: "completed",
      completedAt: "2026-06-10T00:00:00Z",
    });
    const { updated, changed } = ageActiveTasks([task]);
    expect(changed).toBe(false);
    expect(updated[0].status).toBe("completed");
  });

  it("empty tasks list returns empty, changed=false", () => {
    const { updated, changed } = ageActiveTasks([]);
    expect(changed).toBe(false);
    expect(updated).toEqual([]);
  });

  it("task activated same day as now stays active", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const task = makeTask({ activatedAt: "2026-06-15T08:00:00Z" });
    const { updated, changed } = ageActiveTasks([task]);
    expect(changed).toBe(false);
    expect(updated[0].status).toBe("active");
  });

  it("multiple tasks, only the aging one is changed", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    const oldTask = makeTask({
      id: "old",
      activatedAt: "2026-06-07T12:00:00Z",
    });
    const youngTask = makeTask({
      id: "young",
      activatedAt: "2026-06-10T12:00:00Z",
    });
    const { updated, changed } = ageActiveTasks([oldTask, youngTask]);
    expect(changed).toBe(true);
    expect(updated.find((t) => t.id === "old")?.status).toBe("dormant");
    expect(updated.find((t) => t.id === "young")?.status).toBe("active");
  });
});

describe("filterTasksByQuery", () => {
  const tasks = [
    makeTask({ id: "1", title: "Buy groceries" }),
    makeTask({ id: "2", title: "Walk the dog" }),
    makeTask({ id: "3", title: "Write tests" }),
  ];

  it("returns [] for empty query", () => {
    expect(filterTasksByQuery(tasks, "")).toEqual([]);
  });

  it("returns [] for whitespace query", () => {
    expect(filterTasksByQuery(tasks, "   ")).toEqual([]);
  });

  it("returns matching tasks for substring query", () => {
    const result = filterTasksByQuery(tasks, "groceries");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("matches case-insensitively (uppercase query)", () => {
    const result = filterTasksByQuery(tasks, "GROCERIES");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("matches case-insensitively (mixed case title)", () => {
    const tasksMixed = [makeTask({ id: "1", title: "Buy GrOcErIeS" })];
    const result = filterTasksByQuery(tasksMixed, "groceries");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns [] for non-matching query", () => {
    expect(filterTasksByQuery(tasks, "xylophone")).toEqual([]);
  });

  it("returns only matching tasks from mixed list", () => {
    const result = filterTasksByQuery(tasks, "test");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });
});
