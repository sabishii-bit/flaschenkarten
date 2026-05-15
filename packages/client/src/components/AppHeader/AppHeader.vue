<script setup lang="ts">
import { useSideNav } from '../../composables/useSideNav.ts'

const { toggle } = useSideNav()
</script>

<template>
  <header class="relative border-b border-cyber-border bg-cyber-surface/80 backdrop-blur-sm">
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent" />

    <!-- Three-slot layout: hamburger | centered logo | spacer -->
    <div class="relative flex items-center px-4 py-4">

      <!-- Far-left: hamburger -->
      <button
        class="flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0 group z-10"
        aria-label="Open menu"
        @click="toggle"
      >
        <span class="block h-px w-full bg-cyber-purple transition-all duration-200 group-hover:bg-cyber-purple-lt" />
        <span class="block h-px w-5 bg-cyber-purple transition-all duration-200 group-hover:w-full group-hover:bg-cyber-purple-lt" />
        <span class="block h-px w-full bg-cyber-purple transition-all duration-200 group-hover:bg-cyber-purple-lt" />
      </button>

      <!-- Centered logo (absolute so it doesn't shift with the hamburger) -->
      <RouterLink
        to="/"
        class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5"
      >
        <div class="h-8 w-8 shrink-0 rounded border border-cyber-purple/60 bg-cyber-purple/10 glow-purple flex items-center justify-center">
          <span class="font-mono-cyber text-cyber-purple text-sm font-bold">FK</span>
        </div>
        <!-- Hide wordmark on very small screens to prevent overflow -->
        <span class="hidden sm:block font-orbitron text-cyber-white text-base font-bold tracking-widest uppercase animate-flicker">
          Flaschenkarten
        </span>
      </RouterLink>

      <!-- Spacer to balance the hamburger width on the right -->
      <div class="ml-auto w-8 shrink-0" />
    </div>
  </header>
</template>
