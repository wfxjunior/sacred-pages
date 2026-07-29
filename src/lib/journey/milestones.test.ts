import { describe, expect, it } from "vitest";
import {
  CRITERIA_REGISTRY,
  EMPTY_SNAPSHOT,
  evaluateMilestone,
  evaluateNewMilestones,
  MILESTONE_CATEGORIES,
  MILESTONE_CRITERIA,
  milestoneDescriptionKey,
  milestoneTitleKey,
  visibleMilestones,
  type MilestoneDefinition,
  type ProgressSnapshot,
} from "./milestones";

function definition(overrides: Partial<MilestoneDefinition> = {}): MilestoneDefinition {
  return {
    id: overrides.id ?? "m-1",
    key: overrides.key ?? "first_journey",
    category: overrides.category ?? "journey",
    criteria: overrides.criteria ?? "first_occurrence",
    threshold: overrides.threshold ?? 1,
    qualifier: overrides.qualifier ?? null,
    isActive: overrides.isActive ?? true,
    isHidden: overrides.isHidden ?? false,
    version: overrides.version ?? 1,
    displayOrder: overrides.displayOrder ?? 10,
  };
}

function snapshot(overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot {
  return { ...EMPTY_SNAPSHOT, ...overrides };
}

describe("registry coverage", () => {
  it("has an evaluator for every criteria type", () => {
    for (const criteria of MILESTONE_CRITERIA) {
      expect(typeof CRITERIA_REGISTRY[criteria]).toBe("function");
    }
    expect(Object.keys(CRITERIA_REGISTRY)).toHaveLength(MILESTONE_CRITERIA.length);
  });

  it("maps every category to a counter without throwing", () => {
    for (const category of MILESTONE_CATEGORIES) {
      const result = evaluateMilestone(
        definition({ category, criteria: "cumulative_count", threshold: 1 }),
        snapshot(),
      );
      expect(result.earned).toBe(false);
      expect(result.value).toBe(0);
    }
  });
});

describe("first_occurrence", () => {
  it("is earned on the first completion", () => {
    expect(evaluateMilestone(definition(), snapshot({ journeysCompleted: 1 })).earned).toBe(true);
  });

  it("is not earned at zero", () => {
    expect(evaluateMilestone(definition(), snapshot()).earned).toBe(false);
  });

  it("ignores its threshold, counting only that something happened", () => {
    const result = evaluateMilestone(
      definition({ threshold: 99 }),
      snapshot({ journeysCompleted: 1 }),
    );
    expect(result.earned).toBe(true);
  });
});

describe("cumulative_count", () => {
  const five = definition({ key: "five_journeys", criteria: "cumulative_count", threshold: 5 });

  it("is earned exactly at the threshold", () => {
    expect(evaluateMilestone(five, snapshot({ journeysCompleted: 4 })).earned).toBe(false);
    expect(evaluateMilestone(five, snapshot({ journeysCompleted: 5 })).earned).toBe(true);
  });

  it("reads the counter matching its category", () => {
    const words = definition({
      category: "discovery",
      criteria: "cumulative_count",
      threshold: 100,
    });
    expect(evaluateMilestone(words, snapshot({ journeysCompleted: 500 })).earned).toBe(false);
    expect(evaluateMilestone(words, snapshot({ wordsFound: 100 })).earned).toBe(true);
  });
});

describe("consistency_days", () => {
  it("counts active days regardless of category counters", () => {
    const seven = definition({
      category: "consistency",
      criteria: "consistency_days",
      threshold: 7,
    });
    expect(evaluateMilestone(seven, snapshot({ activeDays: 6 })).earned).toBe(false);
    expect(evaluateMilestone(seven, snapshot({ activeDays: 7 })).earned).toBe(true);
  });
});

describe("difficulty_reached", () => {
  const expert = definition({
    category: "puzzle",
    criteria: "difficulty_reached",
    qualifier: "expert",
  });

  it("is earned once the difficulty appears in the completed set", () => {
    expect(
      evaluateMilestone(expert, snapshot({ difficultiesCompleted: ["gentle", "balanced"] })).earned,
    ).toBe(false);
    expect(evaluateMilestone(expert, snapshot({ difficultiesCompleted: ["expert"] })).earned).toBe(
      true,
    );
  });

  it("defaults to expert when no qualifier is configured", () => {
    const unqualified = definition({ criteria: "difficulty_reached", qualifier: null });
    expect(
      evaluateMilestone(unqualified, snapshot({ difficultiesCompleted: ["expert"] })).earned,
    ).toBe(true);
  });
});

describe("progressPercent", () => {
  it("reports partial progress toward a threshold", () => {
    const hundred = definition({ criteria: "cumulative_count", threshold: 100 });
    expect(evaluateMilestone(hundred, snapshot({ journeysCompleted: 25 })).progressPercent).toBe(
      25,
    );
  });

  it("never exceeds 100", () => {
    const five = definition({ criteria: "cumulative_count", threshold: 5 });
    expect(evaluateMilestone(five, snapshot({ journeysCompleted: 500 })).progressPercent).toBe(100);
  });

  it("does not divide by zero when a threshold is 0", () => {
    const zero = definition({ threshold: 0 });
    const result = evaluateMilestone(zero, snapshot({ journeysCompleted: 1 }));
    expect(Number.isFinite(result.progressPercent)).toBe(true);
    expect(result.progressPercent).toBe(100);
  });
});

describe("evaluateNewMilestones", () => {
  const definitions = [
    definition({ id: "a", key: "first_journey", displayOrder: 10 }),
    definition({
      id: "b",
      key: "five_journeys",
      criteria: "cumulative_count",
      threshold: 5,
      displayOrder: 20,
    }),
    definition({ id: "c", key: "inactive", isActive: false, displayOrder: 5 }),
  ];

  it("returns only newly earned milestones", () => {
    const result = evaluateNewMilestones({
      definitions,
      snapshot: snapshot({ journeysCompleted: 5 }),
      alreadyEarned: [],
    });
    expect(result.map((item) => item.definition.id)).toEqual(["a", "b"]);
  });

  it("is idempotent: a second evaluation awards nothing", () => {
    const first = evaluateNewMilestones({
      definitions,
      snapshot: snapshot({ journeysCompleted: 5 }),
      alreadyEarned: [],
    });
    const second = evaluateNewMilestones({
      definitions,
      snapshot: snapshot({ journeysCompleted: 5 }),
      alreadyEarned: first.map((item) => item.definition.id),
    });
    expect(second).toEqual([]);
  });

  it("skips inactive definitions even when their criteria are met", () => {
    const result = evaluateNewMilestones({
      definitions,
      snapshot: snapshot({ journeysCompleted: 100 }),
      alreadyEarned: [],
    });
    expect(result.map((item) => item.definition.id)).not.toContain("c");
  });

  it("returns results in display order", () => {
    const result = evaluateNewMilestones({
      definitions: [...definitions].reverse(),
      snapshot: snapshot({ journeysCompleted: 5 }),
      alreadyEarned: [],
    });
    expect(result.map((item) => item.definition.displayOrder)).toEqual([10, 20]);
  });
});

describe("visibleMilestones", () => {
  const definitions = [
    definition({ id: "a", key: "first_journey", displayOrder: 10 }),
    definition({
      id: "h",
      key: "secret",
      isHidden: true,
      threshold: 1000,
      criteria: "cumulative_count",
      displayOrder: 20,
    }),
    definition({ id: "x", key: "retired", isActive: false, displayOrder: 30 }),
  ];

  it("hides an unearned hidden milestone", () => {
    const result = visibleMilestones({ definitions, snapshot: snapshot(), earnedIds: [] });
    expect(result.map((item) => item.definition.id)).toEqual(["a"]);
  });

  it("reveals a hidden milestone once earned", () => {
    const result = visibleMilestones({ definitions, snapshot: snapshot(), earnedIds: ["h"] });
    expect(result.map((item) => item.definition.id)).toEqual(["a", "h"]);
  });

  it("trusts the earned list over recomputed criteria", () => {
    // A threshold retuned downward must not un-earn what someone already has.
    const result = visibleMilestones({ definitions, snapshot: snapshot(), earnedIds: ["a"] });
    expect(result.find((item) => item.definition.id === "a")?.earned).toBe(true);
  });

  it("marks an unearned milestone as unearned even when its criteria now pass", () => {
    const result = visibleMilestones({
      definitions,
      snapshot: snapshot({ journeysCompleted: 5000 }),
      earnedIds: [],
    });
    expect(result.find((item) => item.definition.id === "a")?.earned).toBe(false);
  });

  it("omits inactive definitions entirely", () => {
    const result = visibleMilestones({ definitions, snapshot: snapshot(), earnedIds: ["x"] });
    expect(result.map((item) => item.definition.id)).not.toContain("x");
  });
});

describe("copy keys", () => {
  it("namespaces milestone copy so nothing is hardcoded in English", () => {
    expect(milestoneTitleKey("seven_active_days")).toBe("milestone.seven_active_days.title");
    expect(milestoneDescriptionKey("seven_active_days")).toBe(
      "milestone.seven_active_days.description",
    );
  });
});

describe("snapshot shape", () => {
  it("carries counters only — never private text", () => {
    for (const value of Object.values(EMPTY_SNAPSHOT)) {
      expect(typeof value === "number" || Array.isArray(value)).toBe(true);
    }
  });
});
