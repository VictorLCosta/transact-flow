import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-console": "warn",
      'react/jsx-props-no-spreading': 'off',
      'import/default': 'off',
      'import/prefer-default-export': 'off',
      'arrow-body-style': ['error', 'as-needed'],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '@/**/**',
              group: 'parent',
              position: 'before',
            },
          ],
          alphabetize: {
            order: 'asc',
          },
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    }
  },
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  importPlugin.flatConfigs.typescript,
]);
