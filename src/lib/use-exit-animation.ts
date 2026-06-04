import { createSignal, onCleanup } from "solid-js";

type ExitType = "complete" | "delete" | "reopen" | null;

export function useExitAnimation() {
  const [exitType, setExitType] = createSignal<ExitType>(null);
  let exitTimeout: ReturnType<typeof setTimeout> | null = null;

  const isExiting = (): boolean => exitType() !== null;

  const startExit = (type: ExitType, callback: () => void, delay: number): void => {
    setExitType(type);
    exitTimeout = setTimeout(() => {
      exitTimeout = null;
      callback();
    }, delay);
  };

  const cleanup = (): void => {
    if (exitTimeout) {
      clearTimeout(exitTimeout);
      exitTimeout = null;
    }
  };

  onCleanup(() => cleanup());

  return { exitType, isExiting, startExit };
}
