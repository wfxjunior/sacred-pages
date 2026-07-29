import { describe, expect, it } from "vitest";
import {
  ALLOWED_SESSION_TRANSITIONS,
  buildSteps,
  canAccessStep,
  canTransitionSession,
  completionPercent,
  incompleteRequiredSteps,
  isJourneyComplete,
  isValidSessionTransition,
  nextStep,
  previousStep,
  resolveCurrentStep,
  stepLabelKey,
  type JourneySessionStatus,
  type StepState,
} from "./state";

const STEPS = buildSteps();

function states(...completed: string[]): StepState[] {
  return ["scripture", "devotional", "puzzle", "reflection", "prayer", "completion"].map(
    (type) => ({
      type: type as StepState["type"],
      completed: completed.includes(type),
    }),
  );
}

describe("session transitions", () => {
  it("permits the ordinary path through a journey", () => {
    expect(isValidSessionTransition("not_started", "in_progress")).toBe(true);
    expect(isValidSessionTransition("in_progress", "puzzle_completed")).toBe(true);
    expect(isValidSessionTransition("puzzle_completed", "completed")).toBe(true);
  });

  it("treats completed as terminal so a replay must start a new session", () => {
    expect(ALLOWED_SESSION_TRANSITIONS.completed).toEqual([]);
    for (const status of [
      "not_started",
      "in_progress",
      "puzzle_completed",
      "abandoned",
    ] as JourneySessionStatus[]) {
      expect(isValidSessionTransition("completed", status)).toBe(false);
    }
  });

  it("lets an abandoned session be picked back up", () => {
    expect(isValidSessionTransition("abandoned", "in_progress")).toBe(true);
  });

  it("refuses to skip straight from not_started to completed", () => {
    expect(isValidSessionTransition("not_started", "completed")).toBe(false);
  });

  it("blocks completion while a required step is unfinished", () => {
    const result = canTransitionSession({
      from: "in_progress",
      to: "completed",
      steps: STEPS,
      stepStates: states("scripture", "devotional"),
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("required_step_incomplete");
      expect(result.detail).toContain("puzzle");
    }
  });

  it("allows completion once every required step is finished", () => {
    const result = canTransitionSession({
      from: "puzzle_completed",
      to: "completed",
      steps: STEPS,
      stepStates: states("scripture", "devotional", "puzzle"),
    });

    expect(result).toEqual({ allowed: true });
  });

  it("reports an invalid transition before checking steps", () => {
    const result = canTransitionSession({
      from: "completed",
      to: "completed",
      steps: STEPS,
      stepStates: states("scripture", "devotional", "puzzle"),
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe("invalid_transition");
  });

  it("holds back completion when the journey requires a reflection", () => {
    const steps = buildSteps({ requireReflection: true });
    const result = canTransitionSession({
      from: "puzzle_completed",
      to: "completed",
      steps,
      stepStates: states("scripture", "devotional", "puzzle"),
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.detail).toContain("reflection");
  });
});

describe("required steps", () => {
  it("lists unfinished required steps in flow order", () => {
    expect(incompleteRequiredSteps(STEPS, states())).toEqual(["scripture", "devotional", "puzzle"]);
  });

  it("never treats the completion step as a requirement", () => {
    expect(incompleteRequiredSteps(STEPS, states("scripture", "devotional", "puzzle"))).toEqual([]);
    expect(isJourneyComplete(STEPS, states("scripture", "devotional", "puzzle"))).toBe(true);
  });

  it("ignores optional steps when deciding completion", () => {
    expect(isJourneyComplete(STEPS, states("scripture", "devotional", "puzzle"))).toBe(true);
  });
});

describe("completionPercent", () => {
  it("is 0 with nothing done", () => {
    expect(completionPercent(STEPS, states())).toBe(0);
  });

  it("credits optional steps without requiring them", () => {
    const required = completionPercent(STEPS, states("scripture", "devotional", "puzzle"));
    const withReflection = completionPercent(
      STEPS,
      states("scripture", "devotional", "puzzle", "reflection"),
    );

    expect(withReflection).toBeGreaterThan(required);
    expect(required).toBe(60);
    expect(withReflection).toBe(80);
  });

  it("reaches 100 only when every counted step is done", () => {
    expect(
      completionPercent(STEPS, states("scripture", "devotional", "puzzle", "reflection", "prayer")),
    ).toBe(100);
  });

  it("returns 0 rather than dividing by zero for an empty flow", () => {
    expect(completionPercent([], [])).toBe(0);
  });
});

describe("resolveCurrentStep", () => {
  it("lands a new reader on the first step", () => {
    expect(resolveCurrentStep(STEPS, states())).toBe("scripture");
  });

  it("resumes at the first unfinished step", () => {
    expect(resolveCurrentStep(STEPS, states("scripture", "devotional"))).toBe("puzzle");
  });

  it("falls through to completion when everything is done", () => {
    expect(
      resolveCurrentStep(
        STEPS,
        states("scripture", "devotional", "puzzle", "reflection", "prayer"),
      ),
    ).toBe("completion");
  });
});

describe("canAccessStep", () => {
  it("keeps earlier steps reachable so a passage can be re-read", () => {
    expect(
      canAccessStep({
        target: "scripture",
        steps: STEPS,
        states: states("scripture", "devotional"),
      }),
    ).toBe(true);
  });

  it("gates a step sitting behind an unfinished required step", () => {
    expect(canAccessStep({ target: "puzzle", steps: STEPS, states: states("scripture") })).toBe(
      false,
    );
  });

  it("does not gate on unfinished OPTIONAL steps", () => {
    expect(
      canAccessStep({
        target: "prayer",
        steps: STEPS,
        states: states("scripture", "devotional", "puzzle"),
      }),
    ).toBe(true);
  });

  it("always allows a step that is already finished", () => {
    expect(canAccessStep({ target: "puzzle", steps: STEPS, states: states("puzzle") })).toBe(true);
  });

  it("refuses a step that is not part of the flow", () => {
    const trimmed = STEPS.filter((step) => step.type !== "prayer");
    expect(canAccessStep({ target: "prayer", steps: trimmed, states: states() })).toBe(false);
  });
});

describe("step navigation", () => {
  it("walks forward and back through the flow", () => {
    expect(nextStep("scripture", STEPS)).toBe("devotional");
    expect(previousStep("devotional", STEPS)).toBe("scripture");
  });

  it("returns null at each end", () => {
    expect(previousStep("scripture", STEPS)).toBeNull();
    expect(nextStep("completion", STEPS)).toBeNull();
  });
});

describe("buildSteps", () => {
  it("leaves reflection and prayer optional by default", () => {
    const steps = buildSteps();
    expect(steps.find((step) => step.type === "reflection")?.required).toBe(false);
    expect(steps.find((step) => step.type === "prayer")?.required).toBe(false);
  });

  it("applies journey-level requirements", () => {
    const steps = buildSteps({ requireReflection: true, requirePrayer: true });
    expect(steps.find((step) => step.type === "reflection")?.required).toBe(true);
    expect(steps.find((step) => step.type === "prayer")?.required).toBe(true);
  });

  it("never makes scripture, devotional or puzzle optional", () => {
    const steps = buildSteps({ requireReflection: false });
    for (const type of ["scripture", "devotional", "puzzle"]) {
      expect(steps.find((step) => step.type === type)?.required).toBe(true);
    }
  });

  it("returns a fresh array so callers cannot mutate the default flow", () => {
    const first = buildSteps();
    first[0] = { ...first[0], required: false };
    expect(buildSteps()[0].required).toBe(true);
  });
});

describe("stepLabelKey", () => {
  it("namespaces step copy under journey.step", () => {
    expect(stepLabelKey("puzzle")).toBe("journey.step.puzzle");
  });
});
