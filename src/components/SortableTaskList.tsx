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
  /** When true the section title is rendered in tertiary (muted) color */
  mutedTitle?: boolean;
  /** "overdue" renders the section title in urgency-red */
  sectionUrgency?: "overdue";
  onReorder: (orderedIds: string[]) => Promise<void>;
}

export const SortableTaskList: Component<SortableTaskListProps> = (props) => {
  const ids = createMemo(() => props.tasks.map((task) => task.id));

  const handleDragEnd = async (event: DragEvent): Promise<void> => {
    if (!event.draggable || !event.droppable) return;

    const orderedIds = ids();
    const fromIndex = orderedIds.indexOf(String(event.draggable.id));
    const toIndex = orderedIds.indexOf(String(event.droppable.id));

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    await props.onReorder(moveArrayItem(orderedIds, fromIndex, toIndex));
  };

  const titleColor = () => {
    if (props.sectionUrgency === "overdue") return "var(--color-urgency-red)";
    if (props.mutedTitle) return "var(--color-text-tertiary)";
    return "var(--color-text-tertiary)";
  };

  return (
    <section>
      {props.sectionTitle ? (
        <h2
          class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: titleColor() }}
        >
          {props.sectionTitle}
        </h2>
      ) : null}

      <DragDropProvider collisionDetector={closestCenter} onDragEnd={handleDragEnd}>
        <DragDropSensors />
        <SortableProvider ids={ids()}>
          {/* border-t so the first row gets a top divider; each row has border-b */}
          <div
            class="rounded-lg overflow-hidden"
            style={{
              border: "1px solid var(--color-border-subtle)",
            }}
          >
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
