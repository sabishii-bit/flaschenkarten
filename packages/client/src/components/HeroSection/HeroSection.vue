<script setup lang="ts">
import { type HeroSectionProps } from './variants.ts'
import Button from '../Button/Button.vue'

defineProps<HeroSectionProps>()
</script>

<template>
  <section class="text-center mb-24 animate-slide-up">
    <p class="font-mono-cyber text-cyber-purple text-sm tracking-[0.3em] uppercase mb-6">
      {{ eyebrow }}
    </p>
    <h1 class="font-orbitron text-5xl md:text-7xl font-black text-cyber-white glow-text-purple tracking-tight mb-6 animate-flicker">
      {{ titleTop }}<br>
      <span class="text-cyber-purple">{{ titleBottom }}</span>
    </h1>
    <p class="font-mono-cyber text-cyber-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
      {{ subtitle }}
    </p>
    <div class="flex gap-4 justify-center flex-wrap">
      <RouterLink
        v-for="btn in buttons"
        :key="btn.label"
        :to="btn.to"
      >
        <Button :variant="btn.variant">{{ btn.label }}</Button>
      </RouterLink>
    </div>
  </section>
</template>
