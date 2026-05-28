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

  it("rejects duplicate task ids", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [task, { ...task }],
        projects: [project],
        preferences,
      })
    ).toThrow(/duplicate task id/i);
  });

  it("rejects tasks that reference a missing project", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ ...task, projectId: "missing-project" }],
        projects: [project],
        preferences,
      })
    ).toThrow(/dangling project reference/i);
  });

  it("rejects invalid task date strings", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ ...task, whenDate: "2026-99-99" }],
        projects: [project],
        preferences,
      })
    ).toThrow(/invalid task date/i);
  });

  it("rejects impossible calendar dates", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ ...task, dueDate: "2026-02-31" }],
        projects: [project],
        preferences,
      })
    ).toThrow(/invalid task date/i);
  });

  it("rejects invalid task timestamp strings", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ ...task, updatedAt: "not-a-date" }],
        projects: [project],
        preferences,
      })
    ).toThrow(/invalid task timestamp/i);
  });

  it("rejects non-finite task sort orders", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ ...task, sortOrder: Number.POSITIVE_INFINITY }],
        projects: [project],
        preferences,
      })
    ).toThrow(/invalid task sort order/i);
  });

  it("rejects blank titles", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ ...task, title: "   " }],
        projects: [project],
        preferences,
      })
    ).toThrow(/invalid tasks/i);
  });

  it("rejects inconsistent completed task state", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ ...task, status: "completed", completedAt: null }],
        projects: [project],
        preferences,
      })
    ).toThrow(/completion status is inconsistent/i);
  });

  it("rejects duplicate project ids", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [task],
        projects: [project, { ...project }],
        preferences,
      })
    ).toThrow(/duplicate project id/i);
  });

  it("rejects invalid export timestamps", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [task],
        projects: [project],
        preferences,
        exportedAt: "not-a-date",
      })
    ).toThrow(/invalid export timestamp/i);
  });

  it("rejects timestamps that are not ISO datetimes", () => {
    expect(() =>
      parseSnapshot({
        version: 1,
        tasks: [{ ...task, updatedAt: "2026-04-19" }],
        projects: [project],
        preferences,
      })
    ).toThrow(/invalid task timestamp/i);
  });
});
