<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '../composables/useApi.ts'
import Button from '../components/Button/Button.vue'
import FlashCard from '../components/FlashCard/FlashCard.vue'
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

      <!-- Card grid -->
      <div class="mt-10">
        <p class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase mb-4">
          Cards — {{ deck.cards.length }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FlashCard
            v-for="card in deck.cards"
            :key="card.id"
            size="sm"
          >
            <template #front>
              <span class="font-mono-cyber text-cyber-white text-sm text-center leading-relaxed">
                {{ card.front }}
              </span>
            </template>
            <template #back>
              <span class="font-mono-cyber text-cyber-white text-sm text-center leading-relaxed">
                {{ card.back }}
              </span>
            </template>
          </FlashCard>
        </div>
      </div>
    </template>
  </div>
</template>
