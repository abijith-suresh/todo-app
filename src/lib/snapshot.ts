import { getNowIso } from "./date";
import type { ExportSnapshot, Preferences, Project, Task } from "../types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNullableString = (value: unknown): value is string | null =>
  typeof value === "string" || value === null;

const hasTaskShape = (value: unknown): value is Task => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.notes === "string" &&
    (value.status === "open" || value.status === "completed") &&
    typeof value.starred === "boolean" &&
    isNullableString(value.whenDate) &&
    isNullableString(value.dueDate) &&
    isNullableString(value.projectId) &&
    typeof value.sortOrder === "number" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    isNullableString(value.completedAt)
  );
};

const hasProjectShape = (value: unknown): value is Project => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (value.status === "open" || value.status === "completed") &&
    typeof value.sortOrder === "number" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    isNullableString(value.completedAt)
  );
};

const hasPreferencesShape = (value: unknown): value is Preferences => {
  if (!isObject(value)) {
    return false;
  }

  return value.theme === "system" || value.theme === "light" || value.theme === "dark";
};

const isValidDateString = (value: string): boolean => !Number.isNaN(Date.parse(value));

const isValidIsoDateOnly = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const isValidIsoTimestamp = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return false;
  }

  return isValidDateString(value);
};

const isNonBlank = (value: string): boolean => value.trim().length > 0;

const assertUniqueIds = (items: Array<{ id: string }>, label: "task" | "project"): void => {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`Import file contains duplicate ${label} id: ${item.id}`);
    }

    seen.add(item.id);
  }
};

const validateStatusTimestamps = (
  item: Pick<Task | Project, "status" | "completedAt">,
  label: "Task" | "Project"
): void => {
  if (item.status === "open" && item.completedAt !== null) {
    throw new Error(`${label} completion status is inconsistent.`);
  }

  if (item.status === "completed" && item.completedAt === null) {
    throw new Error(`${label} completion status is inconsistent.`);
  }
};

const validateTask = (task: Task, projectIds: Set<string>): void => {
  if (!isNonBlank(task.id) || !isNonBlank(task.title)) {
    throw new Error("Import file contains invalid tasks.");
  }

  if (!Number.isFinite(task.sortOrder)) {
    throw new Error(`Import file contains invalid task sort order: ${task.id}`);
  }

  if (!isValidIsoTimestamp(task.createdAt) || !isValidIsoTimestamp(task.updatedAt)) {
    throw new Error(`Import file contains invalid task timestamp: ${task.id}`);
  }

  if (task.completedAt !== null && !isValidIsoTimestamp(task.completedAt)) {
    throw new Error(`Import file contains invalid task timestamp: ${task.id}`);
  }

  if (task.whenDate !== null && !isValidIsoDateOnly(task.whenDate)) {
    throw new Error(`Import file contains invalid task date: ${task.id}`);
  }

  if (task.dueDate !== null && !isValidIsoDateOnly(task.dueDate)) {
    throw new Error(`Import file contains invalid task date: ${task.id}`);
  }

  if (task.projectId !== null && !projectIds.has(task.projectId)) {
    throw new Error(`Import file contains dangling project reference: ${task.id}`);
  }

  validateStatusTimestamps(task, "Task");
};

const validateProject = (project: Project): void => {
  if (!isNonBlank(project.id) || !isNonBlank(project.title)) {
    throw new Error("Import file contains invalid projects.");
  }

  if (!Number.isFinite(project.sortOrder)) {
    throw new Error(`Import file contains invalid project sort order: ${project.id}`);
  }

  if (!isValidIsoTimestamp(project.createdAt) || !isValidIsoTimestamp(project.updatedAt)) {
    throw new Error(`Import file contains invalid project timestamp: ${project.id}`);
  }

  if (project.completedAt !== null && !isValidIsoTimestamp(project.completedAt)) {
    throw new Error(`Import file contains invalid project timestamp: ${project.id}`);
  }

  validateStatusTimestamps(project, "Project");
};

export const createSnapshot = (data: {
  tasks: Task[];
  projects: Project[];
  preferences: Preferences;
}): ExportSnapshot => ({
  version: 1,
  tasks: data.tasks,
  projects: data.projects,
  preferences: data.preferences,
  exportedAt: getNowIso(),
});

export const parseSnapshot = (value: unknown): ExportSnapshot => {
  if (!isObject(value)) {
    throw new Error("Import file must contain a JSON object.");
  }

  if (value.version !== 1) {
    throw new Error("Unsupported import version.");
  }

  if (!Array.isArray(value.tasks) || !value.tasks.every(hasTaskShape)) {
    throw new Error("Import file contains invalid tasks.");
  }

  if (!Array.isArray(value.projects) || !value.projects.every(hasProjectShape)) {
    throw new Error("Import file contains invalid projects.");
  }

  if (!hasPreferencesShape(value.preferences)) {
    throw new Error("Import file contains invalid preferences.");
  }

  if (typeof value.exportedAt === "string" && !isValidIsoTimestamp(value.exportedAt)) {
    throw new Error("Import file contains invalid export timestamp.");
  }

  assertUniqueIds(value.tasks, "task");
  assertUniqueIds(value.projects, "project");

  const projectIds = new Set(value.projects.map((project) => project.id));

  value.projects.forEach(validateProject);
  value.tasks.forEach((task) => validateTask(task, projectIds));

  return {
    version: 1,
    tasks: value.tasks,
    projects: value.projects,
    preferences: value.preferences,
    exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : getNowIso(),
  };
};
