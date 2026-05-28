import { type ComponentProps, type ParentProps, splitProps } from "solid-js";

import { cx } from "@/lib/cx";

type ButtonVariant = "accent" | "surface" | "ghost" | "danger" | "dangerGhost" | "accentGhost";
type ButtonSize = "sm" | "md" | "iconSm" | "icon";

interface ButtonProps extends ParentProps<ComponentProps<"button">> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  accent: "bg-[var(--color-accent)] text-white hover:opacity-85",
  surface:
    "border border-[var(--color-border-default)] bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-focus)]",
  ghost:
    "bg-transparent text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-input)] hover:text-[var(--color-text-secondary)]",
  danger: "bg-[var(--color-urgency-red)] text-white hover:opacity-85",
  dangerGhost:
    "bg-transparent text-[var(--color-text-tertiary)] hover:bg-[var(--color-urgency-red-bg)] hover:text-[var(--color-urgency-red)]",
  accentGhost:
    "bg-transparent text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  iconSm: "size-6",
  icon: "size-7",
};

export const Button = (props: ButtonProps) => {
  const [local, rest] = splitProps(props, ["children", "class", "size", "type", "variant"]);

  return (
    <button
      {...rest}
      type={local.type ?? "button"}
      class={cx(
        "inline-flex items-center justify-center rounded-lg font-medium outline-none transition-[background-color,border-color,color,opacity] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-surface)]",
        sizeClasses[local.size ?? "md"],
        variantClasses[local.variant ?? "ghost"],
        local.class
      )}
    >
      {local.children}
    </button>
  );
};

interface IconButtonProps extends Omit<ButtonProps, "size"> {
  size?: Extract<ButtonSize, "iconSm" | "icon">;
  label: string;
}

export const IconButton = (props: IconButtonProps) => {
  const [local, rest] = splitProps(props, ["label", "size"]);

  return (
    <Button {...rest} size={local.size ?? "icon"} aria-label={local.label} title={local.label} />
  );
};
