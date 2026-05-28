import eslint from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';

const tsFiles = ['src/**/*.ts', 'src/**/*.tsx'];

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  {
    files: tsFiles,
    ...eslint.configs.recommended,
  },
  ...tsPlugin.configs['flat/recommended'].map(c => ({
    ...c,
    files: tsFiles,
  })),
  {
    files: tsFiles,
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      sonarjs,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'complexity': ['error', 12],
      'sonarjs/cognitive-complexity': ['error', 15],
      'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['src/components/**/*.tsx', 'src/hooks/**/*.ts'],
    rules: {
      'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['tests/**/*', 'src/**/*.test.*'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
];
