import { type Component, createEffect, createSignal, For, Show } from "solid-js";

import { formatDateLabel } from "../lib/date";
import { useAppStore } from "../state/app-store";
import { SearchIcon } from "./icons";

export const CommandPalette: Component = () => {
  const app = useAppStore();
  const [activeIndex, setActiveIndex] = createSignal(0);

  let input: HTMLInputElement | undefined;

  createEffect(() => {
    if (app.isCommandPaletteOpen()) {
      setActiveIndex(0);
      queueMicrotask(() => input?.focus());
    }
  });

  createEffect(() => {
    app.searchResults();
    setActiveIndex(0);
  });

  const chooseResult = (index: number): void => {
    const result = app.searchResults()[index];
    if (!result) return;
    app.openTask(result.taskId, true);
  };

  return (
    <Show when={app.isCommandPaletteOpen()}>
      <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-16">
        <button
          type="button"
          class="absolute inset-0"
          aria-label="Close search"
          onClick={() => app.closeCommandPalette()}
        />

        <div
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="relative z-10 w-full max-w-xl overflow-hidden rounded-xl shadow-2xl"
          style={{
            "background-color": "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
          }}
        >
          {/* search input */}
          <div
            class="flex items-center gap-3 px-4 py-3.5"
            style={{ "border-bottom": "1px solid var(--color-border-subtle)" }}
          >
            <SearchIcon class="size-4 shrink-0" />
            <input
              ref={(el) => {
                input = el;
              }}
              value={app.commandQuery()}
              onInput={(event) => app.setCommandQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((i) =>
                    Math.min(i + 1, Math.max(app.searchResults().length - 1, 0))
                  );
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
                  app.closeCommandPalette();
                }
              }}
              placeholder="Search tasks and notes…"
              class="w-full bg-transparent text-sm outline-none"
              style={{
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          {/* results */}
          <div class="max-h-80 overflow-y-auto p-2">
            <Show
              when={app.searchResults().length > 0}
              fallback={
                <p
                  class="px-3 py-8 text-center text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  No tasks matched your search.
                </p>
              }
            >
              <div>
                <For each={app.searchResults()}>
                  {(result, index) => (
                    <button
                      type="button"
                      class="relative flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                      style={{
                        "background-color":
                          activeIndex() === index() ? "var(--color-accent-subtle)" : "transparent",
                        "border-left":
                          activeIndex() === index()
                            ? "3px solid var(--color-accent)"
                            : "3px solid transparent",
                        "padding-left":
                          activeIndex() === index() ? "calc(0.75rem - 3px)" : "0.75rem",
                      }}
                      onMouseEnter={() => setActiveIndex(index())}
                      onClick={() => chooseResult(index())}
                    >
                      <div class="min-w-0 flex-1">
                        <p
                          class="truncate text-sm font-medium"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {result.title}
                        </p>
                        <p
                          class="mt-0.5 truncate text-xs"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {result.projectName}
                          {result.notes ? ` · ${result.notes}` : ""}
                        </p>
                      </div>
                      <span
                        class="shrink-0 font-mono text-[11px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {result.dateLabel ? formatDateLabel(result.dateLabel) : "No date"}
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};
