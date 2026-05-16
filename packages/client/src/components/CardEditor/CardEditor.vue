<script setup lang="ts">
import { ref } from 'vue'
import { cardEditorBase, cardEditorActive, type CardEditorProps, type CardEditorCard } from './variants.ts'
import Button from '../Button/Button.vue'
import TextArea from '../TextArea/TextArea.vue'

const props = defineProps<CardEditorProps>()
const emit = defineEmits<{
  'update:card': [card: CardEditorCard]
  'delete': []
  'select': []
}>()

const newAnswer = ref('')

function updateFront(front: string) {
  emit('update:card', { ...props.card, front })
}
function updateBack(back: string) {
  emit('update:card', { ...props.card, back })
}
function addAnswer() {
  const trimmed = newAnswer.value.trim()
  if (!trimmed) return
  emit('update:card', { ...props.card, acceptedAnswers: [...props.card.acceptedAnswers, trimmed] })
  newAnswer.value = ''
}
function removeAnswer(i: number) {
  const updated = props.card.acceptedAnswers.filter((_, idx) => idx !== i)
  emit('update:card', { ...props.card, acceptedAnswers: updated })
}
function onAnswerKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addAnswer() }
}
</script>

<template>
  <div
    :class="[cardEditorBase, isActive && cardEditorActive]"
    tabindex="0"
    @focusin="emit('select')"
  >
    <!-- Card number badge -->
    <div class="shrink-0 pt-1">
      <span class="font-orbitron text-xs font-bold text-cyber-purple bg-cyber-raised border border-cyber-border rounded px-2 py-1">
        {{ String(index + 1).padStart(2, '0') }}
      </span>
    </div>

    <!-- Front -->
    <div class="flex-1 min-w-0" @click.stop>
      <TextArea
        :model-value="card.front"
        label="Front"
        placeholder="Question or term…"
        :rows="3"
        @update:model-value="updateFront"
        @click="emit('select')"
      />
    </div>

    <!-- Back + accepted answers -->
    <div class="flex-1 min-w-0 flex flex-col gap-2" @click.stop>
      <TextArea
        :model-value="card.back"
        label="Back"
        placeholder="Answer or definition…"
        :rows="3"
        @update:model-value="updateBack"
        @click="emit('select')"
      />

      <!-- Accepted answers editor (answer mode only) -->
      <template v-if="requiresAnswer">
        <div class="flex flex-col gap-1.5">
          <span class="font-mono-cyber text-cyber-muted text-[10px] tracking-[0.2em] uppercase">
            Accepted Answers
          </span>

          <!-- Chips -->
          <div v-if="card.acceptedAnswers.length > 0" class="flex flex-wrap gap-1.5">
            <span
              v-for="(ans, i) in card.acceptedAnswers"
              :key="i"
              class="flex items-center gap-1 font-mono-cyber text-xs text-cyber-white bg-cyber-raised border border-cyber-border rounded px-2 py-0.5"
            >
              {{ ans }}
              <button
                class="text-cyber-muted hover:text-red-400 transition-colors leading-none cursor-pointer"
                @click.stop="removeAnswer(i)"
              >✕</button>
            </span>
          </div>

          <!-- Add answer input -->
          <div class="flex gap-1.5">
            <input
              v-model="newAnswer"
              type="text"
              placeholder="Add an answer…"
              class="flex-1 font-mono-cyber text-xs text-cyber-white bg-cyber-surface border border-cyber-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-cyber-purple placeholder-cyber-muted/50 transition-all"
              @click.stop
              @keydown="onAnswerKeydown"
            />
            <button
              class="font-mono-cyber text-xs text-cyber-purple border border-cyber-border rounded px-2 py-1 hover:border-cyber-purple/60 hover:bg-cyber-raised transition-all cursor-pointer"
              @click.stop="addAnswer"
            >+</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Delete -->
    <div class="shrink-0 pt-6" @click.stop>
      <Button variant="ghost" @click="emit('delete')">✕</Button>
    </div>
  </div>
</template>
