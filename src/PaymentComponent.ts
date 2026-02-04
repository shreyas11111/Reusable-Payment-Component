import type { ThemeConfig, ThemeName, PaymentChangeDetail, PaymentTokenDetail, PaymentErrorDetail, CardData } from './types';
import { getTheme, themeToCssVars } from './styles/themes';
import { baseCss } from './styles/base-css';
import { createCardNumberInput } from './components/CardNumberInput';
import { createExpiryInput } from './components/ExpiryInput';
import { createCVCInput } from './components/CVCInput';
import { createPostalCodeInput } from './components/PostalCodeInput';
import { createToken } from './services/TokenService';
import { tokenize } from './services/PaymentAPI';
import type { CardType } from './types';

const EVENT_READY = 'payment-ready';
const EVENT_CHANGE = 'payment-change';
const EVENT_TOKEN = 'payment-token';
const EVENT_ERROR = 'payment-error';

export class PaymentComponent extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['theme', 'locale', 'disabled', 'postal-code-enabled'];
  }

  private _theme: ThemeName | ThemeConfig = 'default';
  private _locale = 'en-US';
  private _disabled = false;
  private _postalCodeEnabled = true;
  private _cardType: CardType | null = null;
  private _errors: string[] = [];
  private _complete = false;

  private shadow: ShadowRoot;
  private styleEl!: HTMLStyleElement;
  private cardNumberInput!: ReturnType<typeof createCardNumberInput>;
  private expiryInput!: ReturnType<typeof createExpiryInput>;
  private cvcInput!: ReturnType<typeof createCVCInput>;
  private postalCodeInput!: ReturnType<typeof createPostalCodeInput> | null;
  private container!: HTMLDivElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'closed' });
  }

  connectedCallback(): void {
    this._theme = (this.getAttribute('theme') as ThemeName) || 'default';
    this._locale = this.getAttribute('locale') || 'en-US';
    this._disabled = this.getAttribute('disabled') !== null;
    this._postalCodeEnabled = this.getAttribute('postal-code-enabled') !== 'false';
    this.render();
    this.emit(EVENT_READY, {});
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'theme' && value) this._theme = value as ThemeName;
    if (name === 'locale' && value) this._locale = value;
    if (name === 'disabled') this._disabled = value !== null;
    if (name === 'postal-code-enabled') this._postalCodeEnabled = value !== 'false';
    if (this.container) {
      this.updateTheme();
      this.cardNumberInput?.input && (this.cardNumberInput.input.disabled = this._disabled);
      this.expiryInput?.input && (this.expiryInput.input.disabled = this._disabled);
      this.cvcInput?.input && (this.cvcInput.input.disabled = this._disabled);
      this.postalCodeInput?.input && (this.postalCodeInput.input.disabled = this._disabled);
    }
  }

  private emit(eventName: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
  }

  private updateTheme(): void {
    if (!this.styleEl) return;
    const theme = getTheme(this._theme as ThemeName);
    this.styleEl.textContent = `:host { ${themeToCssVars(theme)} }` + baseCss;
  }

  private checkComplete(): void {
    const cardVal = this.cardNumberInput.getValue().replace(/\D/g, '');
    const cardOk = cardVal.length >= 13 && !this.cardNumberInput.errorEl.textContent;
    const exp = this.expiryInput.getValue();
    const expOk = exp.month.length === 2 && exp.year.length === 2 && !this.expiryInput.errorEl.textContent;
    const cvcOk =
      this.cvcInput.getValue().replace(/\D/g, '').length >= (this._cardType === 'amex' ? 4 : 3) && !this.cvcInput.errorEl.textContent;
    let postalOk = true;
    if (this._postalCodeEnabled && this.postalCodeInput) {
      postalOk = this.postalCodeInput.getValue().length >= 3 && !this.postalCodeInput.errorEl.textContent;
    }
    this._complete = cardOk && expOk && cvcOk && postalOk;
    this._errors = [];
    if (this.cardNumberInput.errorEl.textContent) this._errors.push(this.cardNumberInput.errorEl.textContent);
    if (this.expiryInput.errorEl.textContent) this._errors.push(this.expiryInput.errorEl.textContent);
    if (this.cvcInput.errorEl.textContent) this._errors.push(this.cvcInput.errorEl.textContent);
    if (this.postalCodeInput?.errorEl.textContent) this._errors.push(this.postalCodeInput.errorEl.textContent);
    this.emit(EVENT_CHANGE, { complete: this._complete, errors: this._errors, cardType: this._cardType } as PaymentChangeDetail);
  }

  private render(): void {
    const theme = getTheme(this._theme as ThemeName);
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = `:host { ${themeToCssVars(theme)} }` + baseCss;

    this.container = document.createElement('div');
    this.container.className = 'container';

    this.cardNumberInput = createCardNumberInput({
      locale: this._locale,
      disabled: this._disabled,
      onInput: (_, cardType, __) => {
        this._cardType = cardType;
        this.cvcInput.setCardType(cardType);
        this.checkComplete();
      }
    });
    this.container.appendChild(this.cardNumberInput.wrap);

    const row = document.createElement('div');
    row.className = 'row';
    this.expiryInput = createExpiryInput({
      locale: this._locale,
      disabled: this._disabled,
      onInput: () => this.checkComplete()
    });
    row.appendChild(this.expiryInput.wrap);
    this.cvcInput = createCVCInput({
      locale: this._locale,
      disabled: this._disabled,
      cardType: this._cardType,
      onInput: () => this.checkComplete()
    });
    row.appendChild(this.cvcInput.wrap);
    this.container.appendChild(row);

    if (this._postalCodeEnabled) {
      this.postalCodeInput = createPostalCodeInput({
        locale: this._locale,
        disabled: this._disabled,
        onInput: () => this.checkComplete()
      });
      this.container.appendChild(this.postalCodeInput.wrap);
    } else {
      this.postalCodeInput = null;
    }

    this.shadow.appendChild(this.styleEl);
    this.shadow.appendChild(this.container);
  }

  async createToken(): Promise<{ token: string; expiresAt?: string } | { error: PaymentErrorDetail }> {
    const cardData: CardData = {
      number: this.cardNumberInput.getValue(),
      expiryMonth: this.expiryInput.getMonth(),
      expiryYear: this.expiryInput.getYear(),
      cvc: this.cvcInput.getValue(),
      postalCode: this._postalCodeEnabled && this.postalCodeInput ? this.postalCodeInput.getValue() : undefined
    };

    const result = createToken(cardData, this._postalCodeEnabled, this._locale);
    if ('error' in result) {
      this.emit(EVENT_ERROR, result.error as PaymentErrorDetail);
      return { error: result.error };
    }

    try {
      const apiResponse = await tokenize(result.token);
      const detail: PaymentTokenDetail = { token: apiResponse.token, expiresAt: apiResponse.expiresAt };
      this.emit(EVENT_TOKEN, detail);
      return { token: detail.token, expiresAt: detail.expiresAt };
    } catch (err) {
      const errorDetail: PaymentErrorDetail = {
        code: 'network_error',
        message: err instanceof Error ? err.message : 'Network error'
      };
      this.emit(EVENT_ERROR, errorDetail);
      return { error: errorDetail };
    }
  }

  clear(): void {
    this.cardNumberInput.setValue('');
    this.cardNumberInput.updateError(null);
    this.expiryInput.setValue('', '');
    this.expiryInput.updateError(null);
    this.cvcInput.setValue('');
    this.cvcInput.updateError(null);
    if (this.postalCodeInput) {
      this.postalCodeInput.setValue('');
      this.postalCodeInput.updateError(null);
    }
    this._cardType = null;
    this._errors = [];
    this._complete = false;
    this.emit(EVENT_CHANGE, { complete: false, errors: [], cardType: null } as PaymentChangeDetail);
  }

  focus(): void {
    this.cardNumberInput.focus();
  }

  setTheme(theme: ThemeConfig): void {
    this._theme = theme;
    this.updateTheme();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('secure-payment-form')) {
  customElements.define('secure-payment-form', PaymentComponent);
}
