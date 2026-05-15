<script setup lang="ts">
import { cardBase, cardGlow, type CardProps } from './variants.ts'

defineProps<CardProps>()
</script>

<template>
  <div :class="[cardBase, glowOnHover && cardGlow]">
    <!-- Corner accents -->
    <span class="absolute top-0 left-0 block h-3 w-3 border-t border-l border-cyber-purple/70 rounded-tl-lg" />
    <span class="absolute top-0 right-0 block h-3 w-3 border-t border-r border-cyber-purple/70 rounded-tr-lg" />
    <span class="absolute bottom-0 left-0 block h-3 w-3 border-b border-l border-cyber-purple/70 rounded-bl-lg" />
    <span class="absolute bottom-0 right-0 block h-3 w-3 border-b border-r border-cyber-purple/70 rounded-br-lg" />

    <slot />
  </div>
</template>
