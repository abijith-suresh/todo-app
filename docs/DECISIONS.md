# Decisions

Technical and design decisions, with reasoning. Useful context before changing anything structural.

---

## Framework: Astro.js

**Decision:** Use Astro.js as the main framework.

**Reasoning:** The project has two distinct parts — a mostly static marketing site (`/`, `/about`, `/features`) and a fully interactive app (`/app`). Astro's islands architecture is a natural fit: the marketing pages ship as static HTML with no JavaScript overhead, and the interactive app is a single Solid.js island. This avoids turning the entire site into a SPA for the sake of one interactive route.

---

## UI framework: Solid.js

**Decision:** Use Solid.js for the interactive app island.

**Reasoning:** Solid.js is lightweight and reactive with no virtual DOM, which suits a small, performance-sensitive UI well. It integrates cleanly with Astro's island model. React would work but adds unnecessary weight for a tool where perceived speed matters.

---

## Styling: Tailwind CSS

**Decision:** Use Tailwind CSS throughout.

**Reasoning:** Utility-first CSS removes the need to context-switch between component files and separate style files — practical for a solo project. Tailwind also ships minimal CSS in production via purging unused classes.

---

## Storage: localStorage

**Decision:** Use the browser's localStorage API to persist all data.

**Reasoning:** The app is intentionally single-device and browser-based. localStorage is synchronous, requires no setup, and is more than sufficient for the expected dataset size. A typical user will have at most a few dozen items across all states at any time — the aging system prevents unbounded growth.

**Tradeoff:** localStorage has a ~5MB limit and no query capability. The workaround is loading the full dataset into memory on startup and filtering in JavaScript. This is acceptable at this scale. If the dataset ever grew large enough to make this painful (unlikely), IndexedDB would be the natural migration path.

**Data structure:** Items are stored as a JSON array under a single key (e.g. `items`). The entire array is read on load and written on every change.

---

## No backend

**Decision:** No server, no database, no API.

**Reasoning:** The product requires no accounts and no setup. A backend would introduce deployment cost, infrastructure maintenance, and authentication complexity — none of which serves the use case. Everything the app needs is already available in the browser.

---

## Aging window: 7 days

**Decision:** Active items become dormant after 7 days.

**Reasoning:** The app is designed for work-context capture — things that come up during a working day. A 7-day window maps naturally to one working week. If something has not been acted on after a week, it has either been handled informally, forgotten, or it belongs in a proper task manager. 14 days was the initial consideration but felt too long for the intended use case.

---

## Aging is not user-configurable

**Decision:** The 7-day window is a fixed default, not a setting.

**Reasoning:** Adding a settings UI creates surface area, preference state, and decision overhead for users. The product philosophy is to stay out of the way. A sensible default is more useful here than flexibility.

---

## Completion rollover: calendar day

**Decision:** Completed items leave the main view at midnight (device local time), not 24 hours after completion.

**Reasoning:** "End of day" is the more natural mental model. A user who completes something at 11pm expects it to be gone in the morning — not at 11pm the following night.

---

## `activatedAt` as a separate field from `createdAt`

**Decision:** The 7-day aging window is calculated from `activatedAt`, not `createdAt`.

**Reasoning:** When a dormant item is recovered, the aging clock needs to restart from the recovery date. If aging ran from `createdAt`, a recovered item could immediately go dormant again (since its original creation date is days or weeks in the past). `activatedAt` is set on creation and reset on every recovery. `createdAt` is immutable and serves as a permanent record.

---

## Recovery resets the aging timer

**Decision:** Recovering a dormant item gives it a fresh 7-day window.

**Reasoning:** Recovery is a deliberate act. The user is choosing to work on this item again. Giving it a full new window respects that intent. Keeping the original timer would make recovery almost pointless for older items.

---

## State transitions on load and tab focus

**Decision:** Aging and midnight rollover checks run on app load and on the `visibilitychange` event when the tab regains focus.

**Reasoning:** The app has no background process or server. If a user leaves the tab open overnight, stale state will not self-correct. Running the check whenever the tab becomes visible ensures state is always consistent before anything is rendered or interacted with.
