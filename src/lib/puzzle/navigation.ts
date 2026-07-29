import {
  DIRECTION_VECTORS,
  coordinateKey,
  isWithinGrid,
  pathOf,
  type Coordinate,
  type Grid,
  type Selection,
} from "./grid";

// Interaction model for the puzzle grid — pure state transitions, no React.
//
// The same reducer serves keyboard, mouse and touch. That is deliberate: when
// pointer and keyboard paths diverge, the keyboard one rots. Here, a keyboard
// user and a touch user drive identical state, so both stay correct.

export type InputMode = "keyboard" | "mouse" | "touch";

export type NavigationState = {
  /** The cell with the roving tabindex. */
  readonly focus: Coordinate;
  readonly anchor: Coordinate | null;
  readonly cursor: Coordinate | null;
  readonly isSelecting: boolean;
  readonly mode: InputMode;
  /** Message for the aria-live region; empty when there is nothing to say. */
  readonly announcement: string;
};

export function initialNavigationState(): NavigationState {
  return {
    focus: { row: 0, col: 0 },
    anchor: null,
    cursor: null,
    isSelecting: false,
    mode: "keyboard",
    announcement: "",
  };
}

export type NavigationAction =
  | { type: "move"; direction: "up" | "down" | "left" | "right" }
  | { type: "jump"; to: "row_start" | "row_end" | "grid_start" | "grid_end" }
  | { type: "focus_cell"; coordinate: Coordinate; mode: InputMode }
  | { type: "begin_selection"; coordinate?: Coordinate; mode: InputMode }
  | { type: "extend_selection"; coordinate: Coordinate }
  | { type: "commit_selection" }
  | { type: "cancel_selection" }
  | { type: "announce"; message: string };

const MOVE_VECTORS = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
} as const;

/**
 * Advances navigation state. Movement clamps at the edges rather than wrapping —
 * wrapping makes a grid disorienting to explore without sight.
 */
export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
  gridSize: number,
): NavigationState {
  switch (action.type) {
    case "move": {
      const { dr, dc } = MOVE_VECTORS[action.direction];
      const next = {
        row: clamp(state.focus.row + dr, gridSize),
        col: clamp(state.focus.col + dc, gridSize),
      };
      return {
        ...state,
        focus: next,
        cursor: state.isSelecting ? next : state.cursor,
        mode: "keyboard",
        announcement: "",
      };
    }

    case "jump": {
      const next = (() => {
        switch (action.to) {
          case "row_start":
            return { row: state.focus.row, col: 0 };
          case "row_end":
            return { row: state.focus.row, col: gridSize - 1 };
          case "grid_start":
            return { row: 0, col: state.focus.col };
          case "grid_end":
            return { row: gridSize - 1, col: state.focus.col };
        }
      })();
      return {
        ...state,
        focus: next,
        cursor: state.isSelecting ? next : state.cursor,
        mode: "keyboard",
        announcement: "",
      };
    }

    case "focus_cell":
      if (!isWithinGrid(action.coordinate, gridSize)) return state;
      return { ...state, focus: action.coordinate, mode: action.mode, announcement: "" };

    case "begin_selection": {
      const start = action.coordinate ?? state.focus;
      if (!isWithinGrid(start, gridSize)) return state;
      return {
        ...state,
        focus: start,
        anchor: start,
        cursor: start,
        isSelecting: true,
        mode: action.mode,
        announcement: "Selection started",
      };
    }

    case "extend_selection":
      if (!state.isSelecting || !isWithinGrid(action.coordinate, gridSize)) return state;
      return { ...state, cursor: action.coordinate, focus: action.coordinate, announcement: "" };

    case "commit_selection":
      // The caller validates the selection; this only returns to a neutral state.
      return { ...state, anchor: null, cursor: null, isSelecting: false, announcement: "" };

    case "cancel_selection":
      if (!state.isSelecting) return state;
      return {
        ...state,
        anchor: null,
        cursor: null,
        isSelecting: false,
        announcement: "Selection cleared",
      };

    case "announce":
      return { ...state, announcement: action.message };
  }
}

function clamp(value: number, size: number): number {
  return Math.min(Math.max(value, 0), size - 1);
}

/** The active selection, or null when one is not in progress. */
export function currentSelection(state: NavigationState): Selection | null {
  if (!state.anchor || !state.cursor) return null;
  return { start: state.anchor, end: state.cursor };
}

/** Cells to highlight while dragging. Empty when the line is not straight. */
export function highlightedCells(state: NavigationState): Set<string> {
  const selection = currentSelection(state);
  if (!selection) return new Set();
  return new Set(pathOf(selection).map(coordinateKey));
}

