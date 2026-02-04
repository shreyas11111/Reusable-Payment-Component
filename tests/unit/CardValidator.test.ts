import { describe, it, expect } from 'vitest';
import { luhnCheck, detectCardType, validateCardNumber, validateExpiry, validateCvc, validatePostalCode, getCvcLength } from '../../src/services/CardValidator';

describe('Luhn algorithm', () => {
  it('accepts valid Visa', () => {
    expect(luhnCheck('4242424242424242')).toBe(true);
  });
  it('accepts valid Amex', () => {
    expect(luhnCheck('378282246310005')).toBe(true);
  });
  it('rejects invalid card', () => {
    expect(luhnCheck('4242424242424241')).toBe(false);
  });
  it('rejects too short', () => {
    expect(luhnCheck('123456789012')).toBe(false);
  });
});

describe('Card type detection', () => {
  it('detects Visa', () => {
    expect(detectCardType('4')).toBe(null);
    expect(detectCardType('4242424242424242')).toBe('visa');
  });
  it('detects Mastercard', () => {
    expect(detectCardType('5111111111111118')).toBe('mastercard');
    expect(detectCardType('2221000000000009')).toBe('mastercard');
  });
  it('detects Amex', () => {
    expect(detectCardType('378282246310005')).toBe('amex');
  });
  it('detects Discover', () => {
    expect(detectCardType('6011111111111117')).toBe('discover');
  });
});

describe('validateCardNumber', () => {
  it('returns valid for correct Luhn', () => {
    const r = validateCardNumber('4242 4242 4242 4242');
    expect(r.isValid).toBe(true);
    expect(r.cardType).toBe('visa');
  });
  it('returns errors for invalid Luhn', () => {
    const r = validateCardNumber('4242424242424241');
    expect(r.isValid).toBe(false);
    expect(r.errors).toContain('Invalid card number');
  });
});

describe('validateExpiry', () => {
  it('accepts future date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const m = String(future.getMonth() + 1).padStart(2, '0');
    const y = String(future.getFullYear() % 100).padStart(2, '0');
    expect(validateExpiry(m, y).isValid).toBe(true);
  });
  it('rejects past date', () => {
    expect(validateExpiry('01', '20').errors.some((e) => e.includes('expired'))).toBe(true);
  });
  it('rejects invalid month', () => {
    expect(validateExpiry('13', '30').errors).toContain('Invalid expiration month');
  });
});

describe('validateCvc', () => {
  it('accepts 3 digits for Visa', () => {
    expect(validateCvc('123', null).isValid).toBe(true);
  });
  it('accepts 4 digits for Amex', () => {
    expect(validateCvc('1234', 'amex').isValid).toBe(true);
  });
  it('rejects 3 digits for Amex', () => {
    expect(validateCvc('123', 'amex').isValid).toBe(false);
  });
});

describe('validatePostalCode', () => {
  it('accepts US ZIP', () => {
    expect(validatePostalCode('12345', 'en-US').isValid).toBe(true);
    expect(validatePostalCode('12345-6789', 'en-US').isValid).toBe(true);
  });
  it('rejects invalid US ZIP', () => {
    expect(validatePostalCode('1234', 'en-US').isValid).toBe(false);
  });
});

describe('getCvcLength', () => {
  it('returns 4 for Amex', () => expect(getCvcLength('amex')).toBe(4));
  it('returns 3 for others', () => expect(getCvcLength('visa')).toBe(3));
});
