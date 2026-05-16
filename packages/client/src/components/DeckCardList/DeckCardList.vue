<script setup lang="ts">
import CardEditor from '../CardEditor/CardEditor.vue'
import Button from '../Button/Button.vue'
import type { CardEditorCard } from '../CardEditor/variants.ts'

defineProps<{ cards: CardEditorCard[]; activeIndex: number; requiresAnswer: boolean }>()
defineEmits<{
  select:         [index: number]
  'update:card':  [index: number, card: CardEditorCard]
  delete:         [index: number]
  add:            []
}>()
</script>

<template>
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
        @select="$emit('select', i)"
        @update:card="$emit('update:card', i, $event)"
        @delete="$emit('delete', i)"
      />
    </div>

    <Button variant="ghost" @click="$emit('add')">+ Add Card</Button>
  </div>
</template>
