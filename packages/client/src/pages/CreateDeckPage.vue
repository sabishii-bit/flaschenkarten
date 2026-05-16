<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../components/Button/Button.vue'
import TextInput from '../components/TextInput/TextInput.vue'
import TextArea from '../components/TextArea/TextArea.vue'
import CardEditor from '../components/CardEditor/CardEditor.vue'
import FlashCard from '../components/FlashCard/FlashCard.vue'
import { useApi } from '../composables/useApi.ts'
import type { Deck } from '@flaschenkarten/shared'

interface CardEntry { front: string; back: string; acceptedAnswers: string[] }

const router   = useRouter()
const { post } = useApi()

const lgQuery = window.matchMedia('(min-width: 1024px)')

function syncScrollLock() {
  document.body.style.overflow = lgQuery.matches ? 'hidden' : ''
}

onMounted(()   => { syncScrollLock(); lgQuery.addEventListener('change', syncScrollLock) })
onUnmounted(() => { document.body.style.overflow = ''; lgQuery.removeEventListener('change', syncScrollLock) })

const title          = ref('')
const description    = ref('')
const isPublic       = ref(true)
const requiresAnswer = ref(false)
const cards          = ref<CardEntry[]>([{ front: '', back: '', acceptedAnswers: [] }])
const activeIndex = ref(0)
const saving      = ref(false)
const saveError   = ref<string | null>(null)

const activeCard = computed(() => cards.value[activeIndex.value] ?? { front: '', back: '' })
const canSave    = computed(() =>
  title.value.trim().length > 0 &&
  cards.value.some(c => c.front.trim() || c.back.trim())
)

function addCard() {
  cards.value.push({ front: '', back: '', acceptedAnswers: [] })
  activeIndex.value = cards.value.length - 1
}

function removeCard(i: number) {
  if (cards.value.length === 1) return
  cards.value.splice(i, 1)
  activeIndex.value = Math.min(activeIndex.value, cards.value.length - 1)
}

function updateCard(i: number, updated: CardEntry) {
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

      <!-- LEFT: sticky panel — metadata + preview + actions -->
      <div class="lg:sticky lg:top-8 flex flex-col gap-6">
        <div>
          <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">// new deck</p>
          <h2 class="font-orbitron text-2xl font-bold text-cyber-white">Create a Deck</h2>
        </div>

        <!-- Metadata -->
        <div class="flex flex-col gap-4">
          <TextInput v-model="title" label="Deck Title" placeholder="e.g. Japanese Vocabulary N5" />
          <TextArea  v-model="description" label="Description" placeholder="What will you study with this deck?" :rows="2" />

          <label class="flex items-center gap-3 cursor-pointer select-none w-fit">
            <span class="font-mono-cyber text-xs tracking-[0.2em] uppercase text-cyber-muted">Public</span>
            <div class="relative">
              <input v-model="isPublic" type="checkbox" class="sr-only" />
              <div class="w-10 h-5 rounded-full transition-colors duration-200" :class="isPublic ? 'bg-cyber-purple glow-purple' : 'bg-cyber-border'" />
              <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200" :class="isPublic ? 'translate-x-5' : 'translate-x-0'" />
            </div>
            <span class="font-mono-cyber text-xs text-cyber-white/60">
              {{ isPublic ? 'Anyone can view this deck' : 'Only you can view this deck' }}
            </span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer select-none w-fit">
            <span class="font-mono-cyber text-xs tracking-[0.2em] uppercase text-cyber-muted">Answer Mode</span>
            <div class="relative">
              <input v-model="requiresAnswer" type="checkbox" class="sr-only" />
              <div class="w-10 h-5 rounded-full transition-colors duration-200" :class="requiresAnswer ? 'bg-cyber-purple glow-purple' : 'bg-cyber-border'" />
              <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200" :class="requiresAnswer ? 'translate-x-5' : 'translate-x-0'" />
            </div>
            <span class="font-mono-cyber text-xs text-cyber-white/60">
              {{ requiresAnswer ? 'Studiers must type an answer' : 'Flip-only mode' }}
            </span>
          </label>
        </div>

        <div class="border-t border-cyber-border" />

        <!-- Live preview -->
        <div class="flex flex-col gap-3">
          <p class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase">
            // preview — card {{ activeIndex + 1 }}
          </p>
          <FlashCard :key="activeIndex">
            <template #front>
              <span class="font-mono-cyber text-center text-cyber-white text-base leading-relaxed" :class="{ 'text-cyber-muted/50 text-sm': !activeCard.front }">
                {{ activeCard.front || '// front' }}
              </span>
            </template>
            <template #back>
              <span class="font-mono-cyber text-center text-cyber-white text-base leading-relaxed" :class="{ 'text-cyber-muted/50 text-sm': !activeCard.back }">
                {{ activeCard.back || '// back' }}
              </span>
            </template>
          </FlashCard>
        </div>

        <div class="border-t border-cyber-border" />

        <!-- Actions -->
        <div class="flex flex-col gap-2">
          <p v-if="saveError" class="font-mono-cyber text-xs text-red-400">{{ saveError }}</p>
          <Button variant="primary" :disabled="!canSave || saving" @click="saveDeck">
            {{ saving ? 'Saving…' : 'Save Deck' }}
          </Button>
        </div>
      </div>

      <!-- RIGHT: scrollable card list -->
      <div class="flex flex-col gap-3">
        <p class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase">
          Cards — {{ cards.length }}
        </p>

        <div class="flex flex-col gap-3 lg:overflow-y-auto lg:max-h-[calc(100vh-16rem)] pr-1">
          <CardEditor
            v-for="(card, i) in cards"
            :key="i"
            :card="card"
            :index="i"
            :is-active="i === activeIndex"
            :requires-answer="requiresAnswer"
            @select="activeIndex = i"
            @update:card="updateCard(i, $event)"
            @delete="removeCard(i)"
          />
        </div>

        <Button variant="ghost" @click="addCard">+ Add Card</Button>
      </div>

    </div>
  </div>
</template>
