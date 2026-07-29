import { describe, expect, it } from "vitest";
import { isValidSlug, slugify, SLUG_MAX_LENGTH, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("produces URL-safe slugs from titles", () => {
    expect(slugify("The Life of Jesus")).toBe("the-life-of-jesus");
    expect(slugify("Women of the Bible")).toBe("women-of-the-bible");
  });

  it("folds accents to ASCII (unlike puzzle normalization, URLs stay ASCII)", () => {
    expect(slugify("Oração e Fé")).toBe("oracao-e-fe");
    expect(slugify("El Año Nuevo")).toBe("el-ano-nuevo");
  });

  it("collapses punctuation and repeated separators", () => {
    expect(slugify("Faith,   Hope & Love!")).toBe("faith-hope-love");
    expect(slugify("--leading and trailing--")).toBe("leading-and-trailing");
  });

  it("never exceeds the maximum length or ends with a hyphen", () => {
    const slug = slugify("a ".repeat(200));
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("output always satisfies the database constraint", () => {
    for (const title of ["The Life of Jesus", "Oração", "123 Numbers", "A"]) {
      expect(isValidSlug(slugify(title))).toBe(true);
    }
  });
});

describe("isValidSlug", () => {
  it("accepts valid slugs", () => {
    expect(isValidSlug("psalms")).toBe(true);
    expect(isValidSlug("the-life-of-jesus")).toBe(true);
    expect(isValidSlug("plan-2")).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("Psalms")).toBe(false);
    expect(isValidSlug("double--hyphen")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
    expect(isValidSlug("has space")).toBe(false);
    expect(isValidSlug("oração")).toBe(false);
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when unused", () => {
    expect(uniqueSlug("Psalms", [])).toBe("psalms");
  });

  it("appends a suffix when taken", () => {
    expect(uniqueSlug("Psalms", ["psalms"])).toBe("psalms-2");
    expect(uniqueSlug("Psalms", ["psalms", "psalms-2"])).toBe("psalms-3");
  });

  it("keeps suffixed slugs within the length limit and valid", () => {
    const long = "x".repeat(SLUG_MAX_LENGTH);
    const taken = [long.slice(0, SLUG_MAX_LENGTH)];
    const result = uniqueSlug(long, taken);
    expect(result.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(isValidSlug(result)).toBe(true);
  });
});
