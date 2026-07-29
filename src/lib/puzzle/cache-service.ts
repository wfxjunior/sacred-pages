// PuzzleCacheService — a tiny TTL cache behind an async interface.
//
// The interface is deliberately async and string-keyed even though the current
// implementation is a synchronous in-memory Map. That is what makes swapping in
// Redis (or Vercel KV, or Cloudflare KV) a configuration change rather than a
// refactor: every caller already awaits, and no caller depends on Map.
//
// Only immutable or slow-changing data is cached. Per-user session and progress
// state is NEVER cached — it is small, changes constantly, and a stale read
// would show a reader the wrong puzzle state.

export type CacheStore = {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
};

type Entry = { value: unknown; expiresAt: number };

/**
 * In-memory store. Per-process, so it is a request-coalescing cache rather than
 * a shared one — correct but not shared across server instances.
 */
export class MemoryCacheStore implements CacheStore {
  private readonly entries = new Map<string, Entry>();

  constructor(private readonly maxEntries = 500) {}

  async get<T>(key: string): Promise<T | null> {
    const entry = this.entries.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }

    // Refresh recency for the LRU eviction below.
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }

  async clear(): Promise<void> {
    this.entries.clear();
  }

  /** Test/diagnostic helper — not part of CacheStore. */
  get size(): number {
    return this.entries.size;
  }
}

/**
 * Cache key namespaces. Centralised so an invalidation can never miss a key
 * that was built ad hoc at a call site.
 */
export const cacheKeys = {
  template: (id: string) => `puzzle:template:${id}`,
  activeTemplate: (journeyId: string, locale: string, difficulty: string) =>
    `puzzle:template:active:${journeyId}:${locale}:${difficulty}`,
  instance: (id: string) => `puzzle:instance:${id}`,
  instanceByKey: (templateId: string, version: number, seed: number, engine: string) =>
    `puzzle:instance:key:${templateId}:${version}:${seed}:${engine}`,
  wordMetadata: (journeyId: string, locale: string) => `puzzle:words:${journeyId}:${locale}`,
  dailyJourney: (date: string, locale: string) => `content:daily:${date}:${locale}`,
  statistics: (instanceId: string) => `puzzle:stats:${instanceId}`,
} as const;

/**
 * TTLs reflect how mutable each thing is.
 *
 * A generated instance is immutable by construction, so it can be cached for a
 * long time. Templates change when editors publish a new version. Statistics
 * are aggregates that may lag slightly without harm.
 */
export const CACHE_TTL = {
  /** Immutable once generated. */
  instance: 60 * 60 * 24,
  /** Changes only when an editor activates a new version. */
  template: 60 * 10,
  /** Published word lists change rarely. */
  wordMetadata: 60 * 15,
  /** Fixed for the day once assigned. */
  dailyJourney: 60 * 30,
  /** Aggregates; a little staleness is acceptable. */
  statistics: 60 * 5,
} as const;

export class PuzzleCacheService {
  constructor(private readonly store: CacheStore = new MemoryCacheStore()) {}

  /**
   * Cache-aside read. On a miss the loader runs and its result is stored;
   * `null` results are NOT cached, so a missing row cannot be pinned as absent.
   */
  async remember<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T | null>,
  ): Promise<T | null> {
    const cached = await this.store.get<T>(key);
    if (cached !== null) return cached;

    const value = await loader();
    if (value !== null && value !== undefined) {
      await this.store.set(key, value, ttlSeconds);
    }
    return value;
  }

  async invalidate(key: string): Promise<void> {
    await this.store.delete(key);
  }

  /**
   * Invalidates everything derived from a template. Called when a template is
   * activated or archived — the active-template key and the template key are
   * both affected, and forgetting either would serve a stale recipe.
   */
  async invalidateTemplate(input: {
    templateId: string;
    journeyId: string;
    languageCode: string;
    difficulty: string;
  }): Promise<void> {
    await Promise.all([
      this.store.delete(cacheKeys.template(input.templateId)),
      this.store.delete(
        cacheKeys.activeTemplate(input.journeyId, input.languageCode, input.difficulty),
      ),
    ]);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
}

export const puzzleCache = new PuzzleCacheService();
