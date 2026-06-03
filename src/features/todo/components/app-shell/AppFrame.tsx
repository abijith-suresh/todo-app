import type { ParentComponent } from "solid-js";

export const AppFrame: ParentComponent = (props) => (
  <div
    class="min-h-screen"
    style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}
  >
    {props.children}
  </div>
);
