<template>
  <header class="relative border-b border-cyber-border bg-cyber-surface/80 backdrop-blur-sm">
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent" />

    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded border border-cyber-purple/60 bg-cyber-purple/10 glow-purple flex items-center justify-center">
          <span class="font-mono-cyber text-cyber-purple text-sm font-bold">FK</span>
        </div>
        <span class="font-orbitron text-cyber-white text-lg font-bold tracking-widest uppercase animate-flicker">
          Flaschenkarten
        </span>
      </div>

      <nav class="flex items-center gap-1">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="font-mono-cyber text-cyber-muted hover:text-cyber-purple-lt text-sm px-4 py-2 rounded border border-transparent hover:border-cyber-border hover:bg-cyber-raised transition-all duration-200"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { navLinks } from './variants.ts'
</script>
