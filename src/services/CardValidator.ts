import type { CardType, ValidationResult } from '../types';
import { digitsOnly } from '../utils/formatters';

const CARD_PATTERNS: Array<{ type: CardType; pattern: RegExp; lengths: number[] }> = [
  { type: 'visa', pattern: /^4/, lengths: [13, 16, 19] },
  { type: 'mastercard', pattern: /^5[1-5]|^2[2-7]/, lengths: [16] },
  { type: 'amex', pattern: /^3[47]/, lengths: [15] },
  { type: 'discover', pattern: /^6(?:011|5)/, lengths: [16] }
];

const MAX_EXPIRY_YEARS = 10;

export function detectCardType(number: string): CardType | null {
  const digits = digitsOnly(number);
  if (digits.length < 4) return null;
  for (const { type, pattern } of CARD_PATTERNS) {
    if (pattern.test(digits)) return type;
  }
  return 'unknown';
}

export function luhnCheck(number: string): boolean {
  const digits = digitsOnly(number);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export function validateCardNumber(number: string): ValidationResult {
  const errors: string[] = [];
  const digits = digitsOnly(number);
  if (digits.length === 0) return { isValid: false, cardType: null, errors: [] };

  const cardType = detectCardType(number);
  const config = CARD_PATTERNS.find((c) => c.type === cardType);
  if (cardType && cardType !== 'unknown' && config && !config.lengths.includes(digits.length) && digits.length >= Math.min(...config.lengths)) {
    errors.push('Invalid card number length');
  }
  if (digits.length >= 13 && !luhnCheck(number)) errors.push('Invalid card number');
  if (digits.length > 0 && digits.length < 13) return { isValid: false, cardType, errors: [] };

  return { isValid: errors.length === 0 && luhnCheck(number), cardType: cardType || null, errors };
}

export function validateExpiry(month: string, year: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (!month || !year || month.length < 2 || year.length < 2) return { isValid: false, errors: [] };
  if (m < 1 || m > 12) errors.push('Invalid expiration month');
  if (year.length === 2) {
    const fullYear = 2000 + y;
    const maxYear = now.getFullYear() + MAX_EXPIRY_YEARS;
    if (fullYear < now.getFullYear()) errors.push('Card has expired');
    else if (fullYear > maxYear) errors.push('Expiry date too far in future');
  }
  if (errors.length === 0 && month.length === 2 && year.length === 2 && y === currentYear && m < currentMonth) {
    errors.push('Card has expired');
  }
  return { isValid: errors.length === 0, errors };
}

export function validateCvc(cvc: string, cardType: CardType | null): { isValid: boolean; errors: string[] } {
  const digits = digitsOnly(cvc);
  const requiredLen = cardType === 'amex' ? 4 : 3;
  if (digits.length === 0) return { isValid: false, errors: [] };
  if (digits.length < requiredLen) return { isValid: false, errors: [] };
  const errors = digits.length !== requiredLen ? [cardType === 'amex' ? 'CVC must be 4 digits' : 'CVC must be 3 digits'] : [];
  return { isValid: errors.length === 0, errors };
}

export function validatePostalCode(postalCode: string, locale: string = 'en-US'): { isValid: boolean; errors: string[] } {
  const trimmed = postalCode.trim();
  const errors: string[] = [];
  if (trimmed.length === 0) return { isValid: false, errors: [] };
  if (locale === 'en-US' || locale.startsWith('en-US')) {
    if (!/^\d{5}(-\d{4})?$/.test(trimmed)) errors.push('Invalid ZIP code');
    return { isValid: errors.length === 0, errors };
  }
  if (locale === 'en-GB' || locale.startsWith('en-GB')) {
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(trimmed.replace(/\s/g, ' ')) && trimmed.length >= 5) errors.push('Invalid postcode');
    return { isValid: errors.length === 0, errors };
  }
  if (!/^[0-9a-zA-Z\s\-]{3,10}$/.test(trimmed)) errors.push('Invalid postal code');
  return { isValid: errors.length === 0, errors };
}

export function getCvcLength(cardType: CardType | null): number {
  return cardType === 'amex' ? 4 : 3;
}
