<script setup lang="ts">
import { useRoute } from 'vue-router'

const id = useRoute().params.id
</script>

<template>
  <div class="animate-slide-up max-w-2xl mx-auto text-center">
    <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">
      // study mode
    </p>
    <h2 class="font-orbitron text-3xl font-bold text-cyber-white mb-10">
      Deck #{{ id }}
    </h2>

    <div class="font-mono-cyber text-cyber-muted text-sm text-center py-24 border border-dashed border-cyber-border rounded-lg">
      // study session coming soon
    </div>

    <RouterLink
      :to="`/decks/${id}`"
      class="inline-block mt-6 font-mono-cyber text-cyber-muted text-sm hover:text-cyber-purple-lt transition-colors"
    >
      ← back to deck
    </RouterLink>
  </div>
</template>
