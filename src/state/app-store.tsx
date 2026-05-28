import Fuse from "fuse.js";
import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  type ParentComponent,
  untrack,
  useContext,
} from "solid-js";

import { compareIsoDate, getNowIso, getTodayIso } from "../lib/date";
import { createId } from "../lib/id";
import { createSnapshot, parseSnapshot } from "../lib/snapshot";
import {
  applySubsetOrder,
  getInboxTasks,
  getPreferredViewForTask,
  getProjectCountMap,
  getProjectTasks,
  getTodaySections,
  getUpcomingGroups,
  sortProjects,
  sortTasks,
} from "../lib/view-model";
import { todoStorage } from "../storage/database";
import {
  defaultPreferences,
  loadPreferences,
  resolveThemeMode,
  savePreferences,
} from "../storage/preferences";
import type { AppView, Preferences, Project, SearchResultItem, Task, ThemeMode } from "../types";

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

interface CreateTaskInput {
  title: string;
  notes?: string;
  starred?: boolean;
  whenDate?: string | null;
  dueDate?: string | null;
  projectId?: string | null;
}

interface AppStore {
  tasks: Accessor<Task[]>;
  projects: Accessor<Project[]>;
  preferences: Accessor<Preferences>;
  activeView: Accessor<AppView>;
  selectedTaskId: Accessor<string | null>;
  focusedTaskId: Accessor<string | null>;
  isHydrated: Accessor<boolean>;
  isSettingsOpen: Accessor<boolean>;
  isCommandPaletteOpen: Accessor<boolean>;
  commandQuery: Accessor<string>;
  errorMessage: Accessor<string | null>;
  completingTaskIds: Accessor<string[]>;
  openProjects: Accessor<Project[]>;
  openTasks: Accessor<Task[]>;
  inboxTasks: Accessor<Task[]>;
  todaySections: Accessor<{ overdue: Task[]; today: Task[] }>;
  upcomingGroups: Accessor<{ date: string; label: string; tasks: Task[] }[]>;
  activeProject: Accessor<Project | undefined>;
  selectedTask: Accessor<Task | undefined>;
  projectCountMap: Accessor<Map<string, number>>;
  searchResults: Accessor<SearchResultItem[]>;
  completedViewTasks: Accessor<Task[]>;
  setActiveView: (view: AppView) => void;
  setFocusedTaskId: (taskId: string | null) => void;
  setCommandQuery: (value: string) => void;
  openTask: (taskId: string, navigateToTask?: boolean) => void;
  closeTask: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  clearError: () => void;
  createTask: (input: CreateTaskInput) => Promise<boolean>;
  updateTask: (taskId: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => Promise<void>;
  toggleTaskStar: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  reopenTask: (taskId: string) => Promise<void>;
  cancelComplete: (taskId: string) => void;
  reorderTasks: (orderedIds: string[]) => Promise<void>;
  createProject: (title: string) => Promise<boolean>;
  updateProject: (
    projectId: string,
    patch: Partial<Omit<Project, "id" | "createdAt">>
  ) => Promise<void>;
  completeProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  reorderProjects: (orderedIds: string[]) => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  confirmState: Accessor<ConfirmState | null>;
  showConfirm: (state: ConfirmState) => void;
  dismissConfirm: () => void;
}

const AppContext = createContext<AppStore>();

const applyDocumentTheme = (theme: ThemeMode): void => {
  const resolved = resolveThemeMode(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
};

const hasChanged = <T extends { id: string }>(current: T[], next: T[]): T[] => {
  const currentById = new Map(current.map((item) => [item.id, item]));

  return next.filter((item) => {
    const previous = currentById.get(item.id);
    return JSON.stringify(previous) !== JSON.stringify(item);
  });
};

const nextSortOrder = <T extends { sortOrder: number }>(items: T[]): number => {
  const maxSortOrder = items.reduce((highest, item) => Math.max(highest, item.sortOrder), 0);
  return maxSortOrder + 1000;
};

export const AppProvider: ParentComponent = (props) => {
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [preferences, setPreferences] = createSignal<Preferences>(loadPreferences());
  const [activeView, setActiveViewSignal] = createSignal<AppView>({ type: "inbox" });
  const [selectedTaskId, setSelectedTaskId] = createSignal<string | null>(null);
  const [focusedTaskId, setFocusedTaskId] = createSignal<string | null>(null);
  const [isHydrated, setIsHydrated] = createSignal(false);
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = createSignal(false);
  const [commandQuery, setCommandQuery] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [completingTaskIds, setCompletingTaskIds] = createSignal<string[]>([]);
  const [confirmState, setConfirmState] = createSignal<ConfirmState | null>(null);

  // Non-reactive map of taskId → pending completion timeout ID
  const completionTimers = new Map<string, ReturnType<typeof globalThis.setTimeout>>();

  const showConfirm = (state: ConfirmState): void => {
    setConfirmState(state);
  };
  const dismissConfirm = (): void => {
    setConfirmState(null);
  };

  let errorTimeout: ReturnType<typeof globalThis.setTimeout> | undefined;

  const reportError = (message: string): void => {
    setErrorMessage(message);
    globalThis.clearTimeout(errorTimeout);
    errorTimeout = globalThis.setTimeout(() => setErrorMessage(null), 5000);
  };

  onCleanup(() => globalThis.clearTimeout(errorTimeout));

  const setActiveView = (view: AppView): void => {
    if (view.type === "project") {
      const projectExists = projects().some(
        (project) => project.id === view.projectId && project.status === "open"
      );
      setActiveViewSignal(projectExists ? view : { type: "inbox" });
      return;
    }

    setActiveViewSignal(view);
  };

  const openProjects = createMemo(() =>
    sortProjects(projects().filter((project) => project.status === "open"))
  );
  const openTasks = createMemo(() => sortTasks(tasks().filter((task) => task.status === "open")));
  const inboxTasks = createMemo(() => getInboxTasks(openTasks()));
  const todaySections = createMemo(() => getTodaySections(openTasks()));
  const upcomingGroups = createMemo(() => getUpcomingGroups(openTasks()));
  const projectCountMap = createMemo(() => getProjectCountMap(openTasks()));
  const activeProject = createMemo(() => {
    const view = activeView();
    return view.type === "project"
      ? openProjects().find((project) => project.id === view.projectId)
      : undefined;
  });
  const selectedTask = createMemo(() => tasks().find((task) => task.id === selectedTaskId()));

  // Completed tasks for the current view — project views only
  const completedViewTasks = createMemo(() => {
    const view = activeView();
    if (view.type !== "project") return [];
    const completed = tasks().filter((t) => t.status === "completed");
    return completed.filter((t) => t.projectId === view.projectId);
  });

  const searchableItems = createMemo(() => {
    const projectNames = new Map(projects().map((project) => [project.id, project.title]));

    return openTasks().map((task) => ({
      taskId: task.id,
      title: task.title,
      notes: task.notes,
      projectName: task.projectId ? (projectNames.get(task.projectId) ?? "Inbox") : "Inbox",
      dateLabel: task.whenDate ?? task.dueDate,
    }));
  });

  const searchIndex = createMemo(
    () =>
      new Fuse(searchableItems(), {
        threshold: 0.35,
        ignoreLocation: true,
        keys: ["title", "notes", "projectName"],
      })
  );

  const searchResults = createMemo(() => {
    const query = commandQuery().trim();

    if (!query) {
      return searchableItems().slice(0, 10);
    }

    return searchIndex()
      .search(query, { limit: 10 })
      .map((result) => result.item);
  });

  const persistTasks = async (current: Task[], next: Task[]): Promise<void> => {
    const changed = hasChanged(current, next);
    await Promise.all(changed.map((task) => todoStorage.saveTask(task)));
  };

  const persistProjects = async (current: Project[], next: Project[]): Promise<void> => {
    const changed = hasChanged(current, next);
    await Promise.all(changed.map((project) => todoStorage.saveProject(project)));
  };

  const loadData = async (): Promise<void> => {
    try {
      const [loadedTasks, loadedProjects] = await Promise.all([
        todoStorage.listTasks(),
        todoStorage.listProjects(),
      ]);
      // Roll over stale whenDates to today (Things 3-style carry-forward)
      const today = getTodayIso();
      const rolled = loadedTasks.map((task) => {
        if (task.status === "open" && task.whenDate && compareIsoDate(task.whenDate, today) < 0) {
          return { ...task, whenDate: today, updatedAt: getNowIso() };
        }
        return task;
      });
      const rolledChanged = rolled.filter((t, i) => t !== loadedTasks[i]);
      if (rolledChanged.length > 0) {
        await Promise.all(rolledChanged.map((t) => todoStorage.saveTask(t)));
      }

      setTasks(sortTasks(rolled));
      setProjects(sortProjects(loadedProjects));
      applyDocumentTheme(preferences().theme);
    } catch (error) {
      console.error(error);
      reportError("Unable to load local data.");
    } finally {
      setIsHydrated(true);
    }
  };

  onMount(() => {
    void loadData();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onThemeChange = () => {
      if (preferences().theme === "system") {
        applyDocumentTheme("system");
      }
    };

    media.addEventListener("change", onThemeChange);
    onCleanup(() => media.removeEventListener("change", onThemeChange));
  });

  createEffect(() => {
    savePreferences(preferences());
    applyDocumentTheme(preferences().theme);
  });

  const openTask = (taskId: string, navigateToTask = false): void => {
    const task = tasks().find((candidate) => candidate.id === taskId);
    if (!task) {
      return;
    }

    if (navigateToTask) {
      setActiveView(getPreferredViewForTask(task, projects(), getTodayIso()));
    }

    setSelectedTaskId(taskId);
    setFocusedTaskId(taskId);
    setIsCommandPaletteOpen(false);
    setCommandQuery("");
  };

  const closeTask = (): void => {
    setSelectedTaskId(null);
  };

  const clearError = (): void => {
    setErrorMessage(null);
  };

  const createTask = async (input: CreateTaskInput): Promise<boolean> => {
    const title = input.title.trim();
    if (!title) {
      return false;
    }

    const now = getNowIso();
    const task: Task = {
      id: createId(),
      title,
      notes: input.notes?.trim() ?? "",
      status: "open",
      starred: Boolean(input.starred),
      whenDate: input.whenDate ?? null,
      dueDate: input.dueDate ?? null,
      projectId: input.projectId ?? null,
      sortOrder: nextSortOrder(tasks()),
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    const current = tasks();
    const next = sortTasks([...current, task]);
    setTasks(next);

    try {
      await todoStorage.saveTask(task);
      return true;
    } catch (error) {
      console.error(error);
      setTasks(current);
      reportError("Unable to create task.");
      return false;
    }
  };

  const updateTask = async (
    taskId: string,
    patch: Partial<Omit<Task, "id" | "createdAt">>
  ): Promise<void> => {
    const current = tasks();
    const existing = current.find((task) => task.id === taskId);
    if (!existing) {
      return;
    }

    const nextTask: Task = {
      ...existing,
      ...patch,
      title:
        typeof patch.title === "string" ? patch.title.trim() || existing.title : existing.title,
      updatedAt: getNowIso(),
    };
    const next = sortTasks(current.map((task) => (task.id === taskId ? nextTask : task)));
    setTasks(next);

    try {
      await persistTasks(current, next);
    } catch (error) {
      console.error(error);
      setTasks(current);
      reportError("Unable to update task.");
    }
  };

  const toggleTaskStar = async (taskId: string): Promise<void> => {
    const task = tasks().find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    await updateTask(taskId, { starred: !task.starred });
  };

  const cancelComplete = (taskId: string): void => {
    const timerId = completionTimers.get(taskId);
    if (timerId !== undefined) {
      globalThis.clearTimeout(timerId);
      completionTimers.delete(taskId);
    }
    setCompletingTaskIds((ids) => ids.filter((id) => id !== taskId));
  };

  const completeTask = async (taskId: string): Promise<void> => {
    if (completingTaskIds().includes(taskId)) {
      return;
    }

    setCompletingTaskIds((current) => [...current, taskId]);

    // eslint-disable-next-line solid/reactivity
    const timerId = globalThis.setTimeout(async () => {
      completionTimers.delete(taskId);
      const current = untrack(tasks);
      const existing = current.find((task) => task.id === taskId);
      if (!existing) {
        setCompletingTaskIds((ids) => ids.filter((id) => id !== taskId));
        return;
      }

      const now = getNowIso();
      const nextTask: Task = {
        ...existing,
        status: "completed",
        completedAt: now,
        updatedAt: now,
      };
      const next = sortTasks(current.map((task) => (task.id === taskId ? nextTask : task)));
      setTasks(next);
      setCompletingTaskIds((ids) => ids.filter((id) => id !== taskId));

      if (selectedTaskId() === taskId) {
        setSelectedTaskId(null);
      }

      try {
        await todoStorage.saveTask(nextTask);
      } catch (error) {
        console.error(error);
        reportError("Unable to complete task.");
      }
    }, 720);

    completionTimers.set(taskId, timerId);
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const current = tasks();
    const next = current.filter((task) => task.id !== taskId);
    setTasks(next);
    setCompletingTaskIds((ids) => ids.filter((id) => id !== taskId));

    if (selectedTaskId() === taskId) {
      setSelectedTaskId(null);
    }

    try {
      await todoStorage.deleteTask(taskId);
    } catch (error) {
      console.error(error);
      setTasks(current);
      reportError("Unable to delete task.");
    }
  };

  const reopenTask = async (taskId: string): Promise<void> => {
    await updateTask(taskId, { status: "open", completedAt: null });
  };

  const reorderTasks = async (orderedIds: string[]): Promise<void> => {
    const current = tasks();
    const next = sortTasks(applySubsetOrder(current, orderedIds));
    setTasks(next);

    try {
      await persistTasks(current, next);
    } catch (error) {
      console.error(error);
      setTasks(current);
      reportError("Unable to save task order.");
    }
  };

  const createProject = async (title: string): Promise<boolean> => {
    const projectTitle = title.trim();
    if (!projectTitle) {
      return false;
    }

    const now = getNowIso();
    const project: Project = {
      id: createId(),
      title: projectTitle,
      status: "open",
      sortOrder: nextSortOrder(projects()),
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    const current = projects();
    const next = sortProjects([...current, project]);
    setProjects(next);
    setActiveView({ type: "project", projectId: project.id });

    try {
      await todoStorage.saveProject(project);
      return true;
    } catch (error) {
      console.error(error);
      setProjects(current);
      setActiveView({ type: "inbox" });
      reportError("Unable to create project.");
      return false;
    }
  };

  const updateProject = async (
    projectId: string,
    patch: Partial<Omit<Project, "id" | "createdAt">>
  ): Promise<void> => {
    const current = projects();
    const existing = current.find((project) => project.id === projectId);
    if (!existing) {
      return;
    }

    const nextProject: Project = {
      ...existing,
      ...patch,
      title:
        typeof patch.title === "string" ? patch.title.trim() || existing.title : existing.title,
      updatedAt: getNowIso(),
    };
    const next = sortProjects(
      current.map((project) => (project.id === projectId ? nextProject : project))
    );
    setProjects(next);

    try {
      await persistProjects(current, next);
    } catch (error) {
      console.error(error);
      setProjects(current);
      reportError("Unable to update project.");
    }
  };

  const completeProject = async (projectId: string): Promise<void> => {
    const currentProjects = projects();
    const currentTasks = tasks();
    const now = getNowIso();

    const nextProjects = sortProjects(
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              status: "completed",
              completedAt: now,
              updatedAt: now,
            }
          : project
      )
    );

    const nextTasks = sortTasks(
      currentTasks.map((task) =>
        task.projectId === projectId && task.status === "open"
          ? {
              ...task,
              status: "completed",
              completedAt: now,
              updatedAt: now,
            }
          : task
      )
    );

    setProjects(nextProjects);
    setTasks(nextTasks);
    {
      const view = activeView();
      if (view.type === "project" && view.projectId === projectId) {
        setActiveView({ type: "inbox" });
      }
    }
    if (selectedTask()?.projectId === projectId) {
      setSelectedTaskId(null);
    }

    try {
      await Promise.all([
        persistProjects(currentProjects, nextProjects),
        persistTasks(currentTasks, nextTasks),
      ]);
    } catch (error) {
      console.error(error);
      setProjects(currentProjects);
      setTasks(currentTasks);
      reportError("Unable to complete project.");
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    const currentProjects = projects();
    const currentTasks = tasks();
    const now = getNowIso();
    const nextProjects = currentProjects.filter((project) => project.id !== projectId);
    const nextTasks = sortTasks(
      currentTasks.map((task) =>
        task.projectId === projectId
          ? {
              ...task,
              projectId: null,
              updatedAt: now,
            }
          : task
      )
    );

    setProjects(nextProjects);
    setTasks(nextTasks);
    {
      const view = activeView();
      if (view.type === "project" && view.projectId === projectId) {
        setActiveView({ type: "inbox" });
      }
    }

    try {
      await Promise.all([
        todoStorage.deleteProject(projectId),
        persistTasks(currentTasks, nextTasks),
      ]);
    } catch (error) {
      console.error(error);
      setProjects(currentProjects);
      setTasks(currentTasks);
      reportError("Unable to delete project.");
    }
  };

  const reorderProjects = async (orderedIds: string[]): Promise<void> => {
    const current = projects();
    const next = sortProjects(applySubsetOrder(current, orderedIds));
    setProjects(next);

    try {
      await persistProjects(current, next);
    } catch (error) {
      console.error(error);
      setProjects(current);
      reportError("Unable to save project order.");
    }
  };

  const setTheme = (theme: ThemeMode): void => {
    setPreferences({ theme });
  };

  const exportData = (): void => {
    try {
      const snapshot = createSnapshot({
        tasks: tasks(),
        projects: projects(),
        preferences: preferences(),
      });
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `todo-app-backup-${getTodayIso()}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error(error);
      reportError("Unable to export data.");
    }
  };

  const importData = async (file: File): Promise<void> => {
    try {
      const raw = await file.text();
      const snapshot = parseSnapshot(JSON.parse(raw));

      await todoStorage.replaceAll(snapshot);
      savePreferences(snapshot.preferences ?? defaultPreferences);
      window.location.reload();
    } catch (error) {
      console.error(error);
      reportError(error instanceof Error ? error.message : "Unable to import data.");
    }
  };

  const store: AppStore = {
    tasks,
    projects,
    preferences,
    activeView,
    selectedTaskId,
    focusedTaskId,
    isHydrated,
    isSettingsOpen,
    isCommandPaletteOpen,
    commandQuery,
    errorMessage,
    completingTaskIds,
    openProjects,
    openTasks,
    inboxTasks,
    todaySections,
    upcomingGroups,
    activeProject,
    selectedTask,
    projectCountMap,
    searchResults,
    completedViewTasks,
    setActiveView,
    setFocusedTaskId,
    setCommandQuery,
    openTask,
    closeTask,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    openCommandPalette: () => {
      setCommandQuery("");
      setIsCommandPaletteOpen(true);
    },
    closeCommandPalette: () => {
      setIsCommandPaletteOpen(false);
      setCommandQuery("");
    },
    clearError,
    createTask,
    updateTask,
    toggleTaskStar,
    completeTask,
    deleteTask,
    reopenTask,
    cancelComplete,
    reorderTasks,
    createProject,
    updateProject,
    completeProject,
    deleteProject,
    reorderProjects,
    setTheme,
    exportData,
    importData,
    confirmState,
    showConfirm,
    dismissConfirm,
  };

  return <AppContext.Provider value={store}>{props.children}</AppContext.Provider>;
};

export const useAppStore = (): AppStore => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used inside AppProvider.");
  }

  return context;
};

export const useActiveViewTasks = (): Accessor<Task[]> => {
  const store = useAppStore();

  const activeViewTasks = createMemo(() => {
    const view = store.activeView();
    switch (view.type) {
      case "inbox":
        return store.inboxTasks();
      case "today":
        return [...store.todaySections().overdue, ...store.todaySections().today];
      case "upcoming":
        return store.upcomingGroups().flatMap((group) => group.tasks);
      case "project":
        return getProjectTasks(store.openTasks(), view.projectId);
    }
  });

  return activeViewTasks;
};
