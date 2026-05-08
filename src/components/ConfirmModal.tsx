import { type Component, onMount, Show } from "solid-js";

import { useAppStore } from "../state/app-store";

export const ConfirmModal: Component = () => {
  const app = useAppStore();

  return (
    <Show when={app.confirmState()}>
      {(stateAccessor) => {
        const state = stateAccessor();
        let cancelRef: HTMLButtonElement | undefined;

        onMount(() => {
          cancelRef?.focus();
        });

        return (
          <div
            class="confirm-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            {/* Backdrop */}
            <div
              class="absolute inset-0"
              role="button"
              tabIndex={-1}
              aria-label="Close dialog"
              onClick={() => app.dismissConfirm()}
              onKeyDown={(e) => e.key === "Escape" && app.dismissConfirm()}
            />

            {/* Card */}
            <div class="confirm-card">
              <h2
                id="confirm-title"
                class="mb-2 text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {state.title}
              </h2>
              <p
                class="mb-5 text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {state.message}
              </p>

              <div class="flex items-center justify-end gap-2">
                <button
                  ref={(el) => {
                    cancelRef = el;
                  }}
                  type="button"
                  class="rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    "background-color": "var(--color-bg-input)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border-default)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--color-border-focus)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--color-border-default)";
                  }}
                  onClick={() => app.dismissConfirm()}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  class="rounded-lg px-3.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-85"
                  style={{ "background-color": "var(--color-urgency-red)" }}
                  onClick={() => {
                    state.onConfirm();
                    app.dismissConfirm();
                  }}
                >
                  {state.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>
        );
      }}
    </Show>
  );
};
