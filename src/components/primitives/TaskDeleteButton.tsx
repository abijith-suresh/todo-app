import { type Component } from "solid-js";

import { TrashIcon } from "@/components/icons/TrashIcon";

interface TaskDeleteButtonProps {
  ariaLabel: string;
  onDelete: (event: MouseEvent) => void;
  disabled?: boolean;
}

export const TaskDeleteButton: Component<TaskDeleteButtonProps> = (props) => (
  <button
    type="button"
    aria-label={props.ariaLabel}
    class="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
    style={{ color: "var(--color-text-tertiary)" }}
    onClick={props.onDelete}
    disabled={props.disabled}
  >
    <TrashIcon />
  </button>
);
