import { type Component, For } from "solid-js";

import { Checkbox } from "@/components/ui/Solid/Checkbox";
import { DeleteButton } from "@/components/ui/Solid/DeleteButton";
import { Text } from "@/components/ui/Solid/Text";
import { createExitAnimation } from "@/lib/exit-animation";
import { useAppStore } from "@/state/app-store";
import type { Task } from "@/lib/types";

interface DoneTodaySectionProps {
  tasks: Task[];
  onReopen: (taskId: string) => void;
}

interface DoneTodayRowProps {
  task: Task;
  onReopen: (taskId: string) => void;
}

const DoneTodayRow: Component<DoneTodayRowProps> = (props) => {
  const app = useAppStore();
  const { exitType, isExiting, startExit } = createExitAnimation();

  const handleReopen = (): void => {
    const id = props.task.id;
    const reopen = props.onReopen;
    startExit(
      "reopen",
      () => {
        reopen(id);
      },
      900
    );
  };

  const handleDelete = (event: MouseEvent): void => {
    event.stopPropagation();
    const id = props.task.id;
    startExit(
      "delete",
      () => {
        void app.deleteTask(id);
      },
      300
    );
  };

  return (
    <div
      class="task-wrapper"
      classList={{
        "task-reopening": exitType() === "reopen",
        "task-deleting": exitType() === "delete",
      }}
    >
      <div class="task-inner">
        <div
          class="group flex items-center gap-3 py-3 border-b border-line-subtle"
          classList={{ "task-enter": !exitType() }}
        >
          <Checkbox
            status="completed"
            ariaLabel={`Reopen ${props.task.title}`}
            onToggle={handleReopen}
            disabled={isExiting()}
          />
          <Text title={props.task.title} strikethrough muted />
          <DeleteButton
            ariaLabel={`Delete ${props.task.title}`}
            onDelete={handleDelete}
            disabled={isExiting()}
          />
        </div>
      </div>
    </div>
  );
};

export const DoneTodaySection: Component<DoneTodaySectionProps> = (props) => (
  <div class="mt-16 sm:mt-20">
    <div class="mx-auto mb-8 w-24 border-t border-line" />
    <p class="mb-6 text-xs italic tracking-wide text-ink-tertiary font-body">Done today</p>
    <div>
      <For each={props.tasks}>
        {(task) => <DoneTodayRow task={task} onReopen={props.onReopen} />}
      </For>
    </div>
  </div>
);
