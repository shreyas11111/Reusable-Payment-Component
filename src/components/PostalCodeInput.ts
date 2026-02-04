import { sanitizeInput } from '../utils/formatters';
import { validatePostalCode } from '../services/CardValidator';
import { getPostalCodeAriaLabel, getErrorId, getDescribedBy } from '../utils/accessibility';

const FIELD_NAME = 'postal-code';

export interface PostalCodeInputOptions {
  locale: string;
  disabled: boolean;
  onInput: (value: string, error: string | null) => void;
}

export function createPostalCodeInput(options: PostalCodeInputOptions) {
  const { locale, disabled, onInput } = options;
  const wrap = document.createElement('div');
  wrap.className = 'field-group';

  const label = document.createElement('label');
  label.className = 'label';
  label.htmlFor = FIELD_NAME;
  label.textContent = locale.startsWith('en-US') ? 'ZIP code' : 'Postal code';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = FIELD_NAME;
  input.className = 'input';
  input.autocomplete = 'postal-code';
  input.placeholder = locale.startsWith('en-US') ? '12345' : 'Postal code';
  input.setAttribute('aria-label', getPostalCodeAriaLabel(locale));
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
    input.value = sanitizeInput(input.value, true);
    const result = validatePostalCode(input.value.trim(), locale);
    updateError(result.errors[0] ?? null);
    onInput(input.value.trim(), result.errors[0] ?? null);
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
    getValue: () => input.value.trim(),
    setValue: (v: string) => {
      input.value = sanitizeInput(v, true);
    },
    focus: () => input.focus()
  };
}
