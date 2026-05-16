<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.ts'
import Button from '../components/Button/Button.vue'
import FlashCard from '../components/FlashCard/FlashCard.vue'
import { Trash2 } from '@lucide/vue'
import type { DeckWithCards } from '@flaschenkarten/shared'

const route        = useRoute()
const router       = useRouter()
const id           = route.params.id as string
const { get, del } = useApi()

const deck      = ref<DeckWithCards | null>(null)
const loading   = ref(true)
const error     = ref<string | null>(null)
const isOwn     = ref(false)
const confirming = ref(false)
const deleting   = ref(false)
const deleteError = ref<string | null>(null)

onMounted(async () => {
  try {
    deck.value = await get<DeckWithCards>(`/api/decks/${id}`)
    // Check ownership: if GET /api/decks/mine contains this deck, it's ours
    const mine = await get<{ id: string }[]>('/api/decks/mine')
    isOwn.value = mine.some(d => d.id === id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load deck'
  } finally {
    loading.value = false
  }
})

async function deleteDeck() {
  if (deleting.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await del(`/api/decks/${id}`)
    router.push('/my-decks')
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'Failed to delete deck'
    confirming.value = false
  } finally {
    deleting.value = false
  }
}
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

      <div class="flex flex-wrap items-center justify-between gap-3 mt-8">
        <!-- Left: primary actions -->
        <div class="flex items-center gap-3">
          <RouterLink :to="`/decks/${id}/study`">
            <Button variant="primary">Study Now</Button>
          </RouterLink>
          <template v-if="isOwn">
            <RouterLink :to="`/decks/${id}/edit`">
              <Button variant="ghost">Edit Deck</Button>
            </RouterLink>
          </template>
        </div>

        <!-- Right: delete -->
        <template v-if="isOwn">
          <template v-if="!confirming">
            <Button variant="danger" @click="confirming = true">
              <span class="flex items-center gap-2">
                <Trash2 :size="14" />
                Delete
              </span>
            </Button>
          </template>
          <template v-else>
            <div class="flex items-center gap-2">
              <span class="font-mono-cyber text-cyber-muted text-xs">Are you sure?</span>
              <Button variant="danger" :disabled="deleting" @click="deleteDeck">
                {{ deleting ? 'Deleting…' : 'Yes, delete' }}
              </Button>
              <Button variant="ghost" @click="confirming = false">Cancel</Button>
            </div>
          </template>
          <p v-if="deleteError" class="font-mono-cyber text-xs text-red-400 w-full text-right">{{ deleteError }}</p>
        </template>
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
