import { formatCvc } from '../utils/formatters';
import { validateCvc, getCvcLength } from '../services/CardValidator';
import { getCvcAriaLabel, getErrorId, getDescribedBy } from '../utils/accessibility';
import type { CardType } from '../types';

const FIELD_NAME = 'cvc';

export interface CVCInputOptions {
  locale: string;
  disabled: boolean;
  cardType: CardType | null;
  onInput: (value: string, error: string | null) => void;
}

export function createCVCInput(options: CVCInputOptions) {
  const { locale, disabled, cardType: initialCardType, onInput } = options;
  let cardType = initialCardType;

  const wrap = document.createElement('div');
  wrap.className = 'field-group cvc';

  const label = document.createElement('label');
  label.className = 'label';
  label.htmlFor = FIELD_NAME;
  label.textContent = 'CVC';

  const input = document.createElement('input');
  input.type = 'password';
  input.id = FIELD_NAME;
  input.className = 'input';
  input.autocomplete = 'cc-csc';
  input.inputMode = 'numeric';
  input.placeholder = cardType === 'amex' ? '1234' : '123';
  input.maxLength = 4;
  input.setAttribute('aria-label', getCvcAriaLabel(locale));
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
  function setCardType(ct: CardType | null) {
    cardType = ct;
    input.placeholder = ct === 'amex' ? '1234' : '123';
    input.maxLength = getCvcLength(ct);
    input.value = formatCvc(input.value.replace(/\D/g, ''), ct === 'amex');
  }

  input.addEventListener('input', () => {
    const raw = input.value.replace(/\D/g, '');
    input.value = formatCvc(raw.slice(0, getCvcLength(cardType)), cardType === 'amex');
    const result = validateCvc(input.value, cardType);
    updateError(result.errors[0] ?? null);
    onInput(input.value, result.errors[0] ?? null);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      updateError(null);
      onInput('', null);
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
    setCardType,
    getValue: () => input.value,
    setValue: (v: string) => {
      input.value = formatCvc(v.replace(/\D/g, ''), cardType === 'amex');
    },
    focus: () => input.focus()
  };
}
