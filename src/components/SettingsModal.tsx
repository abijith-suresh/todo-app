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
      <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-8">
        <button
          type="button"
          class="absolute inset-0"
          aria-label="Close settings"
          onClick={() => app.closeSettings()}
        />

        <div
          class="relative z-10 max-h-full w-full max-w-2xl overflow-y-auto rounded-xl shadow-2xl"
          style={{
            "background-color": "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
          }}
        >
          {/* header */}
          <div
            class="flex items-center justify-between px-6 py-5"
            style={{ "border-bottom": "1px solid var(--color-border-subtle)" }}
          >
            <h2 class="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Settings
            </h2>
            <button
              type="button"
              class="rounded-lg p-1.5 transition-colors"
              style={{
                "background-color": "var(--color-bg-input)",
                color: "var(--color-text-secondary)",
              }}
              onClick={() => app.closeSettings()}
            >
              <CloseIcon class="size-4" />
            </button>
          </div>

          <div class="grid gap-4 p-6 lg:grid-cols-2">
            {/* theme */}
            <section
              class="space-y-3 rounded-lg p-4"
              style={{
                "background-color": "var(--color-bg-surface)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div>
                <h3 class="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Theme
                </h3>
                <p class="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  Stored in localStorage, defaults to system preference.
                </p>
              </div>
              <div class="flex gap-1.5">
                <For each={themes}>
                  {(theme) => {
                    const isActive = () => app.preferences().theme === theme;
                    return (
                      <button
                        type="button"
                        class="rounded-lg px-3 py-1.5 text-sm capitalize transition"
                        style={{
                          "background-color": isActive()
                            ? "var(--color-accent)"
                            : "var(--color-bg-input)",
                          color: isActive() ? "#ffffff" : "var(--color-text-secondary)",
                          border: isActive()
                            ? "1px solid var(--color-accent)"
                            : "1px solid var(--color-border-default)",
                        }}
                        onClick={() => app.setTheme(theme)}
                      >
                        {theme}
                      </button>
                    );
                  }}
                </For>
              </div>
            </section>

            {/* backup */}
            <section
              class="space-y-3 rounded-lg p-4"
              style={{
                "background-color": "var(--color-bg-surface)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div>
                <h3 class="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Backup &amp; restore
                </h3>
                <p class="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  Export a versioned JSON snapshot, or import one to replace all local data.
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ "background-color": "var(--color-accent)" }}
                  onClick={() => app.exportData()}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-sm transition"
                  style={{
                    "border-color": "var(--color-border-default)",
                    "background-color": "var(--color-bg-input)",
                    color: "var(--color-text-secondary)",
                  }}
                  onClick={() => fileInput?.click()}
                >
                  Import JSON
                </button>
                <input
                  ref={(el) => {
                    fileInput = el;
                  }}
                  type="file"
                  accept="application/json"
                  class="hidden"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) void app.importData(file);
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </section>
          </div>

          {/* keyboard shortcuts */}
          <section class="px-6 pb-6">
            <div
              class="rounded-lg overflow-hidden"
              style={{
                "background-color": "var(--color-bg-surface)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                class="px-4 py-2.5"
                style={{
                  "background-color": "var(--color-bg-input)",
                  "border-bottom": "1px solid var(--color-border-subtle)",
                }}
              >
                <h3
                  class="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Keyboard shortcuts
                </h3>
              </div>
              <table class="min-w-full text-sm">
                <tbody>
                  <For each={shortcuts}>
                    {(shortcut, index) => (
                      <tr
                        style={{
                          "border-top":
                            index() > 0 ? "1px solid var(--color-border-subtle)" : "none",
                        }}
                      >
                        <td class="px-4 py-2.5" style={{ color: "var(--color-text-secondary)" }}>
                          {shortcut[0]}
                        </td>
                        <td class="px-4 py-2.5 text-right">
                          <kbd
                            class="font-mono text-xs"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {shortcut[1]}
                          </kbd>
                        </td>
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
