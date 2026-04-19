import {
  closestCenter,
  DragDropProvider,
  DragDropSensors,
  type DragEvent,
  SortableProvider,
} from "@thisbeyond/solid-dnd";
import { type Component, createMemo, For } from "solid-js";

import { moveArrayItem, moveIdWithinOrder } from "../lib/view-model";
import type { Task } from "../types";
import { TaskRow } from "./TaskRow";

interface SortableTaskListProps {
  tasks: Task[];
  sectionTitle?: string;
  mutedTitle?: boolean;
  onReorder: (orderedIds: string[]) => Promise<void>;
}

export const SortableTaskList: Component<SortableTaskListProps> = (props) => {
  const ids = createMemo(() => props.tasks.map((task) => task.id));

  const handleDragEnd = async (event: DragEvent): Promise<void> => {
    if (!event.draggable || !event.droppable) {
      return;
    }

    const orderedIds = ids();
    const fromIndex = orderedIds.indexOf(String(event.draggable.id));
    const toIndex = orderedIds.indexOf(String(event.droppable.id));

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }

    await props.onReorder(moveArrayItem(orderedIds, fromIndex, toIndex));
  };

  return (
    <section class="space-y-3">
      {props.sectionTitle ? (
        <div class="flex items-center gap-2 px-1">
          <h2
            classList={{
              "text-zinc-500": props.mutedTitle,
            }}
            class="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300"
          >
            {props.sectionTitle}
          </h2>
          <div class="h-px flex-1 bg-white/10" />
        </div>
      ) : null}

      <DragDropProvider collisionDetector={closestCenter} onDragEnd={handleDragEnd}>
        <DragDropSensors />
        <SortableProvider ids={ids()}>
          <div class="space-y-2">
            <For each={props.tasks}>
              {(task, index) => (
                <TaskRow
                  task={task}
                  canMoveUp={index() > 0}
                  canMoveDown={index() < props.tasks.length - 1}
                  onMove={(direction) =>
                    void props.onReorder(moveIdWithinOrder(ids(), task.id, direction))
                  }
                />
              )}
            </For>
          </div>
        </SortableProvider>
      </DragDropProvider>
    </section>
  );
};
