// src/lib/isDisposableEmail.ts

/**
 * Disposable email blocking utility
 *
 * ⚠️ TEMPORARILY DISABLED
 * Set ENABLED = true to re-enable blocking
 */
const ENABLED = false; // TODO: Set to true before production

// Lightweight disposable domains list (can be extended later)
const DISPOSABLE_DOMAINS = [
  "juhxs.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
];

export function isDisposableEmail(email: string): boolean {
  if (!ENABLED) return false;

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  return DISPOSABLE_DOMAINS.some(
    (d) => domain === d || domain.endsWith(`.${d}`)
  );
}