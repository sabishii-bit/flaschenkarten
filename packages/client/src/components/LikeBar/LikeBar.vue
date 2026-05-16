<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ThumbsUp, ThumbsDown } from '@lucide/vue'
import { useApi } from '../../composables/useApi.ts'
import type { LikeBarProps } from './variants.ts'
import type { VoteSummary, VoteType } from '@flaschenkarten/shared'

const props = defineProps<LikeBarProps>()
const { get, post } = useApi()

const votes   = ref<VoteSummary>({ likes: 0, dislikes: 0, myVote: null })
const loading = ref(true)
const busy    = ref(false)

const total      = computed(() => votes.value.likes + votes.value.dislikes)
const likeRatio  = computed(() => total.value === 0 ? 50 : (votes.value.likes / total.value) * 100)

onMounted(async () => {
  try {
    votes.value = await get<VoteSummary>(`/api/decks/${props.deckId}/votes`)
  } finally {
    loading.value = false
  }
})

async function vote(type: VoteType) {
  if (busy.value) return
  busy.value = true
  try {
    votes.value = await post<VoteSummary>(`/api/decks/${props.deckId}/votes`, { vote: type })
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Buttons -->
    <div class="flex items-center gap-3">
      <!-- Like -->
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer"
        :class="votes.myVote === 'like'
          ? 'border-cyber-green/70 bg-cyber-green/10 text-cyber-green'
          : 'border-cyber-border text-cyber-muted hover:border-cyber-green/40 hover:text-cyber-green hover:bg-cyber-green/5'"
        :disabled="busy || loading"
        @click="vote('like')"
      >
        <ThumbsUp :size="15" />
        <span class="font-mono-cyber text-xs">{{ loading ? '—' : votes.likes }}</span>
      </button>

      <!-- Dislike -->
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer"
        :class="votes.myVote === 'dislike'
          ? 'border-red-400/60 bg-red-400/10 text-red-400'
          : 'border-cyber-border text-cyber-muted hover:border-red-400/40 hover:text-red-400 hover:bg-red-400/5'"
        :disabled="busy || loading"
        @click="vote('dislike')"
      >
        <ThumbsDown :size="15" />
        <span class="font-mono-cyber text-xs">{{ loading ? '—' : votes.dislikes }}</span>
      </button>
    </div>

    <!-- Ratio bar -->
    <div class="flex flex-col gap-1">
      <div class="h-1 w-full rounded-full overflow-hidden bg-red-400/30">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="loading ? 'bg-cyber-border' : 'bg-cyber-green'"
          :style="{ width: loading ? '50%' : `${likeRatio}%` }"
        />
      </div>
      <div v-if="!loading && total > 0" class="flex justify-between">
        <span class="font-mono-cyber text-[10px] text-cyber-green/70">{{ Math.round(likeRatio) }}% liked</span>
        <span class="font-mono-cyber text-[10px] text-cyber-muted/50">{{ total }} {{ total === 1 ? 'vote' : 'votes' }}</span>
      </div>
    </div>
  </div>
</template>
