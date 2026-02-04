/**
 * Format card number with spaces (4-4-4-4 for most, 4-6-5 for Amex)
 */
export function formatCardNumber(value: string, isAmex: boolean = false): string {
  const digits = value.replace(/\D/g, '');
  const maxLen = isAmex ? 15 : 16;
  const limited = digits.slice(0, maxLen);
  if (isAmex) {
    return limited.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) => {
      let result = a;
      if (b) result += ' ' + b;
      if (c) result += ' ' + c;
      return result.trim();
    });
  }
  return limited.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/** Format expiry as MM/YY */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

/** Format CVC (digits only, max 4 for Amex) */
export function formatCvc(value: string, isAmex: boolean = false): string {
  const digits = value.replace(/\D/g, '');
  return digits.slice(0, isAmex ? 4 : 3);
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Sanitize to prevent XSS - allow only safe chars for card/postal */
export function sanitizeInput(value: string, allowSpaces: boolean = false): string {
  const pattern = allowSpaces ? /[^0-9a-zA-Z\s\-]/g : /[^0-9a-zA-Z\-]/g;
  return value.replace(pattern, '');
}
