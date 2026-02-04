import { formatExpiry, digitsOnly } from '../utils/formatters';
import { validateExpiry } from '../services/CardValidator';
import { getExpiryAriaLabel, getErrorId, getDescribedBy } from '../utils/accessibility';

const FIELD_NAME = 'expiry';

export interface ExpiryInputOptions {
  locale: string;
  disabled: boolean;
  onInput: (month: string, year: string, error: string | null) => void;
}

export function createExpiryInput(options: ExpiryInputOptions) {
  const { locale, disabled, onInput } = options;
  const wrap = document.createElement('div');
  wrap.className = 'field-group expiry';

  const label = document.createElement('label');
  label.className = 'label';
  label.htmlFor = FIELD_NAME;
  label.textContent = 'Expiry (MM/YY)';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = FIELD_NAME;
  input.className = 'input';
  input.autocomplete = 'cc-exp';
  input.inputMode = 'numeric';
  input.placeholder = 'MM/YY';
  input.setAttribute('aria-label', getExpiryAriaLabel(locale));
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
  function parseValue() {
    const digits = digitsOnly(input.value);
    return { month: digits.slice(0, 2), year: digits.slice(2, 4) };
  }

  input.addEventListener('input', () => {
    const digits = digitsOnly(input.value).slice(0, 4);
    input.value = formatExpiry(digits);
    const { month, year } = parseValue();
    const result = validateExpiry(month, year);
    const err = result.errors[0] ?? null;
    updateError(err);
    onInput(month, year, err);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      updateError(null);
      onInput('', '', null);
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
    getMonth: () => parseValue().month,
    getYear: () => parseValue().year,
    getValue: () => parseValue(),
    setValue: (month: string, year: string) => {
      input.value = formatExpiry((month + year).replace(/\D/g, '').slice(0, 4));
    },
    focus: () => input.focus()
  };
}
