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
    decks.value = await get<Deck[]>('/api/decks/mine')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load decks'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="animate-slide-up">
    <div class="mb-10 flex items-end justify-between">
      <div>
        <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">
          // personal
        </p>
        <h2 class="font-orbitron text-3xl font-bold text-cyber-white">
          My Decks
        </h2>
      </div>
      <RouterLink to="/decks/new">
        <Button variant="primary">+ New Deck</Button>
      </RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="font-mono-cyber text-cyber-muted text-sm text-center py-24">
      // loading…
    </div>

    <!-- Error -->
    <div v-else-if="error" class="font-mono-cyber text-red-400 text-sm text-center py-24">
      {{ error }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="decks.length === 0"
      class="font-mono-cyber text-cyber-muted text-sm text-center py-24 border border-dashed border-cyber-border rounded-lg"
    >
      // no decks yet —
      <RouterLink to="/decks/new" class="text-cyber-purple hover:text-cyber-purple-lt underline underline-offset-2 transition-colors">
        create your first one
      </RouterLink>
    </div>

    <!-- Deck list -->
    <div v-else class="flex flex-col gap-3">
      <RouterLink
        v-for="deck in decks"
        :key="deck.id"
        :to="`/decks/${deck.id}`"
        class="group flex items-center justify-between px-6 py-4 rounded-xl border border-cyber-border bg-cyber-surface hover:border-cyber-purple/50 hover:bg-cyber-raised hover:glow-purple transition-all duration-200"
      >
        <div class="flex flex-col gap-1">
          <span class="font-orbitron text-cyber-white text-sm font-semibold group-hover:text-cyber-purple-lt transition-colors">
            {{ deck.title }}
          </span>
          <span v-if="deck.description" class="font-mono-cyber text-cyber-muted text-xs">
            {{ deck.description }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="font-mono-cyber text-[10px] tracking-widest uppercase px-2 py-0.5 rounded border"
            :class="deck.isPublic
              ? 'text-cyber-purple border-cyber-purple/40 bg-cyber-purple/10'
              : 'text-cyber-muted border-cyber-border bg-cyber-raised'"
          >
            {{ deck.isPublic ? 'public' : 'private' }}
          </span>
          <span class="font-mono-cyber text-cyber-muted/50 text-xs">→</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
