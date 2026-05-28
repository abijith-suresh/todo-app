import type { Project, Task } from "../types";

export const completeProjectEntities = (input: {
  projectId: string;
  now: string;
  projects: Project[];
  tasks: Task[];
}): { projects: Project[]; tasks: Task[] } => ({
  projects: input.projects.map((project) =>
    project.id === input.projectId
      ? {
          ...project,
          status: "completed",
          completedAt: input.now,
          updatedAt: input.now,
        }
      : project
  ),
  tasks: input.tasks.map((task) =>
    task.projectId === input.projectId && task.status === "open"
      ? {
          ...task,
          status: "completed",
          completedAt: input.now,
          updatedAt: input.now,
        }
      : task
  ),
});

export const deleteProjectEntities = (input: {
  projectId: string;
  now: string;
  projects: Project[];
  tasks: Task[];
}): { projects: Project[]; tasks: Task[] } => ({
  projects: input.projects.filter((project) => project.id !== input.projectId),
  tasks: input.tasks.map((task) =>
    task.projectId === input.projectId
      ? {
          ...task,
          projectId: null,
          updatedAt: input.now,
        }
      : task
  ),
});
