import { describe, expect, it } from "vitest";
import { GAME_MODES, listActiveGames } from "@/lib/games";
import {
  PLAN_FEATURES,
  PLAN_FEATURE_GROUPS,
  PLAN_GROUP_LABEL_KEYS,
  featuresForGroup,
  gameRequiresPremium,
  includedFeatures,
  planHighlights,
  planIncludes,
} from "./features";

describe("plan catalogue integrity", () => {
  it("has unique ids and a label key for every feature", () => {
    expect(new Set(PLAN_FEATURES.map((f) => f.id)).size).toBe(PLAN_FEATURES.length);
    for (const feature of PLAN_FEATURES) {
      expect(feature.labelKey.startsWith("plan.f.")).toBe(true);
      expect(PLAN_FEATURE_GROUPS).toContain(feature.group);
    }
  });

  it("labels every group and leaves none empty", () => {
    for (const group of PLAN_FEATURE_GROUPS) {
      expect(PLAN_GROUP_LABEL_KEYS[group]).toBeTruthy();
      expect(featuresForGroup(group).length).toBeGreaterThan(0);
    }
  });

  it("never offers a free feature that Premium lacks", () => {
    for (const feature of PLAN_FEATURES) {
      if (feature.free === "included") expect(feature.premium).toBe("included");
    }
  });
});

describe("the product stance", () => {
  it("keeps the daily habit free", () => {
    for (const id of ["daily_journey", "devotional", "reflection", "prayer", "streak"]) {
      expect(planIncludes("free", id)).toBe(true);
    }
  });

  it("keeps every shipped game — and every difficulty — free", () => {
    for (const game of listActiveGames()) {
      expect(gameRequiresPremium(game.id)).toBe(false);
    }
    expect(planIncludes("free", "all_difficulties")).toBe(true);
    // and no game mode is ever listed as premium-only
    for (const mode of GAME_MODES) {
      expect(gameRequiresPremium(mode)).toBe(false);
    }
  });

  it("reserves breadth and company for Premium", () => {
    for (const id of ["unlimited_collections", "journey_together", "exclusive_series"]) {
      expect(planIncludes("free", id)).toBe(false);
      expect(planIncludes("premium", id)).toBe(true);
    }
  });
});

describe("plan views", () => {
  it("lists what Premium adds, never what Free already has", () => {
    const highlights = planHighlights("premium");
    expect(highlights.length).toBeGreaterThan(4);
    for (const feature of highlights) {
      expect(feature.free).not.toBe("included");
    }
    expect(highlights.map((f) => f.id)).toContain("journey_together");
  });

  it("gives the free card real, present-tense features", () => {
    const highlights = planHighlights("free");
    expect(highlights.length).toBeGreaterThan(3);
    for (const feature of highlights) {
      expect(feature.free).toBe("included");
    }
  });

  it("counts included features per plan without counting promises", () => {
    expect(includedFeatures("free").every((f) => f.free === "included")).toBe(true);
    expect(includedFeatures("premium").length).toBeGreaterThan(includedFeatures("free").length);
  });
});
