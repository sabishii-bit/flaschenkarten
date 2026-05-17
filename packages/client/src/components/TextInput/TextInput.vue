<script setup lang="ts">
import { inputBase, type InputProps } from './variants.ts'

defineProps<InputProps>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="font-mono-cyber text-cyber-muted text-xs tracking-[0.2em] uppercase">
      {{ label }}
    </label>
    <input
      :type="type ?? 'text'"
      :class="inputBase"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
