import { describe, expect, it } from "vitest";
import {
  cellLabel,
  cellStateFor,
  cellTabIndex,
  currentSelection,
  highlightedCells,
  initialNavigationState,
  keyToAction,
  motionDuration,
  navigationReducer,
  selectionAnnouncement,
  type NavigationState,
} from "./navigation";
import { coordinateKey } from "./grid";

const SIZE = 5;

function reduce(state: NavigationState, ...actions: Parameters<typeof navigationReducer>[1][]) {
  return actions.reduce((s, action) => navigationReducer(s, action, SIZE), state);
}

describe("movement", () => {
  it("moves focus with the arrow keys", () => {
    const state = reduce(
      initialNavigationState(),
      { type: "move", direction: "right" },
      { type: "move", direction: "down" },
    );
    expect(state.focus).toEqual({ row: 1, col: 1 });
  });

  it("clamps at the edges rather than wrapping", () => {
    // Wrapping would make the grid disorienting to explore without sight.
    const topLeft = reduce(
      initialNavigationState(),
      { type: "move", direction: "up" },
      { type: "move", direction: "left" },
    );
    expect(topLeft.focus).toEqual({ row: 0, col: 0 });

    const bottomRight = reduce(
      initialNavigationState(),
      ...Array(10).fill({ type: "move", direction: "down" } as const),
      ...Array(10).fill({ type: "move", direction: "right" } as const),
    );
    expect(bottomRight.focus).toEqual({ row: SIZE - 1, col: SIZE - 1 });
  });

  it("jumps to row and grid extremes", () => {
    const base = reduce(initialNavigationState(), { type: "move", direction: "down" });
    expect(reduce(base, { type: "jump", to: "row_end" }).focus).toEqual({ row: 1, col: SIZE - 1 });
    expect(reduce(base, { type: "jump", to: "grid_end" }).focus).toEqual({ row: SIZE - 1, col: 0 });
    expect(reduce(base, { type: "jump", to: "grid_start" }).focus).toEqual({ row: 0, col: 0 });
  });

  it("ignores focus requests outside the grid", () => {
    const state = reduce(initialNavigationState(), {
      type: "focus_cell",
      coordinate: { row: 99, col: 0 },
      mode: "mouse",
    });
    expect(state.focus).toEqual({ row: 0, col: 0 });
  });
});

describe("selection lifecycle", () => {
  it("begins, extends and commits a selection", () => {
    let state = reduce(initialNavigationState(), {
      type: "begin_selection",
      coordinate: { row: 0, col: 0 },
      mode: "keyboard",
    });
    expect(state.isSelecting).toBe(true);
    expect(state.announcement).toBe("Selection started");

    state = reduce(state, { type: "extend_selection", coordinate: { row: 0, col: 3 } });
    expect(currentSelection(state)).toEqual({
      start: { row: 0, col: 0 },
      end: { row: 0, col: 3 },
    });

    state = reduce(state, { type: "commit_selection" });
    expect(state.isSelecting).toBe(false);
    expect(currentSelection(state)).toBeNull();
  });

  it("keyboard movement extends an active selection", () => {
    const state = reduce(
      initialNavigationState(),
      { type: "begin_selection", mode: "keyboard" },
      { type: "move", direction: "right" },
      { type: "move", direction: "right" },
    );
    expect(currentSelection(state)).toEqual({
      start: { row: 0, col: 0 },
      end: { row: 0, col: 2 },
    });
  });

  it("cancels a selection and says so", () => {
    const state = reduce(
      initialNavigationState(),
      { type: "begin_selection", mode: "mouse" },
      { type: "cancel_selection" },
    );
    expect(state.isSelecting).toBe(false);
    expect(state.announcement).toBe("Selection cleared");
  });

  it("ignores extend when no selection is active", () => {
    const state = reduce(initialNavigationState(), {
      type: "extend_selection",
      coordinate: { row: 2, col: 2 },
    });
    expect(state.cursor).toBeNull();
  });

  it("produces the same state from keyboard and pointer input", () => {
    // The reducer is shared deliberately: divergent paths let the keyboard rot.
    const keyboard = reduce(
      initialNavigationState(),
      { type: "begin_selection", coordinate: { row: 1, col: 1 }, mode: "keyboard" },
      { type: "extend_selection", coordinate: { row: 1, col: 3 } },
    );
    const touch = reduce(
      initialNavigationState(),
      { type: "begin_selection", coordinate: { row: 1, col: 1 }, mode: "touch" },
      { type: "extend_selection", coordinate: { row: 1, col: 3 } },
    );
    expect(currentSelection(keyboard)).toEqual(currentSelection(touch));
  });
});

