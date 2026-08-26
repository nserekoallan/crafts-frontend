import { ApiError } from './api';

/**
 * Turns an unknown thrown value into something worth showing a user.
 *
 * The API returns a plain string for most failures but an **array** of
 * validation messages for 400s, e.g.
 *   { error: { message: ["Phone must be a valid international number"] } }
 *
 * The auth screens used to `catch {}` and show a fixed string, so a user whose
 * phone format was rejected was told to "check your details" with no hint as to
 * which detail. They retried the same input indefinitely.
 *
 * @param fallback shown when the server gave us nothing usable.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) {
    return fallback;
  }

  const raw = err.body?.error?.message as unknown;

  if (Array.isArray(raw)) {
    const messages = raw.filter((m): m is string => typeof m === 'string');
    if (messages.length > 0) {
      // One line per failed rule reads better than a comma-joined run-on.
      return messages.join('. ');
    }
  }

  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw;
  }

  return fallback;
}
