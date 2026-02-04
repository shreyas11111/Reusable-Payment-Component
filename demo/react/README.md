# React integration example

1. Build the payment component from the repo root: `npm run build`
2. Copy `dist/secure-payment.umd.js` into your React app's `public/` and add `<script src="/secure-payment.umd.js"></script>` in `index.html`.
3. Use a ref to call methods:

```tsx
import { useRef, useEffect } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'secure-payment-form': any;
    }
  }
}

export function Checkout() {
  const formRef = useRef<HTMLElement & { createToken(): Promise<{ token: string } | { error: { message: string } }> }>(null);

  const handleSubmit = async () => {
    const form = formRef.current;
    if (!form) return;
    const result = await form.createToken();
    if ('token' in result) {
      // Send result.token to your backend
    }
  };

  return (
    <>
      <secure-payment-form ref={formRef} theme="default" />
      <button onClick={handleSubmit}>Pay</button>
    </>
  );
}
```

4. For `payment-change` and `payment-error`, attach event listeners in `useEffect` to the ref current element.
