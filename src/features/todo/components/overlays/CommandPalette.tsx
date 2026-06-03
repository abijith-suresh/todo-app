import { type Component, createEffect, createSignal, For, onCleanup, Show } from "solid-js";

import { useAppStore } from "@/state/app-store";

export const CommandPalette: Component = () => {
  const app = useAppStore();
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [isMounted, setIsMounted] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);

  let input: HTMLInputElement | undefined;
  let dialogRef: HTMLDivElement | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

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
    const originalOverflow = document.body.style.overflow;
    if (app.isSearchOpen()) {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      document.body.style.overflow = "hidden";
      setIsMounted(true);
      setActiveIndex(0);
      queueMicrotask(() => input?.focus());

      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });

      onCleanup(() => {
        document.body.style.overflow = originalOverflow;
        cancelAnimationFrame(raf);
      });
    } else {
      setIsVisible(false);
      closeTimer = setTimeout(() => {
        setIsMounted(false);
        closeTimer = null;
      }, 200);
      onCleanup(() => {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      });
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

    if (event.key === "Tab" && dialogRef) {
      event.preventDefault();
      const focusable = Array.from(
        dialogRef.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])")
      );
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      let nextIndex: number;
      if (event.shiftKey) {
        nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
      }
      focusable[nextIndex]?.focus();
    }
  };

  return (
    <Show when={isMounted()}>
      <div
        class="command-palette-overlay fixed inset-0 z-50 flex items-start justify-center px-4 py-16 sm:py-24"
        style={{
          "background-color": "rgba(26, 24, 22, 0.04)",
          opacity: isVisible() ? 1 : 0,
        }}
        onClick={() => app.closeSearch()}
        role="presentation"
      >
        <div
          ref={(el) => {
            dialogRef = el;
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search tasks"
          tabindex="-1"
          class="command-palette-dialog relative z-10 w-full max-w-xl overflow-hidden"
          style={{
            "background-color": "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
            "box-shadow": "0 4px 24px rgba(26, 24, 22, 0.05), 0 1px 2px rgba(26, 24, 22, 0.03)",
            "border-radius": "6px",
            opacity: isVisible() ? 1 : 0,
            transform: isVisible() ? "scale(1) translateY(0)" : "scale(0.98) translateY(-4px)",
          }}
          onClick={(e) => e.stopPropagation()}
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
            <button
              type="button"
              onClick={() => app.closeSearch()}
              class="shrink-0 rounded-sm p-1.5 transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
              style={{ color: "var(--color-text-tertiary)" }}
              aria-label="Close search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div class="max-h-80 overflow-y-auto" role="listbox" aria-label="Search results">
            <Show
              when={flatResults().length > 0}
              fallback={
                <p
                  class="px-4 py-10 text-center text-sm italic"
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
                        class="px-4 pt-3 pb-1 text-xs italic tracking-wide"
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
                              class="group flex w-full items-center gap-3 px-4 py-3 text-left text-base transition-colors duration-150"
                              style={{
                                "border-bottom": "1px solid var(--color-border-subtle)",
                                "background-color":
                                  activeIndex() === globalIndex
                                    ? "var(--color-bg-elevated)"
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
              {isVisible() && app.searchQuery().trim() && flatResults().length > 0
                ? `${flatResults().length} result${flatResults().length === 1 ? "" : "s"}`
                : ""}
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
