import { type Component, onMount, Show } from "solid-js";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/state/app-store";

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
                <Button
                  ref={(el) => {
                    cancelRef = el;
                  }}
                  variant="surface"
                  size="sm"
                  onClick={() => app.dismissConfirm()}
                >
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    state.onConfirm();
                    app.dismissConfirm();
                  }}
                >
                  {state.confirmLabel ?? "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        );
      }}
    </Show>
  );
};
