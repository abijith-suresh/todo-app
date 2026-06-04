import { onCleanup, onMount } from "solid-js";

import { useAppStore } from "@/state/app-store";

import { AppFrame } from "../components/app-shell/AppFrame";
import { AppTaskContent } from "../components/app-shell/AppTaskContent";
import { QuickAdd } from "../components/tasks/QuickAdd";
import { SearchView } from "../components/search/SearchView";

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

  const searchOpen = () => app.isSearchOpen();

  return (
    <AppFrame>
      {/* Subtle ambient gradient */}
      <div
        class="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(237, 234, 227, 0.5) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <main class="relative z-10 mx-auto max-w-xl px-6 pt-20 pb-12 sm:pt-28 sm:pb-16">
        {/* Views are absolutely positioned within this wrapper.
            Only opacity changes — no position toggling, so no layout jank. */}
        <div class="relative" style={{ "min-height": "60vh" }}>
          {/* Main View */}
          <div
            class="view-fade"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              opacity: searchOpen() ? 0 : 1,
              "pointer-events": searchOpen() ? "none" : "auto",
              "z-index": searchOpen() ? 0 : 1,
            }}
          >
            <h1
              class="mb-10 text-center text-2xl font-normal tracking-tight sm:mb-14"
              style={{ "font-family": '"DM Serif Display", Georgia, serif' }}
            >
              Today&rsquo;s Intentions
            </h1>
            <QuickAdd />
            <div class="mt-10 sm:mt-14">
              <AppTaskContent />
            </div>
          </div>

          {/* Search View */}
          <div
            class="view-fade"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              opacity: searchOpen() ? 1 : 0,
              "pointer-events": searchOpen() ? "auto" : "none",
              "z-index": searchOpen() ? 1 : 0,
            }}
          >
            <SearchView />
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
