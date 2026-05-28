import eslint from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    ...eslint.configs.recommended,
  },
  ...tsPlugin.configs['flat/recommended'].map(c => ({
    ...c,
    files: ['src/**/*.ts', 'tests/**/*.ts'],
  })),
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    plugins: { sonarjs },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'complexity': ['error', 12],
      'sonarjs/cognitive-complexity': ['error', 15],
      'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
];
