import { compareIsoDate, formatLongDateLabel, getTodayIso } from "./date";
import type { AppView, Project, Task, TodaySections, UpcomingGroup } from "../types";

const sortByOrder = <T extends { sortOrder: number; createdAt: string }>(items: T[]): T[] =>
  [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });

export const sortTasks = (tasks: Task[]): Task[] => sortByOrder(tasks);
export const sortProjects = (projects: Project[]): Project[] => sortByOrder(projects);

export const getInboxTasks = (tasks: Task[]): Task[] =>
  sortTasks(tasks.filter((task) => task.status === "open" && !task.projectId && !task.whenDate));

export const qualifiesForToday = (task: Task, today: string = getTodayIso()): boolean => {
  if (task.status !== "open") {
    return false;
  }

  const hasWhen = Boolean(task.whenDate && compareIsoDate(task.whenDate, today) <= 0);
  const hasDue = Boolean(task.dueDate && compareIsoDate(task.dueDate, today) <= 0);

  return hasWhen || hasDue;
};

export const getTodaySections = (tasks: Task[], today: string = getTodayIso()): TodaySections => {
  const visible = sortTasks(tasks.filter((task) => qualifiesForToday(task, today)));

  return {
    overdue: visible.filter((task) => task.dueDate && compareIsoDate(task.dueDate, today) < 0),
    today: visible.filter((task) => !task.dueDate || compareIsoDate(task.dueDate, today) >= 0),
  };
};

export const getUpcomingGroups = (
  tasks: Task[],
  today: string = getTodayIso()
): UpcomingGroup[] => {
  const groups = new Map<string, Task[]>();

  for (const task of sortTasks(tasks)) {
    if (task.status !== "open") {
      continue;
    }

    const groupDate =
      task.whenDate && compareIsoDate(task.whenDate, today) > 0
        ? task.whenDate
        : !task.whenDate && task.dueDate && compareIsoDate(task.dueDate, today) > 0
          ? task.dueDate
          : null;

    if (!groupDate) {
      continue;
    }

    const nextGroup = groups.get(groupDate) ?? [];
    nextGroup.push(task);
    groups.set(groupDate, nextGroup);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => compareIsoDate(left, right))
    .map(([date, groupedTasks]) => ({
      date,
      label: formatLongDateLabel(date),
      tasks: sortTasks(groupedTasks),
    }));
};

export const getProjectCountMap = (tasks: Task[]): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    if (task.status !== "open" || !task.projectId) {
      continue;
    }

    counts.set(task.projectId, (counts.get(task.projectId) ?? 0) + 1);
  }

  return counts;
};

export const getProjectTasks = (tasks: Task[], projectId: string): Task[] =>
  sortTasks(tasks.filter((task) => task.status === "open" && task.projectId === projectId));

export const getTaskUrgency = (
  task: Task,
  today: string = getTodayIso()
): "normal" | "due-today" | "overdue" => {
  if (!task.dueDate) {
    return "normal";
  }

  if (compareIsoDate(task.dueDate, today) < 0) {
    return "overdue";
  }

  if (compareIsoDate(task.dueDate, today) === 0) {
    return "due-today";
  }

  return "normal";
};

export const getPreferredViewForTask = (
  task: Task,
  projects: Project[],
  today: string = getTodayIso()
): AppView => {
  const hasOpenProject = Boolean(
    task.projectId &&
    projects.some((project) => project.id === task.projectId && project.status === "open")
  );

  if (hasOpenProject) {
    return { type: "project", projectId: task.projectId as string };
  }

  if (qualifiesForToday(task, today)) {
    return { type: "today" };
  }

  const isUpcoming =
    (task.whenDate && compareIsoDate(task.whenDate, today) > 0) ||
    (!task.whenDate && task.dueDate && compareIsoDate(task.dueDate, today) > 0);

  if (isUpcoming) {
    return { type: "upcoming" };
  }

  return { type: "inbox" };
};

export const getViewTitle = (view: AppView, projects: Project[]): string => {
  switch (view.type) {
    case "inbox":
      return "Inbox";
    case "today":
      return "Today";
    case "upcoming":
      return "Upcoming";
    case "project":
      return projects.find((project) => project.id === view.projectId)?.title ?? "Project";
  }
};

export const getEmptyStateMessage = (view: AppView): string => {
  switch (view.type) {
    case "inbox":
      return "You're all clear. Add tasks here to sort later.";
    case "today":
      return "Nothing on your plate. Enjoy it or plan ahead.";
    case "upcoming":
      return "No tasks scheduled yet. Plan something.";
    case "project":
      return "No tasks in this project yet.";
  }
};

export const applySubsetOrder = <T extends { id: string; sortOrder: number; createdAt: string }>(
  items: T[],
  orderedSubsetIds: string[]
): T[] => {
  const allSorted = sortByOrder(items);
  const wanted = new Set(orderedSubsetIds);
  const subsetMap = new Map(
    allSorted.filter((item) => wanted.has(item.id)).map((item) => [item.id, item])
  );
  const subsetItems = orderedSubsetIds.map((id) => subsetMap.get(id)).filter(Boolean) as T[];
  const replacementPositions = allSorted
    .map((item, index) => (wanted.has(item.id) ? index : -1))
    .filter((index) => index >= 0);

  if (subsetItems.length !== replacementPositions.length || subsetItems.length === 0) {
    return items;
  }

  const next = [...allSorted];
  replacementPositions.forEach((position, index) => {
    next[position] = subsetItems[index] as T;
  });

  return next.map((item, index) => ({
    ...item,
    sortOrder: (index + 1) * 1000,
  }));
};

export const moveIdWithinOrder = (ids: string[], id: string, direction: -1 | 1): string[] => {
  const index = ids.indexOf(id);

  if (index === -1) {
    return ids;
  }

  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= ids.length) {
    return ids;
  }

  const next = [...ids];
  const [moved] = next.splice(index, 1);
  next.splice(nextIndex, 0, moved as string);
  return next;
};

export const moveArrayItem = <T>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved as T);
  return next;
};
