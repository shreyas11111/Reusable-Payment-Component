import type { CardData, TokenPayload } from '../types';
import { PaymentErrorCode } from '../types';
import { encryptPayload, generateNonce, createFingerprint, encodeTokenPayload } from '../utils/encryption';
import { validateCardNumber, validateExpiry, validateCvc, validatePostalCode, detectCardType } from './CardValidator';
import type { PaymentError } from '../types';

const TOKEN_TTL_MS = 15 * 60 * 1000;

export function createToken(
  cardData: CardData,
  postalCodeEnabled: boolean,
  locale: string
): { token: string; expiresAt: number } | { error: PaymentError } {
  const number = cardData.number.replace(/\D/g, '');
  const cardValidation = validateCardNumber(cardData.number);
  if (!cardValidation.isValid) {
    return {
      error: {
        code: PaymentErrorCode.INVALID_CARD_NUMBER,
        message: cardValidation.errors[0] || 'Invalid card number',
        field: 'number'
      }
    };
  }
  const expiryValidation = validateExpiry(cardData.expiryMonth, cardData.expiryYear);
  if (!expiryValidation.isValid) {
    return {
      error: {
        code: expiryValidation.errors.some((e) => e.includes('expired')) ? PaymentErrorCode.EXPIRED_CARD : PaymentErrorCode.INVALID_EXPIRY,
        message: expiryValidation.errors[0] || 'Invalid expiry',
        field: 'expiry'
      }
    };
  }
  const cardType = detectCardType(cardData.number);
  const cvcValidation = validateCvc(cardData.cvc, cardType);
  if (!cvcValidation.isValid) {
    return {
      error: {
        code: PaymentErrorCode.INVALID_CVC,
        message: cvcValidation.errors[0] || 'Invalid CVC',
        field: 'cvc'
      }
    };
  }
  if (postalCodeEnabled && cardData.postalCode !== undefined) {
    const postalValidation = validatePostalCode(cardData.postalCode, locale);
    if (!postalValidation.isValid) {
      return {
        error: {
          code: PaymentErrorCode.INVALID_POSTAL,
          message: postalValidation.errors[0] || 'Invalid postal code',
          field: 'postalCode'
        }
      };
    }
  }

  const nonce = generateNonce();
  const timestamp = Date.now();
  const fingerprint = createFingerprint(cardData.number);
  const payload = {
    number,
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
    cvc: cardData.cvc,
    postalCode: cardData.postalCode ?? ''
  };
  const encryptedData = encryptPayload(JSON.stringify(payload));
  const tokenPayload: TokenPayload = { encryptedData, nonce, timestamp, fingerprint };
  const token = encodeTokenPayload(tokenPayload);
  return { token, expiresAt: timestamp + TOKEN_TTL_MS };
}

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
