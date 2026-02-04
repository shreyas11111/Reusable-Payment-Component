import { defineConfig } from 'vitest/config';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  plugins: [typescript()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts']
  }
});
