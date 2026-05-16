<script setup lang="ts">
import FlashCard from '../FlashCard/FlashCard.vue'

withDefaults(defineProps<{ front: string; back: string; index: number; size?: 'default' | 'sm' }>(), { size: 'sm' })
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase">
      // preview — card {{ index + 1 }}
    </p>
    <FlashCard :key="index" :size="size">
      <template #front>
        <span
          class="font-mono-cyber text-center text-cyber-white text-sm leading-relaxed break-all w-full"
          :class="{ 'text-cyber-muted/50': !front }"
        >
          {{ front || '// front' }}
        </span>
      </template>
      <template #back>
        <span
          class="font-mono-cyber text-center text-cyber-white text-sm leading-relaxed break-all w-full"
          :class="{ 'text-cyber-muted/50': !back }"
        >
          {{ back || '// back' }}
        </span>
      </template>
    </FlashCard>
  </div>
</template>
