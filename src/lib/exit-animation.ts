import { createSignal, onCleanup } from "solid-js";

export type ExitType = "complete" | "delete" | "reopen" | null;

export function createExitAnimation() {
  const [exitType, setExitType] = createSignal<ExitType>(null);
  let exitTimeout: ReturnType<typeof setTimeout> | null = null;

  onCleanup(() => {
    if (exitTimeout) clearTimeout(exitTimeout);
  });

  const isExiting = (): boolean => exitType() !== null;

  const startExit = (type: ExitType, callback: () => void, delay: number): void => {
    setExitType(type);
    exitTimeout = setTimeout(() => {
      exitTimeout = null;
      callback();
    }, delay);
  };

  return { exitType, isExiting, startExit };
}
