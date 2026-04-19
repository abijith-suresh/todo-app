import { type Component, createEffect, createMemo, createSignal } from "solid-js";

import { formatDateLabel } from "../lib/date";
import { getTodayIso, getTomorrowIso } from "../lib/date";
import { useAppStore } from "../state/app-store";
import { CircleIcon } from "./icons";

interface QuickAddProps {
  inputRef?: (element: HTMLInputElement) => void;
}

export const QuickAdd: Component<QuickAddProps> = (props) => {
  const app = useAppStore();
  const [title, setTitle] = createSignal("");
  const [isFocused, setIsFocused] = createSignal(false);

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
    const next = defaults();
    setWhenDate(next.whenDate);
    setDueDate(next.dueDate);
  });

  // Refs for the hidden native date inputs
  let whenInputRef: HTMLInputElement | undefined;
  let dueInputRef: HTMLInputElement | undefined;
  let titleInputRef: HTMLInputElement | undefined;

  const submit = async (event?: Event): Promise<void> => {
    event?.preventDefault();
    const created = await app.createTask({
      title: title(),
      whenDate: whenDate() || null,
      dueDate: dueDate() || null,
      projectId: defaults().projectId,
    });
    if (!created) return;
    setTitle("");
    setWhenDate(defaults().whenDate);
    setDueDate(defaults().dueDate);
    // Keep expanded if the user keeps typing
  };

  const collapse = (): void => {
    setTitle("");
    setWhenDate(defaults().whenDate);
    setDueDate(defaults().dueDate);
    setIsFocused(false);
    titleInputRef?.blur();
  };

  const handleTitleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      collapse();
    }
  };

  const triggerWhenPicker = (event: MouseEvent): void => {
    event.preventDefault();
    if (whenDate()) {
      setWhenDate("");
      return;
    }
    whenInputRef?.showPicker?.();
    whenInputRef?.click();
  };

  const triggerDuePicker = (event: MouseEvent): void => {
    event.preventDefault();
    if (dueDate()) {
      setDueDate("");
      return;
    }
    dueInputRef?.showPicker?.();
    dueInputRef?.click();
  };

  return (
    <form class="relative" onSubmit={(event) => void submit(event)}>
      {/* ── Title row — looks like a task row ── */}
      <div
        class="flex items-center gap-2.5 px-0.5 py-1"
        style={{
          "border-bottom": isFocused()
            ? "1px solid var(--color-border-default)"
            : "1px solid transparent",
          transition: "border-color 150ms ease",
        }}
      >
        {/* Left glyph — hollow circle matching task-row checkbox size */}
        <span
          class="flex shrink-0 items-center justify-center"
          style={{
            width: "17px",
            height: "17px",
            color: "var(--color-border-default)",
          }}
          aria-hidden="true"
        >
          <CircleIcon class="size-[17px]" />
        </span>

        {/* Title input */}
        <input
          ref={(el) => {
            titleInputRef = el;
            props.inputRef?.(el);
          }}
          value={title()}
          onInput={(event) => setTitle(event.currentTarget.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleTitleKeyDown}
          placeholder="New to-do…"
          class="min-w-0 flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--color-text-primary)" }}
          autocomplete="off"
        />

        {/* Subtle Return hint — only visible when focused and has text */}
        {isFocused() && title().trim() ? (
          <span
            class="shrink-0 select-none font-mono text-[10px] opacity-40"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            ↵ Return
          </span>
        ) : null}
      </div>

      {/* ── Expanded chip toolbar ── */}
      <div class={`quickadd-expand-wrapper${isFocused() ? " is-open" : ""}`}>
        <div class="quickadd-expand-inner">
          <div class="flex items-center gap-2 pt-2 pb-0.5 px-0.5">
            {/* When chip */}
            <button
              type="button"
              class={`quickadd-chip${whenDate() ? " has-value" : ""}`}
              onClick={triggerWhenPicker}
              tabIndex={isFocused() ? 0 : -1}
              aria-label={
                whenDate()
                  ? `When: ${formatDateLabel(whenDate())} — click to clear`
                  : "Set when date"
              }
            >
              <span>When{whenDate() ? `: ${formatDateLabel(whenDate())}` : ""}</span>
              {whenDate() ? (
                <span class="chip-clear" aria-hidden="true">
                  ×
                </span>
              ) : null}
            </button>

            {/* Due chip */}
            <button
              type="button"
              class={`quickadd-chip${dueDate() ? " has-value" : ""}`}
              onClick={triggerDuePicker}
              tabIndex={isFocused() ? 0 : -1}
              aria-label={
                dueDate() ? `Due: ${formatDateLabel(dueDate())} — click to clear` : "Set due date"
              }
            >
              <span>Due{dueDate() ? `: ${formatDateLabel(dueDate())}` : ""}</span>
              {dueDate() ? (
                <span class="chip-clear" aria-hidden="true">
                  ×
                </span>
              ) : null}
            </button>

            {/* Escape hint */}
            <span
              class="ml-auto select-none font-mono text-[10px] opacity-30"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Esc to cancel
            </span>
          </div>
        </div>
      </div>

      {/* Hidden native date inputs — triggered programmatically by the chips */}
      <input
        ref={(el) => {
          whenInputRef = el;
        }}
        type="date"
        value={whenDate()}
        onInput={(event) => setWhenDate(event.currentTarget.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: "0",
          "pointer-events": "none",
          width: "1px",
          height: "1px",
          top: "0",
          left: "0",
        }}
      />
      <input
        ref={(el) => {
          dueInputRef = el;
        }}
        type="date"
        value={dueDate()}
        onInput={(event) => setDueDate(event.currentTarget.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: "0",
          "pointer-events": "none",
          width: "1px",
          height: "1px",
          top: "0",
          left: "0",
        }}
      />
    </form>
  );
};
