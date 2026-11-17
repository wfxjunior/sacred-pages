const LIVE_ORIGIN = "https://lumenadaily.com";
const ALLOWED_ORIGINS = new Set([
  LIVE_ORIGIN,
  "https://www.lumenadaily.com",
  "https://lumenadaily.lovable.app",
  "https://id-preview--6c2de52e-945e-4548-b717-7a47489f78e3.lovable.app",
  "http://localhost:8080",
]);

/** Only exact app origins are allowed, never caller-selected external hosts. */
export function trustedReturnOrigin(request?: Request, configured?: string): string {
  const candidates = [configured, request?.headers.get("origin"), request?.url];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (!url.username && !url.password && ALLOWED_ORIGINS.has(url.origin)) return url.origin;
    } catch {
      // Malformed origins fall back to the official site.
    }
  }
  return LIVE_ORIGIN;
}