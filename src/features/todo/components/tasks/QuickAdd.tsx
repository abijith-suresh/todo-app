import { type Component, createSignal } from "solid-js";

import { useAppStore } from "@/state/app-store";

export const QuickAdd: Component = () => {
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
        }}
        value={title()}
        onInput={(event) => setTitle(event.currentTarget.value)}
        placeholder="What do you want to do today?"
        class="w-full bg-transparent pb-3 text-base outline-none transition-colors placeholder:italic"
        style={{
          color: "var(--color-text-primary)",
          "border-bottom": "1px solid var(--color-border-default)",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderBottomColor = "var(--color-accent)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLInputElement).style.borderBottomColor =
            "var(--color-border-default)";
        }}
        autocomplete="off"
      />
    </form>
  );
};
