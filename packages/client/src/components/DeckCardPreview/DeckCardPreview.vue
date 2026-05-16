<script setup lang="ts">
import FlashCard from '../FlashCard/FlashCard.vue'

defineProps<{ front: string; back: string; index: number }>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase">
      // preview — card {{ index + 1 }}
    </p>
    <FlashCard :key="index">
      <template #front>
        <span
          class="font-mono-cyber text-center text-cyber-white text-base leading-relaxed"
          :class="{ 'text-cyber-muted/50 text-sm': !front }"
        >
          {{ front || '// front' }}
        </span>
      </template>
      <template #back>
        <span
          class="font-mono-cyber text-center text-cyber-white text-base leading-relaxed"
          :class="{ 'text-cyber-muted/50 text-sm': !back }"
        >
          {{ back || '// back' }}
        </span>
      </template>
    </FlashCard>
  </div>
</template>
