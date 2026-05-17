<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '../composables/useAdminAuth.ts'

const { token, isAuthenticated } = useAdminAuth()
const router = useRouter()

if (!isAuthenticated.value) router.replace('/admin')

type ServerLog = {
  id: string
  event: string
  visitorId: string | null
  ip: string | null
  details: string | null
  createdAt: string
}

const logs        = ref<ServerLog[]>([])
const loading     = ref(false)
const loadingMore = ref(false)
const error       = ref<string | null>(null)
const offset      = ref(0)
const hasMore     = ref(true)
const sentinel    = ref<HTMLElement | null>(null)
const banning     = ref<string | null>(null)
const query       = ref('')
const LIMIT       = 50

let observer:    IntersectionObserver | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const BASE = import.meta.env.VITE_API_URL ?? ''

const EVENT_LABELS: Record<string, string> = {
  new_visitor:      'New Visitor',
  deck_created:     'Deck Created',
  deck_deleted:     'Deck Deleted',
  deck_generated:   'Deck Generated',
  vote_cast:        'Vote Cast',
  favorite_added:   'Favorited',
  favorite_removed: 'Unfavorited',
  admin_login:      'Admin Login',
  ban_issued:       'Ban Issued',
  ban_removed:      'Ban Removed',
}

const EVENT_COLOURS: Record<string, string> = {
  new_visitor:      'text-cyber-purple',
  deck_created:     'text-green-400',
  deck_deleted:     'text-red-400',
  deck_generated:   'text-cyan-400',
  vote_cast:        'text-yellow-400',
  favorite_added:   'text-amber-400',
  favorite_removed: 'text-cyber-muted',
  admin_login:      'text-white',
  ban_issued:       'text-red-400',
  ban_removed:      'text-green-400',
}

async function fetchLogs(reset = false) {
  if (reset) {
    loading.value = true
  } else {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
  }
  error.value = null
  try {
    const currentOffset = reset ? 0 : offset.value
    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(currentOffset) })
    if (query.value) params.set('q', query.value)
    const res  = await fetch(`${BASE}/api/admin/logs?${params}`, {
      credentials: 'include',
      headers: {
        'X-Api-Key':     import.meta.env.VITE_API_KEY ?? '',
        'Authorization': `Bearer ${token.value}`,
      },
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body?.error ?? `Request failed: ${res.status}`)
    const batch: ServerLog[] = body.data
    if (reset) {
      logs.value   = batch
      offset.value = batch.length
    } else {
      logs.value.push(...batch)
      offset.value += batch.length
    }
    hasMore.value = batch.length === LIMIT
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load logs'
  } finally {
    loading.value     = false
    loadingMore.value = false
  }

  if (reset) {
    await nextTick()
    if (observer && sentinel.value) {
      observer.disconnect()
      observer.observe(sentinel.value)
    }
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

type DetailPart = { key: string; value: string; link?: string }

function parseDetails(raw: string | null): DetailPart[] {
  if (!raw) return []
  try {
    return Object.entries(JSON.parse(raw)).map(([k, v]) => ({
      key:   k,
      value: String(v),
      link:  k === 'deckId' ? `/decks/${v}` : undefined,
    }))
  } catch { return [{ key: 'raw', value: raw }] }
}

async function banIp(ip: string) {
  if (!ip || banning.value) return
  const reason = prompt(`Ban reason for ${ip}:`)
  if (reason === null) return
  banning.value = ip
  try {
    const res = await fetch(`${BASE}/api/admin/bans`, {
      method:      'POST',
      credentials: 'include',
      headers: {
        'Content-Type':  'application/json',
        'X-Api-Key':     import.meta.env.VITE_API_KEY ?? '',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({ ip, reason }),
    })
    if (!res.ok) {
      const body = await res.json()
      alert(`Ban failed: ${body?.error ?? res.status}`)
    }
  } finally {
    banning.value = null
  }
}

watch(query, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchLogs(true), 300)
})

