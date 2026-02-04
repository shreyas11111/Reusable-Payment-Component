# Production-Grade Reusable Payment Component

A **framework-agnostic, secure payment card input** Web Component that works like Stripe Elements—secure, tokenized payment collection for any web app (Angular, React, Vue, or vanilla HTML).

## Features

- **Web Component** (`<secure-payment-form>`) with Shadow DOM for style encapsulation
- **Luhn validation** and card type detection (Visa, Mastercard, Amex, Discover)
- **Token generation** with client-side encryption (no plaintext card data leaves the component)
- **Dummy Payment API** for tokenize and charge (simulate success/decline/expired)
- **WCAG 2.1 AA** accessibility: ARIA, keyboard nav, focus, 44px touch targets
- **Theming** via CSS custom properties and `setTheme()`
- **Single bundle** UMD + ESM, &lt; 50KB gzipped target

## Quick start

```bash
npm install
npm run build
```

Then open `demo/index.html` in a browser (or serve the repo root and go to `/demo/index.html`). The demo uses `dist/secure-payment.umd.js`.

## Usage (vanilla HTML)

```html
<script src="dist/secure-payment.umd.js"></script>
<secure-payment-form id="payment" theme="default" locale="en-US"></secure-payment-form>
<button id="pay-btn" disabled>Pay $99.00</button>

<script>
  const form = document.getElementById('payment');
  const btn = document.getElementById('pay-btn');

  form.addEventListener('payment-change', (e) => {
    btn.disabled = !e.detail.complete;
  });

  btn.addEventListener('click', async () => {
    const result = await form.createToken();
    if ('token' in result) {
      await fetch('/charge', { method: 'POST', body: JSON.stringify({ token: result.token, amount: 9900 }) });
    }
  });
</script>
```

## Attributes

| Attribute              | Values                          | Description                    |
|------------------------|----------------------------------|--------------------------------|
| `theme`                | `default` \| `minimal` \| `dark` | Visual theme                  |
| `locale`               | `en-US`, `en-GB`, etc.          | Locale for labels/validation  |
| `disabled`             | boolean (presence = true)       | Disable all inputs            |
| `postal-code-enabled`   | `true` (default) \| `false`     | Show/hide postal code field    |

## Events

- **`payment-ready`** – Component initialized.
- **`payment-change`** – `detail: { complete: boolean, errors: string[], cardType? }`
- **`payment-token`** – `detail: { token: string, expiresAt?: string }`
- **`payment-error`** – `detail: { code: string, message: string, field?: string }`

## Methods

- **`createToken()`** – `Promise<{ token: string, expiresAt? } | { error: PaymentErrorDetail }>`
- **`clear()`** – Clear all fields and reset state.
- **`focus()`** – Focus the card number field.
- **`setTheme(theme: ThemeConfig)`** – Apply theme overrides.

## Dummy API (included)

The bundle includes a client-side dummy API:

- **Tokenize** – Accepts encrypted card payload, returns a token and expiry.
- **Charge** – Accepts token, amount, currency; simulates:
  - `4242424242424242` → success
  - `4000000000000002` → insufficient funds
  - `4000000000009995` → card declined
  - `4000000000000069` → expired card

Replace with your real payment backend in production.

## Project structure

```
payment-component/
├── src/
│   ├── index.ts              # Entry & exports
│   ├── PaymentComponent.ts   # Web Component
│   ├── components/           # CardNumber, Expiry, CVC, PostalCode inputs
│   ├── services/             # CardValidator, TokenService, PaymentAPI
│   ├── utils/                # formatters, encryption, accessibility
│   ├── styles/               # base-css, themes
│   └── types/                # TypeScript interfaces
├── demo/
│   ├── index.html            # Vanilla HTML demo
│   ├── angular/              # Angular integration (README)
│   └── react/                # React integration (README)
├── tests/
│   ├── unit/                 # Vitest: Luhn, card type, formatters, token
│   └── e2e/                  # Playwright: form render, flow
├── package.json
├── tsconfig.json
├── rollup.config.js
└── README.md
```

## Scripts

- `npm run build` – Build UMD + ESM to `dist/`
- `npm run dev` – Watch build
- `npm run test` – Unit tests (Vitest)
- `npm run test:e2e` – E2E tests (Playwright; run after build and with demo served)

## Angular / React

See `demo/angular/README.md` and `demo/react/README.md` for integration examples (CUSTOM_ELEMENTS_SCHEMA, refs, event listeners).

## Security

- Shadow DOM isolates styles and structure from the host page.
- Inputs are sanitized to reduce XSS risk.
- Card data is not logged; token payload is encrypted and time-limited (15 min).
- Use a real payment processor and HTTPS in production.

## License

MIT
