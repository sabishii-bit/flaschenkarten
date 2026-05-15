<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '../composables/useApi.ts'
import Button from '../components/Button/Button.vue'
import type { DeckWithCards } from '@flaschenkarten/shared'

const route  = useRoute()
const id     = route.params.id as string
const { get } = useApi()

const deck    = ref<DeckWithCards | null>(null)
const loading = ref(true)
const error   = ref<string | null>(null)

onMounted(async () => {
  try {
    deck.value = await get<DeckWithCards>(`/api/decks/${id}`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load deck'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="animate-slide-up">
    <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">
      // deck
    </p>

    <div v-if="loading" class="font-mono-cyber text-cyber-muted text-sm py-4">// loading…</div>
    <div v-else-if="error" class="font-mono-cyber text-red-400 text-sm py-4">{{ error }}</div>

    <template v-else-if="deck">
      <h2 class="font-orbitron text-3xl font-bold text-cyber-white mb-2">
        {{ deck.title }}
      </h2>
      <p v-if="deck.description" class="font-mono-cyber text-cyber-muted text-sm mb-6">
        {{ deck.description }}
      </p>

      <div class="flex gap-3 mt-8">
        <RouterLink :to="`/decks/${id}/study`">
          <Button variant="primary">Study Now</Button>
        </RouterLink>
        <RouterLink :to="`/decks/${id}/edit`">
          <Button variant="ghost">Edit Deck</Button>
        </RouterLink>
      </div>

      <div class="font-mono-cyber text-cyber-muted text-sm text-center py-24 mt-10 border border-dashed border-cyber-border rounded-lg">
        // card list coming soon
      </div>
    </template>
  </div>
</template>