onMounted(async () => {
  await fetchLogs(true)

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) fetchLogs(false)
  }, { rootMargin: '300px' })

  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="animate-slide-up flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">// admin</p>
        <h2 class="font-orbitron text-2xl font-bold text-cyber-white">Server Logs</h2>
      </div>
      <button
        class="font-mono-cyber text-xs text-cyber-purple hover:text-cyber-white transition-colors disabled:opacity-40"
        :disabled="loading"
        @click="fetchLogs(true)"
      >
        {{ loading ? 'Loading…' : '↺ Refresh' }}
      </button>
    </div>

    <!-- Search -->
    <div class="relative">
      <input
        v-model="query"
        type="text"
        placeholder="Search by event, IP, visitor ID, or details"
        class="w-full font-mono-cyber text-sm text-cyber-white bg-cyber-surface border border-cyber-border rounded-sm px-3 py-2 focus:outline-none focus:border-cyber-purple transition-colors placeholder:text-cyber-muted/50"
      />
      <button
        v-if="query"
        class="absolute right-3 top-1/2 -translate-y-1/2 font-mono-cyber text-xs text-cyber-muted hover:text-cyber-white transition-colors"
        @click="query = ''"
      >✕</button>
    </div>

    <p v-if="error" class="font-mono-cyber text-xs text-red-400">{{ error }}</p>

    <div v-if="loading" class="font-mono-cyber text-cyber-muted text-sm text-center py-24">
      // loading…
    </div>

    <template v-else>
      <div class="border border-cyber-border rounded-sm overflow-x-auto">
        <table class="w-full text-xs font-mono-cyber">
          <thead>
            <tr class="border-b border-cyber-border bg-cyber-surface">
              <th class="text-left px-3 py-2 text-cyber-muted tracking-[0.15em] uppercase whitespace-nowrap">Timestamp</th>
              <th class="text-left px-3 py-2 text-cyber-muted tracking-[0.15em] uppercase whitespace-nowrap">Event</th>
              <th class="text-left px-3 py-2 text-cyber-muted tracking-[0.15em] uppercase whitespace-nowrap hidden md:table-cell">Visitor</th>
              <th class="text-left px-3 py-2 text-cyber-muted tracking-[0.15em] uppercase hidden lg:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in logs"
              :key="entry.id"
              class="border-b border-cyber-border/40 hover:bg-cyber-surface/50 transition-colors"
            >
              <td class="px-3 py-2 text-cyber-muted whitespace-nowrap">{{ formatDate(entry.createdAt) }}</td>
              <td class="px-3 py-2 whitespace-nowrap" :class="EVENT_COLOURS[entry.event] ?? 'text-cyber-white'">
                {{ EVENT_LABELS[entry.event] ?? entry.event }}
              </td>
              <td class="px-3 py-2 hidden md:table-cell">
                <button
                  v-if="entry.ip"
                  class="font-mono-cyber text-xs text-cyber-muted/70 hover:text-red-400 transition-colors disabled:opacity-40"
                  :disabled="banning === entry.ip"
                  :title="`Click to ban ${entry.ip}`"
                  @click="banIp(entry.ip)"
                >{{ entry.ip }}</button>
                <span v-else class="text-cyber-muted/70">—</span>
              </td>
              <td class="px-3 py-2 text-cyber-muted/70 hidden lg:table-cell">
                <span v-for="(part, i) in parseDetails(entry.details)" :key="part.key">
                  <span v-if="i > 0"> · </span>
                  <span>{{ part.key }}: </span>
                  <RouterLink
                    v-if="part.link"
                    :to="part.link"
                    class="text-cyber-purple hover:text-cyber-purple-lt underline underline-offset-2"
                  >{{ part.value }}</RouterLink>
                  <span v-else>{{ part.value }}</span>
                </span>
              </td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="4" class="px-3 py-8 text-center text-cyber-muted/40 tracking-[0.2em] uppercase">
                // no logs yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sentinel -->
      <div ref="sentinel" class="h-1" />

      <div v-if="loadingMore" class="font-mono-cyber text-cyber-muted text-xs text-center py-4 tracking-widest">
        // loading more…
      </div>
      <div v-else-if="!hasMore && logs.length > 0" class="font-mono-cyber text-cyber-muted/40 text-xs text-center py-4 tracking-widest">
        // end of results
      </div>
    </template>
  </div>
</template>
