import { type Component, createEffect, createMemo, createSignal } from "solid-js";

import { DatePickerModal } from "./DatePickerModal";
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
  const [whenPickerOpen, setWhenPickerOpen] = createSignal(false);
  const [duePickerOpen, setDuePickerOpen] = createSignal(false);

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

  return (
    <>
      <form
        ref={(el) => {
          formRef = el;
        }}
        class="relative"
        onSubmit={(event) => void submit(event)}
        onFocusOut={handleFormFocusOut}
      >
        {/* Title row */}
        <div
          class="flex items-center gap-2.5 px-0.5 py-1"
          style={{
            "border-bottom": isFocused()
              ? "1px solid var(--color-border-default)"
              : "1px solid transparent",
            transition: "border-color 150ms ease",
          }}
        >
          <span
            class="flex shrink-0 items-center justify-center"
            style={{ width: "17px", height: "17px", color: "var(--color-border-default)" }}
            aria-hidden="true"
          >
            <CircleIcon class="size-[17px]" />
          </span>

          <input
            ref={(el) => {
              titleInputRef = el;
              props.inputRef?.(el);
            }}
            value={title()}
            onInput={(event) => setTitle(event.currentTarget.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleTitleKeyDown}
            placeholder="New to-do..."
            class="min-w-0 flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text-primary)" }}
            autocomplete="off"
          />

          {isFocused() && title().trim() ? (
            <span
              class="shrink-0 select-none font-mono text-[10px] opacity-40"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Return
            </span>
          ) : null}
        </div>

        {/* Expanded chip toolbar */}
        <div class={`quickadd-expand-wrapper${isFocused() ? " is-open" : ""}`}>
          <div class="quickadd-expand-inner">
            <div class="flex items-center gap-1.5 pt-2 pb-0.5 px-0.5">
              {/* When chip */}
              <button
                type="button"
                class={whenDate() ? "quickadd-chip has-value" : "quickadd-icon-btn"}
                onClick={() => setWhenPickerOpen(true)}
                tabIndex={isFocused() ? 0 : -1}
                aria-label={
                  whenDate()
                    ? `When: ${formatDateLabel(whenDate())} - click to change`
                    : "Set when date"
                }
              >
                <CalendarClockIcon class="size-3.5 shrink-0" />
                {whenDate() ? <span class="ml-1">{formatDateLabel(whenDate())}</span> : null}
              </button>

              {/* Due chip */}
              <button
                type="button"
                class={dueDate() ? "quickadd-chip has-value" : "quickadd-icon-btn"}
                onClick={() => setDuePickerOpen(true)}
                tabIndex={isFocused() ? 0 : -1}
                aria-label={
                  dueDate()
                    ? `Due: ${formatDateLabel(dueDate())} - click to change`
                    : "Set due date"
                }
              >
                <FlagIcon class="size-3.5 shrink-0" />
                {dueDate() ? <span class="ml-1">{formatDateLabel(dueDate())}</span> : null}
              </button>

              <span
                class="ml-auto select-none font-mono text-[10px] opacity-30"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Esc to cancel
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Date pickers — outside the form so they're not submitted */}
      <DatePickerModal
        isOpen={whenPickerOpen()}
        onClose={() => setWhenPickerOpen(false)}
        currentDate={whenDate() || null}
        onSelect={(iso) => {
          setWhenDate(iso ?? "");
          setWhenPickerOpen(false);
        }}
        label="When"
        mode="when"
      />
      <DatePickerModal
        isOpen={duePickerOpen()}
        onClose={() => setDuePickerOpen(false)}
        currentDate={dueDate() || null}
        onSelect={(iso) => {
          setDueDate(iso ?? "");
          setDuePickerOpen(false);
        }}
        label="Deadline"
        mode="due"
      />
    </>
  );
};
