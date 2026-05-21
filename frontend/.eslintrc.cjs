module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'sonarjs'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'complexity': ['error', 12],
    'sonarjs/cognitive-complexity': ['error', 15],
    'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
  },
  overrides: [
    {
      // React components and hooks are inherently verbose due to JSX — allow up to 100 lines
      files: ['src/components/**/*.tsx', 'src/hooks/**/*.ts'],
      rules: {
        'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
      },
    },
    {
      // Test describe/it blocks are not logic functions — disable line counting
      files: ['tests/**/*'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
  ],
}
