import type { Preferences, ThemeMode } from "../types";

const PREFERENCES_KEY = "todo-app:preferences:v1";

export const defaultPreferences: Preferences = {
  theme: "system",
};

export const resolveThemeMode = (theme: ThemeMode): Exclude<ThemeMode, "system"> => {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
};

export const loadPreferences = (): Preferences => {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);

    if (!raw) {
      return defaultPreferences;
    }

    const parsed = JSON.parse(raw) as Partial<Preferences>;
    if (parsed.theme === "system" || parsed.theme === "light" || parsed.theme === "dark") {
      return {
        theme: parsed.theme,
      };
    }
  } catch (error) {
    console.warn("Unable to load preferences", error);
  }

  return defaultPreferences;
};

export const savePreferences = (preferences: Preferences): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
};
