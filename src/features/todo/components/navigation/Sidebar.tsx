import {
  closestCenter,
  createSortable,
  DragDropProvider,
  DragDropSensors,
  type DragEvent,
  SortableProvider,
  transformStyle,
} from "@thisbeyond/solid-dnd";
import { type Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import type { JSX } from "solid-js";

import { moveArrayItem } from "@/lib/view-model";
import { useAppStore } from "@/state/app-store";
import type { AppView, Project } from "@/types";

import {
  FolderIcon,
  InboxIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TodayIcon,
  UpcomingIcon,
} from "../icons";

// ── Per-item icon colour tints ──────────────────────────────────────────────

const NAV_ICON_COLORS: Record<string, string> = {
  inbox: "#c2956a",
  today: "#3370ff",
  upcoming: "#4db8a0",
};

interface NavIconBadgeProps {
  view: string; // "inbox" | "today" | "upcoming"
  active: boolean;
  children: JSX.Element;
}

const NavIconBadge: Component<NavIconBadgeProps> = (props) => {
  const colour = createMemo(() => NAV_ICON_COLORS[props.view] ?? "var(--color-text-secondary)");
  return (
    <span
      class="flex shrink-0 items-center justify-center rounded-md"
      style={{
        width: "22px",
        height: "22px",
        "background-color": props.active
          ? `color-mix(in srgb, ${colour()} 18%, transparent)`
          : `color-mix(in srgb, ${colour()} 10%, transparent)`,
        color: props.active
          ? colour()
          : `color-mix(in srgb, ${colour()} 80%, var(--color-text-secondary))`,
        transition: "background-color 140ms ease, color 140ms ease",
      }}
    >
      {props.children}
    </span>
  );
};

// ── Navigation items definition ─────────────────────────────────────────────

const navigationItems: Array<{
  label: string;
  view: AppView;
  viewKey: string;
  icon: Component<{ class?: string }>;
}> = [
  { label: "Inbox", view: { type: "inbox" }, viewKey: "inbox", icon: InboxIcon },
  { label: "Today", view: { type: "today" }, viewKey: "today", icon: TodayIcon },
  { label: "Upcoming", view: { type: "upcoming" }, viewKey: "upcoming", icon: UpcomingIcon },
];

// ── ProjectItem ──────────────────────────────────────────────────────────────

interface ProjectItemProps {
  project: Project;
  count: number;
  isRenaming: boolean;
  onRenameStart: () => void;
  onRenameCommit: (title: string) => void;
  onRenameCancel: () => void;
}

const ProjectItem: Component<ProjectItemProps> = (props) => {
  const app = useAppStore();
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.project.id);

  let renameInputRef: HTMLInputElement | undefined;

  const isActive = createMemo(() => {
    const view = app.activeView();
    return view.type === "project" && view.projectId === props.project.id;
  });

  // When rename mode is entered, focus the input
  createEffect(() => {
    if (props.isRenaming) {
      // Use microtask to wait for the DOM to update
      queueMicrotask(() => {
        renameInputRef?.focus();
        renameInputRef?.select();
      });
    }
  });

  const handleClick = (): void => {
    if (props.isRenaming) return;
    if (isActive()) {
      // Second click on already-active item → enter rename mode
      props.onRenameStart();
    } else {
      app.setActiveView({ type: "project", projectId: props.project.id });
    }
  };

  const handleDoubleClick = (): void => {
    if (!props.isRenaming) props.onRenameStart();
  };

  const handleRenameKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = (event.currentTarget as HTMLInputElement).value.trim();
      props.onRenameCommit(value);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      props.onRenameCancel();
    }
  };

  const handleRenameBlur = (event: FocusEvent): void => {
    const value = (event.currentTarget as HTMLInputElement).value.trim();
    if (value) {
      props.onRenameCommit(value);
    } else {
      props.onRenameCancel();
    }
  };

  return (
    <div
      use:sortable
      ref={sortable.ref}
      style={{
        ...transformStyle(sortable.transform),
        transition: "transform 200ms ease",
        "background-color": isActive() ? "var(--color-accent-subtle)" : "transparent",
        "border-radius": "8px",
      }}
      role="button"
      tabIndex={0}
      class="group flex w-full items-center gap-2 py-1.5 pl-2 pr-2 text-left text-sm outline-none cursor-pointer"
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !props.isRenaming) {
          event.preventDefault();
          app.setActiveView({ type: "project", projectId: props.project.id });
        }
      }}
      onMouseEnter={(e) => {
        if (!isActive()) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-input)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive()) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        }
      }}
    >
      {/* Folder icon */}
      <span
        class="shrink-0"
        style={{
          color: isActive() ? "var(--color-accent)" : "var(--color-text-tertiary)",
          transition: "color 140ms ease",
        }}
      >
        <FolderIcon class="size-3.5" />
      </span>

      {/* Title — or rename input */}
      <Show
        when={props.isRenaming}
        fallback={
          <span
            class="min-w-0 flex-1 truncate text-sm"
            style={{
              color: isActive() ? "var(--color-accent)" : "var(--color-text-secondary)",
              transition: "color 140ms ease",
            }}
          >
            {props.project.title}
          </span>
        }
      >
        <input
          ref={(el) => {
            renameInputRef = el;
          }}
          type="text"
          value={props.project.title}
          class="min-w-0 flex-1 bg-transparent text-sm outline-none"
          style={{
            color: "var(--color-text-primary)",
            "border-bottom": "1px solid var(--color-border-focus)",
            "padding-bottom": "1px",
          }}
          onKeyDown={handleRenameKeyDown}
          onBlur={handleRenameBlur}
          onClick={(e) => e.stopPropagation()}
        />
      </Show>

      {/* Task count badge */}
      <Show when={!props.isRenaming}>
        <span
          class="shrink-0 font-mono text-[11px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {props.count > 0 ? props.count : ""}
        </span>
      </Show>
    </div>
  );
};

