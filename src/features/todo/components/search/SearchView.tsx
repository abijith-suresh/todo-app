import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { useAppStore } from "@/state/app-store";

export const SearchView: Component = () => {
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
    app.searchResults();
    setActiveIndex(0);
  });

  createEffect(() => {
    if (app.isSearchOpen()) {
      setActiveIndex(0);
      queueMicrotask(() => input?.focus());
    }
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
    <div>
      <h1
        class="mb-10 text-center text-2xl font-normal tracking-tight sm:mb-14"
        style={{ "font-family": '"DM Serif Display", Georgia, serif' }}
      >
        Search
      </h1>

      <div
        class="flex items-center gap-3 pb-3"
        style={{ "border-bottom": "1px solid var(--color-border-default)" }}
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
          aria-hidden="true"
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

      <div class="mt-10 sm:mt-14" role="listbox" aria-label="Search results">
        <Show
          when={flatResults().length > 0}
          fallback={
            <p
              class="py-10 text-center text-sm italic"
              style={{
                color: "var(--color-text-tertiary)",
                "font-family": '"Source Serif 4", Georgia, serif',
              }}
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
                    class="mb-6 text-xs italic tracking-wide"
                    style={{
                      color: "var(--color-text-tertiary)",
                      "font-family": '"Source Serif 4", Georgia, serif',
                    }}
                  >
                    {group.label}
                  </p>
                  <For each={groupTasks}>
                    {(task) => {
                      const globalIndex = globalStart + groupTasks.indexOf(task);
                      const isCompleted = group.label === "Completed";

                      return (
                        <button
                          type="button"
                          class="group flex w-full items-center gap-3 py-4 text-left text-base transition-colors duration-150"
                          style={{
                            "border-bottom": "1px solid var(--color-border-subtle)",
                            "background-color":
                              activeIndex() === globalIndex
                                ? "var(--color-bg-surface)"
                                : "transparent",
                          }}
                          role="option"
                          aria-selected={activeIndex() === globalIndex}
                          onMouseEnter={() => setActiveIndex(globalIndex)}
                          onClick={() => chooseResult(globalIndex)}
                        >
                          <span
                            class="min-w-0 flex-1 truncate"
                            classList={{ "line-through": isCompleted }}
                            style={{
                              color: isCompleted
                                ? "var(--color-text-tertiary)"
                                : "var(--color-text-primary)",
                              "font-family": '"Source Serif 4", Georgia, serif',
                            }}
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

        <div class="sr-only" aria-live="polite" aria-atomic="true">
          {app.isSearchOpen() && app.searchQuery().trim() && flatResults().length > 0
            ? `${flatResults().length} result${flatResults().length === 1 ? "" : "s"}`
            : ""}
        </div>
      </div>
    </div>
  );
};
