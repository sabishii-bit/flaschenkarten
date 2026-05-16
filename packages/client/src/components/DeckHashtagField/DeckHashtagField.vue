<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ modelValue: string[] }>()
const emit  = defineEmits<{ 'update:modelValue': [tags: string[]] }>()

const input = ref('')

const MAX = 20

function add() {
  const raw     = input.value.trim()
  if (!raw) return
  const tag     = raw.startsWith('#') ? raw : `#${raw}`
  if (props.modelValue.includes(tag)) { input.value = ''; return }
  if (props.modelValue.length >= MAX) return
  emit('update:modelValue', [...props.modelValue, tag])
  input.value = ''
}

function remove(i: number) {
  emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i))
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); add() }
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center justify-between">
      <span class="font-mono-cyber text-cyber-muted text-[10px] tracking-[0.2em] uppercase">Hashtags</span>
      <span class="font-mono-cyber text-[10px]" :class="modelValue.length < MIN ? 'text-red-400' : 'text-cyber-muted/60'">
        {{ modelValue.length }} / {{ MAX }}
      </span>
    </div>

    <!-- Chips -->
    <div v-if="modelValue.length > 0" class="flex flex-wrap gap-1.5">
      <span
        v-for="(tag, i) in modelValue"
        :key="tag"
        class="flex items-center gap-1 font-mono-cyber text-xs text-cyber-purple bg-cyber-raised border border-cyber-border rounded px-2 py-0.5"
      >
        {{ tag }}
        <button
          class="text-cyber-muted hover:text-red-400 transition-colors leading-none cursor-pointer"
          @click="remove(i)"
        >✕</button>
      </span>
    </div>

    <!-- Input row -->
    <div class="flex gap-1.5">
      <input
        v-model="input"
        type="text"
        placeholder="Add a hashtag…"
        :disabled="modelValue.length >= MAX"
        class="flex-1 font-mono-cyber text-xs text-cyber-white bg-cyber-surface border border-cyber-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-cyber-purple placeholder-cyber-muted/50 transition-all disabled:opacity-40"
        @keydown="onKeydown"
      />
      <button
        :disabled="modelValue.length >= MAX"
        class="font-mono-cyber text-xs text-cyber-purple border border-cyber-border rounded px-2 py-1 hover:border-cyber-purple/60 hover:bg-cyber-raised transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        @click="add"
      >+</button>
    </div>

  </div>
</template>
