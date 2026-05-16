<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Star } from '@lucide/vue'
import { useApi } from '../../composables/useApi.ts'
import type { StarButtonProps } from './variants.ts'

const props = defineProps<StarButtonProps>()
const { get, post } = useApi()

const favorited = ref(false)
const loading   = ref(true)
const busy      = ref(false)

onMounted(async () => {
  try {
    const res = await get<{ favorited: boolean }>(`/api/decks/${props.deckId}/favorite`)
    favorited.value = res.favorited
  } finally {
    loading.value = false
  }
})

async function toggle() {
  if (busy.value || loading.value) return
  busy.value = true
  try {
    const res = await post<{ favorited: boolean }>(`/api/decks/${props.deckId}/favorite`, {})
    favorited.value = res.favorited
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <button
    class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer"
    :class="favorited
      ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-400'
      : 'border-cyber-border text-cyber-muted hover:border-yellow-400/40 hover:text-yellow-400 hover:bg-yellow-400/5'"
    :disabled="loading || busy"
    @click="toggle"
  >
    <Star
      :size="15"
      :fill="favorited ? 'currentColor' : 'none'"
      class="transition-all duration-200"
      :class="{ 'scale-125': favorited }"
    />
    <span class="font-mono-cyber text-xs">
      {{ favorited ? 'Favorited' : 'Favorite' }}
    </span>
  </button>
</template>
