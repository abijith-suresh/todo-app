# Product

## What this is

A fast, browser-based tool for capturing things you need to remember at work.

Not a task manager. A short-term holding area. You add something, get back to what you were doing, and the tool manages itself. Old items fade out automatically after 7 days. Nothing is permanently deleted — faded items move to a searchable archive and can be recovered at any time.

---

## The problem

You are focused on something and a small to-do comes up:

- A coworker asks you to review a pull request
- A message comes in on Teams that needs a follow-up later
- You need to remember to check something, but not right now

It is too small to justify opening a full task manager. But if you do not write it down, you will forget it.

Most tools are either too heavy (task managers with projects, priorities, due dates) or too loose (notes apps that quietly become junk drawers). This sits between the two.

---

## Core idea

Capture fast. Get back to what you were doing.

Items stay visible until you mark them done, or they fade out after 7 days. The goal is to keep the view small and focused. The tool should never feel like a graveyard of things you have not done.

---

## What this is not

- Not a task manager
- Not a note-taking app
- Not a project manager
- Not a reminder or notification system

If you need any of those, use a dedicated tool.

---

## Who this is for

Someone working primarily on one device who needs to capture small work items quickly without breaking their focus. The app lives in a browser tab.

---

## User stories

### Primary — quick capture

A coworker asks me to review a pull request while I am in the middle of something else.

I open the app in a browser tab. The cursor is already in the input. I type `Review payment PR` and press Enter. The item appears. I go back to what I was doing.

Later I come back, mark it done. It stays visible for the rest of today, then disappears tomorrow morning.

---

### Aging — keeping the view clean

I add a few things on Monday. By the following Monday I have either done them, forgotten them entirely, or handled them some other way.

At the 7-day mark, unfinished items quietly leave the main view. They are not gone — they are in the archive. But they are out of my way.

I never have to manually clean up.

---

### Recovery — nothing is lost

Three weeks ago I added something. I did not finish it. It faded out.

I remember it was related to an invoice. I open search, type `invoice`. It comes back. I can act on it or leave it.

---

## Non-goals

The following are intentionally excluded. Their absence is part of the design.

**Organisation** — tags, folders, categories, projects, multiple lists

**Scheduling** — due dates, reminders, notifications, recurring items

**Task features** — priorities, dependencies, subtasks, kanban boards

**Collaboration** — accounts, teams, sharing, comments

**Content expansion** — notes, attachments, rich text, links

**Metrics** — counts, streaks, statistics, progress charts

Any future feature request should be evaluated against one question: does it support fast capture and a clean, focused view? If not, it should be left out.
