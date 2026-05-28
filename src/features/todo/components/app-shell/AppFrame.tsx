import type { ParentComponent } from "solid-js";

export const AppFrame: ParentComponent = (props) => (
  <div class="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
    {props.children}
  </div>
);
