<script setup lang="ts">
import { features } from './variants.ts'
import Card from '../Card/Card.vue'
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card
      v-for="(feature, i) in features"
      :key="feature.title"
      :glow-on-hover="true"
      class="animate-slide-up"
      :style="{ animationDelay: `${i * 100}ms` }"
    >
      <p class="font-mono-cyber text-cyber-purple text-2xl mb-4">
        {{ feature.icon }}
      </p>
      <h3 class="font-orbitron text-cyber-white text-sm font-bold tracking-widest uppercase mb-2">
        {{ feature.title }}
      </h3>
      <p class="font-mono-cyber text-cyber-muted text-sm leading-relaxed">
        {{ feature.description }}
      </p>
    </Card>
  </section>
</template>
