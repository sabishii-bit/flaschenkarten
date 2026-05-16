<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.ts'
import { useUndoDelete } from '../composables/useUndoDelete.ts'
import Button from '../components/Button/Button.vue'
import TextArea from '../components/TextArea/TextArea.vue'
import DeckMetaFields from '../components/DeckMetaFields/DeckMetaFields.vue'
import DeckCardPreview from '../components/DeckCardPreview/DeckCardPreview.vue'
import DeckCardList from '../components/DeckCardList/DeckCardList.vue'
import UndoToast from '../components/UndoToast/UndoToast.vue'
import type { CardEditorCard } from '../components/CardEditor/variants.ts'
import type { Deck } from '@flaschenkarten/shared'

interface GeneratedDeck {
  title: string
  description: string
  requiresAnswer: boolean
  cards: CardEditorCard[]
}

const router   = useRouter()
const { post } = useApi()

const lgQuery = window.matchMedia('(min-width: 1024px)')
function syncScrollLock() { document.body.style.overflow = lgQuery.matches && !!generated.value ? 'hidden' : '' }
onMounted(()   => { syncScrollLock(); lgQuery.addEventListener('change', syncScrollLock) })
onUnmounted(() => { document.body.style.overflow = ''; lgQuery.removeEventListener('change', syncScrollLock) })

// Phase 1
const prompt     = ref('')
const cardCount  = ref(10)
const generating = ref(false)
const genError   = ref<string | null>(null)

// Phase 2 (edit state)
const generated      = ref<GeneratedDeck | null>(null)
const title          = ref('')
const description    = ref('')
const isPublic       = ref(true)
const requiresAnswer = ref(false)
const cards          = ref<CardEditorCard[]>([])
const activeIndex    = ref(0)
const saving         = ref(false)
const saveError      = ref<string | null>(null)

const { hasDeleted, deleteCount, record: recordDelete, undo: popUndo } = useUndoDelete<CardEditorCard>()

const activeCard = computed(() => cards.value[activeIndex.value] ?? { front: '', back: '' })
const canSave    = computed(() =>
  title.value.trim().length > 0 &&
  cards.value.some(c => c.front.trim() || c.back.trim())
)

async function generate() {
  if (!prompt.value.trim() || generating.value) return
  generating.value = true
  genError.value = null
  try {
    const data = await post<GeneratedDeck>('/api/generate', { prompt: prompt.value, cardCount: cardCount.value })
    generated.value      = data
    title.value          = data.title
    description.value    = data.description
    requiresAnswer.value = data.requiresAnswer
    cards.value          = data.cards.map(c => ({ ...c }))
    activeIndex.value    = 0
    syncScrollLock()
  } catch (e) {
    genError.value = e instanceof Error ? e.message : 'Generation failed'
  } finally {
    generating.value = false
  }
}

function regenerate() {
  generated.value = null
  saveError.value = null
  syncScrollLock()
}

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
    const deck = await post<Deck>('/api/decks', {
      title:          title.value,
      description:    description.value,
      isPublic:       isPublic.value,
      requiresAnswer: requiresAnswer.value,
      cards:          cards.value.filter(c => c.front.trim() || c.back.trim()),
    })
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
    <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">

      <!-- LEFT: sticky panel -->
      <div class="lg:sticky lg:top-8 flex flex-col gap-6">

        <!-- Phase 1: prompt form -->
        <template v-if="!generated">
          <div>
            <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">// generate</p>
            <h2 class="font-orbitron text-2xl font-bold text-cyber-white">Generate a Deck</h2>
          </div>

          <div class="flex flex-col gap-4">
            <TextArea
              v-model="prompt"
              label="Prompt"
              placeholder="What should this deck be about? e.g. Basic Spanish vocabulary"
              :rows="4"
            />

            <div class="flex flex-col gap-1">
              <label class="font-mono-cyber text-xs tracking-[0.2em] uppercase text-cyber-muted">Card Count</label>
              <input
                v-model.number="cardCount"
                type="number"
                min="1"
                max="50"
                class="w-full bg-cyber-bg border border-cyber-border rounded-sm px-3 py-2 font-mono-cyber text-sm text-cyber-white focus:outline-none focus:border-cyber-purple transition-colors"
              />
              <p class="font-mono-cyber text-xs text-cyber-muted/60">Between 1 and 50 cards</p>
            </div>

            <p v-if="genError" class="font-mono-cyber text-xs text-red-400">{{ genError }}</p>

            <Button variant="primary" :disabled="!prompt.trim() || generating" @click="generate">
              {{ generating ? 'Generating…' : 'Generate' }}
            </Button>
          </div>
        </template>

        <!-- Phase 2: edit -->
        <template v-else>
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">// new deck</p>
              <h2 class="font-orbitron text-2xl font-bold text-cyber-white">{{ title || 'Generated Deck' }}</h2>
            </div>
            <button
              class="font-mono-cyber text-xs text-cyber-muted hover:text-cyber-white transition-colors shrink-0 mt-1"
              @click="regenerate"
            >
              ← Regenerate
            </button>
          </div>

          <DeckMetaFields
            :title="title" :description="description" :is-public="isPublic" :requires-answer="requiresAnswer"
            @update:title="title = $event" @update:description="description = $event"
            @update:is-public="isPublic = $event" @update:requires-answer="requiresAnswer = $event"
          />

          <div class="border-t border-cyber-border" />
          <DeckCardPreview :front="activeCard.front" :back="activeCard.back" :index="activeIndex" />
          <div class="border-t border-cyber-border" />

          <div class="flex flex-col gap-2">
            <p v-if="saveError" class="font-mono-cyber text-xs text-red-400">{{ saveError }}</p>
            <Button variant="primary" :disabled="!canSave || saving" @click="saveDeck">
              {{ saving ? 'Saving…' : 'Save Deck' }}
            </Button>
          </div>
        </template>
      </div>

      <!-- RIGHT: card list or placeholder -->
      <div v-if="!generated" class="hidden lg:flex items-center justify-center h-64 border border-dashed border-cyber-border/40 rounded-sm">
        <p class="font-mono-cyber text-cyber-muted/40 text-xs tracking-[0.3em] uppercase">// cards will appear here</p>
      </div>

      <DeckCardList
        v-else
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
