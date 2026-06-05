import { onCleanup, onMount } from "solid-js";

import { useAppStore } from "@/state/app-store";

import { MainTaskView } from "./MainTaskView";
import { QuickAdd } from "./QuickAdd";
import { SearchView } from "./SearchView";

export const TodoApp = () => {
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
    };

    window.addEventListener("keydown", onKeyDown);
    onCleanup(() => window.removeEventListener("keydown", onKeyDown));
  });

  const searchOpen = () => app.isSearchOpen();

  return (
    <div class="min-h-screen bg-page text-ink">
      <div
        class="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(237, 234, 227, 0.5) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <main class="relative z-10 mx-auto max-w-xl px-6 pt-20 pb-12 sm:pt-28 sm:pb-16">
        <div class="relative min-h-[60vh]">
          <div
            class="view-fade absolute inset-0"
            style={{
              opacity: searchOpen() ? 0 : 1,
              "pointer-events": searchOpen() ? "none" : "auto",
              "z-index": searchOpen() ? 0 : 1,
            }}
          >
            <h1 class="mb-10 text-center text-2xl font-normal tracking-tight sm:mb-14 font-display">
              Today&rsquo;s Intentions
            </h1>
            <QuickAdd />
            <div class="mt-10 sm:mt-14">
              <MainTaskView />
            </div>
          </div>

          <div
            class="view-fade absolute inset-0"
            style={{
              opacity: searchOpen() ? 1 : 0,
              "pointer-events": searchOpen() ? "auto" : "none",
              "z-index": searchOpen() ? 1 : 0,
            }}
          >
            <SearchView />
          </div>
        </div>
      </main>
    </div>
  );
};
