import { type Component } from "solid-js";

import { TrashIcon } from "@/components/ui/Solid/TrashIcon";

interface DeleteButtonProps {
  ariaLabel: string;
  onDelete: (event: MouseEvent) => void;
  disabled?: boolean;
}

export const DeleteButton: Component<DeleteButtonProps> = (props) => (
  <button
    type="button"
    aria-label={props.ariaLabel}
    class="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 text-ink-tertiary"
    onClick={(e) => props.onDelete(e)}
    disabled={props.disabled}
  >
    <TrashIcon />
  </button>
);
