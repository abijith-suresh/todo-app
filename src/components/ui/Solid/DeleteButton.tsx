import { type Component } from "solid-js";

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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-3.5"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  </button>
);
