import { describe, expect, it } from "vitest";
import {
  hasBlockingIssues,
  parseBulkWords,
  previewNormalization,
  validateWordList,
  type WordListEntry,
} from "./word-list";

const base = { minGridSize: 10, targetWordCount: 8 };

function entries(...words: string[]): WordListEntry[] {
  return words.map((displayValue) => ({ displayValue }));
}

describe("validateWordList", () => {
  it("accepts a healthy list", () => {
    const issues = validateWordList({
      ...base,
      entries: entries("GRACE", "FAITH", "PEACE", "PRAYER", "HOPE"),
    });
    expect(issues).toEqual([]);
  });

  it("flags duplicate display values", () => {
    const issues = validateWordList({ ...base, entries: entries("GRACE", "FAITH", "GRACE") });
    expect(issues.some((i) => i.code === "duplicate_display" && i.index === 2)).toBe(true);
  });

  it("flags words that collide only after accent folding", () => {
    // "AVO" and "AVÔ" are different words but identical in the puzzle grid.
    const issues = validateWordList({ ...base, entries: entries("AVO", "FAITH", "AVÔ") });
    expect(issues.some((i) => i.code === "duplicate_normalized" && i.index === 2)).toBe(true);
  });

  it("does not flag AÑO against ANO, which remain distinct", () => {
    const issues = validateWordList({ ...base, entries: entries("AÑO", "ANO", "FAITH") });
    expect(issues.some((i) => i.code === "duplicate_normalized")).toBe(false);
  });

  it("rejects words too long for the smallest grid", () => {
    const issues = validateWordList({
      ...base,
      minGridSize: 8,
      entries: entries("GRACE", "FAITH", "TRANSFIGURATION"),
    });
    expect(issues.some((i) => i.code === "too_long_for_grid" && i.severity === "error")).toBe(true);
  });

  it("rejects punctuation-only and empty entries", () => {
    const issues = validateWordList({
      ...base,
      entries: entries("GRACE", "---", "", "FAITH"),
    });
    expect(issues.some((i) => i.code === "punctuation_only")).toBe(true);
    expect(issues.some((i) => i.code === "empty")).toBe(true);
  });

  it("rejects words shorter than two letters", () => {
    const issues = validateWordList({ ...base, entries: entries("A", "GRACE", "FAITH") });
    expect(issues.some((i) => i.code === "too_short")).toBe(true);
  });

  it("warns (not errors) when there are more words than the target", () => {
    const issues = validateWordList({
      ...base,
      targetWordCount: 3,
      entries: entries("GRACE", "FAITH", "PEACE", "HOPE", "MERCY"),
    });
    const tooMany = issues.find((i) => i.code === "too_many_words");
    expect(tooMany?.severity).toBe("warning");
    expect(hasBlockingIssues([tooMany!])).toBe(false);
  });

  it("errors when there are too few words", () => {
    const issues = validateWordList({ ...base, entries: entries("GRACE", "FAITH") });
    expect(issues.some((i) => i.code === "too_few_words" && i.severity === "error")).toBe(true);
  });

  it("warns about missing translations when locales are required", () => {
    const issues = validateWordList({
      ...base,
      entries: [
        { id: "w1", displayValue: "GRACE" },
        { id: "w2", displayValue: "FAITH" },
        { id: "w3", displayValue: "PEACE" },
      ],
      requiredLocales: ["en", "pt", "es"],
      existingTranslations: { w1: ["en", "pt", "es"], w2: ["en"], w3: ["en", "pt"] },
    });
    const missing = issues.filter((i) => i.code === "missing_translation");
    expect(missing).toHaveLength(2);
    expect(missing[0].message).toContain("pt");
    expect(missing[0].message).toContain("es");
  });
});

describe("hasBlockingIssues", () => {
  it("is true only when an error-severity issue exists", () => {
    expect(hasBlockingIssues([{ code: "empty", index: 0, message: "", severity: "error" }])).toBe(
      true,
    );
    expect(
      hasBlockingIssues([
        { code: "too_many_words", index: null, message: "", severity: "warning" },
      ]),
    ).toBe(false);
  });
});

describe("parseBulkWords", () => {
  it("splits on newlines, commas and semicolons", () => {
    expect(parseBulkWords("GRACE\nFAITH, PEACE; HOPE").map((e) => e.displayValue)).toEqual([
      "GRACE",
      "FAITH",
      "PEACE",
      "HOPE",
    ]);
  });

  it("preserves accented spelling and drops blanks", () => {
    expect(parseBulkWords("ORAÇÃO,, \n , FÉ").map((e) => e.displayValue)).toEqual(["ORAÇÃO", "FÉ"]);
  });
});

describe("previewNormalization", () => {
  it("shows the display and matching forms side by side", () => {
    expect(previewNormalization(entries("ORAÇÃO", "AÑO"))).toEqual([
      { display: "ORAÇÃO", normalized: "ORACAO" },
      { display: "AÑO", normalized: "AÑO" },
    ]);
  });
});
