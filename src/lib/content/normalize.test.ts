import { describe, expect, it } from "vitest";
import { hasMatchableContent, normalizeDisplayWord, normalizeWord } from "./normalize";

describe("normalizeWord", () => {
  it("folds Portuguese diacritics while preserving the display form separately", () => {
    expect(normalizeWord("GRAÇA")).toBe("GRACA");
    expect(normalizeWord("ORAÇÃO")).toBe("ORACAO");
    expect(normalizeWord("Coração")).toBe("CORACAO");
    expect(normalizeWord("FÉ")).toBe("FE");
    expect(normalizeWord("irmã")).toBe("IRMA");
  });

  it("folds Spanish accents", () => {
    expect(normalizeWord("JESÚS")).toBe("JESUS");
    expect(normalizeWord("oración")).toBe("ORACION");
    expect(normalizeWord("PINGÜINO")).toBe("PINGUINO");
  });

  it("keeps N-tilde distinct so AÑO never collides with ANO", () => {
    expect(normalizeWord("AÑO")).toBe("AÑO");
    expect(normalizeWord("ANO")).toBe("ANO");
    expect(normalizeWord("AÑO")).not.toBe(normalizeWord("ANO"));
    expect(normalizeWord("niño")).toBe("NIÑO");
  });

  it("strips spaces, punctuation, apostrophes and hyphens", () => {
    expect(normalizeWord("São Paulo")).toBe("SAOPAULO");
    expect(normalizeWord("D'ARC")).toBe("DARC");
    expect(normalizeWord("well-being")).toBe("WELLBEING");
    expect(normalizeWord("Jesus!")).toBe("JESUS");
  });

  it("returns an empty string for punctuation-only input", () => {
    expect(normalizeWord("---")).toBe("");
    expect(normalizeWord("'")).toBe("");
    expect(normalizeWord("   ")).toBe("");
  });

  it("is idempotent", () => {
    for (const word of ["ORAÇÃO", "AÑO", "São Paulo", "FÉ"]) {
      expect(normalizeWord(normalizeWord(word))).toBe(normalizeWord(word));
    }
  });

  it("handles pre-composed and decomposed input identically", () => {
    const precomposed = "ÁGUA"; // Á as one code point
    const decomposed = "ÁGUA"; // A + combining acute
    expect(normalizeWord(precomposed)).toBe("AGUA");
    expect(normalizeWord(decomposed)).toBe("AGUA");
  });
});

describe("normalizeDisplayWord", () => {
  it("preserves accents and collapses whitespace", () => {
    expect(normalizeDisplayWord("  ORAÇÃO  ")).toBe("ORAÇÃO");
    expect(normalizeDisplayWord("São   Paulo")).toBe("São Paulo");
  });
});

describe("hasMatchableContent", () => {
  it("distinguishes real words from punctuation", () => {
    expect(hasMatchableContent("FÉ")).toBe(true);
    expect(hasMatchableContent("---")).toBe(false);
    expect(hasMatchableContent("")).toBe(false);
  });
});
