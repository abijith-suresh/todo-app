import { onCleanup, onMount } from "solid-js";

import { useAppStore } from "@/state/app-store";

import { AppFrame } from "../components/app-shell/AppFrame";
import { AppTaskContent } from "../components/app-shell/AppTaskContent";
import { QuickAdd } from "../components/tasks/QuickAdd";
import { CommandPalette } from "../components/overlays/CommandPalette";

const isEditableTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return Boolean(element.closest("input, textarea, select, [contenteditable='true']"));
};

export default function TodoApp() {
  const app = useAppStore();

  onMount(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (app.isSearchOpen()) {
          app.closeSearch();
        } else {
          app.openSearch();
        }
        return;
      }

      if (event.key === "Escape") {
        if (app.isSearchOpen()) {
          app.closeSearch();
          return;
        }
        return;
      }

      if (app.isSearchOpen()) return;
      if (isEditableTarget(event.target)) return;
    };

    window.addEventListener("keydown", onKeyDown);
    onCleanup(() => window.removeEventListener("keydown", onKeyDown));
  });

  return (
    <AppFrame>
      <main class="mx-auto flex min-w-0 max-w-2xl flex-col px-6 py-6 lg:px-10">
        <QuickAdd />
        <div class="mt-6">
          <AppTaskContent />
        </div>
      </main>

      <CommandPalette />
    </AppFrame>
  );
}
