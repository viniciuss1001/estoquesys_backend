module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    // Regras relaxadas
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Integração com o Prettier
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        trailingComma: 'all',
        semi: true,
        printWidth: 100,
        endOfLine: 'auto',
      },
    ],
  },
};
