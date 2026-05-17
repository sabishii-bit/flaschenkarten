<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '../composables/useAdminAuth.ts'

const { token, isAuthenticated } = useAdminAuth()
const router = useRouter()

if (!isAuthenticated.value) router.replace('/admin')

type BannedEntry = {
  ip:        string
  cookieId:  string | null
  reason:    string
  createdAt: string
}

const bans    = ref<BannedEntry[]>([])
const loading = ref(false)
const error   = ref<string | null>(null)

const BASE = import.meta.env.VITE_API_URL ?? ''

function authHeaders(): Record<string, string> {
  return {
    'Content-Type':  'application/json',
    'X-Api-Key':     import.meta.env.VITE_API_KEY ?? '',
    'Authorization': `Bearer ${token.value}`,
  }
}

async function fetchBans() {
  loading.value = true
  error.value   = null
  try {
    const res  = await fetch(`${BASE}/api/admin/bans`, { credentials: 'include', headers: authHeaders() })
    const body = await res.json()
    if (!res.ok) throw new Error(body?.error ?? `Request failed: ${res.status}`)
    bans.value = body.data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load bans'
  } finally {
    loading.value = false
  }
}

async function unban(ip: string) {
  const prev = bans.value
  bans.value = bans.value.filter(b => b.ip !== ip)
  try {
    const res = await fetch(`${BASE}/api/admin/bans/${encodeURIComponent(ip)}`, {
      method: 'DELETE', credentials: 'include', headers: authHeaders(),
    })
    if (!res.ok) throw new Error()
  } catch {
    bans.value = prev
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

onMounted(() => fetchBans())
</script>

<template>
  <div class="animate-slide-up flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">// admin</p>
        <h2 class="font-orbitron text-2xl font-bold text-cyber-white">Ban List</h2>
      </div>
      <button
        class="font-mono-cyber text-xs text-cyber-purple hover:text-cyber-white transition-colors disabled:opacity-40"
        :disabled="loading"
        @click="fetchBans"
      >
        {{ loading ? 'Loading…' : '↺ Refresh' }}
      </button>
    </div>

    <p v-if="error" class="font-mono-cyber text-xs text-red-400">{{ error }}</p>

    <!-- Mobile cards -->
    <div class="flex flex-col gap-2 md:hidden">
      <div
        v-for="entry in bans"
        :key="entry.ip"
        class="flex flex-col gap-1.5 px-4 py-3 border border-cyber-border/40 rounded-sm bg-cyber-surface/30 text-xs font-mono-cyber"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-red-400 font-semibold">{{ entry.ip }}</span>
          <button
            class="text-cyber-muted hover:text-green-400 transition-colors shrink-0"
            @click="unban(entry.ip)"
          >Unban</button>
        </div>
        <span class="text-cyber-muted/60">{{ formatDate(entry.createdAt) }}</span>
        <span v-if="entry.reason" class="text-cyber-muted/70">{{ entry.reason }}</span>
        <span v-if="entry.cookieId" class="text-cyber-muted/50" :title="entry.cookieId">
          cookie: {{ entry.cookieId.slice(0, 8) }}…
        </span>
      </div>
      <div v-if="!loading && bans.length === 0" class="px-3 py-8 text-center text-cyber-muted/40 tracking-[0.2em] uppercase text-xs font-mono-cyber">
        // no banned users
      </div>
    </div>

    <!-- Desktop table -->
    <div class="hidden md:block border border-cyber-border rounded-sm overflow-x-auto">
      <table class="w-full text-xs font-mono-cyber">
        <thead>
          <tr class="border-b border-cyber-border bg-cyber-surface">
            <th class="text-left px-3 py-2 text-cyber-muted tracking-[0.15em] uppercase whitespace-nowrap">IP Address</th>
            <th class="text-left px-3 py-2 text-cyber-muted tracking-[0.15em] uppercase whitespace-nowrap">Cookie ID</th>
            <th class="text-left px-3 py-2 text-cyber-muted tracking-[0.15em] uppercase hidden lg:table-cell">Reason</th>
            <th class="text-left px-3 py-2 text-cyber-muted tracking-[0.15em] uppercase whitespace-nowrap">Banned At</th>
            <th class="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in bans"
            :key="entry.ip"
            class="border-b border-cyber-border/40 hover:bg-cyber-surface/50 transition-colors"
          >
            <td class="px-3 py-2 text-red-400 whitespace-nowrap">{{ entry.ip }}</td>
            <td class="px-3 py-2 text-cyber-muted/70" :title="entry.cookieId ?? ''">
              {{ entry.cookieId ? entry.cookieId.slice(0, 8) + '…' : '—' }}
            </td>
            <td class="px-3 py-2 text-cyber-muted/70 hidden lg:table-cell">
              {{ entry.reason || '—' }}
            </td>
            <td class="px-3 py-2 text-cyber-muted whitespace-nowrap">{{ formatDate(entry.createdAt) }}</td>
            <td class="px-3 py-2 text-right">
              <button
                class="font-mono-cyber text-xs text-cyber-muted hover:text-green-400 transition-colors"
                @click="unban(entry.ip)"
              >
                Unban
              </button>
            </td>
          </tr>
          <tr v-if="!loading && bans.length === 0">
            <td colspan="5" class="px-3 py-8 text-center text-cyber-muted/40 tracking-[0.2em] uppercase">
              // no banned users
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
