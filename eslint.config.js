import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.join(__dirname, '.gitignore');

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default defineConfig([
  // Globally ignored files by ESLint
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['public', '.husky', '.github', 'pnpm-lock.yaml'],
  },

  // All TypeScript files
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,js,jsx,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: fileURLToPath(import.meta.url),
      },
      sourceType: 'module',
    },
    rules: {
      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',

      // Import sorting
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          // using eslint-plugin-simple-import-sort instead
          ignoreDeclarationSort: true,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],

      // Typescript specific
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['typeAlias'],
          format: ['PascalCase'],
          custom: {
            regex: '^T[A-Z]',
            match: true,
          },
        },
      ],
    },
  },

  // Test files
  {
    extends: [vitest.configs.recommended],
    files: ['**/*.{spec,test}.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },

  // Vanilla JS files
  {
    files: ['**/*.{js,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Prettier config
  // turns off all rules that conflict with Prettier formatter
  // MUST be last!
  eslintConfigPrettier,
]);
