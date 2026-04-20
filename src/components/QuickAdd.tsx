import { type Component, createEffect, createMemo, createSignal } from "solid-js";

import { formatDateLabel } from "../lib/date";
import { getTodayIso, getTomorrowIso } from "../lib/date";
import { useAppStore } from "../state/app-store";
import { CalendarClockIcon, CircleIcon, FlagIcon } from "./icons";

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
  let formRef: HTMLFormElement | undefined;

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
  };

  const collapse = (): void => {
    setTitle("");
    setWhenDate(defaults().whenDate);
    setDueDate(defaults().dueDate);
    setIsFocused(false);
    titleInputRef?.blur();
  };

  const handleFormFocusOut = (event: FocusEvent): void => {
    const relatedTarget = event.relatedTarget as Node | null;
    // Only collapse if focus moved entirely outside the form
    if (formRef && !formRef.contains(relatedTarget)) {
      setIsFocused(false);
    }
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
    <form
      ref={(el) => {
        formRef = el;
      }}
      class="relative"
      onSubmit={(event) => void submit(event)}
      onFocusOut={handleFormFocusOut}
    >
      {/* ── Title row ── */}
      <div
        class="flex items-center gap-2.5 px-0.5 py-1"
        style={{
          "border-bottom": isFocused()
            ? "1px solid var(--color-border-default)"
            : "1px solid transparent",
          transition: "border-color 150ms ease",
        }}
      >
        {/* Left glyph — hollow circle */}
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

        {/* Return hint */}
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
          <div class="flex items-center gap-1.5 pt-2 pb-0.5 px-0.5">
            {/* When button — icon-only when empty, pill with date when set */}
            <button
              type="button"
              class={whenDate() ? "quickadd-chip has-value" : "quickadd-icon-btn"}
              onClick={triggerWhenPicker}
              tabIndex={isFocused() ? 0 : -1}
              aria-label={
                whenDate()
                  ? `When: ${formatDateLabel(whenDate())} — click to clear`
                  : "Set when date"
              }
            >
              <CalendarClockIcon class="size-3.5 shrink-0" />
              {whenDate() ? (
                <>
                  <span class="ml-1">{formatDateLabel(whenDate())}</span>
                  <span class="chip-clear ml-1" aria-hidden="true">
                    ×
                  </span>
                </>
              ) : null}
            </button>

            {/* Due button — icon-only when empty, pill with date when set */}
            <button
              type="button"
              class={dueDate() ? "quickadd-chip has-value" : "quickadd-icon-btn"}
              onClick={triggerDuePicker}
              tabIndex={isFocused() ? 0 : -1}
              aria-label={
                dueDate() ? `Due: ${formatDateLabel(dueDate())} — click to clear` : "Set due date"
              }
            >
              <FlagIcon class="size-3.5 shrink-0" />
              {dueDate() ? (
                <>
                  <span class="ml-1">{formatDateLabel(dueDate())}</span>
                  <span class="chip-clear ml-1" aria-hidden="true">
                    ×
                  </span>
                </>
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

      {/* Hidden native date inputs */}
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
