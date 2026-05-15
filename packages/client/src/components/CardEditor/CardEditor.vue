<script setup lang="ts">
import { cardEditorBase, cardEditorActive, type CardEditorProps, type CardEditorCard } from './variants.ts'
import Button from '../Button/Button.vue'
import TextArea from '../TextArea/TextArea.vue'

const props = defineProps<CardEditorProps>()
const emit = defineEmits<{
  'update:card': [card: CardEditorCard]
  'delete': []
  'select': []
}>()

function updateFront(front: string) {
  emit('update:card', { ...props.card, front })
}
function updateBack(back: string) {
  emit('update:card', { ...props.card, back })
}
</script>

<template>
  <div
    :class="[cardEditorBase, isActive && cardEditorActive]"
    @click="emit('select')"
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

    <!-- Back -->
    <div class="flex-1 min-w-0" @click.stop>
      <TextArea
        :model-value="card.back"
        label="Back"
        placeholder="Answer or definition…"
        :rows="3"
        @update:model-value="updateBack"
        @click="emit('select')"
      />
    </div>

    <!-- Delete -->
    <div class="shrink-0 pt-6" @click.stop>
      <Button variant="ghost" @click="emit('delete')">✕</Button>
    </div>
  </div>
</template>
