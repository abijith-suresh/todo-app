import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { useAppStore } from "@/state/app-store";

export const CommandPalette: Component = () => {
  const app = useAppStore();
  const [activeIndex, setActiveIndex] = createSignal(0);

  let input: HTMLInputElement | undefined;

  const flatResults = () => {
    const groups = app.searchResults();
    const items: { taskId: string; groupIndex: number }[] = [];
    groups.forEach((group, gi) => {
      group.tasks.forEach((task) => {
        items.push({ taskId: task.id, groupIndex: gi });
      });
    });
    return items;
  };

  createEffect(() => {
    if (app.isSearchOpen()) {
      setActiveIndex(0);
      queueMicrotask(() => input?.focus());
    }
  });

  createEffect(() => {
    app.searchResults();
    setActiveIndex(0);
  });

  const chooseResult = (index: number): void => {
    const items = flatResults();
    const item = items[index];
    if (!item) return;

    const groups = app.searchResults();
    const group = groups[item.groupIndex];
    const task = group.tasks.find((t) => t.id === item.taskId);
    if (!task) return;

    if (group.label === "Earlier") {
      void app.recoverTask(task.id);
      app.closeSearch();
    } else if (group.label === "Active") {
      app.closeSearch();
    }
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    const items = flatResults();

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      chooseResult(activeIndex());
    }

    if (event.key === "Escape") {
      event.preventDefault();
      app.closeSearch();
    }
  };

  return (
    <Show when={app.isSearchOpen()}>
      <div
        class="fixed inset-0 z-50 flex items-start justify-center px-4 py-16"
        style={{ "background-color": "rgba(26, 24, 22, 0.35)" }}
      >
        <button
          type="button"
          class="absolute inset-0"
          aria-label="Close search"
          onClick={() => app.closeSearch()}
        />

        <div
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="relative z-10 w-full max-w-xl overflow-hidden rounded-lg shadow-2xl"
          style={{
            "background-color": "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
          }}
        >
          <div
            class="flex items-center gap-3 px-4 py-3.5"
            style={{ "border-bottom": "1px solid var(--color-border-subtle)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4 shrink-0"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={(el) => {
                input = el;
              }}
              value={app.searchQuery()}
              onInput={(event) => app.setSearchQuery(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks…"
              class="w-full bg-transparent text-base outline-none placeholder:italic"
              style={{ color: "var(--color-text-primary)" }}
            />
          </div>

          <div class="max-h-80 overflow-y-auto p-2">
            <Show
              when={app.searchResults().length > 0 && flatResults().length > 0}
              fallback={
                <p
                  class="px-3 py-8 text-center text-base italic"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {app.searchQuery().trim()
                    ? "No tasks matched your search."
                    : "Type to search your tasks."}
                </p>
              }
            >
              <For each={app.searchResults()}>
                {(group) => {
                  const groupTasks = group.tasks;
                  let globalStart = 0;
                  const groups = app.searchResults();
                  for (let g = 0; g < groups.length; g++) {
                    if (groups[g].label === group.label) break;
                    globalStart += groups[g].tasks.length;
                  }

                  return (
                    <div>
                      <p
                        class="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {group.label}
                      </p>
                      <For each={groupTasks}>
                        {(task) => {
                          const globalIndex = globalStart + groupTasks.indexOf(task);

                          return (
                            <button
                              type="button"
                              class="relative flex w-full items-center rounded-lg px-3 py-2 text-left text-base transition-colors"
                              style={{
                                "background-color":
                                  activeIndex() === globalIndex
                                    ? "var(--color-accent-subtle)"
                                    : "transparent",
                                "border-left":
                                  activeIndex() === globalIndex
                                    ? "3px solid var(--color-accent)"
                                    : "3px solid transparent",
                                "padding-left":
                                  activeIndex() === globalIndex ? "calc(0.75rem - 3px)" : "0.75rem",
                              }}
                              onMouseEnter={() => setActiveIndex(globalIndex)}
                              onClick={() => chooseResult(globalIndex)}
                            >
                              <span
                                class="min-w-0 flex-1 truncate"
                                style={{ color: "var(--color-text-primary)" }}
                              >
                                {task.title}
                              </span>
                            </button>
                          );
                        }}
                      </For>
                    </div>
                  );
                }}
              </For>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};
