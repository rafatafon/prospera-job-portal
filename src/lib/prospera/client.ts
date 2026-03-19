import 'server-only';

// ---------------------------------------------------------------------------
// Prospera external API client — server-only module
// Verifies company Resident Permit Numbers (RPNs) against the Prospera
// registry API.
// ---------------------------------------------------------------------------

const BASE_URL = 'https://portal.eprospera.com/api/v1';
const FETCH_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Types (exported for use in server actions / route handlers)
// ---------------------------------------------------------------------------

export type LegalEntity = {
  id: string;
  name: string;
  extension: string;
  residentPermitNumber: string;
};

export type ProspectaVerifyResult =
  | { status: 'valid'; entity: LegalEntity }
  | { status: 'not_found' }
  | { status: 'inactive' }
  | { status: 'natural_person' }
  | { status: 'rate_limited' }
  | { status: 'api_error'; message: string };

// Internal response shapes (not exported)
type VerifyRpnResponse = {
  result: 'found_legal_entity' | 'found_natural_person' | 'not_found';
  active: boolean;
};

type LegalEntitySearchResponse = {
  results: LegalEntity[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiKey(): string {
  const key = process.env.PROSPERA_API_KEY;
  if (!key) {
    throw new Error(
      'PROSPERA_API_KEY environment variable is not set. ' +
        'Add it to your server environment (do NOT use NEXT_PUBLIC_ prefix).',
    );
  }
  return key;
}

/**
 * Thin wrapper around `fetch` that adds auth headers, a timeout via
 * AbortController, and standardised error handling. Never exposes raw API
 * details to callers.
 */
async function prosperaFetch<T>(
  path: string,
  body: Record<string, string>,
): Promise<{ ok: true; data: T } | { ok: false; result: ProspectaVerifyResult }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 429) {
      return { ok: false, result: { status: 'rate_limited' } };
    }

    if (response.status === 401) {
      return {
        ok: false,
        result: { status: 'api_error', message: 'Authentication with Prospera API failed.' },
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        result: {
          status: 'api_error',
          message: `Prospera API returned status ${response.status}.`,
        },
      };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        ok: false,
        result: { status: 'api_error', message: 'Prospera API request timed out.' },
      };
    }
    return {
      ok: false,
      result: { status: 'api_error', message: 'Failed to connect to Prospera API.' },
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Verify a Resident Permit Number (RPN) against the Prospera registry.
 *
 * 1. Calls POST /verify_rpn to check existence and status.
 * 2. If the RPN belongs to an active legal entity, calls
 *    POST /registries/legal_entities/search to retrieve full entity details.
 * 3. Returns a discriminated union so callers can pattern-match on `status`.
 */
export async function verifyAndLookupRpn(rpn: string): Promise<ProspectaVerifyResult> {
  // --- Step 1: verify the RPN ---
  const verifyRes = await prosperaFetch<VerifyRpnResponse>('/verify_rpn', { rpn });

  if (!verifyRes.ok) {
    return verifyRes.result;
  }

  const { result, active } = verifyRes.data;

  if (result === 'not_found') {
    return { status: 'not_found' };
  }

  if (result === 'found_natural_person') {
    return { status: 'natural_person' };
  }

  // result === 'found_legal_entity'
  if (!active) {
    return { status: 'inactive' };
  }

  // --- Step 2: look up entity details ---
  const searchRes = await prosperaFetch<LegalEntitySearchResponse>(
    '/registries/legal_entities/search',
    { query: rpn },
  );

  if (!searchRes.ok) {
    return searchRes.result;
  }

  const entity = searchRes.data.results.find((e) => e.residentPermitNumber === rpn);

  if (!entity) {
    // Defensive: verify said it exists but search didn't match.
    return { status: 'not_found' };
  }

  return { status: 'valid', entity };
}
