<script setup lang="ts">
import { textAreaBase, type TextAreaProps } from './variants.ts'

withDefaults(defineProps<TextAreaProps>(), { rows: 3 })
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase">
      {{ label }}
    </label>
    <textarea
      :class="textAreaBase"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>
