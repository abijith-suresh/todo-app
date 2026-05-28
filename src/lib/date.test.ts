import { afterEach, describe, expect, it } from "vitest";

import { getTodayIso, getTomorrowIso } from "./date";

const originalTz = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTz;
});

describe("date", () => {
  it("uses the device-local calendar day instead of slicing the UTC ISO string", () => {
    process.env.TZ = "Asia/Kolkata";

    const localMidnight = new Date("2026-04-20T00:30:00+05:30");

    expect(getTodayIso(localMidnight)).toBe("2026-04-20");
    expect(getTomorrowIso(localMidnight)).toBe("2026-04-21");
  });
});
