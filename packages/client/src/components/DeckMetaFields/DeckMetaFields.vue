<script setup lang="ts">
import TextInput from '../TextInput/TextInput.vue'
import TextArea from '../TextArea/TextArea.vue'
import DeckToggle from '../DeckToggle/DeckToggle.vue'

defineProps<{ title: string; description: string; isPublic: boolean; requiresAnswer: boolean }>()
defineEmits<{
  'update:title':         [v: string]
  'update:description':   [v: string]
  'update:isPublic':      [v: boolean]
  'update:requiresAnswer':[v: boolean]
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <TextInput
      :model-value="title"
      label="Deck Title"
      placeholder="e.g. Japanese Vocabulary N5"
      @update:model-value="$emit('update:title', $event)"
    />
    <TextArea
      :model-value="description"
      label="Description"
      placeholder="What will you study with this deck?"
      :rows="2"
      @update:model-value="$emit('update:description', $event)"
    />
    <DeckToggle
      :model-value="isPublic"
      label="Public"
      on-text="Anyone can view this deck"
      off-text="Only you can view this deck"
      @update:model-value="$emit('update:isPublic', $event)"
    />
    <DeckToggle
      :model-value="requiresAnswer"
      label="Answer Mode"
      on-text="Studiers must type an answer"
      off-text="Flip-only mode"
      @update:model-value="$emit('update:requiresAnswer', $event)"
    />
  </div>
</template>
