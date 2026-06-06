import { getNowIso, isOlderThanDays } from "./date";
import type { Task } from "./types";

export const ageActiveTasks = (tasks: Task[]): { updated: Task[]; changed: boolean } => {
  const now = getNowIso();
  let changed = false;

  const updated = tasks.map((task) => {
    if (task.status === "active" && isOlderThanDays(task.activatedAt, 7)) {
      changed = true;
      return {
        ...task,
        status: "dormant" as const,
        dormantAt: now,
        updatedAt: now,
      };
    }
    return task;
  });

  return { updated, changed };
};

export const filterTasksByQuery = (tasks: Task[], query: string): Task[] => {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return tasks.filter((task) => task.title.toLowerCase().includes(lower));
};
