import { formatCardNumber, sanitizeInput } from '../utils/formatters';
import { validateCardNumber, detectCardType } from '../services/CardValidator';
import { getCardNumberAriaLabel, getErrorId, getDescribedBy } from '../utils/accessibility';
import type { CardType } from '../types';

const FIELD_NAME = 'card-number';

export interface CardNumberInputOptions {
  locale: string;
  disabled: boolean;
  onInput: (value: string, cardType: CardType | null, error: string | null) => void;
}

export function createCardNumberInput(options: CardNumberInputOptions) {
  const { locale, disabled, onInput } = options;
  const wrap = document.createElement('div');
  wrap.className = 'field-group';

  const label = document.createElement('label');
  label.className = 'label';
  label.htmlFor = FIELD_NAME;
  label.textContent = 'Card number';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = FIELD_NAME;
  input.className = 'input';
  input.autocomplete = 'cc-number';
  input.inputMode = 'numeric';
  input.placeholder = '1234 5678 9012 3456';
  input.setAttribute('aria-label', getCardNumberAriaLabel(locale));
  input.setAttribute('aria-required', 'true');
  input.disabled = disabled;

  const errorId = getErrorId(FIELD_NAME);
  const errorEl = document.createElement('div');
  errorEl.id = errorId;
  errorEl.className = 'error-message';
  errorEl.setAttribute('role', 'alert');
  errorEl.setAttribute('aria-live', 'polite');

  function updateError(message: string | null) {
    errorEl.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    input.setAttribute('aria-describedby', getDescribedBy(FIELD_NAME, !!message) ?? '');
  }

  input.addEventListener('input', () => {
    const raw = sanitizeInput(input.value, true);
    const cardType = detectCardType(raw);
    input.value = formatCardNumber(raw, cardType === 'amex');
    const result = validateCardNumber(input.value);
    const err = result.errors[0] ?? null;
    updateError(err);
    onInput(input.value, result.cardType ?? null, err);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      updateError(null);
      onInput('', null, null);
    }
  });

  wrap.appendChild(label);
  wrap.appendChild(input);
  wrap.appendChild(errorEl);

  return {
    wrap,
    input,
    errorEl,
    updateError,
    getValue: () => input.value,
    setValue: (v: string) => {
      const raw = sanitizeInput(v, true);
      const cardType = detectCardType(raw);
      input.value = formatCardNumber(raw, cardType === 'amex');
    },
    focus: () => input.focus()
  };
}
