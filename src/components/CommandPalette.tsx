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
    if (!result) {
      return;
    }

    app.openTask(result.taskId, true);
  };

  return (
    <Show when={app.isCommandPaletteOpen()}>
      <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-10 backdrop-blur-sm">
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
          class="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/40"
        >
          <div class="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <SearchIcon class="size-4 text-zinc-500" />
            <input
              ref={(element) => {
                input = element;
              }}
              value={app.commandQuery()}
              onInput={(event) => app.setCommandQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((current) =>
                    Math.min(current + 1, Math.max(app.searchResults().length - 1, 0))
                  );
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((current) => Math.max(current - 1, 0));
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
              placeholder="Search tasks and notes"
              class="w-full bg-transparent text-base text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          <div class="max-h-[24rem] overflow-y-auto p-3">
            <Show
              when={app.searchResults().length > 0}
              fallback={
                <p class="px-3 py-6 text-sm text-zinc-500">No tasks matched your search.</p>
              }
            >
              <div class="space-y-1">
                <For each={app.searchResults()}>
                  {(result, index) => (
                    <button
                      type="button"
                      classList={{
                        "bg-sky-500/10": activeIndex() === index(),
                      }}
                      class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/5"
                      onMouseEnter={() => setActiveIndex(index())}
                      onClick={() => chooseResult(index())}
                    >
                      <div class="min-w-0 flex-1">
                        <p class="truncate font-medium text-white">{result.title}</p>
                        <p class="mt-1 truncate text-sm text-zinc-400">
                          {result.projectName}
                          {result.notes ? ` • ${result.notes}` : ""}
                        </p>
                      </div>
                      <span class="shrink-0 text-xs uppercase tracking-[0.16em] text-zinc-500">
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
