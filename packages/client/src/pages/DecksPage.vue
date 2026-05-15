<script setup lang="ts">
import Button from '../components/Button/Button.vue'
</script>

<template>
  <div class="animate-slide-up">
    <div class="mb-10 flex items-end justify-between">
      <div>
        <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">
          // library
        </p>
        <h2 class="font-orbitron text-3xl font-bold text-cyber-white">
          Browse Decks
        </h2>
      </div>
      <RouterLink to="/decks/new">
        <Button variant="primary">
          + New Deck
        </Button>
      </RouterLink>
    </div>

    <div class="font-mono-cyber text-cyber-muted text-sm text-center py-24 border border-dashed border-cyber-border rounded-lg">
      // no decks yet — create one or check back later
    </div>
  </div>
</template>
