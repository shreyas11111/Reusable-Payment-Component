/**
 * Client-side encryption utilities (simulated for demo).
 * Sensitive data is never logged.
 */

export function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function encryptPayload(plaintext: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  return btoa(String.fromCharCode(...data));
}

export function createFingerprint(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '').slice(0, 6);
  if (digits.length < 6) return '';
  let hash = 0;
  for (let i = 0; i < digits.length; i++) {
    const c = digits.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function encodeTokenPayload(payload: object): string {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeTokenPayload(token: string): object | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(token)))) as object;
  } catch {
    return null;
  }
}
