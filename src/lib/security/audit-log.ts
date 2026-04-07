/**
 * Security audit logging via Sentry.
 *
 * Captures security-relevant events (rate limit hits, blocked file uploads)
 * as Sentry events with structured context.
 *
 * @module security/audit-log
 */

import * as Sentry from '@sentry/nextjs';
import { headers } from 'next/headers';

type SecurityEvent =
  | 'security.rate_limited'
  | 'security.file_blocked';

interface AuditContext {
  action: string;
  [key: string]: string | number | boolean | null | undefined;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return h.get('x-real-ip') ?? 'unknown';
}

/**
 * Log a security event to Sentry.
 */
export async function logSecurityEvent(
  event: SecurityEvent,
  context: AuditContext,
): Promise<void> {
  const ip = await getClientIp();

  Sentry.captureMessage(event, {
    level: event === 'security.rate_limited' ? 'warning' : 'error',
    tags: {
      'security.event': event,
      'security.action': context.action,
    },
    extra: {
      ...context,
      ip,
      timestamp: new Date().toISOString(),
    },
  });
}
