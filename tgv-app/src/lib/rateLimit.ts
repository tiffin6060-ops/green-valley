/**
 * Simple in-memory sliding-window rate limiter.
 *
 * LIMITATION: state lives in the memory of a single serverless instance. On Vercel,
 * each cold start / parallel instance has its own counter and it resets on redeploy,
 * so this only slows down casual abuse. For a hard limit use a shared store
 * (e.g. Upstash Redis / Vercel KV) or Vercel's firewall rate limiting.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}
