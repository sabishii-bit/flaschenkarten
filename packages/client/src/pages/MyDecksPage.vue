<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi.ts'
import Button from '../components/Button/Button.vue'
import { Trash2 } from '@lucide/vue'
import type { Deck } from '@flaschenkarten/shared'

const { get, del } = useApi()
const decks   = ref<Deck[]>([])
const loading = ref(true)
const error   = ref<string | null>(null)

// Per-deck confirmation state
const confirming = ref<string | null>(null)
const deleting   = ref<string | null>(null)

onMounted(async () => {
  try {
    decks.value = await get<Deck[]>('/api/decks/mine')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load decks'
  } finally {
    loading.value = false
  }
})

async function deleteDeck(id: string) {
  if (deleting.value) return
  deleting.value = id
  try {
    await del(`/api/decks/${id}`)
    decks.value = decks.value.filter(d => d.id !== id)
    confirming.value = null
  } catch {
    confirming.value = null
  } finally {
    deleting.value = null
  }
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
          My Decks
        </h2>
      </div>
      <RouterLink to="/decks/new">
        <Button variant="primary">+ New Deck</Button>
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
      // no decks yet —
      <RouterLink to="/decks/new" class="text-cyber-purple hover:text-cyber-purple-lt underline underline-offset-2 transition-colors">
        create your first one
      </RouterLink>
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="deck in decks"
        :key="deck.id"
        class="flex items-center justify-between px-6 py-4 rounded-xl border border-cyber-border bg-cyber-surface transition-all duration-200"
        :class="confirming === deck.id ? 'border-red-400/30' : 'hover:border-cyber-purple/50 hover:bg-cyber-raised hover:glow-purple'"
      >
        <!-- Deck info — navigates to detail -->
        <RouterLink :to="`/decks/${deck.id}`" class="group flex flex-col gap-1 flex-1 min-w-0">
          <span class="font-orbitron text-cyber-white text-sm font-semibold group-hover:text-cyber-purple-lt transition-colors truncate">
            {{ deck.title }}
          </span>
          <span v-if="deck.description" class="font-mono-cyber text-cyber-muted text-xs truncate">
            {{ deck.description }}
          </span>
        </RouterLink>

        <!-- Right side: badge + actions -->
        <div class="flex items-center gap-3 shrink-0 ml-4">
          <span
            class="font-mono-cyber text-[10px] tracking-widest uppercase px-2 py-0.5 rounded border"
            :class="deck.isPublic
              ? 'text-cyber-purple border-cyber-purple/40 bg-cyber-purple/10'
              : 'text-cyber-muted border-cyber-border bg-cyber-raised'"
          >
            {{ deck.isPublic ? 'public' : 'private' }}
          </span>

          <!-- Normal state -->
          <template v-if="confirming !== deck.id">
            <span class="font-mono-cyber text-cyber-muted/50 text-xs">→</span>
            <button
              class="text-cyber-muted/40 hover:text-red-400 transition-colors p-1"
              @click.prevent="confirming = deck.id"
            >
              <Trash2 :size="14" />
            </button>
          </template>

          <!-- Confirmation state -->
          <template v-else>
            <span class="font-mono-cyber text-cyber-muted text-xs">Delete?</span>
            <button
              class="font-mono-cyber text-xs text-red-400 hover:text-red-300 border border-red-400/40 hover:border-red-300 rounded px-3 py-1 transition-colors"
              :disabled="deleting === deck.id"
              @click.prevent="deleteDeck(deck.id)"
            >
              {{ deleting === deck.id ? '…' : 'Yes' }}
            </button>
            <button
              class="font-mono-cyber text-xs text-cyber-muted hover:text-cyber-white border border-cyber-border rounded px-3 py-1 transition-colors"
              @click.prevent="confirming = null"
            >
              No
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
