import type { ParentComponent } from "solid-js";

export const AppFrame: ParentComponent = (props) => (
  <div class="min-h-screen bg-page text-ink">{props.children}</div>
);
