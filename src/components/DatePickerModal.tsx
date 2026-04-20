import { type Component, createMemo, createSignal, For, Show } from "solid-js";

import { addDays, format, getDaysInMonth, startOfMonth } from "date-fns";
import { getTodayIso } from "../lib/date";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string | null;
  onSelect: (iso: string | null) => void;
  label: string;
  mode: "when" | "due";
}

// Format an ISO date string to YYYY-MM-DD safely
const toIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const DatePickerModal: Component<DatePickerModalProps> = (props) => {
  const today = getTodayIso();
  const todayDate = new Date(today + "T00:00:00");

  // Display month/year — initialise from current date or today
  const initDate = (): Date => {
    if (props.currentDate) return new Date(props.currentDate + "T00:00:00");
    return new Date(today + "T00:00:00");
  };

  const [displayDate, setDisplayDate] = createSignal<Date>(initDate());

  // Reopen the picker at the right month when it re-opens
  const open = createMemo(() => {
    if (props.isOpen) {
      setDisplayDate(initDate());
    }
    return props.isOpen;
  });

  const displayYear = createMemo(() => displayDate().getFullYear());
  const displayMonth = createMemo(() => displayDate().getMonth()); // 0-indexed

  const monthLabel = createMemo(() => format(displayDate(), "MMMM yyyy"));

  // Build calendar grid (always 6 rows x 7 cols = 42 cells)
  const calendarCells = createMemo(() => {
    const year = displayYear();
    const month = displayMonth();
    const first = startOfMonth(new Date(year, month, 1));
    const startDow = first.getDay(); // 0=Sun
    const daysInMonth = getDaysInMonth(first);

    // Cells for previous month
    const prevMonth = new Date(year, month, 0); // last day of prev month
    const prevDays = getDaysInMonth(prevMonth);

    const cells: Array<{ iso: string; day: number; thisMonth: boolean }> = [];

    // Leading days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevDays - i);
      cells.push({ iso: toIso(d), day: d.getDate(), thisMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ iso: toIso(date), day: d, thisMonth: true });
    }

    // Trailing days to fill 42 cells
    let next = 1;
    while (cells.length < 42) {
      const d = new Date(year, month + 1, next++);
      cells.push({ iso: toIso(d), day: d.getDate(), thisMonth: false });
    }

    return cells;
  });

  const prevMonth = (): void => {
    setDisplayDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const nextMonth = (): void => {
    setDisplayDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const accentColor = createMemo(() =>
    props.mode === "when" ? "var(--color-accent)" : "var(--color-urgency-amber)"
  );
  const accentBg = createMemo(() =>
    props.mode === "when" ? "var(--color-accent-subtle)" : "var(--color-urgency-amber-bg)"
  );

  // Quick options
  const quickOptions: Array<{ label: string; iso: string }> = [
    { label: "Today", iso: toIso(todayDate) },
    { label: "Tomorrow", iso: toIso(addDays(todayDate, 1)) },
    { label: "Next week", iso: toIso(addDays(todayDate, 7)) },
  ];

  return (
    <Show when={open()}>
      {/* Overlay backdrop — click outside to close */}
      <div class="datepicker-overlay" role="dialog" aria-modal="true" aria-label={props.label}>
        {/* Click-outside backdrop */}
        <div
          class="absolute inset-0"
          role="button"
          tabIndex={-1}
          aria-label="Close date picker"
          onClick={() => props.onClose()}
          onKeyDown={(e) => e.key === "Escape" && props.onClose()}
        />
        {/* Card */}
        <div class="datepicker-card">
          {/* Header */}
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-semibold" style={{ color: accentColor() }}>
              {props.label}
            </span>
            <button
              type="button"
              class="datepicker-close-btn"
              onClick={() => props.onClose()}
              aria-label="Close date picker"
            >
              <CloseIcon class="size-3.5" />
            </button>
          </div>

          {/* Quick picks */}
          <div class="flex gap-1.5 mb-4">
            <For each={quickOptions}>
              {(opt) => (
                <button
                  type="button"
                  class="datepicker-quick-btn"
                  classList={{ active: props.currentDate === opt.iso }}
                  style={
                    props.currentDate === opt.iso
                      ? {
                          "background-color": accentBg(),
                          color: accentColor(),
                          "border-color": accentColor(),
                        }
                      : {}
                  }
                  onClick={() => props.onSelect(opt.iso)}
                >
                  {opt.label}
                </button>
              )}
            </For>
          </div>

          {/* Divider */}
          <div
            style={{
              "border-top": "1px solid var(--color-border-subtle)",
              "margin-bottom": "1rem",
            }}
          />

          {/* Month navigation */}
          <div class="flex items-center justify-between mb-3">
            <button
              type="button"
              class="datepicker-nav-btn"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              <ChevronLeftIcon class="size-4" />
            </button>
            <span class="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {monthLabel()}
            </span>
            <button
              type="button"
              class="datepicker-nav-btn"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRightIcon class="size-4" />
            </button>
          </div>

          {/* Day of week headers */}
          <div class="datepicker-grid mb-1">
            <For each={DAYS_OF_WEEK}>
              {(d) => (
                <div class="datepicker-dow" style={{ color: "var(--color-text-tertiary)" }}>
                  {d}
                </div>
              )}
            </For>
          </div>

          {/* Day cells */}
          <div class="datepicker-grid">
            <For each={calendarCells()}>
              {(cell) => {
                const isSelected = props.currentDate === cell.iso;
                const isToday = cell.iso === today;

                return (
                  <button
                    type="button"
                    class="datepicker-day"
                    classList={{
                      selected: isSelected,
                      today: isToday && !isSelected,
                      "other-month": !cell.thisMonth,
                    }}
                    style={
                      isSelected
                        ? {
                            "background-color": accentColor(),
                            color: "#fff",
                            "border-color": accentColor(),
                          }
                        : {}
                    }
                    onClick={() => props.onSelect(cell.iso)}
                    aria-label={cell.iso}
                    aria-pressed={isSelected}
                  >
                    {cell.day}
                  </button>
                );
              }}
            </For>
          </div>

          {/* Footer: clear */}
          <Show when={props.currentDate}>
            <div
              style={{
                "border-top": "1px solid var(--color-border-subtle)",
                "margin-top": "0.75rem",
                "padding-top": "0.75rem",
              }}
            >
              <button
                type="button"
                class="datepicker-clear-btn"
                onClick={() => props.onSelect(null)}
              >
                Clear date
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};
