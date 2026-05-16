<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.ts'
import Button from '../components/Button/Button.vue'
import FlashCard from '../components/FlashCard/FlashCard.vue'
import LikeBar from '../components/LikeBar/LikeBar.vue'
import StarButton from '../components/StarButton/StarButton.vue'
import { Trash2 } from '@lucide/vue'
import Checkbox from '../components/Checkbox/Checkbox.vue'
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

const selectedIds = ref<Set<string>>(new Set())

const allSelected  = computed(() => deck.value?.cards.every(c => selectedIds.value.has(c.id)) ?? false)
const noneSelected = computed(() => selectedIds.value.size === 0)

onMounted(async () => {
  try {
    deck.value = await get<DeckWithCards>(`/api/decks/${id}`)
    selectedIds.value = new Set(deck.value.cards.map(c => c.id))
    const mine = await get<{ id: string }[]>('/api/decks/mine')
    isOwn.value = mine.some(d => d.id === id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load deck'
  } finally {
    loading.value = false
  }
})


function toggleCard(cardId: string) {
  if (selectedIds.value.has(cardId)) selectedIds.value.delete(cardId)
  else selectedIds.value.add(cardId)
  selectedIds.value = new Set(selectedIds.value)
}

function selectAll() {
  selectedIds.value = new Set(deck.value!.cards.map(c => c.id))
}

function deselectAll() {
  selectedIds.value = new Set()
}

function startStudy() {
  const cards = [...selectedIds.value].join(',')
  router.push({ name: 'deck-study', params: { id }, query: { cards } })
}

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
          <Button variant="primary" :disabled="noneSelected" @click="startStudy">
            Study Now{{ noneSelected ? '' : selectedIds.size < deck.cards.length ? ` (${selectedIds.size})` : '' }}
          </Button>
          <template v-if="isOwn">
            <RouterLink :to="`/decks/${id}/edit`">
              <Button variant="ghost">Edit Deck</Button>
            </RouterLink>
          </template>
          <StarButton :deck-id="id" />
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

      <!-- Votes -->
      <div class="mt-8 pt-6 border-t border-cyber-border">
        <p class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase mb-3">// rate this deck</p>
        <LikeBar :deck-id="id" />
      </div>

      <!-- Card grid -->
      <div class="mt-10">
        <div class="flex items-center justify-between mb-4">
          <p class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase">
            Cards — {{ deck.cards.length }}
          </p>
          <div class="flex items-center gap-3">
            <span class="font-mono-cyber text-cyber-muted/50 text-xs">
              {{ selectedIds.size }} selected
            </span>
            <button
              class="font-mono-cyber text-xs text-cyber-purple hover:text-cyber-purple-lt transition-colors cursor-pointer"
              @click="allSelected ? deselectAll() : selectAll()"
            >
              {{ allSelected ? 'Deselect all' : 'Select all' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FlashCard
            v-for="card in deck.cards"
            :key="card.id"
            size="sm"
          >
            <template #overlay>
              <Checkbox
                class="absolute top-12 left-3 z-10"
                :checked="selectedIds.has(card.id)"
                @toggle="toggleCard(card.id)"
              />
            </template>
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