// ── Sidebar ──────────────────────────────────────────────────────────────────

export const Sidebar: Component = () => {
  const app = useAppStore();
  const [isCreating, setIsCreating] = createSignal(false);
  const [renamingProjectId, setRenamingProjectId] = createSignal<string | null>(null);

  let createInputRef: HTMLInputElement | undefined;

  const projectIds = createMemo(() => app.openProjects().map((p) => p.id));

  // When create mode is entered, focus the input
  const enterCreateMode = (): void => {
    setIsCreating(true);
    queueMicrotask(() => createInputRef?.focus());
  };

  const exitCreateMode = (): void => {
    // Clear the value BEFORE setIsCreating so that the blur fired on
    // input unmount sees an empty value and won't create a duplicate project.
    if (createInputRef) createInputRef.value = "";
    setIsCreating(false);
  };

  const handleCreateKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = (event.currentTarget as HTMLInputElement).value.trim();
      if (value) {
        void app.createProject(value).then(() => exitCreateMode());
      } else {
        exitCreateMode();
      }
    }
    if (event.key === "Escape") {
      event.preventDefault();
      exitCreateMode();
    }
  };

  const handleCreateBlur = (event: FocusEvent): void => {
    const value = (event.currentTarget as HTMLInputElement).value.trim();
    if (value) {
      void app.createProject(value).then(() => exitCreateMode());
    } else {
      exitCreateMode();
    }
  };

  const handleProjectDragEnd = async (event: DragEvent): Promise<void> => {
    if (!event.draggable || !event.droppable) return;
    const ids = projectIds();
    const fromIndex = ids.indexOf(String(event.draggable.id));
    const toIndex = ids.indexOf(String(event.droppable.id));
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    await app.reorderProjects(moveArrayItem(ids, fromIndex, toIndex));
  };

  const startRename = (projectId: string): void => {
    setRenamingProjectId(projectId);
  };

  const commitRename = (projectId: string, title: string): void => {
    if (title && title !== app.openProjects().find((p) => p.id === projectId)?.title) {
      void app.updateProject(projectId, { title });
    }
    setRenamingProjectId(null);
  };

  const cancelRename = (): void => {
    setRenamingProjectId(null);
  };

  return (
    <aside
      class="flex h-full w-full flex-col py-4"
      style={{
        "background-color": "var(--color-bg-surface)",
        "border-right": "1px solid var(--color-border-subtle)",
      }}
    >
      {/* ── App wordmark ── */}
      <div class="mb-3 px-4">
        <span
          class="text-sm font-semibold tracking-tight select-none"
          style={{ color: "var(--color-text-primary)" }}
        >
          Done
        </span>
      </div>

      {/* ── Search row ── */}
      <div class="px-2 mb-1">
        <button
          type="button"
          class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
          onClick={() => app.openCommandPalette()}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-input)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          <span
            class="flex shrink-0 items-center justify-center rounded-md"
            style={{
              width: "22px",
              height: "22px",
              "background-color": "color-mix(in srgb, var(--color-text-tertiary) 12%, transparent)",
              color: "var(--color-text-tertiary)",
            }}
          >
            <SearchIcon class="size-3.5" />
          </span>
          <span class="flex-1 text-left" style={{ color: "var(--color-text-secondary)" }}>
            Search
          </span>
          <kbd
            class="font-mono text-[10px] opacity-50"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav class="px-2 space-y-0.5 mb-5">
        <For each={navigationItems}>
          {(item) => {
            const active = createMemo(() => app.activeView().type === item.view.type);
            const Icon = item.icon;

            return (
              <button
                type="button"
                class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium outline-none transition-colors"
                style={{
                  "background-color": active() ? "var(--color-accent-subtle)" : "transparent",
                  color: active() ? "var(--color-accent)" : "var(--color-text-secondary)",
                  transition: "background-color 140ms ease, color 140ms ease",
                }}
                onClick={() => app.setActiveView(item.view)}
                onMouseEnter={(e) => {
                  if (!active()) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--color-bg-input)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active()) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                <NavIconBadge view={item.viewKey} active={active()}>
                  <Icon class="size-3.5" />
                </NavIconBadge>
                <span>{item.label}</span>
              </button>
            );
          }}
        </For>
      </nav>

      {/* ── Projects section ── */}
      <div class="flex items-center justify-between px-4 mb-1">
        <h2
          class="text-[10px] font-semibold uppercase tracking-widest select-none"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Projects
        </h2>
      </div>

      {/* Project list */}
      <div class="min-h-0 flex-1 overflow-y-auto px-2">
        <DragDropProvider collisionDetector={closestCenter} onDragEnd={handleProjectDragEnd}>
          <DragDropSensors />
          <SortableProvider ids={projectIds()}>
            <div class="space-y-0.5">
              <For each={app.openProjects()}>
                {(project) => (
                  <ProjectItem
                    project={project}
                    count={app.projectCountMap().get(project.id) ?? 0}
                    isRenaming={renamingProjectId() === project.id}
                    onRenameStart={() => startRename(project.id)}
                    onRenameCommit={(title) => commitRename(project.id, title)}
                    onRenameCancel={cancelRename}
                  />
                )}
              </For>
            </div>
          </SortableProvider>
        </DragDropProvider>

        {/* New Project ghost row / inline create input */}
        <div class="mt-1">
          <Show
            when={isCreating()}
            fallback={
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors outline-none"
                style={{
                  color: "var(--color-text-tertiary)",
                  opacity: "0.6",
                }}
                onClick={enterCreateMode}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-input)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "0.6";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                <PlusIcon class="size-3.5 shrink-0" />
                <span>New Project</span>
              </button>
            }
          >
            <div
              class="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={{
                "background-color": "var(--color-bg-input)",
                border: "1px solid var(--color-border-focus)",
              }}
            >
              <span style={{ color: "var(--color-text-tertiary)" }}>
                <FolderIcon class="size-3.5 shrink-0" />
              </span>
              <input
                ref={(el) => {
                  createInputRef = el;
                }}
                type="text"
                placeholder="Project name…"
                class="min-w-0 flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--color-text-primary)" }}
                onKeyDown={handleCreateKeyDown}
                onBlur={handleCreateBlur}
              />
            </div>
          </Show>
        </div>
      </div>

      {/* ── Settings ── */}
      <div class="mt-2 px-2">
        <button
          type="button"
          class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors outline-none"
          style={{
            color: "var(--color-text-tertiary)",
            opacity: "0.7",
          }}
          onClick={() => app.openSettings()}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-input)";
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.opacity = "0.7";
          }}
        >
          <span
            class="flex shrink-0 items-center justify-center rounded-md"
            style={{
              width: "22px",
              height: "22px",
              "background-color": "color-mix(in srgb, var(--color-text-tertiary) 10%, transparent)",
            }}
          >
            <SettingsIcon class="size-3.5" />
          </span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