describe("highlightedCells", () => {
  it("covers the whole straight path", () => {
    const state = reduce(
      initialNavigationState(),
      { type: "begin_selection", coordinate: { row: 0, col: 0 }, mode: "mouse" },
      { type: "extend_selection", coordinate: { row: 0, col: 2 } },
    );
    const cells = highlightedCells(state);
    expect(cells.size).toBe(3);
    expect(cells.has(coordinateKey({ row: 0, col: 1 }))).toBe(true);
  });

  it("is empty for a bent selection", () => {
    const state = reduce(
      initialNavigationState(),
      { type: "begin_selection", coordinate: { row: 0, col: 0 }, mode: "mouse" },
      { type: "extend_selection", coordinate: { row: 1, col: 3 } },
    );
    expect(highlightedCells(state).size).toBe(0);
  });
});

describe("keyToAction", () => {
  it("maps arrows, jumps and escape", () => {
    expect(keyToAction("ArrowUp", false)).toEqual({ type: "move", direction: "up" });
    expect(keyToAction("Home", false)).toEqual({ type: "jump", to: "row_start" });
    expect(keyToAction("Escape", true)).toEqual({ type: "cancel_selection" });
  });

  it("toggles selection with both Space and Enter", () => {
    for (const key of [" ", "Enter"]) {
      expect(keyToAction(key, false)).toMatchObject({ type: "begin_selection" });
      expect(keyToAction(key, true)).toEqual({ type: "commit_selection" });
    }
  });

  it("returns null for keys it does not own, so the host can pass them through", () => {
    expect(keyToAction("a", false)).toBeNull();
    expect(keyToAction("Tab", false)).toBeNull();
    expect(keyToAction("Escape", false)).toBeNull();
  });
});

describe("screen-reader labels", () => {
  it("speaks position in words, not symbols", () => {
    expect(
      cellLabel({ letter: "G", coordinate: { row: 0, col: 0 }, state: "idle", gridSize: SIZE }),
    ).toBe("G, row 1, column 1");
  });

  it("states found and selected explicitly rather than by colour alone", () => {
    expect(
      cellLabel({ letter: "R", coordinate: { row: 1, col: 2 }, state: "found", gridSize: SIZE }),
    ).toBe("R, row 2, column 3, found");
    expect(
      cellLabel({ letter: "R", coordinate: { row: 1, col: 2 }, state: "selected", gridSize: SIZE }),
    ).toContain("selected");
  });

  it("announces each selection outcome", () => {
    expect(
      selectionAnnouncement({ kind: "match", word: "GRACE", foundCount: 2, totalWords: 5 }),
    ).toBe("GRACE found. 2 of 5 words found.");
    expect(selectionAnnouncement({ kind: "already_found", word: "GRACE" })).toContain("already");
    expect(selectionAnnouncement({ kind: "invalid_line" })).toContain("straight");
    expect(selectionAnnouncement({ kind: "no_match" })).toBeTruthy();
  });
});

describe("cell helpers", () => {
  it("gives exactly one cell the roving tabindex", () => {
    expect(cellTabIndex({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(0);
    expect(cellTabIndex({ row: 0, col: 1 }, { row: 0, col: 0 })).toBe(-1);
  });

  it("ranks found above selected", () => {
    const found = new Set([coordinateKey({ row: 0, col: 0 })]);
    const highlighted = new Set([coordinateKey({ row: 0, col: 0 })]);
    expect(cellStateFor({ row: 0, col: 0 }, found, highlighted)).toBe("found");
    expect(cellStateFor({ row: 1, col: 1 }, found, highlighted)).toBe("idle");
  });
});

describe("motionDuration", () => {
  it("removes motion entirely rather than shortening it", () => {
    // Vestibular triggers are about movement existing at all, not its speed.
    expect(motionDuration("reduced", 400)).toBe(0);
    expect(motionDuration("full", 400)).toBe(400);
  });
});
