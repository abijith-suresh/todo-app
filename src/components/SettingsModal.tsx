import { type Component, For, Show } from "solid-js";

import { useAppStore } from "../state/app-store";
import type { ThemeMode } from "../types";
import { CloseIcon } from "./icons";

const shortcuts = [
  ["New task", "N"],
  ["Search", "⌘K / Ctrl+K"],
  ["Complete task", "Space"],
  ["Star task", "S"],
  ["Delete task", "Delete / Backspace"],
  ["Go to Inbox", "G I"],
  ["Go to Today", "G T"],
  ["Go to Upcoming", "G U"],
  ["Close detail panel", "Esc"],
];

const themes: ThemeMode[] = ["system", "light", "dark"];

export const SettingsModal: Component = () => {
  const app = useAppStore();

  let fileInput: HTMLInputElement | undefined;

  return (
    <Show when={app.isSettingsOpen()}>
      <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
        <button
          type="button"
          class="absolute inset-0"
          aria-label="Close settings"
          onClick={() => app.closeSettings()}
        />

        <div class="relative z-10 max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl shadow-black/40">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Settings
              </p>
              <h2 class="mt-1 text-2xl font-semibold text-white">
                Preferences, backup, and shortcuts
              </h2>
            </div>
            <button
              type="button"
              class="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10"
              onClick={() => app.closeSettings()}
            >
              <CloseIcon class="size-4" />
            </button>
          </div>

          <div class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section class="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 class="text-lg font-semibold text-white">Theme</h3>
              <p class="text-sm text-zinc-400">
                Stored in localStorage and defaults to your system preference.
              </p>
              <div class="flex flex-wrap gap-3">
                <For each={themes}>
                  {(theme) => (
                    <button
                      type="button"
                      classList={{
                        "border-sky-400/60 bg-sky-500/10 text-white":
                          app.preferences().theme === theme,
                      }}
                      class="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm capitalize text-zinc-300 transition hover:bg-white/10"
                      onClick={() => app.setTheme(theme)}
                    >
                      {theme}
                    </button>
                  )}
                </For>
              </div>
            </section>

            <section class="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 class="text-lg font-semibold text-white">Backup and restore</h3>
              <p class="text-sm text-zinc-400">
                Export a versioned JSON snapshot, or import one to replace everything in the
                browser.
              </p>
              <div class="flex flex-wrap gap-3">
                <button
                  type="button"
                  class="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                  onClick={() => app.exportData()}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  class="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
                  onClick={() => fileInput?.click()}
                >
                  Import JSON
                </button>
                <input
                  ref={(element) => {
                    fileInput = element;
                  }}
                  type="file"
                  accept="application/json"
                  class="hidden"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      void app.importData(file);
                    }
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </section>
          </div>

          <section class="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <h3 class="text-lg font-semibold text-white">Keyboard shortcuts</h3>
            <div class="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table class="min-w-full divide-y divide-white/10 text-left text-sm text-zinc-300">
                <thead class="bg-white/5 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">Action</th>
                    <th class="px-4 py-3 font-medium">Shortcut</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10">
                  <For each={shortcuts}>
                    {(shortcut) => (
                      <tr>
                        <td class="px-4 py-3">{shortcut[0]}</td>
                        <td class="px-4 py-3 text-zinc-100">{shortcut[1]}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </Show>
  );
};
