import { describe, expect, it } from "vitest";

import { createSnapshot, parseSnapshot } from "./snapshot";
import type { Preferences, Project, Task } from "../types";

const task: Task = {
  id: "task-1",
  title: "Ship the PRD",
  notes: "",
  status: "open",
  starred: false,
  whenDate: null,
  dueDate: null,
  projectId: null,
  sortOrder: 1000,
  createdAt: "2026-04-19T10:00:00.000Z",
  updatedAt: "2026-04-19T10:00:00.000Z",
  completedAt: null,
};

const project: Project = {
  id: "project-1",
  title: "Portfolio",
  status: "open",
  sortOrder: 1000,
  createdAt: "2026-04-19T10:00:00.000Z",
  updatedAt: "2026-04-19T10:00:00.000Z",
  completedAt: null,
};

const preferences: Preferences = { theme: "dark" };

describe("snapshot", () => {
  it("creates a versioned export snapshot", () => {
    const snapshot = createSnapshot({ tasks: [task], projects: [project], preferences });

    expect(snapshot.version).toBe(1);
    expect(snapshot.tasks).toHaveLength(1);
    expect(snapshot.projects).toHaveLength(1);
    expect(snapshot.preferences.theme).toBe("dark");
    expect(snapshot.exportedAt).toBeTypeOf("string");
  });

  it("parses a valid snapshot", () => {
    const parsed = parseSnapshot({
      version: 1,
      tasks: [task],
      projects: [project],
      preferences,
      exportedAt: "2026-04-19T10:00:00.000Z",
    });

    expect(parsed.tasks[0]?.id).toBe("task-1");
    expect(parsed.projects[0]?.id).toBe("project-1");
  });

  it("rejects invalid snapshot shapes", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ nope: true }],
        projects: [project],
        preferences,
      })
    ).toThrow(/invalid tasks/i);
  });
});
