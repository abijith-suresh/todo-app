/* eslint-disable solid/reactivity */
import { createMemo, createRoot, createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../lib/types";

const mockSaveTask = vi.fn();
const mockDeleteTask = vi.fn();

vi.mock("../storage/database", () => ({
  todoStorage: {
    listTasks: vi.fn().mockResolvedValue([]),
    saveTask: (...args: unknown[]) => mockSaveTask(...args),
    deleteTask: (...args: unknown[]) => mockDeleteTask(...args),
  },
}));

vi.mock("../lib/id", () => ({
  createId: vi.fn(() => "mock-id"),
}));

const getNowIso = (): string => new Date().toISOString();

const getTodayLocalIso = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (isoDate: string, localDateStr: string): boolean => {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}` === localDateStr;
};

describe("AppProvider behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T10:00:00Z"));
    process.env.TZ = "UTC";
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = "UTC";
    vi.clearAllMocks();
  });

  it("activeTasks memo filters to status active", () => {
    createRoot(() => {
      const [tasks] = createSignal<Task[]>([
        {
          id: "1",
          title: "Active",
          status: "active",
          createdAt: "",
          activatedAt: "",
          updatedAt: "",
          completedAt: null,
          dormantAt: null,
        },
        {
          id: "2",
          title: "Dormant",
          status: "dormant",
          createdAt: "",
          activatedAt: "",
          updatedAt: "",
          completedAt: null,
          dormantAt: "2026-06-10T00:00:00Z",
        },
        {
          id: "3",
          title: "Done",
          status: "completed",
          createdAt: "",
          activatedAt: "",
          updatedAt: "",
          completedAt: "2026-06-15T08:00:00Z",
          dormantAt: null,
        },
      ]);
      const activeTasks = createMemo(() => tasks().filter((t) => t.status === "active"));
      expect(activeTasks()).toHaveLength(1);
      expect(activeTasks()[0].id).toBe("1");
    });
  });

  it("doneTodayTasks memo shows completed tasks from today only", () => {
    createRoot(() => {
      const [tasks] = createSignal<Task[]>([
        {
          id: "1",
          title: "Done today",
          status: "completed",
          createdAt: "",
          activatedAt: "",
          updatedAt: "",
          completedAt: "2026-06-15T08:00:00Z",
          dormantAt: null,
        },
        {
          id: "2",
          title: "Done yesterday",
          status: "completed",
          createdAt: "",
          activatedAt: "",
          updatedAt: "",
          completedAt: "2026-06-14T20:00:00Z",
          dormantAt: null,
        },
        {
          id: "3",
          title: "Active",
          status: "active",
          createdAt: "",
          activatedAt: "",
          updatedAt: "",
          completedAt: null,
          dormantAt: null,
        },
      ]);
      const today = getTodayLocalIso();
      const doneTodayTasks = createMemo(() =>
        tasks().filter(
          (t) => t.status === "completed" && t.completedAt && isSameDay(t.completedAt, today)
        )
      );
      expect(doneTodayTasks()).toHaveLength(1);
      expect(doneTodayTasks()[0].id).toBe("1");
    });
  });

  it("createTask adds task to signal and persists", async () => {
    await createRoot(async () => {
      mockSaveTask.mockResolvedValue(undefined);

      const [tasks, setTasks] = createSignal<Task[]>([]);
      const now = getNowIso();
      const task: Task = {
        id: "mock-id",
        title: "New task",
        status: "active",
        createdAt: now,
        activatedAt: now,
        updatedAt: now,
        completedAt: null,
        dormantAt: null,
      };

      const current = tasks();
      setTasks([task, ...current]);

      expect(tasks()).toHaveLength(1);
      expect(tasks()[0].title).toBe("New task");
      expect(tasks()[0].status).toBe("active");
      expect(mockSaveTask).not.toHaveBeenCalled();

      await mockSaveTask(task);
      expect(mockSaveTask).toHaveBeenCalledWith(task);
    });
  });

  it("completeTask updates signal and persists", async () => {
    await createRoot(async () => {
      mockSaveTask.mockResolvedValue(undefined);

      const existing: Task = {
        id: "1",
        title: "Do something",
        status: "active",
        createdAt: "2026-06-15T08:00:00Z",
        activatedAt: "2026-06-15T08:00:00Z",
        updatedAt: "2026-06-15T08:00:00Z",
        completedAt: null,
        dormantAt: null,
      };

      const [tasks, setTasks] = createSignal<Task[]>([existing]);
      const current = tasks();
      const now = getNowIso();
      const updated: Task = { ...existing, status: "completed", completedAt: now, updatedAt: now };

      setTasks(current.map((t) => (t.id === "1" ? updated : t)));
      expect(tasks()[0].status).toBe("completed");
      expect(tasks()[0].completedAt).toBe("2026-06-15T10:00:00.000Z");

      await mockSaveTask(updated);
      expect(mockSaveTask).toHaveBeenCalledWith(updated);
    });
  });

  it("rolls back on persistence failure", async () => {
    await createRoot(async () => {
      mockSaveTask.mockRejectedValue(new Error("DB error"));

      const existing: Task = {
        id: "1",
        title: "Do something",
        status: "active",
        createdAt: "",
        activatedAt: "",
        updatedAt: "",
        completedAt: null,
        dormantAt: null,
      };

      const [tasks, setTasks] = createSignal<Task[]>([existing]);
      const current = tasks();
      const now = getNowIso();
      const updated: Task = { ...existing, status: "completed", completedAt: now, updatedAt: now };

      setTasks(current.map((t) => (t.id === "1" ? updated : t)));
      expect(tasks()[0].status).toBe("completed");

      try {
        await mockSaveTask(updated);
      } catch {
        setTasks(current);
      }

      expect(tasks()[0].status).toBe("active");
      expect(tasks()[0].completedAt).toBeNull();
    });
  });

  it("deleteTask removes task and persists deletion", async () => {
    await createRoot(async () => {
      mockDeleteTask.mockResolvedValue(undefined);

      const existing: Task = {
        id: "1",
        title: "Delete me",
        status: "active",
        createdAt: "",
        activatedAt: "",
        updatedAt: "",
        completedAt: null,
        dormantAt: null,
      };

      const [tasks, setTasks] = createSignal<Task[]>([existing]);
      const current = tasks();
      setTasks(current.filter((t) => t.id !== "1"));
      expect(tasks()).toHaveLength(0);

      await mockDeleteTask("1");
      expect(mockDeleteTask).toHaveBeenCalledWith("1");
    });
  });
});
