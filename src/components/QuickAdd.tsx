import { type Component, createEffect, createMemo, createSignal } from "solid-js";

import { getTodayIso, getTomorrowIso } from "../lib/date";
import { useAppStore } from "../state/app-store";

interface QuickAddProps {
  inputRef?: (element: HTMLInputElement) => void;
}

export const QuickAdd: Component<QuickAddProps> = (props) => {
  const app = useAppStore();
  const [title, setTitle] = createSignal("");
  const defaults = createMemo(() => {
    const view = app.activeView();

    switch (view.type) {
      case "inbox":
        return { whenDate: "", dueDate: "", projectId: null as string | null };
      case "today":
        return { whenDate: getTodayIso(), dueDate: "", projectId: null as string | null };
      case "upcoming":
        return { whenDate: getTomorrowIso(), dueDate: "", projectId: null as string | null };
      case "project":
        return { whenDate: "", dueDate: "", projectId: view.projectId };
    }
  });
  const [whenDate, setWhenDate] = createSignal("");
  const [dueDate, setDueDate] = createSignal("");

  createEffect(() => {
    const nextDefaults = defaults();
    setWhenDate(nextDefaults.whenDate);
    setDueDate(nextDefaults.dueDate);
  });

  const submit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const created = await app.createTask({
      title: title(),
      whenDate: whenDate() || null,
      dueDate: dueDate() || null,
      projectId: defaults().projectId,
    });

    if (!created) {
      return;
    }

    setTitle("");
    setWhenDate(defaults().whenDate);
    setDueDate(defaults().dueDate);
  };

  return (
    <form
      class="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur-xl"
      onSubmit={(event) => void submit(event)}
    >
      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
        <label class="block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            New task
          </span>
          <input
            ref={props.inputRef}
            value={title()}
            onInput={(event) => setTitle(event.currentTarget.value)}
            placeholder="What needs doing?"
            class="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-sky-400/60"
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            When
          </span>
          <input
            type="date"
            value={whenDate()}
            onInput={(event) => setWhenDate(event.currentTarget.value)}
            class="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Due
          </span>
          <input
            type="date"
            value={dueDate()}
            onInput={(event) => setDueDate(event.currentTarget.value)}
            class="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
          />
        </label>

        <button
          type="submit"
          class="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          Add task
        </button>
      </div>
    </form>
  );
};
