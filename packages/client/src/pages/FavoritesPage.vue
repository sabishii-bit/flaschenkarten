<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi.ts'
import Button from '../components/Button/Button.vue'
import type { Deck } from '@flaschenkarten/shared'

const { get } = useApi()
const decks   = ref<Deck[]>([])
const loading = ref(true)
const error   = ref<string | null>(null)

onMounted(async () => {
  try {
    decks.value = await get<Deck[]>('/api/favorites')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load favorites'
  } finally {
    loading.value = false
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="animate-slide-up">
    <div class="mb-10 flex items-end justify-between">
      <div>
        <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">
          // personal
        </p>
        <h2 class="font-orbitron text-3xl font-bold text-cyber-white">
          Favorites
        </h2>
      </div>
      <RouterLink to="/decks">
        <Button variant="ghost">Browse Decks</Button>
      </RouterLink>
    </div>

    <div v-if="loading" class="font-mono-cyber text-cyber-muted text-sm text-center py-24">
      // loading…
    </div>

    <div v-else-if="error" class="font-mono-cyber text-red-400 text-sm text-center py-24">
      {{ error }}
    </div>

    <div
      v-else-if="decks.length === 0"
      class="font-mono-cyber text-cyber-muted text-sm text-center py-24 border border-dashed border-cyber-border rounded-lg"
    >
      // no favorites yet —
      <RouterLink to="/decks" class="text-cyber-purple hover:text-cyber-purple-lt underline underline-offset-2 transition-colors">
        browse decks to add some
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="deck in decks"
        :key="deck.id"
        :to="`/decks/${deck.id}`"
        class="group relative flex flex-col gap-3 px-6 py-5 rounded-xl border border-cyber-border bg-cyber-surface hover:border-yellow-400/40 hover:bg-cyber-raised hover:glow-purple transition-all duration-200"
      >
        <span class="absolute top-0 left-0 h-3 w-3 border-t border-l border-yellow-400/30 rounded-tl-xl transition-colors group-hover:border-yellow-400/60" />
        <span class="absolute top-0 right-0 h-3 w-3 border-t border-r border-yellow-400/30 rounded-tr-xl transition-colors group-hover:border-yellow-400/60" />
        <span class="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-yellow-400/30 rounded-bl-xl transition-colors group-hover:border-yellow-400/60" />
        <span class="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-yellow-400/30 rounded-br-xl transition-colors group-hover:border-yellow-400/60" />

        <span class="font-orbitron text-cyber-white text-sm font-semibold leading-snug group-hover:text-yellow-400 transition-colors">
          {{ deck.title }}
        </span>
        <span v-if="deck.description" class="font-mono-cyber text-cyber-muted text-xs leading-relaxed line-clamp-2">
          {{ deck.description }}
        </span>
        <div class="mt-auto pt-2 flex items-center justify-between border-t border-cyber-border/60">
          <span class="font-mono-cyber text-cyber-muted/50 text-[10px] tracking-wide">
            {{ formatDate(deck.createdAt) }}
          </span>
          <span class="font-mono-cyber text-yellow-400/60 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
