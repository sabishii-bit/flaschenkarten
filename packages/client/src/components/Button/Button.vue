<script setup lang="ts">
import { buttonVariants, type ButtonVariant } from './variants.ts'

defineProps<{
  variant?: ButtonVariant
}>()
</script>

<template>
  <button
    v-bind="$attrs"
    :class="[
      'relative font-orbitron text-sm font-semibold tracking-widest uppercase px-6 py-3 rounded transition-all duration-200 outline-none',
      buttonVariants[variant ?? 'ghost'],
    ]"
  >
    <slot />
  </button>
</template>
