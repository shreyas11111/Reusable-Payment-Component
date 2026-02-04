export const baseCss = `
:host {
  --payment-primary-color: #5469d4;
  --payment-error-color: #df1b41;
  --payment-success-color: #30b566;
  --payment-background: #ffffff;
  --payment-text-color: #30313d;
  --payment-border-color: #e6e6e6;
  --payment-placeholder-color: #aab7c4;
  --payment-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --payment-font-size: 16px;
  --payment-line-height: 1.5;
  --payment-padding: 12px;
  --payment-border-radius: 6px;
  --payment-gap: 12px;
  --payment-focus-ring: 0 0 0 3px rgba(84, 105, 212, 0.25);
  display: block;
  font-family: var(--payment-font-family);
  font-size: var(--payment-font-size);
  line-height: var(--payment-line-height);
  color: var(--payment-text-color);
}
.container { display: flex; flex-direction: column; gap: var(--payment-gap); padding: var(--payment-padding); background: var(--payment-background); }
.field-group { display: flex; flex-direction: column; gap: 4px; }
.label { font-size: 14px; font-weight: 500; color: var(--payment-text-color); }
.input {
  min-height: 44px; padding: var(--payment-padding); font-family: inherit; font-size: var(--payment-font-size);
  line-height: var(--payment-line-height); color: var(--payment-text-color); background: var(--payment-background);
  border: 1px solid var(--payment-border-color); border-radius: var(--payment-border-radius); box-sizing: border-box;
  width: 100%; transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.input::placeholder { color: var(--payment-placeholder-color); }
.input:hover:not(:disabled):not(:focus) { border-color: #c4c4c4; }
.input:focus { outline: none; border-color: var(--payment-primary-color); box-shadow: var(--payment-focus-ring); }
.input[aria-invalid="true"] { border-color: var(--payment-error-color); }
.input[aria-invalid="true"]:focus { box-shadow: 0 0 0 3px rgba(223, 27, 65, 0.25); }
.input:disabled { opacity: 0.6; cursor: not-allowed; }
.error-message { font-size: 13px; color: var(--payment-error-color); min-height: 20px; }
.error-message[role="alert"] { margin-top: 2px; }
.row { display: flex; gap: var(--payment-gap); }
.row .field-group { flex: 1; }
.row .field-group.expiry { flex: 1; }
.row .field-group.cvc { flex: 0 0 120px; }
@media (max-width: 480px) { .row { flex-direction: column; } .row .field-group.cvc { flex: 1; } }
`;
