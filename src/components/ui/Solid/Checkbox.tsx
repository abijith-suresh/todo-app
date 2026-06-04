import { type Component, Match, Switch } from "solid-js";

interface CheckboxProps {
  status: "active" | "completed";
  ariaLabel: string;
  onToggle: () => void;
  disabled?: boolean;
}

export const Checkbox: Component<CheckboxProps> = (props) => (
  <Switch>
    <Match when={props.status === "active"}>
      <input
        type="checkbox"
        aria-label={props.ariaLabel}
        class="task-checkbox shrink-0"
        onChange={() => props.onToggle()}
        disabled={props.disabled}
      />
    </Match>
    <Match when={props.status === "completed"}>
      <button
        type="button"
        aria-label={props.ariaLabel}
        class="task-checkbox-done shrink-0"
        onClick={() => props.onToggle()}
        disabled={props.disabled}
      />
    </Match>
  </Switch>
);
