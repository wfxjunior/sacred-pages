// Journey state machine and step model.
//
// Three completion concepts that must never be conflated:
//
//   PUZZLE completion     — every word found. One step.
//   JOURNEY completion    — every REQUIRED step complete. The puzzle is one of
//                           them; reflection and prayer may also be required.
//   COLLECTION completion — every published journey in a collection completed.
//
// A puzzle can be finished while the journey is not, which is why
// `puzzle_completed` is its own session status.

export const JOURNEY_SESSION_STATUSES = [
  "not_started",
  "in_progress",
  "puzzle_completed",
  "completed",
  "abandoned",
] as const;
export type JourneySessionStatus = (typeof JOURNEY_SESSION_STATUSES)[number];

export const JOURNEY_STEP_TYPES = [
  "scripture",
  "devotional",
  "puzzle",
  "reflection",
  "prayer",
  "completion",
] as const;
export type JourneyStepType = (typeof JOURNEY_STEP_TYPES)[number];

/**
 * A step's definition within one journey. `required` is configurable so a
 * journey can, for example, demand a written reflection while another treats it
 * as optional.
 */
export type StepDefinition = {
  readonly type: JourneyStepType;
  readonly order: number;
  readonly required: boolean;
};

/** The default flow. Reflection and prayer are optional unless configured. */
export const DEFAULT_STEPS: readonly StepDefinition[] = [
  { type: "scripture", order: 0, required: true },
  { type: "devotional", order: 1, required: true },
  { type: "puzzle", order: 2, required: true },
  { type: "reflection", order: 3, required: false },
  { type: "prayer", order: 4, required: false },
  { type: "completion", order: 5, required: false },
];

export type StepState = {
  readonly type: JourneyStepType;
  readonly completed: boolean;
};

// ---------------------------------------------------------------------------
// Session transitions
// ---------------------------------------------------------------------------

export const ALLOWED_SESSION_TRANSITIONS: Readonly<
  Record<JourneySessionStatus, readonly JourneySessionStatus[]>
> = {
  not_started: ["in_progress", "abandoned"],
  in_progress: ["puzzle_completed", "completed", "abandoned", "not_started"],
  // A finished puzzle can still return to in_progress if the reader resets it.
  puzzle_completed: ["completed", "in_progress", "abandoned"],
  // Completed is terminal for this session; replaying starts a NEW session.
  completed: [],
  abandoned: ["in_progress"],
};

export function isValidSessionTransition(
  from: JourneySessionStatus,
  to: JourneySessionStatus,
): boolean {
  return ALLOWED_SESSION_TRANSITIONS[from].includes(to);
}

export type TransitionCheck =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly reason: "invalid_transition" | "required_step_incomplete";
      readonly detail: string;
    };

/**
 * Validates a session transition, including the requirement that every required
 * step is finished before a journey may be marked complete.
 */
export function canTransitionSession(input: {
  from: JourneySessionStatus;
  to: JourneySessionStatus;
  steps: readonly StepDefinition[];
  stepStates: readonly StepState[];
}): TransitionCheck {
  const { from, to, steps, stepStates } = input;

  if (!isValidSessionTransition(from, to)) {
    return {
      allowed: false,
      reason: "invalid_transition",
      detail: `A journey cannot move from ${from} to ${to}`,
    };
  }

  if (to === "completed") {
    const missing = incompleteRequiredSteps(steps, stepStates);
    if (missing.length > 0) {
      return {
        allowed: false,
        reason: "required_step_incomplete",
        detail: `These steps must be finished first: ${missing.join(", ")}`,
      };
    }
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Step logic
// ---------------------------------------------------------------------------

function isComplete(states: readonly StepState[], type: JourneyStepType): boolean {
  return states.find((state) => state.type === type)?.completed ?? false;
}

/** Required steps that are not yet finished, in flow order. */
export function incompleteRequiredSteps(
  steps: readonly StepDefinition[],
  states: readonly StepState[],
): JourneyStepType[] {
  return [...steps]
    .filter((step) => step.required && step.type !== "completion")
    .sort((a, b) => a.order - b.order)
    .filter((step) => !isComplete(states, step.type))
    .map((step) => step.type);
}

export function isJourneyComplete(
  steps: readonly StepDefinition[],
  states: readonly StepState[],
): boolean {
  return incompleteRequiredSteps(steps, states).length === 0;
}

/**
 * Completion as a whole percentage.
 *
 * Optional steps count toward the total once finished, so a reader who writes a
 * reflection sees credit for it — but they never block completion.
 */
export function completionPercent(
  steps: readonly StepDefinition[],
  states: readonly StepState[],
): number {
  const counted = steps.filter((step) => step.type !== "completion");
  if (counted.length === 0) return 0;
  const done = counted.filter((step) => isComplete(states, step.type)).length;
  return Math.round((done / counted.length) * 100);
}

/**
 * Where a resuming reader should land: the first unfinished step in order, or
 * the completion step when everything required is done.
 */
export function resolveCurrentStep(
  steps: readonly StepDefinition[],
  states: readonly StepState[],
): JourneyStepType {
  const ordered = [...steps].sort((a, b) => a.order - b.order);
  const next = ordered.find((step) => step.type !== "completion" && !isComplete(states, step.type));
  return next?.type ?? "completion";
}

/**
 * Whether a reader may open a step.
 *
 * Deliberately permissive: earlier steps stay reachable so a reader can re-read
 * the passage, and only steps behind an unfinished REQUIRED step are gated.
 * Trapping people in a linear flow makes a devotional feel like a form.
 */
export function canAccessStep(input: {
  target: JourneyStepType;
  steps: readonly StepDefinition[];
  states: readonly StepState[];
}): boolean {
  const { target, steps, states } = input;
  const ordered = [...steps].sort((a, b) => a.order - b.order);
  const targetStep = ordered.find((step) => step.type === target);
  if (!targetStep) return false;

  if (isComplete(states, target)) return true;

  const blocking = ordered.filter(
    (step) => step.order < targetStep.order && step.required && !isComplete(states, step.type),
  );
  return blocking.length === 0;
}

export function nextStep(
  current: JourneyStepType,
  steps: readonly StepDefinition[],
): JourneyStepType | null {
  const ordered = [...steps].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((step) => step.type === current);
  return index >= 0 && index < ordered.length - 1 ? ordered[index + 1].type : null;
}

export function previousStep(
  current: JourneyStepType,
  steps: readonly StepDefinition[],
): JourneyStepType | null {
  const ordered = [...steps].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((step) => step.type === current);
  return index > 0 ? ordered[index - 1].type : null;
}

/**
 * Builds the step list for a journey, applying journey-level requirements.
 */
export function buildSteps(
  config: {
    requireReflection?: boolean;
    requirePrayer?: boolean;
  } = {},
): StepDefinition[] {
  return DEFAULT_STEPS.map((step) => {
    if (step.type === "reflection") {
      return { ...step, required: config.requireReflection ?? false };
    }
    if (step.type === "prayer") {
      return { ...step, required: config.requirePrayer ?? false };
    }
    return { ...step };
  });
}

/** i18n key for a step label. */
export function stepLabelKey(step: JourneyStepType): string {
  return `journey.step.${step}`;
}
