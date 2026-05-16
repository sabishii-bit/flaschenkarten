<script setup lang="ts">
withDefaults(defineProps<{ visible: boolean; count?: number; bottomClass?: string }>(), {
  bottomClass: 'bottom-6',
})
defineEmits<{ undo: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <button
        v-if="visible"
        class="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-cyber-surface border border-cyber-border rounded px-4 py-2.5 shadow-lg whitespace-nowrap cursor-pointer hover:border-cyber-purple/60 transition-colors"
        :class="bottomClass"
        @click="$emit('undo')"
      >
        <span class="font-mono-cyber text-xs text-cyber-muted">
          {{ count && count > 1 ? `// ${count} cards deleted` : '// card deleted' }}
        </span>
        <span class="font-mono-cyber text-xs text-cyber-purple">Undo</span>
      </button>
    </Transition>
  </Teleport>
</template>
