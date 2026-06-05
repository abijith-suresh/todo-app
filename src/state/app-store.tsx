import {
  type Accessor,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  type ParentComponent,
  useContext,
} from "solid-js";

import { getNowIso, getTodayLocalIso, isAfterDays, isSameDay } from "../lib/date";
import { createId } from "../lib/id";
import { todoStorage } from "../storage/database";
import type { SearchResultGroup, Task } from "../lib/types";

interface AppStore {
  tasks: Accessor<Task[]>;
  isHydrated: Accessor<boolean>;
  focusedTaskId: Accessor<string | null>;
  isSearchOpen: Accessor<boolean>;
  searchQuery: Accessor<string>;

  activeTasks: Accessor<Task[]>;
  doneTodayTasks: Accessor<Task[]>;
  searchResults: Accessor<SearchResultGroup[]>;

  createTask: (title: string) => Promise<void>;
  updateTaskTitle: (taskId: string, title: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  reopenTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  recoverTask: (taskId: string) => Promise<void>;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  setFocusedTaskId: (id: string | null) => void;
}

const AppContext = createContext<AppStore>();

const runStateTransitions = (tasks: Task[]): { updated: Task[]; changed: boolean } => {
  const now = getNowIso();
  let changed = false;

  const updated = tasks.map((task) => {
    if (task.status === "active" && isAfterDays(task.activatedAt, 7)) {
      changed = true;
      return {
        ...task,
        status: "dormant" as const,
        dormantAt: now,
        updatedAt: now,
      };
    }
    return task;
  });

  return { updated, changed };
};

const filterTasksByQuery = (tasks: Task[], query: string): Task[] => {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return tasks.filter((task) => task.title.toLowerCase().includes(lower));
};

export const AppProvider: ParentComponent = (props) => {
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [isHydrated, setIsHydrated] = createSignal(false);
  const [focusedTaskId, setFocusedTaskId] = createSignal<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");

  const activeTasks = createMemo(() => tasks().filter((t) => t.status === "active"));

  const doneTodayTasks = createMemo(() => {
    const today = getTodayLocalIso();
    return tasks().filter(
      (t) => t.status === "completed" && t.completedAt && isSameDay(t.completedAt, today)
    );
  });

  const searchResults = createMemo(() => {
    const query = searchQuery();
    const all = tasks();

    const active = filterTasksByQuery(
      all.filter((t) => t.status === "active"),
      query
    );
    const dormant = filterTasksByQuery(
      all.filter((t) => t.status === "dormant"),
      query
    );
    const completed = filterTasksByQuery(
      all.filter((t) => t.status === "completed"),
      query
    );

    const groups: SearchResultGroup[] = [];
    if (active.length > 0) groups.push({ label: "Active", tasks: active });
    if (dormant.length > 0) groups.push({ label: "Earlier", tasks: dormant });
    if (completed.length > 0) groups.push({ label: "Completed", tasks: completed });
    return groups;
  });

  const loadData = async (): Promise<void> => {
    try {
      const loaded = await todoStorage.listTasks();
      const { updated, changed } = runStateTransitions(loaded);
      setTasks(updated);

      if (changed) {
        await Promise.all(updated.map((t) => todoStorage.saveTask(t)));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsHydrated(true);
    }
  };

  const handleVisibilityChange = async (): Promise<void> => {
    if (document.visibilityState === "visible") {
      const current = tasks();
      const { updated, changed } = runStateTransitions(current);
      if (changed) {
        setTasks(updated);
        await Promise.all(updated.map((t) => todoStorage.saveTask(t)));
      }
    }
  };

  onMount(() => {
    void loadData();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    onCleanup(() => document.removeEventListener("visibilitychange", handleVisibilityChange));
  });

  const createTask = async (title: string): Promise<void> => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const now = getNowIso();
    const task: Task = {
      id: createId(),
      title: trimmed,
      status: "active",
      createdAt: now,
      activatedAt: now,
      updatedAt: now,
      completedAt: null,
      dormantAt: null,
    };

    const current = tasks();
    setTasks([task, ...current]);

    try {
      await todoStorage.saveTask(task);
    } catch (error) {
      console.error(error);
      setTasks(current);
    }
  };

  const updateTaskTitle = async (taskId: string, title: string): Promise<void> => {
    const trimmed = title.trim();
    const current = tasks();
    const existing = current.find((t) => t.id === taskId);
    if (!existing || !trimmed) return;

    const updated: Task = { ...existing, title: trimmed, updatedAt: getNowIso() };
    setTasks(current.map((t) => (t.id === taskId ? updated : t)));

    try {
      await todoStorage.saveTask(updated);
    } catch (error) {
      console.error(error);
      setTasks(current);
    }
  };

  const completeTask = async (taskId: string): Promise<void> => {
    const current = tasks();
    const existing = current.find((t) => t.id === taskId);
    if (!existing || existing.status !== "active") return;

    const now = getNowIso();
    const updated: Task = {
      ...existing,
      status: "completed",
      completedAt: now,
      updatedAt: now,
    };
    setTasks(current.map((t) => (t.id === taskId ? updated : t)));

    try {
      await todoStorage.saveTask(updated);
    } catch (error) {
      console.error(error);
      setTasks(current);
    }
  };

  const reopenTask = async (taskId: string): Promise<void> => {
    const current = tasks();
    const existing = current.find((t) => t.id === taskId);
    if (!existing || existing.status !== "completed") return;

    const now = getNowIso();
    const updated: Task = {
      ...existing,
      status: "active",
      completedAt: null,
      updatedAt: now,
    };
    setTasks(current.map((t) => (t.id === taskId ? updated : t)));

    try {
      await todoStorage.saveTask(updated);
    } catch (error) {
      console.error(error);
      setTasks(current);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const current = tasks();
    setTasks(current.filter((t) => t.id !== taskId));

    try {
      await todoStorage.deleteTask(taskId);
    } catch (error) {
      console.error(error);
      setTasks(current);
    }
  };

  const recoverTask = async (taskId: string): Promise<void> => {
    const current = tasks();
    const existing = current.find((t) => t.id === taskId);
    if (!existing || existing.status !== "dormant") return;

    const now = getNowIso();
    const updated: Task = {
      ...existing,
      status: "active",
      activatedAt: now,
      dormantAt: null,
      updatedAt: now,
    };
    setTasks(current.map((t) => (t.id === taskId ? updated : t)));

    try {
      await todoStorage.saveTask(updated);
    } catch (error) {
      console.error(error);
      setTasks(current);
    }
  };

  const openSearch = (): void => {
    setSearchQuery("");
    setIsSearchOpen(true);
  };

  const closeSearch = (): void => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const store: AppStore = {
    tasks,
    isHydrated,
    focusedTaskId,
    isSearchOpen,
    searchQuery,
    activeTasks,
    doneTodayTasks,
    searchResults,
    createTask,
    updateTaskTitle,
    completeTask,
    reopenTask,
    deleteTask,
    recoverTask,
    openSearch,
    closeSearch,
    setSearchQuery,
    setFocusedTaskId,
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
