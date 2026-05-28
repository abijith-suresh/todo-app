import { Show } from "solid-js";

import { IconButton } from "@/components/ui/button";
import { getViewTitle } from "@/lib/view-model";
import { useAppStore } from "@/state/app-store";

import { TrashIcon } from "../icons";

interface AppViewHeaderProps {
  activeCount: number;
}

export const AppViewHeader = (props: AppViewHeaderProps) => {
  const app = useAppStore();

  return (
    <header class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 items-start gap-3">
        <Show when={app.activeView().type === "project" && app.activeProject()}>
          {(projectAccessor) => (
            <input
              type="checkbox"
              class="task-checkbox mt-[5px] size-5 shrink-0"
              checked={false}
              onChange={() => void app.completeProject(projectAccessor().id)}
              aria-label={`Complete project ${projectAccessor().title}`}
              title="Complete project"
            />
          )}
        </Show>

        <div class="min-w-0">
          <h2 class="text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">
            {getViewTitle(app.activeView(), app.projects())}
          </h2>
          <p class="mt-0.5 text-sm text-[var(--color-text-tertiary)]">
            {props.activeCount} open {props.activeCount === 1 ? "task" : "tasks"}
          </p>
        </div>
      </div>

      <Show when={app.activeView().type === "project" && app.activeProject()}>
        {(projectAccessor) => (
          <div class="shrink-0 pt-1">
            <IconButton
              label="Delete project"
              variant="dangerGhost"
              class="text-[var(--color-text-tertiary)]"
              onClick={() => {
                app.showConfirm({
                  title: "Delete project",
                  message: `"${projectAccessor().title}" will be deleted. Its tasks will move to Inbox.`,
                  confirmLabel: "Delete",
                  onConfirm: () => void app.deleteProject(projectAccessor().id),
                });
              }}
            >
              <TrashIcon class="size-4" />
            </IconButton>
          </div>
        )}
      </Show>
    </header>
  );
};
