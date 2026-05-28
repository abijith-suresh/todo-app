import { type Component, For, Show } from "solid-js";

import { Button, IconButton } from "@/components/ui/button";
import { useAppStore } from "@/state/app-store";
import type { ThemeMode } from "@/types";

import { CloseIcon } from "../icons";

const shortcuts: [string, string][] = [
  ["New task", "N"],
  ["Search", "⌘K / Ctrl+K"],
  ["Complete task", "Space"],
  ["Star task", "S"],
  ["Delete task", "Del / ⌫"],
  ["Go to Inbox", "G then I"],
  ["Go to Today", "G then T"],
  ["Go to Upcoming", "G then U"],
  ["Close panel", "Esc"],
];

const themes: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const SettingsModal: Component = () => {
  const app = useAppStore();
  let fileInput: HTMLInputElement | undefined;

  return (
    <Show when={app.isSettingsOpen()}>
      {/* Backdrop */}
      <div class="fixed inset-0 z-40 flex items-center justify-center px-4 py-8">
        <button
          type="button"
          class="absolute inset-0"
          style={{ "background-color": "rgba(0,0,0,0.4)" }}
          aria-label="Close settings"
          onClick={() => app.closeSettings()}
        />

        {/* Modal card */}
        <div
          class="relative z-10 flex max-h-[88vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            "background-color": "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          {/* Header */}
          <div class="flex shrink-0 items-center justify-between px-7 pt-6 pb-5">
            <h2 class="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Settings
            </h2>
            <IconButton
              label="Close settings"
              size="iconSm"
              variant="ghost"
              onClick={() => app.closeSettings()}
            >
              <CloseIcon class="size-3.5" />
            </IconButton>
          </div>

          {/* Scrollable body */}
          <div class="min-h-0 flex-1 overflow-y-auto px-7 pb-7">
            {/* ── Appearance ── */}
            <section class="mb-6">
              <p
                class="mb-3 text-[11px] font-medium"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Appearance
              </p>

              {/* Segmented theme control — no outer border, just three adjacent pills */}
              <div class="flex gap-1">
                <For each={themes}>
                  {(theme) => {
                    const isActive = () => app.preferences().theme === theme.value;
                    return (
                      <button
                        type="button"
                        class="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all"
                        style={{
                          "background-color": isActive()
                            ? "var(--color-accent-subtle)"
                            : "var(--color-bg-input)",
                          color: isActive() ? "var(--color-accent)" : "var(--color-text-tertiary)",
                          border: isActive()
                            ? "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)"
                            : "1px solid transparent",
                          transition: "all 150ms ease",
                        }}
                        onClick={() => app.setTheme(theme.value)}
                      >
                        {theme.label}
                      </button>
                    );
                  }}
                </For>
              </div>
            </section>

            {/* ── Data ── */}
            <section class="mb-6">
              <p
                class="mb-1 text-[11px] font-medium"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Data
              </p>
              <p
                class="mb-3 text-xs leading-relaxed"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Export a versioned JSON backup, or replace all data from a previous snapshot.
              </p>
              <div class="flex gap-2">
                <Button variant="accent" size="sm" onClick={() => app.exportData()}>
                  Export
                </Button>
                <Button variant="surface" size="sm" onClick={() => fileInput?.click()}>
                  Import
                </Button>
                <input
                  ref={(el) => {
                    fileInput = el;
                  }}
                  type="file"
                  accept="application/json"
                  class="hidden"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = "";
                    if (file) {
                      app.showConfirm({
                        title: "Replace all data",
                        message:
                          "Importing will replace all current tasks, projects, and preferences. This cannot be undone.",
                        confirmLabel: "Import",
                        onConfirm: () => void app.importData(file),
                      });
                    }
                  }}
                />
              </div>
            </section>

            {/* ── Keyboard shortcuts ── */}
            <section>
              <p
                class="mb-3 text-[11px] font-medium"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Keyboard shortcuts
              </p>
              <div
                class="rounded-xl overflow-hidden"
                style={{
                  border: "1px solid var(--color-border-subtle)",
                  "background-color": "var(--color-bg-input)",
                }}
              >
                <For each={shortcuts}>
                  {([action, key], index) => (
                    <div
                      class="flex items-center justify-between px-4 py-2.5"
                      style={{
                        "border-top": index() > 0 ? "1px solid var(--color-border-subtle)" : "none",
                      }}
                    >
                      <span class="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        {action}
                      </span>
                      <kbd
                        class="rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none"
                        style={{
                          "background-color": "var(--color-bg-surface)",
                          color: "var(--color-text-primary)",
                          border: "1px solid var(--color-border-default)",
                        }}
                      >
                        {key}
                      </kbd>
                    </div>
                  )}
                </For>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Show>
  );
};
