/**
 * Dummy Payment API - simulates tokenize and charge endpoints.
 * In production, replace with real payment processor (Stripe, etc.).
 */

export interface TokenizeRequest {
  encryptedCardData: string;
}

export interface TokenizeResponse {
  token: string;
  expiresAt: string;
}

export interface ChargeRequest {
  token: string;
  amount: number;
  currency: string;
}

export interface ChargeSuccessResponse {
  success: true;
  transactionId: string;
}

export interface ChargeErrorResponse {
  success: false;
  error: { code: string; message: string };
}

export type ChargeResponse = ChargeSuccessResponse | ChargeErrorResponse;

const SUCCESS_CARD = '4242424242424242';
const INSUFFICIENT_FUNDS = '4000000000000002';
const CARD_DECLINED = '4000000000009995';
const EXPIRED_CARD = '4000000000000069';

function getCardBINFromToken(token: string): string | null {
  try {
    const decoded = atob(token);
    const parsed = JSON.parse(decoded);
    const enc = parsed.encryptedData;
    if (!enc) return null;
    const data = atob(enc);
    const cardData = JSON.parse(data);
    return (cardData.number || '').replace(/\D/g, '').slice(0, 16);
  } catch {
    return null;
  }
}

export async function tokenize(encryptedCardData: string): Promise<TokenizeResponse> {
  await delay(50);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const token = btoa(JSON.stringify({ encryptedCardData, createdAt: Date.now() }));
  return { token, expiresAt };
}

export async function charge(token: string, amount: number, currency: string): Promise<ChargeResponse> {
  await delay(80);
  const bin = getCardBINFromToken(token);
  const digits = (bin || '').replace(/\D/g, '');

  if (digits === INSUFFICIENT_FUNDS) return { success: false, error: { code: 'insufficient_funds', message: 'Insufficient funds' } };
  if (digits === CARD_DECLINED) return { success: false, error: { code: 'card_declined', message: 'Your card was declined' } };
  if (digits === EXPIRED_CARD) return { success: false, error: { code: 'expired_card', message: 'Your card has expired' } };
  if (digits === SUCCESS_CARD || digits.length >= 13) return { success: true, transactionId: 'txn_' + Math.random().toString(36).slice(2, 12) };
  return { success: false, error: { code: 'invalid_token', message: 'Invalid payment token' } };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
