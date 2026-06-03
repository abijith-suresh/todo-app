import { type Component, createSignal } from "solid-js";

import { useAppStore } from "@/state/app-store";

interface QuickAddProps {
  inputRef?: (element: HTMLInputElement) => void;
}

export const QuickAdd: Component<QuickAddProps> = (props) => {
  const app = useAppStore();
  const [title, setTitle] = createSignal("");

  let inputRef: HTMLInputElement | undefined;

  const submit = async (event?: Event): Promise<void> => {
    event?.preventDefault();
    if (!title().trim()) return;
    await app.createTask(title());
    setTitle("");
    inputRef?.focus();
  };

  return (
    <form onSubmit={(event) => void submit(event)}>
      <input
        ref={(el) => {
          inputRef = el;
          props.inputRef?.(el);
        }}
        value={title()}
        onInput={(event) => setTitle(event.currentTarget.value)}
        placeholder="Add a task…"
        class="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm outline-none transition-colors"
        style={{
          color: "var(--color-text-primary)",
          "border-color": "var(--color-border-default)",
        }}
        autocomplete="off"
      />
    </form>
  );
};
