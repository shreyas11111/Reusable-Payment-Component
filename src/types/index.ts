export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export interface ValidationResult {
  isValid: boolean;
  cardType: CardType | null;
  errors: string[];
}

export enum PaymentErrorCode {
  INVALID_CARD_NUMBER = 'invalid_card_number',
  INVALID_EXPIRY = 'invalid_expiry',
  EXPIRED_CARD = 'expired_card',
  INVALID_CVC = 'invalid_cvc',
  INVALID_POSTAL = 'invalid_postal',
  INCOMPLETE_FORM = 'incomplete_form',
  NETWORK_ERROR = 'network_error',
  TOKEN_EXPIRED = 'token_expired',
  CARD_DECLINED = 'card_declined'
}

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  field?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  errorColor?: string;
  successColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  placeholderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  padding?: string;
  borderRadius?: string;
  gap?: string;
  focusRing?: string;
}

export type ThemeName = 'default' | 'minimal' | 'dark';

export interface PaymentChangeDetail {
  complete: boolean;
  errors: string[];
  cardType?: CardType | null;
}

export interface PaymentTokenDetail {
  token: string;
  expiresAt?: string;
}

export interface PaymentErrorDetail {
  code: string;
  message: string;
  field?: string;
}

export interface TokenPayload {
  encryptedData: string;
  nonce: string;
  timestamp: number;
  fingerprint: string;
}

export interface CardData {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  postalCode?: string;
}
