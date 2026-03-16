import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';

export default [

  {
    ignores: ['projects/**/*', 'dist/**/*', 'node_modules/**/*']
  },

  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly'
      }
    }
  },

  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname
      }
    }
  },

  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin
    },
    rules: {
      ...angularTemplatePlugin.configs.recommended.rules
    }
  },

  {
    files: ['**/*.component.ts'],
    plugins: {
      '@angular-eslint': angularPlugin
    },
    rules: {
      ...angularPlugin.configs.recommended.rules
    }
  },

];
