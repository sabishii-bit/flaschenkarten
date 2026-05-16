<script setup lang="ts">
defineProps<{ checked: boolean }>()
defineEmits<{ toggle: [] }>()

function checkboxStyle(checked: boolean) {
  if (checked) return {
    background: 'linear-gradient(150deg, rgba(192,132,252,0.95) 0%, rgba(126,34,206,0.98) 100%)',
    boxShadow: [
      '0 0 0 1px rgba(192,132,252,0.7)',
      'inset 0 1px 0 rgba(255,255,255,0.25)',
      '0 1px 0 1px rgba(0,0,0,0.95)',
      '0 2px 0 1px rgba(0,0,0,0.75)',
      '0 3px 0 1px rgba(0,0,0,0.5)',
      '0 10px 28px rgba(0,0,0,0.85)',
      '0 0 18px rgba(168,85,247,0.65)',
    ].join(','),
  }
  return {
    background: 'rgba(8,6,20,0.88)',
    boxShadow: [
      '0 0 0 1px rgba(168,85,247,0.2)',
      'inset 0 1px 0 rgba(255,255,255,0.04)',
      '0 1px 0 1px rgba(0,0,0,0.9)',
      '0 2px 0 1px rgba(0,0,0,0.6)',
      '0 5px 14px rgba(0,0,0,0.7)',
    ].join(','),
  }
}
</script>

<template>
  <button
    class="checkbox-3d relative w-6 h-6 flex items-center justify-center cursor-pointer"
    :class="{ 'is-selected': checked }"
    :style="checkboxStyle(checked)"
    @click.stop="$emit('toggle')"
  >
    <!-- Extended hit area -->
    <span class="hit-area" />

    <!-- Top-edge glint -->
    <span
      class="absolute inset-x-0 top-0 h-px opacity-40"
      :style="{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }"
    />

    <!-- Corner brackets -->
    <span class="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l transition-colors duration-200"
      :class="checked ? 'border-white/50' : 'border-cyber-purple/30'" />
    <span class="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r transition-colors duration-200"
      :class="checked ? 'border-white/50' : 'border-cyber-purple/30'" />
    <span class="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l transition-colors duration-200"
      :class="checked ? 'border-white/50' : 'border-cyber-purple/30'" />
    <span class="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r transition-colors duration-200"
      :class="checked ? 'border-white/50' : 'border-cyber-purple/30'" />

    <!-- Checkmark -->
    <span
      v-if="checked"
      class="relative z-10 font-orbitron text-[9px] font-bold text-white leading-none"
      style="text-shadow: 0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(192,132,252,0.7)"
    >✓</span>
  </button>
</template>

<style scoped>
.hit-area {
  position: absolute;
  inset: -10px;
}

.checkbox-3d {
  transform: perspective(280px) rotateX(14deg) rotateY(-10deg) translateY(-5px);
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.checkbox-3d.is-selected {
  transform: perspective(280px) rotateX(14deg) rotateY(-10deg) translateY(-10px);
}

.checkbox-3d       { --cb-ty: -5px;  }
.checkbox-3d.is-selected { --cb-ty: -10px; }

@keyframes hologram-spin {
  0%   { transform: perspective(280px) rotateX(14deg) rotateY(-10deg) translateY(var(--cb-ty)); }
  25%  { transform: perspective(280px) rotateX(4deg)  rotateY(22deg)  translateY(calc(var(--cb-ty) - 4px)); }
  50%  { transform: perspective(280px) rotateX(20deg) rotateY(-30deg) translateY(calc(var(--cb-ty) - 2px)); }
  75%  { transform: perspective(280px) rotateX(6deg)  rotateY(10deg)  translateY(calc(var(--cb-ty) - 5px)); }
  100% { transform: perspective(280px) rotateX(14deg) rotateY(-10deg) translateY(var(--cb-ty)); }
}

.checkbox-3d:hover {
  animation: hologram-spin 1.8s ease-in-out infinite;
}
</style>
