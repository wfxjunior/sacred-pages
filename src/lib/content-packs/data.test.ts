import { describe, expect, it } from "vitest";
import { CONTENT_PACKS } from "./data";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const NORMALIZED_RE = /^[A-Z0-9Ñ]{2,24}$/;
const LOCALES = ["en", "pt", "es"];

describe("content packs integrity", () => {
  it("gives every pack, journey and word a valid, unique uuid", () => {
    const ids = new Set<string>();
    for (const pack of CONTENT_PACKS) {
      for (const id of [
        pack.id,
        ...pack.journeys.flatMap((j) => [j.id, ...j.words.map((w) => w.id)]),
      ]) {
        expect(id).toMatch(UUID_RE);
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    }
  });

  it("carries all three locales for every pack, journey and word", () => {
    for (const pack of CONTENT_PACKS) {
      for (const locale of LOCALES) expect(pack.translations[locale]).toBeDefined();
      for (const journey of pack.journeys) {
        for (const locale of LOCALES) expect(journey.translations[locale]).toBeDefined();
        for (const word of journey.words) {
          for (const locale of LOCALES) {
            const translation = word.translations[locale];
            expect(translation).toBeDefined();
            expect(translation!.normalized).toMatch(NORMALIZED_RE);
            expect(translation!.display.length).toBeGreaterThanOrEqual(2);
            expect(translation!.display.length).toBeLessThanOrEqual(24);
          }
        }
      }
    }
  });

  it("never repeats a normalized word inside the same journey and locale", () => {
    for (const pack of CONTENT_PACKS) {
      for (const journey of pack.journeys) {
        for (const locale of LOCALES) {
          const seen = journey.words.map((w) => w.translations[locale]!.normalized);
          expect(new Set(seen).size).toBe(seen.length);
        }
      }
    }
  });

  it("gives every journey a whole week and every collection a unique slug", () => {
    const slugs = new Set<string>();
    for (const pack of CONTENT_PACKS) {
      expect(slugs.has(pack.slug)).toBe(false);
      slugs.add(pack.slug);
      expect(pack.journeys).toHaveLength(7);
      const positions = pack.journeys.map((j) => j.position).sort((a, b) => a - b);
      expect(positions).toEqual([0, 1, 2, 3, 4, 5, 6]);
    }
  });
});
