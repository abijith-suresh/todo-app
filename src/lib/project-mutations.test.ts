import { describe, expect, it } from "vitest";

import { completeProjectEntities, deleteProjectEntities } from "./project-mutations";
import type { Project, Task } from "../types";

const openProject = (overrides: Partial<Project> = {}): Project => ({
  id: "project-1",
  title: "Roadmap",
  status: "open",
  sortOrder: 1000,
  createdAt: "2026-04-19T10:00:00.000Z",
  updatedAt: "2026-04-19T10:00:00.000Z",
  completedAt: null,
  ...overrides,
});

const openTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Draft",
  notes: "",
  status: "open",
  starred: false,
  whenDate: null,
  dueDate: null,
  projectId: "project-1",
  sortOrder: 1000,
  createdAt: "2026-04-19T10:00:00.000Z",
  updatedAt: "2026-04-19T10:00:00.000Z",
  completedAt: null,
  ...overrides,
});

describe("project-mutations", () => {
  it("completes a project and its open tasks with the same timestamp", () => {
    const now = "2026-04-20T09:30:00.000Z";

    const result = completeProjectEntities({
      projectId: "project-1",
      now,
      projects: [openProject(), openProject({ id: "project-2", title: "Other" })],
      tasks: [
        openTask(),
        openTask({ id: "task-2", projectId: "project-2" }),
        openTask({
          id: "task-3",
          status: "completed",
          completedAt: "2026-04-18T08:00:00.000Z",
        }),
      ],
    });

    expect(result.projects).toContainEqual(
      expect.objectContaining({
        id: "project-1",
        status: "completed",
        completedAt: now,
        updatedAt: now,
      })
    );
    expect(result.tasks).toContainEqual(
      expect.objectContaining({
        id: "task-1",
        status: "completed",
        completedAt: now,
        updatedAt: now,
      })
    );
    expect(result.tasks).toContainEqual(
      expect.objectContaining({
        id: "task-2",
        status: "open",
        completedAt: null,
      })
    );
    expect(result.tasks).toContainEqual(
      expect.objectContaining({
        id: "task-3",
        status: "completed",
        completedAt: "2026-04-18T08:00:00.000Z",
      })
    );
  });

  it("deletes a project and detaches its tasks", () => {
    const now = "2026-04-20T09:30:00.000Z";

    const result = deleteProjectEntities({
      projectId: "project-1",
      now,
      projects: [openProject(), openProject({ id: "project-2", title: "Other" })],
      tasks: [
        openTask(),
        openTask({ id: "task-2", projectId: "project-2" }),
        openTask({
          id: "task-3",
          status: "completed",
          completedAt: "2026-04-18T08:00:00.000Z",
        }),
      ],
    });

    expect(result.projects).toEqual([expect.objectContaining({ id: "project-2" })]);
    expect(result.tasks).toContainEqual(
      expect.objectContaining({
        id: "task-1",
        projectId: null,
        updatedAt: now,
        status: "open",
        completedAt: null,
      })
    );
    expect(result.tasks).toContainEqual(
      expect.objectContaining({
        id: "task-2",
        projectId: "project-2",
      })
    );
    expect(result.tasks).toContainEqual(
      expect.objectContaining({
        id: "task-3",
        projectId: null,
        status: "completed",
        completedAt: "2026-04-18T08:00:00.000Z",
        updatedAt: now,
      })
    );
  });
});
