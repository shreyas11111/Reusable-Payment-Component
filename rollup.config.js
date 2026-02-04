import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/secure-payment.umd.js', format: 'umd', name: 'SecurePayment', sourcemap: true },
    { file: 'dist/secure-payment.esm.js', format: 'es', sourcemap: true }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: true,
      declarationDir: 'dist'
    })
  ],
  external: []
};
