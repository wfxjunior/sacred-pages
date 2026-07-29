import { describe, expect, it } from "vitest";
import {
  activityWindow,
  addDays,
  daysBetween,
  encouragementKey,
  isValidTimeZone,
  localDateFor,
  recentDateWindow,
  summarizeConsistency,
  wouldAddActiveDay,
} from "./consistency";

describe("localDateFor", () => {
  it("credits a late-evening reader in Sao Paulo to their own day, not UTC's", () => {
    // 2026-03-10T02:30Z is still 2026-03-09 at 23:30 in Sao Paulo (UTC-3).
    const moment = new Date("2026-03-10T02:30:00Z");
    expect(localDateFor(moment, "America/Sao_Paulo")).toBe("2026-03-09");
    expect(localDateFor(moment, "UTC")).toBe("2026-03-10");
  });

  it("credits an early-morning reader in Tokyo to the day ahead of UTC", () => {
    const moment = new Date("2026-03-09T22:00:00Z");
    expect(localDateFor(moment, "Asia/Tokyo")).toBe("2026-03-10");
  });

  it("uses the zone's rules across a US daylight-saving change", () => {
    // DST began 2026-03-08 in New York; the offset differs either side of it.
    expect(localDateFor(new Date("2026-03-08T04:30:00Z"), "America/New_York")).toBe("2026-03-07");
    expect(localDateFor(new Date("2026-03-09T03:30:00Z"), "America/New_York")).toBe("2026-03-08");
  });

  it("falls back to UTC rather than throwing on an unknown zone", () => {
    expect(localDateFor(new Date("2026-03-10T02:30:00Z"), "Mars/Olympus")).toBe("2026-03-10");
  });

  it("defaults to UTC when no zone is given", () => {
    expect(localDateFor(new Date("2026-07-29T10:00:00Z"))).toBe("2026-07-29");
  });
});

describe("isValidTimeZone", () => {
  it("accepts IANA identifiers", () => {
    expect(isValidTimeZone("America/Sao_Paulo")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it("rejects nonsense", () => {
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
  });
});

describe("date arithmetic", () => {
  it("counts whole calendar days between dates", () => {
    expect(daysBetween("2026-07-01", "2026-07-08")).toBe(7);
    expect(daysBetween("2026-07-08", "2026-07-08")).toBe(0);
  });

  it("crosses month and year boundaries", () => {
    expect(daysBetween("2026-01-31", "2026-02-01")).toBe(1);
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
  });

  it("counts a leap day", () => {
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
  });

  it("adds and subtracts days", () => {
    expect(addDays("2026-07-29", 3)).toBe("2026-08-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("summarizeConsistency", () => {
  it("reports nothing for a reader who has not started", () => {
    expect(summarizeConsistency([], "2026-07-29")).toEqual({
      activeDays: 0,
      currentRun: 0,
      longestRun: 0,
      lastActiveDate: null,
      activeToday: false,
    });
  });

  it("counts one active day however many journeys were read", () => {
    const summary = summarizeConsistency(["2026-07-29", "2026-07-29", "2026-07-29"], "2026-07-29");
    expect(summary.activeDays).toBe(1);
    expect(summary.currentRun).toBe(1);
  });

  it("keeps a run current when the reader has not opened the app yet today", () => {
    const summary = summarizeConsistency(["2026-07-26", "2026-07-27", "2026-07-28"], "2026-07-29");
    expect(summary.currentRun).toBe(3);
    expect(summary.activeToday).toBe(false);
  });

  it("ends the current run after a full missed day", () => {
    const summary = summarizeConsistency(["2026-07-25", "2026-07-26", "2026-07-27"], "2026-07-29");
    expect(summary.currentRun).toBe(0);
    expect(summary.longestRun).toBe(3);
  });

  it("never lowers the longest run when a rhythm lapses", () => {
    const summary = summarizeConsistency(
      ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-29"],
      "2026-07-29",
    );
    expect(summary.longestRun).toBe(4);
    expect(summary.currentRun).toBe(1);
    expect(summary.activeDays).toBe(5);
  });

  it("handles unsorted input", () => {
    const summary = summarizeConsistency(["2026-07-28", "2026-07-26", "2026-07-27"], "2026-07-28");
    expect(summary.currentRun).toBe(3);
    expect(summary.lastActiveDate).toBe("2026-07-28");
  });

  it("marks today active when today has activity", () => {
    const summary = summarizeConsistency(["2026-07-29"], "2026-07-29");
    expect(summary.activeToday).toBe(true);
  });
});

describe("wouldAddActiveDay", () => {
  it("is false when the reader was already active on their local day", () => {
    const moment = new Date("2026-03-10T02:30:00Z"); // 2026-03-09 in Sao Paulo
    expect(wouldAddActiveDay(["2026-03-09"], moment, "America/Sao_Paulo")).toBe(false);
    expect(wouldAddActiveDay(["2026-03-09"], moment, "UTC")).toBe(true);
  });
});

describe("encouragementKey", () => {
  it("never has a broken-streak state", () => {
    const lapsed = summarizeConsistency(["2026-07-01"], "2026-07-29");
    expect(encouragementKey(lapsed)).toBe("consistency.welcomeBack");
  });

  it("maps each state to warm copy", () => {
    expect(encouragementKey(summarizeConsistency([], "2026-07-29"))).toBe("consistency.empty");
    expect(encouragementKey(summarizeConsistency(["2026-07-29"], "2026-07-29"))).toBe(
      "consistency.today",
    );
    expect(encouragementKey(summarizeConsistency(["2026-07-28"], "2026-07-29"))).toBe(
      "consistency.continuing",
    );
  });
});

describe("date windows", () => {
  it("returns the last N days ending today, oldest first", () => {
    expect(recentDateWindow("2026-07-29", 3)).toEqual(["2026-07-27", "2026-07-28", "2026-07-29"]);
  });

  it("marks which days in the window had activity", () => {
    const window = activityWindow(["2026-07-27", "2026-07-29"], "2026-07-29", 3);
    expect(window).toEqual([
      { date: "2026-07-27", active: true },
      { date: "2026-07-28", active: false },
      { date: "2026-07-29", active: true },
    ]);
  });

  it("defaults to a seven-day strip", () => {
    expect(activityWindow([], "2026-07-29")).toHaveLength(7);
  });

  it("ignores activity outside the window", () => {
    const window = activityWindow(["2026-01-01"], "2026-07-29", 3);
    expect(window.every((day) => !day.active)).toBe(true);
  });
});
