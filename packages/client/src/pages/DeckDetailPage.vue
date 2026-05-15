<script setup lang="ts">
import { useRoute } from 'vue-router'
import Button from '../components/Button/Button.vue'

const id = useRoute().params.id
</script>

<template>
  <div class="animate-slide-up">
    <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">
      // deck
    </p>
    <h2 class="font-orbitron text-3xl font-bold text-cyber-white mb-2">
      Deck #{{ id }}
    </h2>

    <div class="flex gap-3 mt-8">
      <RouterLink :to="`/decks/${id}/study`">
        <Button variant="primary">
          Study Now
        </Button>
      </RouterLink>
      <Button variant="ghost">
        Edit Deck
      </Button>
    </div>

    <div class="font-mono-cyber text-cyber-muted text-sm text-center py-24 mt-10 border border-dashed border-cyber-border rounded-lg">
      // card list coming soon
    </div>
  </div>
</template>
