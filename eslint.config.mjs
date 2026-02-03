import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  ...tseslint.configs.recommended,
  prettierConfig, // 👈 apaga reglas que chocan con Prettier
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // 👇 APÁGALO ACÁ
      'prettier/prettier': 'off',

      // reglas TS típicas
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
