<script setup lang="ts">
import { ref } from 'vue'
import { playFlipSound, sizeClass, type FlashCardProps } from './variants.ts'

const props = withDefaults(defineProps<FlashCardProps>(), { size: 'default' })

const isFlipped = ref(false)

function flip() {
  if (props.disabled) return
  playFlipSound()
  isFlipped.value = !isFlipped.value
}

defineExpose({ flip })
</script>

<template>
  <div
    class="relative w-full cursor-pointer select-none perspective-[1200px]"
    :class="[
      props.size === 'sm' && !disabled ? 'transition-transform duration-200 hover:-translate-y-2' : '',
      { 'cursor-not-allowed opacity-50': disabled },
    ]"
    @click="flip"
  >
    <slot name="overlay" />
    <div
      class="relative w-full preserve-3d transition-transform duration-500 ease-in-out"
      :class="[sizeClass[props.size], { 'rotate-y-180': isFlipped }]"
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
          FRONT
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
          BACK
        </p>
      </div>
    </div>
  </div>
</template>
