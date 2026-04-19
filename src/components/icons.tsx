import {
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Circle,
  Folder,
  GripVertical,
  Inbox,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  X,
} from "lucide-solid";
import type { Component } from "solid-js";

interface IconProps {
  class?: string;
}

export const InboxIcon: Component<IconProps> = (props) => <Inbox {...props} />;
export const TodayIcon: Component<IconProps> = (props) => <CalendarDays {...props} />;
export const UpcomingIcon: Component<IconProps> = (props) => <CalendarRange {...props} />;
export const SearchIcon: Component<IconProps> = (props) => <Search {...props} />;
export const SettingsIcon: Component<IconProps> = (props) => <Settings {...props} />;

/** Outline star — shown when a task is not starred */
export const StarIcon: Component<IconProps> = (props) => <Star {...props} />;

/** Filled star — shown when a task IS starred. Uses fill="currentColor" which overrides
 *  lucide-solid's default fill="none" (fill lands in the `rest` spread, applied after
 *  defaultAttributes, so it correctly wins). */
export const StarFilledIcon: Component<IconProps> = (props) => (
  <Star {...props} fill="currentColor" />
);

export const CircleIcon: Component<IconProps> = (props) => <Circle {...props} />;
export const FolderIcon: Component<IconProps> = (props) => <Folder {...props} />;
export const DragHandleIcon: Component<IconProps> = (props) => <GripVertical {...props} />;
export const PlusIcon: Component<IconProps> = (props) => <Plus {...props} />;
export const CloseIcon: Component<IconProps> = (props) => <X {...props} />;
export const ChevronUpIcon: Component<IconProps> = (props) => <ChevronUp {...props} />;
export const ChevronDownIcon: Component<IconProps> = (props) => <ChevronDown {...props} />;
export const TrashIcon: Component<IconProps> = (props) => <Trash2 {...props} />;
