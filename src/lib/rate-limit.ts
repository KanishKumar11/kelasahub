// Small in-memory limiter for public forms. Per-instance only, which is enough to
// blunt casual spam; put a WAF/CDN rule in front for anything heavier.
const hits = new Map<string, number[]>();

export function rateLimit(req: Request, bucket: string, perMinute: number) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= perMinute) return false;
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}
