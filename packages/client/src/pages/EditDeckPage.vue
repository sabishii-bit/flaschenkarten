<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.ts'
import { useUndoDelete } from '../composables/useUndoDelete.ts'
import Button from '../components/Button/Button.vue'
import DeckMetaFields from '../components/DeckMetaFields/DeckMetaFields.vue'
import DeckCardPreview from '../components/DeckCardPreview/DeckCardPreview.vue'
import DeckCardList from '../components/DeckCardList/DeckCardList.vue'
import UndoToast from '../components/UndoToast/UndoToast.vue'
import type { CardEditorCard } from '../components/CardEditor/variants.ts'
import type { Deck, DeckWithCards } from '@flaschenkarten/shared'

const route         = useRoute()
const router        = useRouter()
const { get, post } = useApi()
const id            = route.params.id as string

const title          = ref('')
const description    = ref('')
const isPublic       = ref(true)
const requiresAnswer = ref(false)
const hashtags       = ref<string[]>([])
const cards          = ref<CardEditorCard[]>([])
const activeIndex    = ref(0)
const loading        = ref(true)
const saving         = ref(false)
const loadError      = ref<string | null>(null)
const saveError      = ref<string | null>(null)

const { hasDeleted, deleteCount, record: recordDelete, undo: popUndo } = useUndoDelete<CardEditorCard>()

const activeCard = computed(() => cards.value[activeIndex.value] ?? { front: '', back: '' })
const canSave    = computed(() =>
  title.value.trim().length > 0 &&
  cards.value.some(c => c.front.trim() || c.back.trim())
)

const lgQuery = window.matchMedia('(min-width: 1024px)')
function syncScrollLock() { document.body.style.overflow = lgQuery.matches ? 'hidden' : '' }
onUnmounted(() => { document.body.style.overflow = ''; lgQuery.removeEventListener('change', syncScrollLock) })

onMounted(async () => {
  syncScrollLock()
  lgQuery.addEventListener('change', syncScrollLock)
  try {
    const deck = await get<DeckWithCards>(`/api/decks/${id}`)
    title.value          = deck.title
    description.value    = deck.description
    isPublic.value       = deck.isPublic
    requiresAnswer.value = deck.requiresAnswer
    hashtags.value       = deck.hashtags ?? []
    cards.value          = deck.cards.map(c => ({ front: c.front, back: c.back, acceptedAnswers: c.acceptedAnswers ?? [] }))
    if (cards.value.length === 0) cards.value.push({ front: '', back: '', acceptedAnswers: [] })
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Failed to load deck'
  } finally {
    loading.value = false
  }
})

function addCard() {
  cards.value.push({ front: '', back: '', acceptedAnswers: [] })
  activeIndex.value = cards.value.length - 1
}

function removeCard(i: number) {
  if (cards.value.length === 1) return
  recordDelete(cards.value[i], i)
  cards.value.splice(i, 1)
  activeIndex.value = Math.min(activeIndex.value, cards.value.length - 1)
}

function undoDelete() {
  const entry = popUndo()
  if (!entry) return
  cards.value.splice(entry.index, 0, entry.item)
  activeIndex.value = entry.index
}

function updateCard(i: number, updated: CardEditorCard) {
  cards.value[i] = updated
}

async function saveDeck() {
  if (!canSave.value || saving.value) return
  saving.value = true
  saveError.value = null
  try {
    const deck = await post<Deck>(`/api/decks/${id}`, {
      title:          title.value,
      description:    description.value,
      isPublic:       isPublic.value,
      requiresAnswer: requiresAnswer.value,
      hashtags:       hashtags.value,
      cards:          cards.value.filter(c => c.front.trim() || c.back.trim()),
    }, 'PUT')
    router.push(`/decks/${deck.id}`)
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="animate-slide-up">
    <div v-if="loading" class="font-mono-cyber text-cyber-muted text-sm text-center py-24">// loading…</div>
    <div v-else-if="loadError" class="font-mono-cyber text-red-400 text-sm text-center py-24">{{ loadError }}</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">

      <div class="lg:sticky lg:top-8 flex flex-col gap-6">
        <div>
          <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">// edit deck</p>
          <h2 class="font-orbitron text-2xl font-bold text-cyber-white">Edit Deck</h2>
        </div>

        <DeckMetaFields
          :title="title" :description="description" :is-public="isPublic" :requires-answer="requiresAnswer" :hashtags="hashtags"
          @update:title="title = $event" @update:description="description = $event"
          @update:is-public="isPublic = $event" @update:requires-answer="requiresAnswer = $event" @update:hashtags="hashtags = $event"
        />

        <div class="border-t border-cyber-border" />
        <DeckCardPreview :front="activeCard.front" :back="activeCard.back" :index="activeIndex" />
        <div class="border-t border-cyber-border" />

        <div class="flex flex-col gap-2">
          <p v-if="saveError" class="font-mono-cyber text-xs text-red-400">{{ saveError }}</p>
          <div class="flex gap-3">
            <RouterLink :to="`/decks/${id}`">
              <Button variant="ghost">Cancel</Button>
            </RouterLink>
            <Button variant="primary" :disabled="!canSave || saving" @click="saveDeck">
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </Button>
          </div>
        </div>
      </div>

      <DeckCardList
        :cards="cards" :active-index="activeIndex" :requires-answer="requiresAnswer"
        @select="activeIndex = $event"
        @update:card="(i, card) => updateCard(i, card)"
        @delete="removeCard($event)"
        @add="addCard"
      />

    </div>
  </div>

  <UndoToast :visible="hasDeleted" :count="deleteCount" @undo="undoDelete" />
</template>
