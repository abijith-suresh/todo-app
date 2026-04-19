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

  return {
    version: 1,
    tasks: value.tasks,
    projects: value.projects,
    preferences: value.preferences,
    exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : getNowIso(),
  };
};
