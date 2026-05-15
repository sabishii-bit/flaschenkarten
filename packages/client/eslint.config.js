import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/*.vue', '**/*.ts'],
    rules: {
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style'],
      }],
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)
