<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '../composables/useApi.ts'
import FlashCard from '../components/FlashCard/FlashCard.vue'
import Button from '../components/Button/Button.vue'
import type { DeckWithCards } from '@flaschenkarten/shared'

const route   = useRoute()
const id      = route.params.id as string
const { get } = useApi()

const deck         = ref<DeckWithCards | null>(null)
const loading      = ref(true)
const error        = ref<string | null>(null)
const currentIndex = ref(0)
const completed    = ref(false)

const currentCard = computed(() => deck.value?.cards[currentIndex.value])
const total       = computed(() => deck.value?.cards.length ?? 0)
const progress    = computed(() => total.value ? ((currentIndex.value + 1) / total.value) * 100 : 0)

onMounted(async () => {
  try {
    deck.value = await get<DeckWithCards>(`/api/decks/${id}`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load deck'
  } finally {
    loading.value = false
  }
})

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < total.value - 1) {
    currentIndex.value++
  } else {
    completed.value = true
  }
}

function restart() {
  currentIndex.value = 0
  completed.value    = false
}
</script>

<template>
  <div class="animate-slide-up max-w-2xl mx-auto">

    <!-- Loading -->
    <div v-if="loading" class="font-mono-cyber text-cyber-muted text-sm text-center py-24">
      // loading…
    </div>

    <!-- Error -->
    <div v-else-if="error" class="font-mono-cyber text-red-400 text-sm text-center py-24">
      {{ error }}
    </div>

    <template v-else-if="deck">
      <!-- Header -->
      <div class="text-center mb-8">
        <p class="font-mono-cyber text-cyber-purple text-xs tracking-[0.3em] uppercase mb-2">
          // study mode
        </p>
        <h2 class="font-orbitron text-2xl font-bold text-cyber-white">
          {{ deck.title }}
        </h2>
      </div>

      <!-- Completion screen -->
      <div v-if="completed" class="text-center py-12 flex flex-col items-center gap-6">
        <div class="font-orbitron text-5xl text-cyber-purple glow-text-purple animate-pulse-glow">
          ✓
        </div>
        <div>
          <p class="font-orbitron text-xl font-bold text-cyber-white mb-2">
            Deck Complete
          </p>
          <p class="font-mono-cyber text-cyber-muted text-sm">
            You reviewed all {{ total }} cards.
          </p>
        </div>
        <div class="flex gap-3">
          <Button variant="primary" @click="restart">Study Again</Button>
          <RouterLink :to="`/decks/${id}`">
            <Button variant="ghost">Back to Deck</Button>
          </RouterLink>
        </div>
      </div>

      <!-- Study session -->
      <template v-else>
        <!-- Progress -->
        <div class="flex items-center gap-4 mb-6">
          <div class="flex-1 h-px bg-cyber-border rounded-full overflow-hidden">
            <div
              class="h-full bg-cyber-purple transition-all duration-300 glow-purple"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <span class="font-mono-cyber text-cyber-muted text-xs shrink-0">
            {{ currentIndex + 1 }} / {{ total }}
          </span>
        </div>

        <!-- Card — :key forces remount on index change, resetting flip state -->
        <FlashCard :key="currentIndex">
          <template #front>
            <span class="font-mono-cyber text-center text-cyber-white text-xl leading-relaxed">
              {{ currentCard?.front }}
            </span>
          </template>
          <template #back>
            <span class="font-mono-cyber text-center text-cyber-white text-xl leading-relaxed">
              {{ currentCard?.back }}
            </span>
          </template>
        </FlashCard>

        <!-- Navigation -->
        <div class="flex items-center justify-between mt-8">
          <Button variant="ghost" :disabled="currentIndex === 0" @click="prev">
            ← Prev
          </Button>
          <span class="font-mono-cyber text-cyber-muted/50 text-xs tracking-widest">
            CLICK CARD TO FLIP
          </span>
          <Button variant="primary" @click="next">
            {{ currentIndex === total - 1 ? 'Finish' : 'Next →' }}
          </Button>
        </div>
      </template>

      <!-- Back link -->
      <div class="text-center mt-10" v-if="!completed">
        <RouterLink
          :to="`/decks/${id}`"
          class="font-mono-cyber text-cyber-muted text-sm hover:text-cyber-purple-lt transition-colors"
        >
          ← back to deck
        </RouterLink>
      </div>
    </template>
  </div>
</template>
