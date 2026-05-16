<script setup lang="ts">
defineProps<{ modelValue: boolean; label: string; onText: string; offText: string }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="flex items-center gap-3 cursor-pointer select-none w-fit">
    <span class="font-mono-cyber text-xs tracking-[0.2em] uppercase text-cyber-muted">{{ label }}</span>
    <div class="relative">
      <input
        :checked="modelValue"
        type="checkbox"
        class="sr-only"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <div class="w-10 h-5 rounded-full transition-colors duration-200" :class="modelValue ? 'bg-cyber-purple glow-purple' : 'bg-cyber-border'" />
      <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200" :class="modelValue ? 'translate-x-5' : 'translate-x-0'" />
    </div>
    <span class="font-mono-cyber text-xs text-cyber-white/60">
      {{ modelValue ? onText : offText }}
    </span>
  </label>
</template>
