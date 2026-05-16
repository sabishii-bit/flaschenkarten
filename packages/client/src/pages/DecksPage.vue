<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
const favoriteIds = ref<Set<string>>(new Set())
const query       = ref('')

let observer:    IntersectionObserver | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

interface PageResult { decks: Deck[]; nextCursor: string | null }

async function fetchPage(cursor?: string) {
  const params = new URLSearchParams({ limit: '12' })
  if (cursor)      params.set('cursor', cursor)
  if (query.value) params.set('q', query.value)
  return get<PageResult>(`/api/decks?${params}`)
}

async function resetAndFetch() {
  loading.value    = true
  decks.value      = []
  nextCursor.value = null
  error.value      = null
  try {
    const page       = await fetchPage()
    decks.value      = page.decks
    nextCursor.value = page.nextCursor
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load decks'
  } finally {
    loading.value = false
  }
  // Sentinel unmounts while loading=true; re-observe the newly mounted element
  await nextTick()
  if (observer && sentinel.value) {
    observer.disconnect()
    observer.observe(sentinel.value)
  }
}

watch(query, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(resetAndFetch, 300)
})

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
    const [page, favs] = await Promise.all([
      fetchPage(),
      get<Deck[]>('/api/favorites').catch(() => [] as Deck[]),
    ])
    decks.value      = page.decks
    nextCursor.value  = page.nextCursor
    favoriteIds.value = new Set(favs.map(f => f.id))
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
    <div class="mb-6 flex items-end justify-between gap-4">
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

    <!-- Search -->
    <div class="relative mb-8">
      <input
        v-model="query"
        type="text"
        placeholder="Search for a deck to study"
        class="w-full font-mono-cyber text-sm text-cyber-white bg-cyber-surface border border-cyber-border rounded-sm px-3 py-2 focus:outline-none focus:border-cyber-purple transition-colors placeholder:text-cyber-muted/50"
      />
      <button
        v-if="query"
        class="absolute right-3 top-1/2 -translate-y-1/2 font-mono-cyber text-xs text-cyber-muted hover:text-cyber-white transition-colors"
        @click="query = ''"
      >✕</button>
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
      <template v-if="query">// no results for "{{ query }}"</template>
      <template v-else>
        // no public decks yet —
        <RouterLink to="/decks/new" class="text-cyber-purple hover:text-cyber-purple-lt underline underline-offset-2 transition-colors">
          be the first to create one
        </RouterLink>
      </template>
    </div>

    <template v-else>
      <!-- Deck grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RouterLink
          v-for="deck in decks"
          :key="deck.id"
          :to="`/decks/${deck.id}`"
          class="group relative flex flex-col gap-3 px-6 py-5 rounded-xl border border-cyber-border bg-cyber-surface transition-all duration-200"
          :class="favoriteIds.has(deck.id)
            ? 'hover:border-yellow-400/40 hover:bg-cyber-raised hover:glow-purple'
            : 'hover:border-cyber-purple/50 hover:bg-cyber-raised hover:glow-purple'"
        >
          <span class="absolute top-0 left-0 h-3 w-3 border-t border-l rounded-tl-xl transition-colors"
            :class="favoriteIds.has(deck.id) ? 'border-yellow-400/30 group-hover:border-yellow-400/60' : 'border-cyber-purple/40 group-hover:border-cyber-purple'" />
          <span class="absolute top-0 right-0 h-3 w-3 border-t border-r rounded-tr-xl transition-colors"
            :class="favoriteIds.has(deck.id) ? 'border-yellow-400/30 group-hover:border-yellow-400/60' : 'border-cyber-purple/40 group-hover:border-cyber-purple'" />
          <span class="absolute bottom-0 left-0 h-3 w-3 border-b border-l rounded-bl-xl transition-colors"
            :class="favoriteIds.has(deck.id) ? 'border-yellow-400/30 group-hover:border-yellow-400/60' : 'border-cyber-purple/40 group-hover:border-cyber-purple'" />
          <span class="absolute bottom-0 right-0 h-3 w-3 border-b border-r rounded-br-xl transition-colors"
            :class="favoriteIds.has(deck.id) ? 'border-yellow-400/30 group-hover:border-yellow-400/60' : 'border-cyber-purple/40 group-hover:border-cyber-purple'" />
          <span v-if="favoriteIds.has(deck.id)" class="absolute top-3 right-3 text-yellow-400/70 text-sm leading-none group-hover:text-yellow-400 transition-colors">★</span>

          <span class="font-orbitron text-cyber-white text-sm font-semibold leading-snug transition-colors"
            :class="favoriteIds.has(deck.id) ? 'group-hover:text-yellow-400' : 'group-hover:text-cyber-purple-lt'">
            {{ deck.title }}
          </span>
          <span v-if="deck.description" class="font-mono-cyber text-cyber-muted text-xs leading-relaxed line-clamp-2">
            {{ deck.description }}
          </span>
          <div class="mt-auto pt-2 flex items-center justify-between border-t border-cyber-border/60">
            <span class="font-mono-cyber text-cyber-muted/50 text-[10px] tracking-wide">
              {{ formatDate(deck.createdAt) }}
            </span>
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
