export function getCardNumberAriaLabel(_locale: string): string {
  return 'Card number';
}
export function getExpiryAriaLabel(_locale: string): string {
  return 'Expiration date (MM/YY)';
}
export function getCvcAriaLabel(_locale: string): string {
  return 'Security code (CVC)';
}
export function getPostalCodeAriaLabel(_locale: string): string {
  return 'Postal code';
}
export function getErrorId(fieldName: string): string {
  return `${fieldName}-error`;
}
export function getDescribedBy(fieldName: string, hasError: boolean): string | undefined {
  return hasError ? getErrorId(fieldName) : undefined;
}
