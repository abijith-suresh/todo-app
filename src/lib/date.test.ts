import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getNowIso, getTodayLocalIso, isOlderThanDays, isSameDay, toLocalDateIso } from "./date";

describe("getNowIso", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the current time as UTC ISO string", () => {
    vi.setSystemTime(new Date("2026-06-15T14:30:00Z"));
    expect(getNowIso()).toBe("2026-06-15T14:30:00.000Z");
  });
});

describe("getTodayLocalIso", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today's date in YYYY-MM-DD format", () => {
    vi.setSystemTime(new Date("2026-06-15T14:30:00Z"));
    const result = getTodayLocalIso();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("toLocalDateIso", () => {
  it("converts UTC ISO string to local date string", () => {
    const utcIso = "2026-06-15T12:00:00Z";
    const d = new Date(utcIso);
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    expect(toLocalDateIso(utcIso)).toBe(expected);
  });

  it("gives local date, not UTC date, for late-day UTC timestamps", () => {
    const origTz = process.env.TZ;
    process.env.TZ = "Asia/Kolkata";

    const utcIso = "2026-06-15T23:30:00Z";
    const localDate = toLocalDateIso(utcIso);
    const utcSlice = utcIso.slice(0, 10);

    expect(localDate).toBe("2026-06-16");
    expect(utcSlice).toBe("2026-06-15");
    expect(localDate).not.toBe(utcSlice);

    process.env.TZ = origTz;
  });
});

describe("isSameDay", () => {
  it("returns true when local dates match", () => {
    expect(isSameDay("2026-06-15T12:00:00Z", "2026-06-15")).toBe(true);
  });

  it("returns false when local dates differ", () => {
    expect(isSameDay("2026-06-15T12:00:00Z", "2026-06-16")).toBe(false);
  });

  it("returns true for late UTC timestamps on the same local day", () => {
    const origTz = process.env.TZ;
    process.env.TZ = "America/New_York";

    const completedAt = "2026-06-15T23:30:00Z";
    const localToday = "2026-06-15";

    expect(isSameDay(completedAt, localToday)).toBe(true);

    process.env.TZ = origTz;
  });
});

describe("isOlderThanDays", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = "UTC";
  });

  it("returns true when activated more than N days ago", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(isOlderThanDays("2026-06-07T12:00:00Z", 7)).toBe(true);
  });

  it("returns false when activated less than N days ago", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(isOlderThanDays("2026-06-09T12:00:00Z", 7)).toBe(false);
  });

  it("returns true exactly at 7-day local midnight boundary", () => {
    vi.setSystemTime(new Date("2026-06-15T00:00:00"));
    expect(isOlderThanDays("2026-06-08T10:00:00Z", 7)).toBe(true);
  });

  it("uses local timezone for the date boundary", () => {
    const origTz = process.env.TZ;
    process.env.TZ = "Asia/Kolkata";

    vi.setSystemTime(new Date("2026-06-16T00:00:00"));

    const activatedAt = "2026-06-08T23:30:00Z";
    const result = isOlderThanDays(activatedAt, 7);

    expect(result).toBe(true);

    process.env.TZ = origTz;
  });
});
