import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import perfectionist from 'eslint-plugin-perfectionist'
import sonarjs, { configs as sonarjsConfigs } from 'eslint-plugin-sonarjs'
import pluginVue from 'eslint-plugin-vue'
import { globalIgnores } from 'eslint/config'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

// import.meta.env.VITE_ENV === 'production'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    name: 'app/sonarjs',
    plugins: { sonarjs },
    rules: { ...sonarjsConfigs.recommended.rules },
  },

  {
    name: 'app/vite-config-overrides',
    files: ['vite.config.{js,ts,mjs,mts}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

  {
    name: 'app/rules',
    rules: {
      // Vue specific rules
      'vue/no-v-html': 'off',

      // Console and debugging
      'no-console': 'off',
      'no-debugger': 'warn',

      // Bitwise and syntax
      // ...

      // Naming conventions
      // ...

      // Function and parameter rules
      // ...

      // Loop and flow control
      'no-await-in-loop': 'off',
      'no-continue': 'off',
      'no-nested-ternary': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'no-plusplus': [
        'error',
        {
          allowForLoopAfterthoughts: true,
        },
      ],

      // Global and require
      'no-restricted-globals': ['error', { name: 'fetch', message: 'Chame a API por uma função de useApi.' }],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'fetch', message: 'Chame a API por uma função de useApi.' },
        { object: 'globalThis', property: 'fetch', message: 'Chame a API por uma função de useApi.' },
      ],
      'global-require': 'off',

      // Operators and templates
      'template-curly-spacing': 'off',

      // Import/Export rules
      'import/prefer-default-export': 'off',

      // TypeScript specific overrides
      '@typescript-eslint/no-explicit-any': 'warn',
      // Duplicates the rule below, which honors the `_` prefix used to drop props from a rest.
      'sonarjs/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    name: 'app/import-order',
    plugins: { perfectionist },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          newlinesBetween: 1,
          customGroups: [
            { groupName: 'data', elementNamePattern: '^@/(types|data|plugins|router)(/|$)' },
            { groupName: 'stores', elementNamePattern: '^@/stores(/|$)' },
            { groupName: 'composables', elementNamePattern: '^@/composables(/|$)' },
            { groupName: 'layouts', elementNamePattern: '^@/layouts/' },
            { groupName: 'components', elementNamePattern: '^@/components/' },
          ],
          groups: [
            ['builtin', 'external'],
            'data',
            'stores',
            'composables',
            'layouts',
            'components',
            'sibling',
            'unknown',
          ],
        },
      ],
    },
  },

  {
    name: 'app/api-gateway',
    files: ['src/composables/useApi.ts'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },

  // Debt that predates sonarjs: warn here, error everywhere else.
  {
    name: 'app/sonarjs-debt',
    files: [
      'src/composables/useAskGroup.ts',
      'src/composables/useSupport.ts',
      'src/views/admin/AdminMembers.vue',
      'src/views/auth/LoginView.vue',
      'src/views/catalog/BookDetailsView.vue',
      'src/views/profile/ClaimNameSection.vue',
    ],
    rules: {
      'sonarjs/no-nested-template-literals': 'warn',
      'sonarjs/super-linear-regex': 'warn',
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/dev-dist/**', '**/coverage/**', '**/src/**/_**/*']),

  skipFormatting,
)
