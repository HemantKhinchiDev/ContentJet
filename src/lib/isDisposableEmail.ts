// src/lib/isDisposableEmail.ts

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
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  return DISPOSABLE_DOMAINS.some(
    (d) => domain === d || domain.endsWith(`.${d}`)
  );
}
