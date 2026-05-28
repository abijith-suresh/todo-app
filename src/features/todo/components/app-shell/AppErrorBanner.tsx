import { Show } from "solid-js";

import { IconButton } from "@/components/ui/button";
import { useAppStore } from "@/state/app-store";

import { CloseIcon } from "../icons";

export const AppErrorBanner = () => {
  const app = useAppStore();

  return (
    <Show when={app.errorMessage()}>
      {(message) => (
        <div class="mx-6 mt-4 flex items-center justify-between gap-3 rounded-lg border border-[var(--color-urgency-red)] bg-[var(--color-urgency-red-bg)] px-4 py-3 text-sm text-[var(--color-urgency-red)]">
          <span>{message()}</span>
          <IconButton
            label="Dismiss error"
            size="iconSm"
            variant="ghost"
            class="shrink-0 opacity-70 hover:opacity-100"
            onClick={() => app.clearError()}
          >
            <CloseIcon class="size-4" />
          </IconButton>
        </div>
      )}
    </Show>
  );
};
