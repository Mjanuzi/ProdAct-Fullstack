module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
  ],
  ignorePatterns: ['dist/**'],
  rules: {
    // Lägg till egna regler här vid behov, t.ex.:
    // '@typescript-eslint/explicit-function-return-type': 'warn',
  },
};
