export type TaskStatus = "open" | "completed";
export type ProjectStatus = "open" | "completed";
export type ThemeMode = "system" | "light" | "dark";

export interface Task {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  starred: boolean;
  whenDate: string | null;
  dueDate: string | null;
  projectId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Preferences {
  theme: ThemeMode;
}

export interface ExportSnapshot {
  version: 1;
  tasks: Task[];
  projects: Project[];
  preferences: Preferences;
  exportedAt: string;
}

export type AppView =
  | { type: "inbox" }
  | { type: "today" }
  | { type: "upcoming" }
  | { type: "project"; projectId: string };

export interface UpcomingGroup {
  date: string;
  label: string;
  tasks: Task[];
}

export interface TodaySections {
  overdue: Task[];
  today: Task[];
}

export interface SearchResultItem {
  taskId: string;
  title: string;
  notes: string;
  projectName: string;
  dateLabel: string | null;
}
