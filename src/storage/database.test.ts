import { indexedDB } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import type { Task } from "../lib/types";
import { todoStorage } from "./database";

(globalThis as unknown as Record<string, unknown>).window = globalThis;
globalThis.indexedDB = indexedDB;

const DB_NAME = "todo-app-db";

interface IndexedDbTodoStorageWithInternals {
  getDatabase(): Promise<IDBDatabase>;
  dbPromise: Promise<IDBDatabase> | undefined;
}

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: "Test task",
    status: "active",
    createdAt: "2026-06-05T00:00:00.000Z",
    activatedAt: "2026-06-05T00:00:00.000Z",
    updatedAt: "2026-06-05T00:00:00.000Z",
    completedAt: null,
    dormantAt: null,
    ...overrides,
  };
}

beforeEach(async () => {
  const storage = todoStorage as unknown as IndexedDbTodoStorageWithInternals;
  const db = await storage.getDatabase().catch(() => null);
  if (db) db.close();
  storage.dbPromise = undefined;
  const request = indexedDB.deleteDatabase(DB_NAME);
  await new Promise<void>((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("deleteDatabase blocked"));
  });
});

describe("todoStorage", () => {
  it("listTasks returns an empty array when no tasks exist", async () => {
    const tasks = await todoStorage.listTasks();
    expect(tasks).toEqual([]);
  });

  it("saveTask stores a task and listTasks retrieves it", async () => {
    const task = createTask();
    await todoStorage.saveTask(task);
    const tasks = await todoStorage.listTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toEqual(task);
  });

  it("saveTask overwrites an existing task with the same ID", async () => {
    const task = createTask({ title: "Original" });
    await todoStorage.saveTask(task);

    const updated = { ...task, title: "Updated" };
    await todoStorage.saveTask(updated);

    const tasks = await todoStorage.listTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Updated");
  });

  it("deleteTask removes a task and it no longer appears in listTasks", async () => {
    const task = createTask();
    await todoStorage.saveTask(task);
    await todoStorage.deleteTask(task.id);

    const tasks = await todoStorage.listTasks();
    expect(tasks).toEqual([]);
  });

  it("multiple tasks can be saved and listed", async () => {
    const task1 = createTask({ title: "First" });
    const task2 = createTask({ title: "Second" });
    const task3 = createTask({ title: "Third" });

    await todoStorage.saveTask(task1);
    await todoStorage.saveTask(task2);
    await todoStorage.saveTask(task3);

    const tasks = await todoStorage.listTasks();
    expect(tasks).toHaveLength(3);
    expect(tasks.map((t) => t.title).sort()).toEqual(["First", "Second", "Third"]);
  });
});
