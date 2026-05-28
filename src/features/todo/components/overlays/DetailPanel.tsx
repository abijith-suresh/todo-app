import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { IconButton } from "@/components/ui/button";
import { compareIsoDate, formatDateLabel, getTodayIso } from "@/lib/date";
import { useAppStore } from "@/state/app-store";

import { DatePickerModal } from "./DatePickerModal";
import {
  CalendarClockIcon,
  ChevronDownIcon,
  CloseIcon,
  FlagIcon,
  FolderIcon,
  InboxIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from "../icons";

export const DetailPanel: Component = () => {
  const app = useAppStore();
  const [title, setTitle] = createSignal("");
  const [notes, setNotes] = createSignal("");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = createSignal(false);
  const [whenPickerOpen, setWhenPickerOpen] = createSignal(false);
  const [duePickerOpen, setDuePickerOpen] = createSignal(false);

  // Sync local state whenever the selected task changes
  createEffect(() => {
    const task = app.selectedTask();
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
    setIsProjectDropdownOpen(false);
    setWhenPickerOpen(false);
    setDuePickerOpen(false);
  });

  const saveTitle = async (): Promise<void> => {
    const task = app.selectedTask();
    if (!task) return;
    if (!title().trim()) {
      setTitle(task.title);
      return;
    }
    if (title().trim() !== task.title) await app.updateTask(task.id, { title: title().trim() });
  };

  const saveNotes = async (): Promise<void> => {
    const task = app.selectedTask();
    if (!task) return;
    if (notes() !== task.notes) await app.updateTask(task.id, { notes: notes() });
  };

  return (
    <aside
      classList={{
        "translate-x-full": !app.selectedTask(),
        "translate-x-0": Boolean(app.selectedTask()),
      }}
      class="fixed inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col shadow-2xl transition-transform duration-300 lg:w-96"
      style={{
        "background-color": "var(--color-bg-surface)",
        "border-left": "1px solid var(--color-border-subtle)",
      }}
    >
      <Show when={app.selectedTask()} keyed>
        {(task) => {
          const today = getTodayIso();

          const dueIsUrgent = task.dueDate != null && compareIsoDate(task.dueDate, today) <= 0;
          const dueIsFuture = task.dueDate != null && compareIsoDate(task.dueDate, today) > 0;
          const dueIconColor = dueIsUrgent
            ? "var(--color-urgency-red)"
            : dueIsFuture
              ? "var(--color-urgency-amber)"
              : "var(--color-text-tertiary)";

          const currentProjectName = task.projectId
            ? (app.openProjects().find((p) => p.id === task.projectId)?.title ?? "Inbox")
            : "Inbox";

          return (
            <>
              {/* Header: close / star / delete */}
              <div class="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <IconButton
                  label="Close task details"
                  variant="surface"
                  class="border-none"
                  onClick={() => app.closeTask()}
                >
                  <CloseIcon class="size-3.5" />
                </IconButton>

                <div class="flex items-center gap-1.5">
                  <IconButton
                    label={task.starred ? "Unstar task" : "Star task"}
                    variant="ghost"
                    class={
                      task.starred
                        ? "bg-[var(--color-urgency-amber-bg)] text-[var(--color-star)] hover:bg-[var(--color-urgency-amber-bg)] hover:text-[var(--color-star)]"
                        : "hover:bg-[var(--color-urgency-amber-bg)] hover:text-[var(--color-star)]"
                    }
                    onClick={() => void app.toggleTaskStar(task.id)}
                  >
                    {task.starred ? (
                      <StarFilledIcon class="size-3.5" />
                    ) : (
                      <StarIcon class="size-3.5" />
                    )}
                  </IconButton>

                  <IconButton
                    label="Delete task"
                    variant="dangerGhost"
                    onClick={() => {
                      app.showConfirm({
                        title: "Delete task",
                        message: `"${task.title}" will be permanently deleted.`,
                        confirmLabel: "Delete",
                        onConfirm: () => void app.deleteTask(task.id),
                      });
                    }}
                  >
                    <TrashIcon class="size-3.5" />
                  </IconButton>
                </div>
              </div>

              {/* Scrollable body */}
              <div class="min-h-0 flex-1 overflow-y-auto">
                {/* Title + checkbox */}
                <div class="flex items-start gap-3 px-5 pt-3 pb-2">
                  <input
                    type="checkbox"
                    aria-label={`Complete ${task.title}`}
                    class="task-checkbox mt-[3px] shrink-0"
                    checked={app.completingTaskIds().includes(task.id)}
                    onChange={() => {
                      if (app.completingTaskIds().includes(task.id)) {
                        app.cancelComplete(task.id);
                      } else {
                        void app.completeTask(task.id);
                      }
                    }}
                  />
                  <input
                    value={title()}
                    onInput={(e) => setTitle(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void saveTitle();
                      }
                    }}
                    onBlur={() => void saveTitle()}
                    placeholder="Task title"
                    class="detail-title-input min-w-0 flex-1 bg-transparent text-[1.1rem] font-semibold leading-snug outline-none"
                    style={{ color: "var(--color-text-primary)" }}
                  />
                </div>

                {/* Notes */}
                <div class="px-5 pb-4">
                  <textarea
                    rows="6"
                    value={notes()}
                    onInput={(e) => setNotes(e.currentTarget.value)}
                    onBlur={() => void saveNotes()}
                    placeholder="Add notes, links, or context..."
                    class="detail-notes-textarea w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
                    style={{ color: "var(--color-text-secondary)", "min-height": "6rem" }}
                  />
                </div>

                {/* Divider */}
                <div
                  class="mx-5 mb-4"
                  style={{ "border-top": "1px solid var(--color-border-subtle)" }}
                />

                {/* Metadata rows: When / Deadline / Project */}
                <div class="mx-5 mb-4 flex flex-col gap-1.5">
                  {/* When */}
                  <button
                    type="button"
                    class="metadata-row"
                    classList={{ "has-value": Boolean(task.whenDate) }}
                    onClick={() => setWhenPickerOpen(true)}
                    aria-label={
                      task.whenDate ? `When: ${formatDateLabel(task.whenDate)}` : "Set when date"
                    }
                  >
                    <CalendarClockIcon
                      class="size-3.5 shrink-0"
                      style={{
                        color: task.whenDate ? "var(--color-accent)" : "var(--color-text-tertiary)",
                      }}
                    />
                    <span class="metadata-label">When</span>
                    <span
                      class="flex-1 text-left text-xs font-medium"
                      style={{
                        color: task.whenDate ? "var(--color-accent)" : "var(--color-text-tertiary)",
                        opacity: task.whenDate ? "1" : "0.5",
                      }}
                    >
                      {task.whenDate ? formatDateLabel(task.whenDate) : "Enters Today on this date"}
                    </span>
                  </button>

                  {/* Deadline */}
                  <button
                    type="button"
                    class="metadata-row"
                    classList={{ "has-value due": Boolean(task.dueDate) }}
                    onClick={() => setDuePickerOpen(true)}
                    aria-label={
                      task.dueDate ? `Due: ${formatDateLabel(task.dueDate)}` : "Set due date"
                    }
                  >
                    <FlagIcon class="size-3.5 shrink-0" style={{ color: dueIconColor }} />
                    <span class="metadata-label">Deadline</span>
                    <span
                      class="flex-1 text-left text-xs font-medium"
                      style={{
                        color: task.dueDate ? dueIconColor : "var(--color-text-tertiary)",
                        opacity: task.dueDate ? "1" : "0.5",
                      }}
                    >
                      {task.dueDate ? formatDateLabel(task.dueDate) : "Hard due date"}
                    </span>
                  </button>

                  {/* Project */}
                  <div class="relative">
                    <button
                      type="button"
                      class="metadata-row"
                      classList={{ "has-value": Boolean(task.projectId) }}
                      onClick={() => setIsProjectDropdownOpen((o) => !o)}
                      onBlur={() => setTimeout(() => setIsProjectDropdownOpen(false), 150)}
                      aria-label="Select project"
                      aria-haspopup="listbox"
                      aria-expanded={isProjectDropdownOpen()}
                    >
                      <FolderIcon
                        class="size-3.5 shrink-0"
                        style={{
                          color: task.projectId
                            ? "var(--color-accent)"
                            : "var(--color-text-tertiary)",
                        }}
                      />
                      <span class="metadata-label">Project</span>
                      <span
                        class="flex-1 text-left text-xs font-medium"
                        style={{
                          color: task.projectId
                            ? "var(--color-text-primary)"
                            : "var(--color-text-tertiary)",
                          opacity: task.projectId ? "1" : "0.5",
                        }}
                      >
                        {currentProjectName}
                      </span>
                      <ChevronDownIcon
                        class="size-3 shrink-0 opacity-40"
                        style={{ color: "var(--color-text-tertiary)" }}
                      />
                    </button>

                    <Show when={isProjectDropdownOpen()}>
                      <div
                        class="project-dropdown"
                        role="listbox"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        onKeyDown={(e) => e.key === "Escape" && setIsProjectDropdownOpen(false)}
                      >
                        <button
                          type="button"
                          class={`project-dropdown-item${!task.projectId ? " active" : ""}`}
                          onClick={() => {
                            void app.updateTask(task.id, { projectId: null });
                            setIsProjectDropdownOpen(false);
                          }}
                        >
                          <InboxIcon class="size-3.5 shrink-0" />
                          <span>Inbox</span>
                        </button>
                        <For each={app.openProjects()}>
                          {(project) => (
                            <button
                              type="button"
                              class={`project-dropdown-item${task.projectId === project.id ? " active" : ""}`}
                              onClick={() => {
                                void app.updateTask(task.id, { projectId: project.id });
                                setIsProjectDropdownOpen(false);
                              }}
                            >
                              <FolderIcon class="size-3.5 shrink-0" />
                              <span>{project.title}</span>
                            </button>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>
              </div>

              {/* Custom date picker modals */}
              <DatePickerModal
                isOpen={whenPickerOpen()}
                onClose={() => setWhenPickerOpen(false)}
                currentDate={task.whenDate}
                onSelect={(iso) => {
                  void app.updateTask(task.id, { whenDate: iso });
                  setWhenPickerOpen(false);
                }}
                label="When"
                mode="when"
              />
              <DatePickerModal
                isOpen={duePickerOpen()}
                onClose={() => setDuePickerOpen(false)}
                currentDate={task.dueDate}
                onSelect={(iso) => {
                  void app.updateTask(task.id, { dueDate: iso });
                  setDuePickerOpen(false);
                }}
                label="Deadline"
                mode="due"
              />
            </>
          );
        }}
      </Show>
    </aside>
  );
};
