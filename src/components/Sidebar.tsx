import {
  closestCenter,
  createSortable,
  DragDropProvider,
  DragDropSensors,
  type DragEvent,
  SortableProvider,
  transformStyle,
} from "@thisbeyond/solid-dnd";
import { type Component, createMemo, createSignal, For } from "solid-js";

import { moveArrayItem, moveIdWithinOrder } from "../lib/view-model";
import { useAppStore } from "../state/app-store";
import type { AppView, Project } from "../types";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DragHandleIcon,
  InboxIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TodayIcon,
  UpcomingIcon,
} from "./icons";

const navigationItems: Array<{
  label: string;
  view: AppView;
  icon: Component<{ class?: string }>;
}> = [
  { label: "Inbox", view: { type: "inbox" }, icon: InboxIcon },
  { label: "Today", view: { type: "today" }, icon: TodayIcon },
  { label: "Upcoming", view: { type: "upcoming" }, icon: UpcomingIcon },
];

interface ProjectItemProps {
  project: Project;
  count: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
}

const ProjectItem: Component<ProjectItemProps> = (props) => {
  const app = useAppStore();
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.project.id);
  const isActive = createMemo(() => {
    const view = app.activeView();
    return view.type === "project" && view.projectId === props.project.id;
  });

  return (
    <div
      use:sortable
      ref={sortable.ref}
      style={{
        ...transformStyle(sortable.transform),
        transition: "transform 200ms ease",
      }}
      role="button"
      tabIndex={0}
      classList={{
        "border-sky-400/60 bg-sky-500/10 text-white": isActive(),
      }}
      class="group flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-sm text-zinc-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
      onClick={() => app.setActiveView({ type: "project", projectId: props.project.id })}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          app.setActiveView({ type: "project", projectId: props.project.id });
        }
      }}
    >
      <DragHandleIcon class="size-4 text-zinc-500" />
      <span class="min-w-0 flex-1 truncate">{props.project.title}</span>
      <span class="rounded-full bg-white/7 px-2 py-0.5 text-xs text-zinc-400">{props.count}</span>
      <div class="hidden flex-col gap-1 opacity-0 transition group-hover:opacity-100 md:flex">
        <button
          type="button"
          aria-label="Move project up"
          disabled={!props.canMoveUp}
          class="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={(event) => {
            event.stopPropagation();
            props.onMove(-1);
          }}
        >
          <ChevronUpIcon class="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Move project down"
          disabled={!props.canMoveDown}
          class="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={(event) => {
            event.stopPropagation();
            props.onMove(1);
          }}
        >
          <ChevronDownIcon class="size-3.5" />
        </button>
      </div>
    </div>
  );
};

export const Sidebar: Component = () => {
  const app = useAppStore();
  const [projectTitle, setProjectTitle] = createSignal("");
  const projectIds = createMemo(() => app.openProjects().map((project) => project.id));

  const handleProjectSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const created = await app.createProject(projectTitle());
    if (created) {
      setProjectTitle("");
    }
  };

  const handleProjectDragEnd = async (event: DragEvent): Promise<void> => {
    if (!event.draggable || !event.droppable) {
      return;
    }

    const ids = projectIds();
    const fromIndex = ids.indexOf(String(event.draggable.id));
    const toIndex = ids.indexOf(String(event.droppable.id));

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }

    await app.reorderProjects(moveArrayItem(ids, fromIndex, toIndex));
  };

  return (
    <aside class="flex h-full w-full max-w-xs flex-col border-r border-white/10 bg-black/30 px-4 py-5 backdrop-blur-xl">
      <div class="mb-6 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Local-first</p>
          <h1 class="text-lg font-semibold text-white">todo-app</h1>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
          onClick={() => app.openCommandPalette()}
        >
          <SearchIcon class="size-4" />
          <span class="hidden sm:inline">Search</span>
          <span class="rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] text-zinc-400">
            ⌘K
          </span>
        </button>
      </div>

      <nav class="space-y-1">
        <For each={navigationItems}>
          {(item) => {
            const active = createMemo(() => app.activeView().type === item.view.type);
            const Icon = item.icon;

            return (
              <button
                type="button"
                classList={{
                  "border-sky-400/60 bg-sky-500/10 text-white": active(),
                }}
                class="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                onClick={() => app.setActiveView(item.view)}
              >
                <Icon class="size-4" />
                <span>{item.label}</span>
              </button>
            );
          }}
        </For>
      </nav>

      <div class="mt-8 flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Projects</h2>
        <span class="text-xs text-zinc-500">{app.openProjects().length}</span>
      </div>

      <form
        class="mt-3 flex items-center gap-2"
        onSubmit={(event) => void handleProjectSubmit(event)}
      >
        <input
          value={projectTitle()}
          onInput={(event) => setProjectTitle(event.currentTarget.value)}
          placeholder="New project"
          class="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-sky-400/60"
        />
        <button
          type="submit"
          class="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-200 transition hover:bg-white/10"
          aria-label="Create project"
        >
          <PlusIcon class="size-4" />
        </button>
      </form>

      <div class="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <DragDropProvider collisionDetector={closestCenter} onDragEnd={handleProjectDragEnd}>
          <DragDropSensors />
          <SortableProvider ids={projectIds()}>
            <div class="space-y-1">
              <For each={app.openProjects()}>
                {(project, index) => (
                  <ProjectItem
                    project={project}
                    count={app.projectCountMap().get(project.id) ?? 0}
                    canMoveUp={index() > 0}
                    canMoveDown={index() < app.openProjects().length - 1}
                    onMove={(direction) =>
                      void app.reorderProjects(
                        moveIdWithinOrder(projectIds(), project.id, direction)
                      )
                    }
                  />
                )}
              </For>
            </div>
          </SortableProvider>
        </DragDropProvider>
      </div>

      <button
        type="button"
        class="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
        onClick={() => app.openSettings()}
      >
        <SettingsIcon class="size-4" />
        <span>Settings</span>
      </button>
    </aside>
  );
};
