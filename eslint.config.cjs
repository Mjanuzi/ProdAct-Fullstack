// ESLint 9 flat config for the backend (TypeScript + Node)
// See: https://eslint.org/docs/latest/use/configure/configuration-files

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Start from the plugin's recommended + stylistic rules
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs.stylistic.rules,
      // Lägg till/ändra egna regler här vid behov, t.ex.:
      // '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
];

