<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useApi } from '../composables/useApi.ts'
import Button from '../components/Button/Button.vue'
import type { Deck } from '@flaschenkarten/shared'

const { get } = useApi()

const decks       = ref<Deck[]>([])
const nextCursor  = ref<string | null>(null)
const loading     = ref(true)
const loadingMore = ref(false)
const error       = ref<string | null>(null)
const sentinel    = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

interface PageResult { decks: Deck[]; nextCursor: string | null }

async function fetchPage(cursor?: string) {
  const params = new URLSearchParams({ limit: '12' })
  if (cursor) params.set('cursor', cursor)
  return get<PageResult>(`/api/decks?${params}`)
}

async function loadMore() {
  if (loadingMore.value || !nextCursor.value) return
  loadingMore.value = true
  try {
    const page = await fetchPage(nextCursor.value)
    decks.value.push(...page.decks)
    nextCursor.value = page.nextCursor
  } catch {
    // silently ignore — user can scroll again to retry
  } finally {
    loadingMore.value = false
  }
}

onMounted(async () => {
  try {
    const page   = await fetchPage()
    decks.value  = page.decks
    nextCursor.value = page.nextCursor
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load decks'
  } finally {
    loading.value = false
  }

  await nextTick()

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore()
  }, { rootMargin: '300px' })

  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="animate-slide-up">
    <!-- Header -->
    <div class="mb-10 flex items-end justify-between gap-4">
      <div>
        <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">
          // explore
        </p>
        <h2 class="font-orbitron text-3xl font-bold text-cyber-white">
          Browse Decks
        </h2>
      </div>
      <RouterLink to="/decks/new">
        <Button variant="primary">+ New Deck</Button>
      </RouterLink>
    </div>

    <!-- Initial load -->
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
      // no public decks yet —
      <RouterLink to="/decks/new" class="text-cyber-purple hover:text-cyber-purple-lt underline underline-offset-2 transition-colors">
        be the first to create one
      </RouterLink>
    </div>

    <template v-else>
      <!-- Deck grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RouterLink
          v-for="deck in decks"
          :key="deck.id"
          :to="`/decks/${deck.id}`"
          class="group relative flex flex-col gap-3 px-6 py-5 rounded-xl border border-cyber-border bg-cyber-surface hover:border-cyber-purple/50 hover:bg-cyber-raised hover:glow-purple transition-all duration-200"
        >
          <span class="absolute top-0 left-0 h-3 w-3 border-t border-l border-cyber-purple/40 rounded-tl-xl transition-colors group-hover:border-cyber-purple" />
          <span class="absolute top-0 right-0 h-3 w-3 border-t border-r border-cyber-purple/40 rounded-tr-xl transition-colors group-hover:border-cyber-purple" />
          <span class="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-cyber-purple/40 rounded-bl-xl transition-colors group-hover:border-cyber-purple" />
          <span class="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-cyber-purple/40 rounded-br-xl transition-colors group-hover:border-cyber-purple" />

          <span class="font-orbitron text-cyber-white text-sm font-semibold leading-snug group-hover:text-cyber-purple-lt transition-colors">
            {{ deck.title }}
          </span>
          <span v-if="deck.description" class="font-mono-cyber text-cyber-muted text-xs leading-relaxed line-clamp-2">
            {{ deck.description }}
          </span>
          <div class="mt-auto pt-2 flex items-center justify-between border-t border-cyber-border/60">
            <span class="font-mono-cyber text-cyber-muted/50 text-[10px] tracking-wide">
              {{ formatDate(deck.createdAt) }}
            </span>
            <span class="font-mono-cyber text-cyber-purple text-xs group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </RouterLink>
      </div>

      <!-- Sentinel — IntersectionObserver target -->
      <div ref="sentinel" class="h-1" />

      <!-- Loading more indicator -->
      <div v-if="loadingMore" class="font-mono-cyber text-cyber-muted text-xs text-center py-8 tracking-widest">
        // loading more…
      </div>

      <!-- End of results -->
      <div v-else-if="!nextCursor" class="font-mono-cyber text-cyber-muted/40 text-xs text-center py-8 tracking-widest">
        // end of results
      </div>
    </template>
  </div>
</template>
