import { type Component, For } from "solid-js";

import type { Task } from "@/types";

import { TaskRow } from "./TaskRow";

interface TaskListProps {
  tasks: Task[];
}

export const TaskList: Component<TaskListProps> = (props) => (
  <div>
    <For each={props.tasks}>{(task) => <TaskRow task={task} />}</For>
  </div>
);
