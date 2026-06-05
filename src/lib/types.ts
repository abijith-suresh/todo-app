export type TaskStatus = "active" | "dormant" | "completed";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  activatedAt: string;
  updatedAt: string;
  completedAt: string | null;
  dormantAt: string | null;
}

export interface SearchResultGroup {
  label: "Active" | "Earlier" | "Completed";
  tasks: Task[];
}

export interface TodoStorage {
  listTasks(): Promise<Task[]>;
  saveTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
}
