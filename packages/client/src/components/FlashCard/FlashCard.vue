<script setup lang="ts">
import { ref } from 'vue'
import { playFlipSound, type FlashCardProps } from './variants.ts'

const props = defineProps<FlashCardProps>()

const isFlipped = ref(false)

function flip() {
  if (props.disabled) return
  playFlipSound()
  isFlipped.value = !isFlipped.value
}
</script>

<template>
  <div
    class="w-full cursor-pointer select-none perspective-[1200px]"
    :class="{ 'cursor-not-allowed opacity-50': disabled }"
    @click="flip"
  >
    <div
      class="relative w-full min-h-80 preserve-3d transition-transform duration-500 ease-in-out"
      :class="{ 'rotate-y-180': isFlipped }"
    >
      <!-- Front face -->
      <div class="absolute inset-0 backface-hidden rounded-xl border border-cyber-purple/50 bg-cyber-surface p-8 flex flex-col items-center justify-center glow-purple group">
        <!-- Corner accents -->
        <span class="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-cyber-purple rounded-tl-xl" />
        <span class="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-cyber-purple rounded-tr-xl" />
        <span class="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-cyber-purple rounded-bl-xl" />
        <span class="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-cyber-purple rounded-br-xl" />

        <slot name="front">
          <span class="font-mono-cyber text-cyber-muted text-sm">// front</span>
        </slot>

        <p class="absolute bottom-4 font-mono-cyber text-cyber-muted/50 text-xs tracking-widest">
          CLICK TO FLIP
        </p>
      </div>

      <!-- Back face -->
      <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-cyber-purple bg-cyber-raised p-8 flex flex-col items-center justify-center glow-purple-lg">
        <!-- Corner accents -->
        <span class="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-cyber-purple-lt rounded-tl-xl" />
        <span class="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-cyber-purple-lt rounded-tr-xl" />
        <span class="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-cyber-purple-lt rounded-bl-xl" />
        <span class="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-cyber-purple-lt rounded-br-xl" />

        <slot name="back">
          <span class="font-mono-cyber text-cyber-muted text-sm">// back</span>
        </slot>

        <p class="absolute bottom-4 font-mono-cyber text-cyber-muted/50 text-xs tracking-widest">
          CLICK TO FLIP
        </p>
      </div>
    </div>
  </div>
</template>
