/**
 * In-memory sliding-window rate limiter for server actions.
 *
 * **Limitation:** The store lives in the serverless instance's memory, so it
 * resets on cold starts and is not shared across Vercel function instances.
 * This is acceptable as a first layer of defense — Supabase Auth provides
 * an additional layer of built-in rate limiting.
 *
 * @module security/rate-limit
 */

import { headers } from 'next/headers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window. */
  limit: number;
  /** Window duration in seconds. */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

// ---------------------------------------------------------------------------
// Sliding-window store (module-level singleton per serverless instance)
// ---------------------------------------------------------------------------

const store = new Map<string, number[]>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(maxWindowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - maxWindowMs;
  for (const [key, timestamps] of store) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      store.set(key, valid);
    }
  }
}

// ---------------------------------------------------------------------------
// Core check
// ---------------------------------------------------------------------------

function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // Lazy cleanup to avoid unbounded memory growth
  cleanupExpiredEntries(windowMs);

  const cutoff = now - windowMs;
  const existing = store.get(key) ?? [];
  const valid = existing.filter((t) => t > cutoff);

  if (valid.length >= config.limit) {
    return { success: false, remaining: 0, resetAt: valid[0] + windowMs };
  }

  valid.push(now);
  store.set(key, valid);

  return {
    success: true,
    remaining: config.limit - valid.length,
    resetAt: valid[0] + windowMs,
  };
}

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

async function getClientIp(): Promise<string> {
  const h = await headers();
  // Vercel sets x-forwarded-for; use the first IP (client IP)
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return h.get('x-real-ip') ?? h.get('cf-connecting-ip') ?? 'unknown';
}

// ---------------------------------------------------------------------------
// Pre-configured limits by action type
// ---------------------------------------------------------------------------

const LIMITS = {
  login: { limit: 10, windowSeconds: 300 }, // 10 attempts per 5 min
  signup: { limit: 10, windowSeconds: 1800 }, // 10 attempts per 30 min
  passwordReset: { limit: 5, windowSeconds: 900 }, // 5 attempts per 15 min
  application: { limit: 10, windowSeconds: 600 }, // 10 submissions per 10 min
  jobMutation: { limit: 30, windowSeconds: 3600 }, // 30 job ops per hour
  profileUpdate: { limit: 20, windowSeconds: 3600 }, // 20 profile updates per hour
  statusUpdate: { limit: 60, windowSeconds: 3600 }, // 60 status changes per hour
} as const;

type ActionType = keyof typeof LIMITS;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check rate limit for a server action.
 *
 * @param actionType - The category of action (determines limits).
 * @param discriminator - Optional extra key (e.g., email) for per-account limits.
 * @returns `null` if allowed, or `{ error, code }` if rate limited.
 */
export async function rateLimit(
  actionType: ActionType,
  discriminator?: string,
): Promise<{ error: string; code: string } | null> {
  const ip = await getClientIp();
  const key = discriminator
    ? `${actionType}:${ip}:${discriminator}`
    : `${actionType}:${ip}`;

  const config = LIMITS[actionType];
  const result = checkRateLimit(key, config);

  if (!result.success) {
    return { error: 'too_many_requests', code: 'rate_limited' };
  }

  return null;
}
