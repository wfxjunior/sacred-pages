import { describe, expect, it } from "vitest";
import { chooseRotationJourney, type RotationHistoryEntry } from "./daily-rotation";

const pool = Array.from({ length: 9 }, (_, index) => ({
  id: `j${index + 1}`,
  slug: `journey-${index + 1}`,
}));

describe("chooseRotationJourney", () => {
  it("returns null for an empty pool and the only journey for a pool of one", () => {
    expect(chooseRotationJourney("2026-08-07", [], [])).toBeNull();
    expect(chooseRotationJourney("2026-08-07", [pool[0]!], [])).toEqual(pool[0]);
  });

  it("is deterministic for a date and varies across dates", () => {
    const first = chooseRotationJourney("2026-08-07", pool, []);
    expect(chooseRotationJourney("2026-08-07", pool, [])).toEqual(first);
    const week = new Set(
      ["07", "08", "09", "10", "11", "12"].map(
        (day) => chooseRotationJourney(`2026-08-${day}`, pool, [])!.id,
      ),
    );
    expect(week.size).toBeGreaterThan(1);
  });

  it("never serves what the calendar used within the exclusion window", () => {
    const history: RotationHistoryEntry[] = [
      { journeyId: "j1", date: "2026-08-06" },
      { journeyId: "j2", date: "2026-08-05" },
      { journeyId: "j3", date: "2026-08-04" },
    ];
    for (const day of ["07", "08", "09"]) {
      const picked = chooseRotationJourney(`2026-08-${day}`, pool, history);
      expect(["j1", "j2", "j3"]).not.toContain(picked!.id);
    }
  });

  it("does not repeat while enough journeys exist, walking the pool day by day", () => {
    const history: RotationHistoryEntry[] = [];
    const served: string[] = [];
    for (let day = 0; day < 8; day++) {
      const date = `2026-08-${String(7 + day).padStart(2, "0")}`;
      const picked = chooseRotationJourney(date, pool, history)!;
      served.push(picked.id);
      history.push({ journeyId: picked.id, date });
    }
    expect(new Set(served).size).toBe(served.length);
  });

  it("falls back to the full pool rather than serving nothing when history covers everything", () => {
    const history = pool.map((candidate, index) => ({
      journeyId: candidate.id,
      date: `2026-08-${String(index + 1).padStart(2, "0")}`,
    }));
    expect(chooseRotationJourney("2026-08-10", pool, history)).not.toBeNull();
  });

  it("prefers the least-recently-used journeys", () => {
    const history: RotationHistoryEntry[] = pool.slice(0, 8).map((candidate, index) => ({
      journeyId: candidate.id,
      // j1 served yesterday, j2 two days ago, ... j8 eight days ago; j9 never.
      date: `2026-08-${String(6 - Math.min(index, 5)).padStart(2, "0")}`,
    }));
    const picked = chooseRotationJourney("2026-08-07", pool, history)!;
    // Only never-used or oldest-served candidates are eligible for the pick.
    expect(picked.id).not.toBe("j1");
    expect(picked.id).not.toBe("j2");
  });
});
