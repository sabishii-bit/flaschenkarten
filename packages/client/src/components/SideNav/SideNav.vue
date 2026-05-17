<script setup lang="ts">
import { computed } from 'vue'
import { useSideNav } from '../../composables/useSideNav.ts'
import { useAdminAuth } from '../../composables/useAdminAuth.ts'
import { navSections } from './variants.ts'

const { isOpen, close }           = useSideNav()
const { isAuthenticated, clearToken } = useAdminAuth()

const adminSection = computed(() =>
  isAuthenticated.value
    ? [{
        eyebrow: '// admin control panel',
        items: [
          { label: 'Server Logs', to: '/admin/logs' },
          { label: 'Ban List',     to: '/admin/bans' },
        ],
      }]
    : [],
)

const allSections = computed(() => [...navSections, ...adminSection.value])
</script>

<template>
  <!-- Backdrop -->
  <Transition name="sidenav-backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      @click="close"
    />
  </Transition>

  <!-- Panel -->
  <Transition name="sidenav-panel">
    <aside
      v-if="isOpen"
      class="fixed top-0 left-0 z-50 flex h-full w-72 flex-col bg-cyber-surface border-r border-cyber-purple/30"
    >
      <!-- Top accent line -->
      <div class="h-px bg-gradient-to-r from-cyber-purple via-cyber-purple-lt to-transparent" />

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-cyber-border">
        <span class="font-orbitron text-cyber-white text-sm font-bold tracking-widest uppercase">
          Navigation
        </span>
        <button
          class="font-mono-cyber text-cyber-muted hover:text-cyber-white transition-colors text-lg leading-none"
          @click="close"
        >
          ✕
        </button>
      </div>

      <!-- Nav items -->
      <nav class="flex flex-col gap-4 p-4 flex-1">
        <div v-for="section in allSections" :key="section.eyebrow" class="flex flex-col gap-0">
          <span class="font-mono-cyber text-cyber-purple text-[10px] tracking-[0.25em] uppercase px-4 pb-1">
            {{ section.eyebrow }}
          </span>
          <RouterLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="group flex items-center px-4 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:border-cyber-border hover:bg-cyber-raised hover:glow-purple"
            active-class="border-cyber-purple/40 bg-cyber-raised text-cyber-purple-lt"
            @click="close"
          >
            <span class="font-orbitron text-cyber-white text-sm font-semibold tracking-wide group-[.router-link-active]:text-cyber-purple-lt">
              {{ item.label }}
            </span>
          </RouterLink>
          <button
            v-if="section.eyebrow === '// admin control panel'"
            class="group flex items-center px-4 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:border-cyber-border hover:bg-cyber-raised"
            @click="clearToken(); close()"
          >
            <span class="font-orbitron text-red-400 group-hover:text-red-300 text-sm font-semibold tracking-wide transition-colors">
              Log Out
            </span>
          </button>
        </div>
      </nav>

      <!-- Bottom brand -->
      <div class="px-6 py-5 border-t border-cyber-border">
        <span class="font-mono-cyber text-cyber-muted/50 text-xs tracking-widest">
          // flaschenkarten
        </span>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.sidenav-backdrop-enter-active,
.sidenav-backdrop-leave-active { transition: opacity 0.25s ease; }
.sidenav-backdrop-enter-from,
.sidenav-backdrop-leave-to    { opacity: 0; }

.sidenav-panel-enter-active,
.sidenav-panel-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.sidenav-panel-enter-from,
.sidenav-panel-leave-to    { transform: translateX(-100%); }
</style>
