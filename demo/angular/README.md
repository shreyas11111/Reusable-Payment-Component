# Angular integration example

1. Build the payment component from the repo root: `npm run build`
2. Copy `dist/secure-payment.umd.js` into your Angular app's `src/assets/` (or load via script in `angular.json`).
3. In your Angular module or standalone component:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'secure-payment-component'; // or load script in index.html

// In your component:
@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <secure-payment-form #paymentForm theme="default"></secure-payment-form>
    <button (click)="submitPayment()">Pay</button>
  `
})
export class CheckoutComponent {
  @ViewChild('paymentForm') paymentForm!: ElementRef;

  async submitPayment() {
    const result = await this.paymentForm.nativeElement.createToken();
    if ('token' in result) {
      // Send result.token to your backend
    }
  }
}
```

4. Listen for `payment-change` and `payment-error` events to enable/disable submit and show errors.
