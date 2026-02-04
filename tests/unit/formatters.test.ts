import { describe, it, expect } from 'vitest';
import { formatCardNumber, formatExpiry, formatCvc, digitsOnly, sanitizeInput } from '../../src/utils/formatters';

describe('formatCardNumber', () => {
  it('formats with spaces for non-Amex', () => {
    expect(formatCardNumber('4242424242424242', false)).toBe('4242 4242 4242 4242');
  });
  it('formats Amex 4-6-5', () => {
    expect(formatCardNumber('378282246310005', true)).toBe('3782 822463 10005');
  });
  it('strips non-digits', () => {
    expect(formatCardNumber('4242-4242-4242-4242', false)).toBe('4242 4242 4242 4242');
  });
});

describe('formatExpiry', () => {
  it('adds slash after 2 digits', () => {
    expect(formatExpiry('1234')).toBe('12/34');
  });
  it('leaves 1-2 digits as-is', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('12')).toBe('12');
  });
});

describe('formatCvc', () => {
  it('limits to 3 for non-Amex', () => {
    expect(formatCvc('1234', false)).toBe('123');
  });
  it('limits to 4 for Amex', () => {
    expect(formatCvc('12345', true)).toBe('1234');
  });
});

describe('digitsOnly', () => {
  it('removes non-digits', () => {
    expect(digitsOnly('12 34-56')).toBe('123456');
  });
});

describe('sanitizeInput', () => {
  it('allows alphanumeric and spaces when allowSpaces', () => {
    expect(sanitizeInput('AB12 34', true)).toBe('AB12 34');
  });
  it('removes unsafe chars', () => {
    expect(sanitizeInput('ab<script>', false)).toBe('abscript');
  });
});
