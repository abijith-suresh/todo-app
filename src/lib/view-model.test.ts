import { describe, expect, it } from "vitest";

import {
  getInboxTasks,
  getTodaySections,
  getUpcomingGroups,
  qualifiesForToday,
} from "./view-model";
import type { Task } from "../types";

const makeTask = (overrides: Partial<Task>): Task => ({
  id: overrides.id ?? crypto.randomUUID(),
  title: overrides.title ?? "Task",
  notes: overrides.notes ?? "",
  status: overrides.status ?? "open",
  starred: overrides.starred ?? false,
  whenDate: overrides.whenDate ?? null,
  dueDate: overrides.dueDate ?? null,
  projectId: overrides.projectId ?? null,
  sortOrder: overrides.sortOrder ?? 1000,
  createdAt: overrides.createdAt ?? "2026-04-19T10:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-19T10:00:00.000Z",
  completedAt: overrides.completedAt ?? null,
});

describe("view-model", () => {
  it("keeps unscheduled inbox tasks in Inbox", () => {
    const tasks = [
      makeTask({ id: "inbox-task" }),
      makeTask({ id: "scheduled", whenDate: "2026-04-20" }),
      makeTask({ id: "project", projectId: "project-1" }),
    ];

    expect(getInboxTasks(tasks).map((task) => task.id)).toEqual(["inbox-task"]);
  });

  it("qualifies today tasks from when and due logic", () => {
    expect(qualifiesForToday(makeTask({ whenDate: "2026-04-19" }), "2026-04-19")).toBe(true);
    expect(qualifiesForToday(makeTask({ whenDate: "2026-04-18" }), "2026-04-19")).toBe(true);
    expect(qualifiesForToday(makeTask({ dueDate: "2026-04-19" }), "2026-04-19")).toBe(true);
    expect(qualifiesForToday(makeTask({ whenDate: "2026-04-20" }), "2026-04-19")).toBe(false);
  });

  it("splits Today into overdue and today sections", () => {
    const sections = getTodaySections(
      [
        makeTask({ id: "overdue", dueDate: "2026-04-18" }),
        makeTask({ id: "today-when", whenDate: "2026-04-19" }),
        makeTask({ id: "today-due", dueDate: "2026-04-19" }),
        makeTask({ id: "future", whenDate: "2026-04-20" }),
      ],
      "2026-04-19"
    );

    expect(sections.overdue.map((task) => task.id)).toEqual(["overdue"]);
    expect(sections.today.map((task) => task.id)).toEqual(["today-when", "today-due"]);
  });

  it("groups Upcoming by future when or due dates", () => {
    const groups = getUpcomingGroups(
      [
        makeTask({ id: "when-a", whenDate: "2026-04-20" }),
        makeTask({ id: "when-b", whenDate: "2026-04-20", sortOrder: 2000 }),
        makeTask({ id: "due-only", dueDate: "2026-04-21" }),
        makeTask({ id: "today", whenDate: "2026-04-19" }),
      ],
      "2026-04-19"
    );

    expect(groups).toHaveLength(2);
    expect(groups[0]?.tasks.map((task) => task.id)).toEqual(["when-a", "when-b"]);
    expect(groups[1]?.tasks.map((task) => task.id)).toEqual(["due-only"]);
  });
});
