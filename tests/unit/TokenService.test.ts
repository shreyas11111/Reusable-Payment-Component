import { describe, it, expect } from 'vitest';
import { createToken, isTokenExpired } from '../../src/services/TokenService';

describe('createToken', () => {
  const validCard = {
    number: '4242424242424242',
    expiryMonth: '12',
    expiryYear: '30',
    cvc: '123',
    postalCode: '12345'
  };

  it('returns token for valid data', () => {
    const result = createToken(validCard, true, 'en-US');
    expect('token' in result).toBe(true);
    if ('token' in result) {
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.expiresAt).toBeGreaterThan(Date.now());
    }
  });

  it('returns error for invalid card number', () => {
    const result = createToken({ ...validCard, number: '4242424242424241' }, true, 'en-US');
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error.code).toBe('invalid_card_number');
  });

  it('returns error for invalid CVC length', () => {
    const result = createToken({ ...validCard, cvc: '12' }, true, 'en-US');
    expect('error' in result).toBe(true);
  });

  it('returns error for invalid postal when enabled', () => {
    const result = createToken({ ...validCard, postalCode: '1' }, true, 'en-US');
    expect('error' in result).toBe(true);
  });
});

describe('isTokenExpired', () => {
  it('returns true for past timestamp', () => {
    expect(isTokenExpired(Date.now() - 1000)).toBe(true);
  });
  it('returns false for future timestamp', () => {
    expect(isTokenExpired(Date.now() + 60000)).toBe(false);
  });
});