// ---------------------------------------------------------------------------
// Keyboard mapping
// ---------------------------------------------------------------------------

/**
 * Translates a key press into an action.
 *
 * Space and Enter both toggle selection, because users reasonably expect
 * either; Escape always cancels. Returning null means "not ours" so the host
 * component can leave the event alone rather than swallowing it.
 */
export function keyToAction(key: string, isSelecting: boolean): NavigationAction | null {
  switch (key) {
    case "ArrowUp":
      return { type: "move", direction: "up" };
    case "ArrowDown":
      return { type: "move", direction: "down" };
    case "ArrowLeft":
      return { type: "move", direction: "left" };
    case "ArrowRight":
      return { type: "move", direction: "right" };
    case "Home":
      return { type: "jump", to: "row_start" };
    case "End":
      return { type: "jump", to: "row_end" };
    case "PageUp":
      return { type: "jump", to: "grid_start" };
    case "PageDown":
      return { type: "jump", to: "grid_end" };
    case " ":
    case "Enter":
      return isSelecting
        ? { type: "commit_selection" }
        : { type: "begin_selection", mode: "keyboard" };
    case "Escape":
      return isSelecting ? { type: "cancel_selection" } : null;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Screen-reader labels
// ---------------------------------------------------------------------------

export type CellState = "idle" | "selected" | "found";

export type CellLabelInput = {
  readonly letter: string;
  readonly coordinate: Coordinate;
  readonly state: CellState;
  readonly gridSize: number;
};

/**
 * Label for a single cell.
 *
 * Position is spoken as "row 3, column 5" rather than symbols, and state is
 * spoken as a word — so "found" is never conveyed by colour alone.
 */
export function cellLabel(input: CellLabelInput): string {
  const position = `row ${input.coordinate.row + 1}, column ${input.coordinate.col + 1}`;
  const state = input.state === "idle" ? "" : `, ${input.state}`;
  return `${input.letter}, ${position}${state}`;
}

export function gridLabel(size: number, foundCount: number, totalWords: number): string {
  return `Word search grid, ${size} by ${size}. ${foundCount} of ${totalWords} words found.`;
}

export const KEYBOARD_INSTRUCTIONS =
  "Use the arrow keys to move around the grid. Press Space to start a selection, " +
  "arrow keys to extend it, Space again to confirm, or Escape to cancel.";

/** Announcement after a validated selection — the aria-live counterpart of the toast. */
export function selectionAnnouncement(result: {
  kind: "match" | "already_found" | "no_match" | "invalid_line" | "out_of_bounds";
  word?: string;
  foundCount?: number;
  totalWords?: number;
}): string {
  switch (result.kind) {
    case "match":
      return result.foundCount !== undefined && result.totalWords !== undefined
        ? `${result.word} found. ${result.foundCount} of ${result.totalWords} words found.`
        : `${result.word} found.`;
    case "already_found":
      return `${result.word} has already been found.`;
    case "no_match":
      return "Not a word. Try again.";
    case "invalid_line":
      return "Selections must be straight lines across, down, or diagonally.";
    case "out_of_bounds":
      return "That selection is outside the grid.";
  }
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export type MotionPreference = "full" | "reduced";

/**
 * Durations in milliseconds. Reduced motion returns 0 rather than a shorter
 * animation, because vestibular triggers are about movement existing at all.
 */
export function motionDuration(preference: MotionPreference, base: number): number {
  return preference === "reduced" ? 0 : base;
}

export const MOTION = {
  cellPop: 400,
  wordStrike: 450,
  toast: 250,
} as const;

/** Convenience for building the roving-tabindex attribute of a cell. */
export function cellTabIndex(coordinate: Coordinate, focus: Coordinate): 0 | -1 {
  return coordinate.row === focus.row && coordinate.col === focus.col ? 0 : -1;
}

/** Direction vectors, re-exported so renderers need only import this module. */
export { DIRECTION_VECTORS };

/** Whether a grid coordinate is part of an already-found word. */
export function cellStateFor(
  coordinate: Coordinate,
  foundCells: ReadonlySet<string>,
  highlighted: ReadonlySet<string>,
): CellState {
  const key = coordinateKey(coordinate);
  if (foundCells.has(key)) return "found";
  if (highlighted.has(key)) return "selected";
  return "idle";
}

/** Reads the letter at a coordinate for label building. */
export function letterAt(grid: Grid, coordinate: Coordinate): string {
  return grid.cells[coordinate.row]?.[coordinate.col]?.display ?? "";
}
