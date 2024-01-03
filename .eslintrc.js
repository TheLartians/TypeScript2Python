module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
      project: ['./tsconfig.json'],
    },
    plugins: [
      '@typescript-eslint',
      'prettier',
    ],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
      "prettier/prettier": "error",
      'no-console': ['error', { allow: ['warn', 'error', 'assert'] }],
    },
    ignorePatterns: "dist/**",
  };
  