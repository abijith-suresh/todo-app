import type { Component, JSX } from "solid-js";

interface IconProps {
  class?: string;
}

const createIcon = (path: JSX.Element): Component<IconProps> => {
  const Icon: Component<IconProps> = (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class ?? "size-4"}
      aria-hidden="true"
    >
      {path}
    </svg>
  );

  return Icon;
};

export const InboxIcon = createIcon(<path d="M4 5h16v11H4zM4 13h5l2 3h2l2-3h5" />);
export const TodayIcon = createIcon(
  <>
    <path d="M7 3v4" />
    <path d="M17 3v4" />
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16" />
  </>
);
export const UpcomingIcon = createIcon(
  <>
    <path d="M6 4h12" />
    <path d="M6 10h12" />
    <path d="M6 16h8" />
    <path d="M18 14l2 2-2 2" />
  </>
);
export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
);
export const SettingsIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.87l.06.06a2 2 0 0 1-2.82 2.82l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.05A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.33l-.06.06a2 2 0 0 1-2.82-2.82l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.05A1.7 1.7 0 0 0 4.6 9 1.7 1.7 0 0 0 4.27 7.13l-.06-.06a2 2 0 0 1 2.82-2.82l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.05A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.33l.06-.06a2 2 0 0 1 2.82 2.82l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.05A1.7 1.7 0 0 0 19.4 15Z" />
  </>
);
export const StarIcon = createIcon(
  <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
);
export const DragHandleIcon = createIcon(
  <>
    <circle cx="9" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="17" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="17" r="1" fill="currentColor" stroke="none" />
  </>
);
export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />);
export const CloseIcon = createIcon(<path d="m6 6 12 12M18 6 6 18" />);
export const ChevronUpIcon = createIcon(<path d="m6 14 6-6 6 6" />);
export const ChevronDownIcon = createIcon(<path d="m6 10 6 6 6-6" />);
export const TrashIcon = createIcon(
  <>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M6 7l1 12h10l1-12" />
    <path d="M9 7V4h6v3" />
  </>
);
